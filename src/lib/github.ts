export interface GitHubRepoIdentifier {
  owner: string;
  repo: string;
}

export interface GitHubRepoStats {
  stars: number;
  forks: number;
  contributors: number;
}

interface CachedRepoStatsEntry {
  updatedAt: number;
  stats: GitHubRepoStats;
}

interface CachedUserStatsEntry {
  updatedAt: number;
  stats: GitHubUserStats;
}

const REPO_STATS_CACHE_KEY = 'portfolio:github-repo-stats:v1';
const USER_STATS_CACHE_KEY = 'portfolio:github-user-stats:v1';
const GITHUB_RATE_LIMIT_UNTIL_KEY = 'portfolio:github-rate-limit-until:v1';
const REPO_STATS_CACHE_TTL_MS = 1000 * 60 * 60 * 12;
const USER_STATS_CACHE_TTL_MS = 1000 * 60 * 60 * 12;
const FALLBACK_RATE_LIMIT_COOLDOWN_MS = 1000 * 60 * 15;

const inFlightRepoStatsRequests = new Map<string, Promise<GitHubRepoStats | null>>();
const inFlightUserStatsRequests = new Map<string, Promise<GitHubUserStats | null>>();

const GITHUB_HOSTS = new Set(['github.com', 'www.github.com']);

const getGitHubAuthToken = (): string => {
  const env = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env;
  return env?.VITE_GITHUB_TOKEN?.trim() || '';
};

const getGitHubRequestHeaders = (): HeadersInit => {
  const headers: HeadersInit = {
    Accept: 'application/vnd.github+json',
  };

  const token = getGitHubAuthToken();

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

const readNumberFromStorage = (key: string): number | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      return null;
    }

    const value = Number(raw);
    return Number.isFinite(value) ? value : null;
  } catch {
    return null;
  }
};

const writeNumberToStorage = (key: string, value: number): void => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(key, String(value));
  } catch {
    // ignore storage failures
  }
};

const clearStorageValue = (key: string): void => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.removeItem(key);
  } catch {
    // ignore storage failures
  }
};

const getGitHubRateLimitUntil = (): number | null => readNumberFromStorage(GITHUB_RATE_LIMIT_UNTIL_KEY);

const isGitHubRateLimited = (): boolean => {
  const limitedUntil = getGitHubRateLimitUntil();
  return typeof limitedUntil === 'number' && limitedUntil > Date.now();
};

const updateGitHubRateLimitWindow = (response: Response): void => {
  if (response.status !== 403) {
    return;
  }

  const resetHeader = response.headers.get('x-ratelimit-reset');
  const resetSeconds = Number(resetHeader);
  const resetMillis = Number.isFinite(resetSeconds) ? resetSeconds * 1000 : 0;
  const fallbackMillis = Date.now() + FALLBACK_RATE_LIMIT_COOLDOWN_MS;

  writeNumberToStorage(GITHUB_RATE_LIMIT_UNTIL_KEY, Math.max(resetMillis, fallbackMillis));
};

const clearGitHubRateLimitWindow = (): void => {
  const limitedUntil = getGitHubRateLimitUntil();
  if (limitedUntil && limitedUntil <= Date.now()) {
    clearStorageValue(GITHUB_RATE_LIMIT_UNTIL_KEY);
  }
};

const readRepoStatsCache = (): Record<string, CachedRepoStatsEntry> => {
  if (typeof window === 'undefined') {
    return {};
  }

  try {
    const raw = window.localStorage.getItem(REPO_STATS_CACHE_KEY);
    if (!raw) {
      return {};
    }

    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object') {
      return {};
    }

    return parsed as Record<string, CachedRepoStatsEntry>;
  } catch {
    return {};
  }
};

const writeRepoStatsCache = (cache: Record<string, CachedRepoStatsEntry>): void => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(REPO_STATS_CACHE_KEY, JSON.stringify(cache));
  } catch {
    // ignore storage failures
  }
};

