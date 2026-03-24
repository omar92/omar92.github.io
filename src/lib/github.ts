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
