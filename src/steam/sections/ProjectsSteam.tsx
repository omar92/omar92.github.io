/* eslint-disable */
import { useEffect, useMemo, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ExternalLink, Github, X, Play, Wrench, Star, GitFork, Users } from 'lucide-react';
import data, { type PortfolioProject } from '../../lib/portfolio';
import { fetchGitHubRepoStats, parseGitHubRepoFromUrl, type GitHubRepoStats } from '@/lib/github';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';

gsap.registerPlugin(ScrollTrigger);

type ImageLoadState = 'loading' | 'loaded' | 'failed';
type ProjectMediaItem = {
  id: string;
  kind: 'video' | 'screenshot';
  label: string;
  src: string;
  videoType?: string;
};
const PROJECT_HASH_PREFIX = '#project/';

const getProjectIdFromHash = (hash: string): string | null => {
  if (!hash.startsWith(PROJECT_HASH_PREFIX)) {
    return null;
  }

  const rawId = hash.slice(PROJECT_HASH_PREFIX.length).trim();
  if (!rawId) {
    return null;
  }

  try {
    return decodeURIComponent(rawId);
  } catch {
    return rawId;
  }
};

const Projects = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const filtersContainerRef = useRef<HTMLDivElement>(null);
  const projectDialogScrollRef = useRef<HTMLDivElement>(null);
  const projectDetailHeaderRef = useRef<HTMLDivElement>(null);
  const [activeFilter, setActiveFilter] = useState('Showcase');
  const [selectedProject, setSelectedProject] = useState<PortfolioProject | null>(null);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [activeMediaId, setActiveMediaId] = useState<string | null>(null);
  const [activeDetailSection, setActiveDetailSection] = useState<'pd-media' | 'pd-about' | 'pd-contributions'>('pd-media');
  const [projectGitHubStats, setProjectGitHubStats] = useState<Record<string, GitHubRepoStats>>({});
  const [imageStates, setImageStates] = useState<Record<string, ImageLoadState>>({});
  const [hoveredProject, setHoveredProject] = useState<PortfolioProject | null>(null);
  const [panelPos, setPanelPos] = useState({ top: 80, left: 0 });
  const [visibleTabCount, setVisibleTabCount] = useState(3);
  const rightColRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const loadingImageUrlsRef = useRef(new Set<string>());

  const getImageState = (src: string): ImageLoadState | undefined => imageStates[src];
  const isImageLoaded = (src: string) => getImageState(src) === 'loaded';
  const isImageFailed = (src: string) => getImageState(src) === 'failed';
  const setImageState = (src: string, state: ImageLoadState) => {
    if (!src) {
      return;
    }

    setImageStates((current) => (current[src] === state ? current : { ...current, [src]: state }));
  };
  const queueImageLoad = (src: string) => {
    if (!src || loadingImageUrlsRef.current.has(src) || imageStates[src]) {
      return;
    }

    loadingImageUrlsRef.current.add(src);
    setImageState(src, 'loading');

    const image = new Image();
    image.onload = () => {
      loadingImageUrlsRef.current.delete(src);
      setImageState(src, 'loaded');
    };
    image.onerror = () => {
      loadingImageUrlsRef.current.delete(src);
      setImageState(src, 'failed');
    };
    image.src = src;
  };

  const filterTagCounts = data.projects.reduce<Record<string, number>>((counts, project) => {
    project.filterTags.forEach((tag) => {
      counts[tag] = (counts[tag] ?? 0) + 1;
    });

    return counts;
  }, {});

  const sortedFilterTags = Object.keys(filterTagCounts).sort((left, right) => {
    const countDifference = (filterTagCounts[right] ?? 0) - (filterTagCounts[left] ?? 0);
    if (countDifference !== 0) {
      return countDifference;
    }

    return left.localeCompare(right);
  });

  const publishedProjectsCount = data.projects.filter((project) => project.published).length;

  const categories = ['Showcase', 'All', ...(publishedProjectsCount > 0 ? ['Published'] : []), ...sortedFilterTags];
  const filtered = useMemo(() =>
    activeFilter === 'Showcase' ? data.projects.filter((p) => p.featured) :
    activeFilter === 'All' ? data.projects :
    activeFilter === 'Published' ? data.projects.filter((p) => p.published) :
    data.projects.filter((p) => p.filterTags.includes(activeFilter))
  , [activeFilter]);
  const getProjectGitHubStats = (project: PortfolioProject): GitHubRepoStats | undefined => {
    const fetchedStats = projectGitHubStats[project.id];
    if (fetchedStats) {
      return fetchedStats;
    }

    if (project.stats) {
      return {
        stars: project.stats.stars ?? 0,
        forks: project.stats.forks ?? 0,
        contributors: 0,
      };
    }

    return undefined;
  };

  const selectedProjectGitHubStats = selectedProject ? getProjectGitHubStats(selectedProject) : undefined;
  const hasProjectLinks = (selectedProject?.links?.length ?? 0) > 0;
  const visibleSelectedProjectScreenshots = selectedProject?.screenshots.filter((src) => isImageLoaded(src)) ?? [];
  const selectedProjectMedia = useMemo<ProjectMediaItem[]>(() => {
    if (!selectedProject) {
      return [];
    }

    const videoMedia = selectedProject.videos.map((video, index) => ({
      id: `video-${index}`,
      kind: 'video' as const,
      label: video.text || `Video ${index + 1}`,
      src: video.url,
      videoType: video.type,
    }));

    const screenshotMedia = visibleSelectedProjectScreenshots.map((src, index) => ({
      id: `screenshot-${index}`,
      kind: 'screenshot' as const,
      label: `Screenshot ${index + 1}`,
      src,
    }));

    return [...videoMedia, ...screenshotMedia];
  }, [selectedProject, visibleSelectedProjectScreenshots]);
  const activeSelectedMedia = selectedProjectMedia.find((media) => media.id === activeMediaId) ?? selectedProjectMedia[0] ?? null;
  const visibleSelectedProjectContributionScreenshots = selectedProject?.contributions?.map((contribution) => ({
    ...contribution,
    screenshot: contribution.screenshot.filter((src) => !isImageFailed(src)),
  })) ?? [];
  const hasProjectContributions = (selectedProject?.contributions?.length ?? 0) > 0;
  const selectedProjectVisibleMediaCount = (selectedProject?.videos?.length ?? 0) + visibleSelectedProjectScreenshots.length;
  const selectedProjectGithubLink = selectedProject?.links.find(
    (link) =>
      link.type?.toLowerCase() === 'github' ||
      link.icon?.toLowerCase() === 'github' ||
      link.url.toLowerCase().includes('github.com/'),
  );

  const selectedProjectNonGithubLinks = selectedProject?.links.filter((link) => link !== selectedProjectGithubLink) ?? [];

  const getActiveDetailSectionFromScroll = (): 'pd-media' | 'pd-about' | 'pd-contributions' => {
    const scrollContainer = projectDialogScrollRef.current;
    if (!scrollContainer) {
      return 'pd-media';
    }

    const sectionIds: Array<'pd-media' | 'pd-about' | 'pd-contributions'> = hasProjectContributions
      ? ['pd-media', 'pd-about', 'pd-contributions']
      : ['pd-media', 'pd-about'];

    const containerRect = scrollContainer.getBoundingClientRect();
    const headerOffset = (projectDetailHeaderRef.current?.offsetHeight ?? 0) + 8;
    const targetScroll = scrollContainer.scrollTop + headerOffset + 20;

    let nextActive: 'pd-media' | 'pd-about' | 'pd-contributions' = sectionIds[0];

    sectionIds.forEach((sectionId) => {
      const section = document.getElementById(sectionId);
      if (!section) {
        return;
      }

      const sectionTop = section.getBoundingClientRect().top - containerRect.top + scrollContainer.scrollTop;
      if (sectionTop <= targetScroll) {
        nextActive = sectionId;
      }
    });

    const bottomThreshold = scrollContainer.scrollHeight - scrollContainer.clientHeight - 2;
    if (scrollContainer.scrollTop >= bottomThreshold) {
      return sectionIds[sectionIds.length - 1];
    }

    return nextActive;
  };

  const updateActiveDetailSectionFromScroll = () => {
    const nextActive = getActiveDetailSectionFromScroll();
    setActiveDetailSection((current) => (current === nextActive ? current : nextActive));
  };

  const scrollToDetailSection = (sectionId: 'pd-media' | 'pd-about' | 'pd-contributions') => {
    const scrollContainer = projectDialogScrollRef.current;
    const section = document.getElementById(sectionId);
    if (!scrollContainer || !section) {
      return;
    }

    setActiveDetailSection(sectionId);
    const headerOffset = (projectDetailHeaderRef.current?.offsetHeight ?? 0) + 8;
    const containerTop = scrollContainer.getBoundingClientRect().top;
    const sectionTop = section.getBoundingClientRect().top - containerTop + scrollContainer.scrollTop;

    scrollContainer.scrollTo({
      top: Math.max(0, sectionTop - headerOffset),
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    setActiveMediaId(null);
  }, [selectedProject?.id]);

  useEffect(() => {
    setActiveDetailSection('pd-media');
  }, [selectedProject?.id]);

  useEffect(() => {
    if (!selectedProject) {
      return;
    }

    const handleResize = () => {
      updateActiveDetailSectionFromScroll();
    };

    updateActiveDetailSectionFromScroll();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [selectedProject, hasProjectContributions]);

  useEffect(() => {
    if (selectedProjectMedia.length === 0) {
      if (activeMediaId !== null) {
        setActiveMediaId(null);
      }
      return;
    }

    const hasActiveMedia = activeMediaId
      ? selectedProjectMedia.some((media) => media.id === activeMediaId)
      : false;

    if (!hasActiveMedia) {
      setActiveMediaId(selectedProjectMedia[0].id);
    }
  }, [selectedProjectMedia, activeMediaId]);

  useEffect(() => {
    const imageUrls = new Set<string>();

    filtered.forEach((project) => {
      if (project.image) {
        imageUrls.add(project.image);
      }
    });

    if (selectedProject?.image) {
      imageUrls.add(selectedProject.image);
    }

    selectedProject?.screenshots.forEach((src) => imageUrls.add(src));
    selectedProject?.contributions?.forEach((contribution) => {
      contribution.screenshot.forEach((src) => imageUrls.add(src));
    });

    imageUrls.forEach((src) => {
      if (src.startsWith('http://') || src.startsWith('https://')) {
        queueImageLoad(src);
      } else {
        setImageState(src, 'loaded');
      }
    });
  }, [filtered, selectedProject]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.pj-header', { opacity: 0, y: 40 }, {
        opacity: 1, y: 0, duration: 0.8, ease: 'expo.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 70%' },
      });
      gsap.fromTo('.pj-filter', { opacity: 0, y: 16 }, {
        opacity: 1, y: 0, duration: 0.5, stagger: 0.06, ease: 'expo.out',
        scrollTrigger: { trigger: '.pj-filters', start: 'top 76%' },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    gsap.fromTo('.pj-card', { opacity: 0, y: 32 }, {
      opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: 'expo.out',
    });
    setHoveredProject(filtered[0] ?? null);
  }, [filtered]);

  useEffect(() => {
    const compute = () => {
      if (!sectionRef.current || !rightColRef.current) return;
      const sectionRect = sectionRef.current.getBoundingClientRect();
      const colRect = rightColRef.current.getBoundingClientRect();
      const panelH = panelRef.current?.offsetHeight ?? 360;
      const NAV = 80;
      const top = Math.min(
        Math.max(sectionRect.top + 48, NAV),
        sectionRect.bottom - panelH - 16
      );
      setPanelPos({ top, left: colRect.left });
    };
    compute();
    window.addEventListener('scroll', compute, { passive: true });
    window.addEventListener('resize', compute);
    return () => {
      window.removeEventListener('scroll', compute);
      window.removeEventListener('resize', compute);
    };
  }, [hoveredProject]);

  useEffect(() => {
    const handler = (e: Event) => {
      const id = (e as CustomEvent).detail?.id;
      if (id) { const p = data.projects.find((x) => x.id === id); if (p) setSelectedProject(p); }
    };
    window.addEventListener('open-project', handler);
    return () => window.removeEventListener('open-project', handler);
  }, []);

  useEffect(() => {
    const syncFromHash = () => {
      const projectId = getProjectIdFromHash(window.location.hash);

      if (!projectId) {
        setSelectedProject((current) => (current ? null : current));
        return;
      }

      const project = data.projects.find((item) => item.id === projectId);
      if (!project) {
        return;
      }

      setSelectedProject((current) => (current?.id === project.id ? current : project));
    };

    syncFromHash();
    window.addEventListener('hashchange', syncFromHash);

    return () => {
      window.removeEventListener('hashchange', syncFromHash);
    };
  }, []);

  useEffect(() => {
    if (selectedProject) {
      const nextHash = `${PROJECT_HASH_PREFIX}${encodeURIComponent(selectedProject.id)}`;
      if (window.location.hash !== nextHash) {
        if (window.location.hash.startsWith(PROJECT_HASH_PREFIX)) {
          window.history.replaceState(null, '', nextHash);
        } else {
          window.history.pushState(null, '', nextHash);
        }
      }
      return;
    }

    if (window.location.hash.startsWith(PROJECT_HASH_PREFIX)) {
      window.history.replaceState(null, '', '#projects');
    }
  }, [selectedProject]);

  useEffect(() => {
    let cancelled = false;

    const loadStats = async () => {
      const projectsWithGitHub = data.projects
        .map((project) => {
          const githubLink = project.links.find(
            (link) =>
              link.type?.toLowerCase() === 'github' ||
              link.icon?.toLowerCase() === 'github' ||
              link.url.toLowerCase().includes('github.com/'),
          );

          if (!githubLink) {
            return null;
          }

          const repo = parseGitHubRepoFromUrl(githubLink.url);

          if (!repo) {
            return null;
          }

          return {
            projectId: project.id,
            repoKey: `${repo.owner}/${repo.repo}`.toLowerCase(),
            repo,
          };
        })
        .filter((item): item is { projectId: string; repoKey: string; repo: { owner: string; repo: string } } => Boolean(item));

      const uniqueRepos = new Map<string, { owner: string; repo: string }>();
      projectsWithGitHub.forEach((item) => {
        if (!uniqueRepos.has(item.repoKey)) {
          uniqueRepos.set(item.repoKey, item.repo);
        }
      });

      const repoStatsEntries = await Promise.all(
        Array.from(uniqueRepos.entries()).map(async ([repoKey, repo]) => {
          const stats = await fetchGitHubRepoStats(repo);
          return [repoKey, stats] as const;
        }),
      );

      if (cancelled) {
        return;
      }

      const statsByRepo = new Map<string, GitHubRepoStats>();
      repoStatsEntries.forEach(([repoKey, stats]) => {
        if (stats) {
          statsByRepo.set(repoKey, stats);
        }
      });

      const statsByProject: Record<string, GitHubRepoStats> = {};
      projectsWithGitHub.forEach((item) => {
        const repoStats = statsByRepo.get(item.repoKey);
        if (repoStats) {
          statsByProject[item.projectId] = repoStats;
        }
      });

      setProjectGitHubStats(statsByProject);
    };

    void loadStats();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const container = filtersContainerRef.current;
    if (!container) return;

    const calculateVisibleTabs = () => {
      const containerWidth = container.offsetWidth;
      const tabWidth = 120; // approximate width per tab (px + py + text)
      const moreButtonWidth = 100;
      const gapSize = 8; // gap between items
      
      // Calculate how many tabs can fit
      let count = Math.max(1, Math.floor((containerWidth - moreButtonWidth) / (tabWidth + gapSize)));
      
      // Ensure we don't show more tabs than available
      count = Math.min(count, categories.length);
      
      setVisibleTabCount(count);
    };

    calculateVisibleTabs();

    const resizeObserver = new ResizeObserver(calculateVisibleTabs);
    resizeObserver.observe(container);

    return () => resizeObserver.disconnect();
  }, [categories.length]);

  return (
<section id="projects" ref={sectionRef} className="relative py-12 reveal-section" style={{ background: '#1b2838', borderTop: '1px solid rgba(0,0,0,0.3)' }}>
      <div className="w-full max-w-[1400px] mx-auto px-4 lg:px-8">

        {/* Steam-style category tabs */}
        <div ref={filtersContainerRef} className="pj-filters flex flex-wrap gap-2 mb-8 pb-4 border-b border-white/5 items-center relative" style={{ zIndex: 20 }}>
          {categories.slice(0, visibleTabCount).map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              className="pj-filter text-xs px-4 py-2.5 font-semibold transition-all relative group"
              style={{
                color: activeFilter === cat ? '#66c0f4' : '#8f98a0',
                background: activeFilter === cat ? 'rgba(102, 192, 244, 0.08)' : 'transparent',
                border: activeFilter === cat ? '1px solid rgba(102, 192, 244, 0.4)' : '1px solid rgba(255,255,255,0.08)',
                borderRadius: '2px',
                cursor: 'pointer',
                letterSpacing: '0.3px',
                boxShadow: activeFilter === cat ? '0 0 12px rgba(102, 192, 244, 0.15)' : 'none'
              }}
              onMouseEnter={(e) => {
                if (activeFilter !== cat) {
                  (e.currentTarget as HTMLElement).style.color = '#c6d4df';
                  (e.currentTarget as HTMLElement).style.background = 'rgba(102, 192, 244, 0.03)';
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(102, 192, 244, 0.2)';
                }
              }}
              onMouseLeave={(e) => {
                if (activeFilter !== cat) {
                  (e.currentTarget as HTMLElement).style.color = '#8f98a0';
                  (e.currentTarget as HTMLElement).style.background = 'transparent';
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)';
                }
              }}
            >
              {cat}
            </button>
          ))}
          
          {categories.length > visibleTabCount && (
            <div className="relative group">
              <button
                className="text-xs px-4 py-2.5 font-semibold transition-all"
                style={{
                  color: '#8f98a0',
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '2px',
                  cursor: 'pointer',
                  letterSpacing: '0.3px'
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.color = '#c6d4df';
                  (e.currentTarget as HTMLElement).style.background = 'rgba(102, 192, 244, 0.03)';
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(102, 192, 244, 0.2)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.color = '#8f98a0';
                  (e.currentTarget as HTMLElement).style.background = 'transparent';
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)';
                }}
              >
                More ({categories.length - visibleTabCount})
              </button>
              <div className="absolute left-0 top-full mt-1 hidden group-hover:block bg-[#16202d] border rounded-sm shadow-lg"
                style={{ minWidth: '180px', borderColor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.08)', zIndex: 9999 }}>
                {categories.slice(visibleTabCount).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveFilter(cat)}
                    className="w-full text-left text-xs px-4 py-2.5 transition-all border-b border-white/5 last:border-b-0"
                    style={{
                      color: activeFilter === cat ? '#66c0f4' : '#8f98a0',
                      background: activeFilter === cat ? 'rgba(102, 192, 244, 0.08)' : 'transparent',
                      borderLeft: activeFilter === cat ? '2px solid #66c0f4' : '2px solid transparent',
                      paddingLeft: '12px'
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.background = 'rgba(102, 192, 244, 0.12)';
                      (e.currentTarget as HTMLElement).style.color = '#c6d4df';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.background = activeFilter === cat ? 'rgba(102, 192, 244, 0.08)' : 'transparent';
                      (e.currentTarget as HTMLElement).style.color = activeFilter === cat ? '#66c0f4' : '#8f98a0';
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>



        {/* Steam game list + hover preview */}
        <div className="flex gap-6" style={{ zIndex: 0 }}>
          {/* Project list */}
          <div className="space-y-0.5 flex-1 min-w-0">
          {filtered.map((project) => {
            const githubStats = getProjectGitHubStats(project);

            return (
              <article
                key={project.id}
                data-project-id={project.id}
                className="pj-card cursor-pointer flex gap-4 rounded-sm overflow-hidden transition-all group py-2 px-2"
                style={{ background: hoveredProject?.id === project.id ? '#1e3048' : 'transparent', border: '1px solid transparent' }}
                onClick={() => setSelectedProject(project)}
                onMouseEnter={() => setHoveredProject(project)}
              >
                {/* Left: Thumbnail image */}
                <div className="relative overflow-hidden flex-shrink-0" style={{ width: '184px', height: '104px', background: '#0d1926' }}>
                  {project.image && isImageLoaded(project.image) ? (
                    <img
                      src={project.image}
                      alt={project.name}
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-95 transition-opacity duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl font-bold" style={{ color: '#2a475e' }}>
                      {project.name[0]}
                    </div>
                  )}
                  {/* Published badge */}
                  {project.published && (
                    <div className="absolute top-1 left-1">
                      <span className="text-[10px] px-1.5 py-0.5 rounded-sm font-semibold"
                        style={{ background: 'rgba(106,184,13,0.85)', color: '#fff' }}>
                        Released
                      </span>
                    </div>
                  )}
                </div>

                {/* Middle: Content */}
                <div className="flex-1 flex flex-col gap-2 min-w-0">
                  <h3 className="text-sm font-semibold leading-snug" style={{ color: '#e8f4fd' }}>{project.name}</h3>

                  {/* Description */}
                  <p className="text-xs line-clamp-2 flex-1" style={{ color: '#8f98a0', lineHeight: 1.5 }}>
                    {project.shortDescription}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5">
                    {project.filterTags.slice(0, 4).map((tag) => (
                      <span key={tag} className="text-[10px] px-2 py-0.5 rounded-sm"
                        style={{ background: 'rgba(102, 192, 244, 0.1)', color: '#66c0f4', border: '1px solid rgba(102, 192, 244, 0.2)' }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Right: Platform badges */}
                <div className="flex-shrink-0 flex flex-col items-end justify-between gap-2">
                  <div className="flex flex-wrap justify-end gap-1">
                    {project.platforms.slice(0, 2).map((platform) => (
                      <span key={platform} className="text-[10px] px-1.5 py-0.5 rounded-sm font-medium"
                        style={{ background: 'rgba(0,0,0,0.4)', color: '#8f98a0' }}>
                        {platform}
                      </span>
                    ))}
                  </div>
                  {githubStats && (
                    <div className="flex items-center gap-2 text-[10px]" style={{ color: '#8f98a0' }}>
                      <span className="flex items-center gap-1" style={{ color: '#66c0f4' }}>
                        <Star size={11} />{githubStats.stars.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <GitFork size={11} />{githubStats.forks.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
          </div>

          {/* Right: layout spacer so list doesn't stretch full width */}
          <div ref={rightColRef} className="hidden lg:block flex-shrink-0" style={{ width: '300px' }} />
        </div>

        {/* Fixed preview panel — follows scroll, clamped to section bounds */}
        {hoveredProject && (
          <div
            ref={panelRef}
            className="hidden lg:block rounded-sm overflow-hidden"
            style={{
              position: 'fixed',
              top: panelPos.top,
              left: panelPos.left,
              width: '300px',
              zIndex: 50,
              background: '#16202d',
              border: '1px solid rgba(102,192,244,0.2)',
              pointerEvents: 'none',
            }}
          >
            {/* Project name header */}
            <div className="px-4 py-3" style={{ background: '#2a475e', borderBottom: '1px solid rgba(0,0,0,0.3)' }}>
              <h4 className="text-sm font-semibold truncate" style={{ color: '#e8f4fd' }}>{hoveredProject.name}</h4>
            </div>

            {/* Tags row */}
            <div className="px-3 py-2.5" style={{ background: '#1e3048', borderBottom: '1px solid rgba(0,0,0,0.2)' }}>
              <div className="text-[10px] mb-0.5" style={{ color: '#8f98a0' }}>Category</div>
              <div className="flex flex-wrap gap-1">
                {hoveredProject.filterTags.slice(0, 4).map((tag) => (
                  <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded-sm"
                    style={{ background: 'rgba(102,192,244,0.15)', color: '#66c0f4', border: '1px solid rgba(102,192,244,0.25)' }}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Screenshots */}
            <div className="p-2">
              {hoveredProject.image && (
                <div className="overflow-hidden rounded-sm mb-1.5" style={{ aspectRatio: '16/9', background: '#0d1926' }}>
                  <img src={hoveredProject.image} alt={hoveredProject.name} className="w-full h-full object-cover" />
                </div>
              )}
              {hoveredProject.screenshots.length > 0 && (
                <div className="space-y-1.5">
                  {hoveredProject.screenshots.slice(0, 3).map((src, i) => (
                    <div key={i} className="overflow-hidden rounded-sm" style={{ aspectRatio: '16/9', background: '#0d1926' }}>
                      <img src={src} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Detail dialog */}
      <Dialog
        open={!!selectedProject}
        onOpenChange={(open) => { if (!open) setSelectedProject(null); }}
      >
        <DialogContent
          showCloseButton={false}
          className="w-screen max-w-none h-screen max-h-none rounded-none border-0 p-0 gap-0 flex flex-col overflow-hidden"
          style={{ background: '#1b2838' }}
          onPointerDownOutside={(e) => { if (lightbox) e.preventDefault(); }}
          onInteractOutside={(e) => { if (lightbox) e.preventDefault(); }}
          onEscapeKeyDown={(e) => { if (lightbox) { e.preventDefault(); setLightbox(null); } }}
        >
          <div />
          
          <div
            ref={projectDialogScrollRef}
            onScroll={updateActiveDetailSectionFromScroll}
            className="relative z-10 flex-1 overflow-y-auto"
            style={{ background: '#1b2838' }}
          >
            <div ref={projectDetailHeaderRef} className="sticky top-0 z-20 w-full" style={{ background: '#171a21', borderBottom: '1px solid rgba(0,0,0,0.5)' }}>
              <div className="w-full max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-3.5">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: '#4a6b8a' }}>Store Page</div>
                    <h2 className="text-xl sm:text-2xl font-bold" style={{ color: '#e8f4fd' }}>{selectedProject?.name}</h2>
                  </div>

                  <button
                    onClick={() => setSelectedProject(null)}
                    className="shrink-0 p-1.5 rounded-sm transition-colors"
                    style={{ color: '#8f98a0', background: 'rgba(255,255,255,0.07)' }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#e8f4fd'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#8f98a0'; }}
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="flex items-center text-xs">
                  {(['pd-media', 'pd-about', ...(hasProjectContributions ? ['pd-contributions'] : [])] as const).map((sid) => (
                    <a
                      key={sid}
                      href={`#${sid}`}
                      onClick={(e) => { e.preventDefault(); scrollToDetailSection(sid as 'pd-media' | 'pd-about' | 'pd-contributions'); }}
                      className="relative px-3 py-1 text-xs font-semibold tracking-wide transition-all border-b-2"
                      style={{
                        color: activeDetailSection === sid ? '#c6d4df' : '#8f98a0',
                        borderBottomColor: activeDetailSection === sid ? '#66c0f4' : 'transparent',
                      }}
                    >
                      {sid === 'pd-media' ? 'Gallery' : sid === 'pd-about' ? 'About' : 'Contributions'}
                    </a>
                  ))}
                </div>
              </div>
            </div>

            <div className="w-full max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
              <div className="pt-2 sm:pt-3 lg:pt-4 space-y-8">
              <section className="grid xl:grid-cols-[minmax(0,1fr)_340px] gap-5 lg:gap-6 items-stretch" id="pd-media">
                <div className="h-full flex flex-col min-h-0 self-stretch">
                  <div className="overflow-hidden flex-1 min-h-[260px] sm:min-h-[380px] lg:min-h-[460px] relative" style={{ background: '#0d1926', border: '1px solid rgba(0,0,0,0.4)' }}>
                    <div className="absolute inset-0 flex items-center justify-center">
                    {!activeSelectedMedia && selectedProject?.image ? (
                      <img src={selectedProject.image} alt={selectedProject.name} className="max-w-full max-h-full w-auto h-auto object-contain" />
                    ) : activeSelectedMedia?.kind === 'video' ? (
                      activeSelectedMedia.videoType === 'local' ? (
                        <video src={activeSelectedMedia.src} controls className="w-full h-full object-contain" style={{ background: '#0d1926' }} />
                      ) : activeSelectedMedia.videoType === 'youtube' ? (
                        <iframe src={activeSelectedMedia.src} className="w-full h-full" allowFullScreen title={activeSelectedMedia.label} />
                      ) : null
                    ) : activeSelectedMedia?.kind === 'screenshot' ? (
                      <button className="w-full h-full" onClick={() => setLightbox(activeSelectedMedia.src)}>
                        <img src={activeSelectedMedia.src} alt={activeSelectedMedia.label} className="max-w-full max-h-full w-auto h-auto object-contain hover:opacity-90 transition-opacity mx-auto my-auto" />
                      </button>
                    ) : null}
                    </div>
                  </div>

                  {selectedProjectMedia.length > 0 && (
                    <div className="flex gap-2 overflow-x-auto pb-1 mt-3">
                      {selectedProjectMedia.map((media) => (
                        <button
                          key={media.id}
                          onClick={() => setActiveMediaId(media.id)}
                          className={`relative shrink-0 w-36 h-20 border transition-all ${
                            activeSelectedMedia?.id === media.id
                              ? 'border-[#66c0f4]'
                              : 'border-transparent hover:border-[#4a6b8a]'
                          }`}
                        >
                          {media.kind === 'video' ? (
                            <div className="w-full h-full flex items-center justify-center" style={{ background: '#0d1926' }}>
                              <Play size={16} style={{ color: '#66c0f4' }} />
                            </div>
                          ) : (
                            <img src={media.src} alt={media.label} className="w-full h-full object-cover opacity-80" />
                          )}
                          <span className="absolute bottom-1 left-1 right-1 text-[9px] leading-tight truncate text-left px-1 py-0.5" style={{ color: '#c6d4df', background: 'rgba(13,25,38,0.9)' }}>
                            {media.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <aside className="p-4 sm:p-5 space-y-4 h-full self-stretch rounded-sm" style={{ background: '#16202d', border: '1px solid rgba(0,0,0,0.3)' }}>
                  {selectedProject?.image && (
                    <img src={selectedProject.image} alt={selectedProject.name} className="w-full object-cover" style={{ maxHeight: '176px', border: '1px solid rgba(0,0,0,0.4)' }} />
                  )}

                  <p className="text-sm leading-relaxed" style={{ color: '#c6d4df' }}>{selectedProject?.shortDescription}</p>

                  {selectedProjectGitHubStats && (
                    <div className="grid grid-cols-3 gap-1 text-[10px]">
                      <span className="flex flex-col items-center justify-center px-2 py-2" style={{ border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.2)', color: '#8f98a0' }}>
                        <Star size={12} className="mb-1" style={{ color: '#66c0f4' }} />
                        {selectedProjectGitHubStats.stars.toLocaleString()}
                      </span>
                      <span className="flex flex-col items-center justify-center px-2 py-2" style={{ border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.2)', color: '#8f98a0' }}>
                        <GitFork size={12} className="mb-1" style={{ color: '#66c0f4' }} />
                        {selectedProjectGitHubStats.forks.toLocaleString()}
                      </span>
                      <span className="flex flex-col items-center justify-center px-2 py-2" style={{ border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.2)', color: '#8f98a0' }}>
                        <Users size={12} className="mb-1" style={{ color: '#66c0f4' }} />
                        {selectedProjectGitHubStats.contributors.toLocaleString()}
                      </span>
                    </div>
                  )}

                  <div className="space-y-2 text-xs" style={{ color: '#c6d4df' }}>
                    <div className="flex items-start gap-2">
                      <span className="min-w-[80px]" style={{ color: '#8f98a0' }}>Category:</span>
                      <span>{selectedProject?.category || 'Project'}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="min-w-[80px]" style={{ color: '#8f98a0' }}>Status:</span>
                      <span style={{ color: selectedProject?.published ? '#a4d007' : '#c6d4df' }}>{selectedProject?.published ? 'Released' : 'In Development'}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="min-w-[80px]" style={{ color: '#8f98a0' }}>Platforms:</span>
                      <span>{selectedProject?.platforms.join(', ') || 'N/A'}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="min-w-[80px]" style={{ color: '#8f98a0' }}>Genre:</span>
                      <span>{selectedProject?.genre.join(', ') || 'N/A'}</span>
                    </div>
                  </div>

                  {hasProjectLinks && (
                    <div className="space-y-2 pt-1">
                      {selectedProjectNonGithubLinks.map((link) => (
                        <a
                          key={link.url}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-primary w-full text-xs flex items-center gap-2 justify-center"
                        >
                          <ExternalLink size={14} />
                          {(link.label || link.text || 'Visit Link').replace(/`+/g, '').trim()}
                        </a>
                      ))}
                      {selectedProjectGithubLink && (
                        <a
                          href={selectedProjectGithubLink.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-ghost w-full text-xs flex items-center gap-2 justify-center"
                        >
                          <Github size={14} />
                          {(selectedProjectGithubLink.label || selectedProjectGithubLink.text || 'GitHub').replace(/`+/g, '').trim()}
                        </a>
                      )}
                    </div>
                  )}

                  {selectedProject?.platforms?.length || selectedProject?.genre?.length ? (
                    <div className="pt-2 space-y-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                      <div className="flex flex-wrap gap-1">
                        {selectedProject?.platforms?.map((p) => <span key={p} className="tag-cyan text-[10px]">{p}</span>)}
                        {selectedProject?.genre?.map((g) => <span key={g} className="tag-violet text-[10px]">{g}</span>)}
                      </div>
                    </div>
                  ) : null}
                </aside>
              </section>

              <section id="pd-about" className="rounded-sm overflow-hidden" style={{ background: '#16202d', border: '1px solid rgba(0,0,0,0.3)' }}>
                <div className="px-5 py-3 flex items-center justify-between" style={{ background: '#2a475e' }}>
                  <span className="text-sm font-semibold" style={{ color: '#c6d4df' }}>About This Project</span>
                  <span className="text-xs" style={{ color: '#8f98a0' }}>{selectedProjectVisibleMediaCount} media files</span>
                </div>
                <div className="p-5 space-y-5">
                  <p className="text-sm leading-relaxed" style={{ color: '#c6d4df' }}>{selectedProject?.shortDescription}</p>

                  {selectedProject?.features && selectedProject.features.length > 0 && (
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#8f98a0' }}>Key Features</div>
                      <ul className="grid md:grid-cols-2 gap-x-8 gap-y-2">
                        {selectedProject.features.map((feature, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm leading-relaxed" style={{ color: '#c6d4df' }}>
                            <span className="shrink-0 mt-0.5" style={{ color: '#66c0f4' }}>&#9656;</span>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#8f98a0' }}>Technologies</div>
                    <div className="flex flex-wrap gap-1">
                      {selectedProject?.skills.map((skill) => (
                        <span key={skill} className="tag-cyan text-[10px]">{skill}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              {selectedProject?.contributions && selectedProject.contributions.length > 0 && (
                <section id="pd-contributions" className="rounded-sm overflow-hidden" style={{ border: '1px solid rgba(0,0,0,0.3)' }}>
                  <div className="px-5 py-3 flex items-center justify-between" style={{ background: '#2a475e' }}>
                    <span className="text-sm font-semibold flex items-center gap-2" style={{ color: '#c6d4df' }}>
                      <Wrench size={13} />
                      My Contributions
                    </span>
                    <span className="text-xs" style={{ color: '#8f98a0' }}>{selectedProject.contributions.length} entries</span>
                  </div>
                  <div className="divide-y" style={{ background: '#16202d', borderColor: 'rgba(0,0,0,0.3)' }}>
                    {visibleSelectedProjectContributionScreenshots.map((contribution, contributionIndex) => {
                      const loadedContributionScreenshots = contribution.screenshot.filter((src) => isImageLoaded(src));

                      return (
                        <article key={contributionIndex} className="transition-colors" style={{ borderColor: 'rgba(0,0,0,0.3)' }}
                          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#1e3048'; }}
                          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = ''; }}>
                          <div className="p-5 pb-4 flex items-start gap-4">
                            <span className="text-2xl font-black tabular-nums shrink-0 leading-none select-none" style={{ color: 'rgba(74,107,138,0.5)' }}>
                              {String(contributionIndex + 1).padStart(2, '0')}
                            </span>
                            <div className="min-w-0">
                              <h4 className="font-semibold text-sm sm:text-base leading-snug mb-2" style={{ color: '#66c0f4' }}>{contribution.title}</h4>
                              <p className="text-sm leading-relaxed" style={{ color: '#8f98a0' }}>{contribution.description}</p>
                            </div>
                          </div>
                          {loadedContributionScreenshots.length > 0 && (
                            <div className="px-5 pb-5 pl-[calc(1.25rem+3rem+1rem)]">
                              <div className="text-[10px] mb-2 uppercase tracking-wider" style={{ color: '#4a6b8a' }}>
                                {loadedContributionScreenshots.length} screenshot{loadedContributionScreenshots.length > 1 ? 's' : ''}
                              </div>
                              <div className="flex gap-2 overflow-x-auto pb-1">
                                {loadedContributionScreenshots.map((src, screenshotIndex) => (
                                  <button
                                    key={screenshotIndex}
                                    onClick={() => setLightbox(src)}
                                    className="group/img relative shrink-0 overflow-hidden transition-all duration-200"
                                    style={{ width: '160px', height: '90px', border: '1px solid rgba(0,0,0,0.4)' }}
                                    onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#66c0f4'; }}
                                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(0,0,0,0.4)'; }}
                                  >
                                    <img
                                      src={src}
                                      alt={`${contribution.title} ${screenshotIndex + 1}`}
                                      className="w-full h-full object-cover opacity-75 group-hover/img:opacity-100 group-hover/img:scale-105 transition-all duration-300"
                                    />
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </article>
                      );
                    })}
                  </div>
                </section>
              )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Lightbox Dialog – separate Radix Dialog so it manages its own dismiss/stack */}
      <Dialog open={!!lightbox} onOpenChange={(open) => !open && setLightbox(null)}>
        <DialogContent
          showCloseButton={false}
          className="max-w-[98vw] max-h-[98vh] w-auto h-auto bg-transparent border-0 shadow-none p-0 flex items-center justify-center"
        >
          <button
            className="absolute top-3 right-3 z-10 text-slate-400 hover:text-white transition-colors bg-slate-900/90 border border-slate-700 p-2"
            onClick={() => setLightbox(null)}
          >
            <X size={18} />
          </button>
          {lightbox && (
            <img
              src={lightbox}
              alt="Preview"
              className="max-w-[95vw] max-h-[95vh] object-contain border border-slate-700"
              onError={() => setLightbox(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default Projects;