const getCachedRepoStats = (repoKey: string, allowStale = false): GitHubRepoStats | null => {
  const cache = readRepoStatsCache();
  const entry = cache[repoKey];
  if (!entry?.stats || typeof entry.updatedAt !== 'number') {
    return null;
  }

  if (allowStale || Date.now() - entry.updatedAt <= REPO_STATS_CACHE_TTL_MS) {
    return entry.stats;
  }

  return null;
};

const setCachedRepoStats = (repoKey: string, stats: GitHubRepoStats): void => {
  const cache = readRepoStatsCache();
  cache[repoKey] = {
    updatedAt: Date.now(),
    stats,
  };
  writeRepoStatsCache(cache);
};

const readUserStatsCache = (): Record<string, CachedUserStatsEntry> => {
  if (typeof window === 'undefined') {
    return {};
  }

  try {
    const raw = window.localStorage.getItem(USER_STATS_CACHE_KEY);
    if (!raw) {
      return {};
    }

    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object') {
      return {};
    }

    return parsed as Record<string, CachedUserStatsEntry>;
  } catch {
    return {};
  }
};

const writeUserStatsCache = (cache: Record<string, CachedUserStatsEntry>): void => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(USER_STATS_CACHE_KEY, JSON.stringify(cache));
  } catch {
    // ignore storage failures
  }
};

const getCachedUserStats = (username: string, allowStale = false): GitHubUserStats | null => {
  const cache = readUserStatsCache();
  const entry = cache[username.toLowerCase()];
  if (!entry?.stats || typeof entry.updatedAt !== 'number') {
    return null;
  }

  if (allowStale || Date.now() - entry.updatedAt <= USER_STATS_CACHE_TTL_MS) {
    return entry.stats;
  }

  return null;
};

const setCachedUserStats = (username: string, stats: GitHubUserStats): void => {
  const cache = readUserStatsCache();
  cache[username.toLowerCase()] = {
    updatedAt: Date.now(),
    stats,
  };
  writeUserStatsCache(cache);
};

const parseContributorsCount = (linkHeader: string | null): number | null => {
  if (!linkHeader) {
    return null;
  }

  const lastMatch = linkHeader.match(/<([^>]+)>;\s*rel="last"/i);
  if (!lastMatch?.[1]) {
    return null;
  }

  try {
    const lastPageUrl = new URL(lastMatch[1]);
    const page = Number(lastPageUrl.searchParams.get('page'));
    return Number.isFinite(page) ? page : null;
  } catch {
    return null;
  }
};

export const parseGitHubRepoFromUrl = (url: string): GitHubRepoIdentifier | null => {
  try {
    const parsed = new URL(url);

    if (!GITHUB_HOSTS.has(parsed.hostname.toLowerCase())) {
      return null;
    }

    const parts = parsed.pathname
      .split('/')
      .map((part) => part.trim())
      .filter(Boolean);

    if (parts.length < 2) {
      return null;
    }

    const owner = parts[0];
    const repo = parts[1].replace(/\.git$/i, '');

    if (!owner || !repo) {
      return null;
    }

    return { owner, repo };
  } catch {
    return null;
  }
};

export interface GitHubUserStats {
  public_repos: number;
  total_stars: number;
  total_forks: number;
}

