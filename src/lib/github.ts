export interface GitHubRepoIdentifier {
  owner: string;
  repo: string;
}

export interface GitHubRepoStats {
  stars: number;
  forks: number;
  contributors: number;
}

const GITHUB_HOSTS = new Set(['github.com', 'www.github.com']);

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
  try {
    const userResponse = await fetch(`https://api.github.com/users/${username}`);
    if (!userResponse.ok) return null;

    const userJson = (await userResponse.json()) as { public_repos?: number };
    const public_repos = Number(userJson.public_repos) || 0;

    let total_stars = 0;
    let total_forks = 0;
    let page = 1;

    while (true) {
      const reposResponse = await fetch(
        `https://api.github.com/users/${username}/repos?per_page=100&page=${page}&sort=updated`,
      );
      if (!reposResponse.ok) break;

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

    return { public_repos, total_stars, total_forks };
  } catch {
    return null;
  }
};

export const fetchGitHubRepoStats = async (
  identifier: GitHubRepoIdentifier,
): Promise<GitHubRepoStats | null> => {
  const { owner, repo } = identifier;

  try {
    const repoResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
    if (!repoResponse.ok) {
      return null;
    }

    const repoJson = (await repoResponse.json()) as {
      stargazers_count?: number;
      forks_count?: number;
    };

    const stars = Number(repoJson.stargazers_count) || 0;
    const forks = Number(repoJson.forks_count) || 0;

    const contributorsResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contributors?per_page=1&anon=1`,
    );

    let contributors = 0;
    if (contributorsResponse.ok) {
      const countFromHeader = parseContributorsCount(contributorsResponse.headers.get('link'));

      if (countFromHeader !== null) {
        contributors = countFromHeader;
      } else {
        const contributorsJson = (await contributorsResponse.json()) as unknown[];
        contributors = Array.isArray(contributorsJson) ? contributorsJson.length : 0;
      }
    }

    return {
      stars,
      forks,
      contributors,
    };
  } catch {
    return null;
  }
};