export const fetchGitHubUserStats = async (username: string): Promise<GitHubUserStats | null> => {
  const usernameKey = username.toLowerCase();
  const freshCachedStats = getCachedUserStats(usernameKey);
  if (freshCachedStats) {
    return freshCachedStats;
  }

  const staleCachedStats = getCachedUserStats(usernameKey, true);
  clearGitHubRateLimitWindow();
  if (isGitHubRateLimited()) {
    return staleCachedStats;
  }

  const inFlight = inFlightUserStatsRequests.get(usernameKey);
  if (inFlight) {
    return inFlight;
  }

  const requestPromise = (async (): Promise<GitHubUserStats | null> => {
  try {
    const headers = getGitHubRequestHeaders();
    const userResponse = await fetch(`https://api.github.com/users/${username}`, { headers });
    if (!userResponse.ok) {
      updateGitHubRateLimitWindow(userResponse);
      return staleCachedStats;
    }

    const userJson = (await userResponse.json()) as { public_repos?: number };
    const public_repos = Number(userJson.public_repos) || 0;

    let total_stars = 0;
    let total_forks = 0;
    let page = 1;

    while (true) {
      const reposResponse = await fetch(
        `https://api.github.com/users/${username}/repos?per_page=100&page=${page}&sort=updated`,
        { headers },
      );
      if (!reposResponse.ok) {
        updateGitHubRateLimitWindow(reposResponse);
        if (staleCachedStats) {
          return staleCachedStats;
        }
        break;
      }

      const repos = (await reposResponse.json()) as {
        stargazers_count?: number;
        forks_count?: number;
      }[];
      if (!Array.isArray(repos) || repos.length === 0) break;

      for (const repo of repos) {
        total_stars += Number(repo.stargazers_count) || 0;
        total_forks += Number(repo.forks_count) || 0;
      }

      const linkHeader = reposResponse.headers.get('link');
      if (repos.length < 100 || !linkHeader?.includes('rel="next"')) break;
      page++;
    }

    const stats = { public_repos, total_stars, total_forks };
    setCachedUserStats(usernameKey, stats);
    return stats;
  } catch {
    return staleCachedStats;
  }
  })();

  inFlightUserStatsRequests.set(usernameKey, requestPromise);

  try {
    return await requestPromise;
  } finally {
    inFlightUserStatsRequests.delete(usernameKey);
  }
};

export const fetchGitHubRepoStats = async (
  identifier: GitHubRepoIdentifier,
): Promise<GitHubRepoStats | null> => {
  const { owner, repo } = identifier;
  const repoKey = `${owner}/${repo}`.toLowerCase();

  const freshCachedStats = getCachedRepoStats(repoKey);
  if (freshCachedStats) {
    return freshCachedStats;
  }

  const staleCachedStats = getCachedRepoStats(repoKey, true);
  clearGitHubRateLimitWindow();
  if (isGitHubRateLimited()) {
    return staleCachedStats;
  }

  const inFlight = inFlightRepoStatsRequests.get(repoKey);
  if (inFlight) {
    return inFlight;
  }

  const requestPromise = (async (): Promise<GitHubRepoStats | null> => {
  const headers = getGitHubRequestHeaders();
  const hasGitHubToken = Boolean(getGitHubAuthToken());

  try {
    const repoResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers,
    });
    if (!repoResponse.ok) {
      updateGitHubRateLimitWindow(repoResponse);
      return staleCachedStats;
    }

    const repoJson = (await repoResponse.json()) as {
      stargazers_count?: number;
      forks_count?: number;
    };

    const stars = Number(repoJson.stargazers_count) || 0;
    const forks = Number(repoJson.forks_count) || 0;

    let contributors = staleCachedStats?.contributors || 0;
    if (hasGitHubToken) {
      const contributorsResponse = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contributors?per_page=1&anon=1`,
        {
          headers,
        },
      );

      if (contributorsResponse.ok) {
        const countFromHeader = parseContributorsCount(contributorsResponse.headers.get('link'));

        if (countFromHeader !== null) {
          contributors = countFromHeader;
        } else {
          const contributorsJson = (await contributorsResponse.json()) as unknown[];
          contributors = Array.isArray(contributorsJson) ? contributorsJson.length : 0;
        }
      } else {
        updateGitHubRateLimitWindow(contributorsResponse);
      }
    }

    const stats = {
      stars,
      forks,
      contributors,
    };

    setCachedRepoStats(repoKey, stats);

    return stats;
  } catch {
    return staleCachedStats;
  }
  })();

  inFlightRepoStatsRequests.set(repoKey, requestPromise);

  try {
    return await requestPromise;
  } finally {
    inFlightRepoStatsRequests.delete(repoKey);
  }
};
