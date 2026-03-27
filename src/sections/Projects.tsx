import { useEffect, useMemo, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ExternalLink, Github, X, ChevronRight, Play, Wrench, Star, GitFork, Users } from 'lucide-react';
import data, { type PortfolioProject } from '../lib/portfolio';
import { fetchGitHubRepoStats, parseGitHubRepoFromUrl, type GitHubRepoStats } from '@/lib/github';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
  const [activeFilter, setActiveFilter] = useState('Showcase');
  const [selectedProject, setSelectedProject] = useState<PortfolioProject | null>(null);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [activeMediaId, setActiveMediaId] = useState<string | null>(null);
  const [projectGitHubStats, setProjectGitHubStats] = useState<Record<string, GitHubRepoStats>>({});
  const [imageStates, setImageStates] = useState<Record<string, ImageLoadState>>({});
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
  const filtered =
    activeFilter === 'Showcase' ? data.projects.filter((p) => p.featured) :
    activeFilter === 'All' ? data.projects :
    activeFilter === 'Published' ? data.projects.filter((p) => p.published) :
    data.projects.filter((p) => p.filterTags.includes(activeFilter));
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
  const selectedProjectVisibleMediaCount = (selectedProject?.videos?.length ?? 0) + visibleSelectedProjectScreenshots.length;
  const selectedProjectGithubLink = selectedProject?.links.find(
    (link) =>
      link.type?.toLowerCase() === 'github' ||
      link.icon?.toLowerCase() === 'github' ||
      link.url.toLowerCase().includes('github.com/'),
  );

  const selectedProjectNonGithubLinks = selectedProject?.links.filter((link) => link !== selectedProjectGithubLink) ?? [];

  useEffect(() => {
    setActiveMediaId(null);
  }, [selectedProject?.id]);

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
  }, [filtered]);

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

  return (
    <section id="projects" ref={sectionRef} className="relative py-28 lg:py-36 reveal-section">
      <div className="divider-cyan mb-24 mx-6 lg:mx-12" />
      <div className="w-full px-6 lg:px-12">

        {/* Header */}
        <div className="pj-header mb-12 flex items-end justify-between flex-wrap gap-4">
          <div>
            <div className="section-label mb-3">02 // PROJECTS</div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white">
              BUILT <span className="text-gradient-cyan">SYSTEMS</span>
            </h2>
          </div>
          <div className="mono text-xs text-slate-500 pb-2">
            SHOWING <span className="text-cyan-400">{filtered.length}</span> / {data.projects.length} PROJECTS
          </div>
        </div>

        {/* Filters */}
        <div className="pj-filters flex flex-wrap gap-2 mb-4">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              className={`pj-filter mono text-xs px-4 py-2 border transition-all ${
                activeFilter === cat
                  ? 'border-cyan-400/60 bg-cyan-400/10 text-cyan-400'
                  : 'border-slate-700 text-slate-500 hover:border-slate-500 hover:text-slate-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>



        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((project) => {
            const githubLink = project.links.find(
              (link) =>
                link.type?.toLowerCase() === 'github' ||
                link.icon?.toLowerCase() === 'github' ||
                link.url.toLowerCase().includes('github.com/'),
            );
            const websiteLink = project.links.find(
              (link) =>
                link.type?.toLowerCase() === 'demo' ||
                link.type?.toLowerCase() === 'live' ||
                link.type?.toLowerCase() === 'website',
            );
            const githubStats = getProjectGitHubStats(project);

            return (
            <article
              key={project.id}
              data-project-id={project.id}
              className="pj-card game-card clip-tl group cursor-pointer flex flex-col"
              onClick={() => setSelectedProject(project)}
            >
              <div className="pokemon-card-inner">
                {/* Image */}
                {project.image && isImageLoaded(project.image) && (
                  <div className="relative overflow-hidden h-44 shrink-0">
                    <img
                      src={project.image}
                      alt={project.name}
                      className="w-full h-full object-cover opacity-70 group-hover:opacity-90 group-hover:scale-105 transition-all duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-transparent to-slate-950/80" />
                    <div className="absolute top-3 right-3 flex flex-wrap justify-end gap-1 max-w-[80%]">
                      {project.platforms.map((platform) => (
                        <span
                          key={platform}
                          className="tag-violet bg-slate-950/90 text-violet-200 border-violet-300/45 backdrop-blur-sm shadow-sm"
                        >
                          {platform}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Body */}
                <div className="p-5 flex flex-col flex-1 gap-3 relative">
                  {githubStats && (
                    <div className="absolute top-4 right-4 flex items-center gap-2 text-[10px] mono text-slate-400 bg-slate-950/70 border border-slate-800 px-2 py-1 rounded-sm">
                      <span className="flex items-center gap-1">
                        <Star size={10} className="text-slate-400" />
                        {githubStats.stars.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <GitFork size={10} className="text-slate-400" />
                        {githubStats.forks.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users size={10} className="text-slate-400" />
                        {githubStats.contributors.toLocaleString()}
                      </span>
                    </div>
                  )}
                  {(!project.image || isImageFailed(project.image) || getImageState(project.image) === 'loading') && (
                    <div className="flex flex-wrap gap-1.5 self-start">
                      {project.platforms.map((platform) => (
                        <span key={platform} className="tag-violet">{platform}</span>
                      ))}
                    </div>
                  )}
                  <h3 className={`font-bold text-white group-hover:text-cyan-400 transition-colors leading-snug ${githubStats ? 'pr-28' : ''}`}>{project.name}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed flex-1 line-clamp-3">{project.shortDescription}</p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5">
                    {project.skills.slice(0, 4).map((t) => (
                      <span key={t} className="tag-cyan text-[10px]">{t}</span>
                    ))}
                    {project.skills.length > 4 && (
                      <span className="tag-cyan text-[10px]">+{project.skills.length - 4}</span>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                    <div className="flex gap-3">
                      {githubLink && (
                        <a href={githubLink.url} onClick={(e) => e.stopPropagation()} target="_blank" rel="noopener noreferrer" className="text-slate-600 hover:text-white transition-colors">
                          <Github size={15} />
                        </a>
                      )}
                      {websiteLink && (
                        <a href={websiteLink.url} onClick={(e) => e.stopPropagation()} target="_blank" rel="noopener noreferrer" className="text-slate-600 hover:text-cyan-400 transition-colors">
                          <ExternalLink size={15} />
                        </a>
                      )}
                    </div>
                    <span className="flex items-center gap-1 text-slate-600 group-hover:text-cyan-400 transition-colors mono text-xs">
                      VIEW <ChevronRight size={12} />
                    </span>
                  </div>
                </div>
              </div>
            </article>
            );
          })}
        </div>
      </div>

      {/* Detail dialog */}
      <Dialog
        open={!!selectedProject}
        onOpenChange={(open) => { if (!open) setSelectedProject(null); }}
      >
        <DialogContent
          showCloseButton={false}
          className="w-screen max-w-none h-screen max-h-none rounded-none bg-slate-950/95 border-0 p-0 gap-0 flex flex-col overflow-hidden backdrop-blur-xl"
          onPointerDownOutside={(e) => { if (lightbox) e.preventDefault(); }}
          onInteractOutside={(e) => { if (lightbox) e.preventDefault(); }}
          onEscapeKeyDown={(e) => { if (lightbox) { e.preventDefault(); setLightbox(null); } }}
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,229,255,0.12),transparent_45%),radial-gradient(circle_at_bottom_left,rgba(139,92,246,0.10),transparent_45%)]" />
          <div className="relative z-10 shrink-0 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-sm">
            <div className="w-full max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-start justify-between gap-4">
              <DialogHeader className="p-0 m-0 flex-1 min-w-0 text-left">
                <div className="section-label mb-1">STORE PAGE // PROJECT</div>
                <DialogTitle className="text-2xl sm:text-3xl font-black text-white leading-tight truncate">
                  {selectedProject?.name}
                </DialogTitle>
                <DialogDescription className="text-slate-300 text-sm mt-1.5 line-clamp-2">
                  {selectedProject?.shortDescription}
                </DialogDescription>
              </DialogHeader>
              <button
                onClick={() => setSelectedProject(null)}
                className="shrink-0 text-slate-300 hover:text-white transition-all border border-slate-700/80 hover:border-cyan-400/50 bg-slate-950/70 p-2"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          <div className="relative z-10 flex-1 overflow-y-auto bg-gradient-to-b from-slate-900/10 to-slate-950/30">
            <div className="w-full max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 space-y-8">
              <section className="grid xl:grid-cols-[minmax(0,1fr)_340px] gap-5 lg:gap-6 items-stretch">
                <div className="h-full flex flex-col min-h-0">
                  <div className="border border-slate-800 bg-slate-950/70 overflow-hidden flex-1 min-h-[260px] sm:min-h-[380px] lg:min-h-[460px]">
                    {!activeSelectedMedia && selectedProject?.image ? (
                      <img src={selectedProject.image} alt={selectedProject.name} className="w-full h-full object-cover" />
                    ) : activeSelectedMedia?.kind === 'video' ? (
                      activeSelectedMedia.videoType === 'local' ? (
                        <video src={activeSelectedMedia.src} controls className="w-full h-full object-contain bg-slate-900" />
                      ) : activeSelectedMedia.videoType === 'youtube' ? (
                        <iframe src={activeSelectedMedia.src} className="w-full h-full min-h-[260px] sm:min-h-[380px] lg:min-h-[460px]" allowFullScreen title={activeSelectedMedia.label} />
                      ) : null
                    ) : activeSelectedMedia?.kind === 'screenshot' ? (
                      <button className="w-full h-full" onClick={() => setLightbox(activeSelectedMedia.src)}>
                        <img src={activeSelectedMedia.src} alt={activeSelectedMedia.label} className="w-full h-full object-cover hover:opacity-90 transition-opacity" />
                      </button>
                    ) : null}
                  </div>

                  {selectedProjectMedia.length > 0 && (
                    <div className="flex gap-2 overflow-x-auto pb-1 mt-3">
                      {selectedProjectMedia.map((media) => (
                        <button
                          key={media.id}
                          onClick={() => setActiveMediaId(media.id)}
                          className={`relative shrink-0 w-36 h-20 border transition-all ${
                            activeSelectedMedia?.id === media.id
                              ? 'border-cyan-400/80 shadow-[0_0_0_1px_rgba(0,229,255,0.25)]'
                              : 'border-slate-800 hover:border-slate-600'
                          }`}
                        >
                          {media.kind === 'video' ? (
                            <div className="w-full h-full bg-slate-900 flex items-center justify-center">
                              <Play size={16} className="text-cyan-300" />
                            </div>
                          ) : (
                            <img src={media.src} alt={media.label} className="w-full h-full object-cover opacity-80" />
                          )}
                          <span className="absolute bottom-1 left-1 right-1 mono text-[9px] leading-tight text-white bg-slate-950/85 border border-slate-700/70 px-1 py-0.5 truncate text-left">
                            {media.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <aside className="game-card border border-slate-800/90 bg-slate-900/55 p-4 sm:p-5 space-y-4 h-full self-stretch">
                  {selectedProject?.image && (
                    <img src={selectedProject.image} alt={selectedProject.name} className="w-full border border-slate-800 object-cover max-h-44" />
                  )}

                  <p className="text-sm text-slate-300 leading-relaxed">{selectedProject?.shortDescription}</p>

                  {selectedProjectGitHubStats && (
                    <div className="grid grid-cols-3 gap-2 text-[10px] mono text-slate-300/90">
                      <span className="flex flex-col items-center justify-center border border-slate-700/70 bg-slate-950/60 px-2 py-2">
                        <Star size={12} className="text-slate-400 mb-1" />
                        {selectedProjectGitHubStats.stars.toLocaleString()} STARS
                      </span>
                      <span className="flex flex-col items-center justify-center border border-slate-700/70 bg-slate-950/60 px-2 py-2">
                        <GitFork size={12} className="text-slate-400 mb-1" />
                        {selectedProjectGitHubStats.forks.toLocaleString()} FORKS
                      </span>
                      <span className="flex flex-col items-center justify-center border border-slate-700/70 bg-slate-950/60 px-2 py-2">
                        <Users size={12} className="text-slate-400 mb-1" />
                        {selectedProjectGitHubStats.contributors.toLocaleString()} CONTRIB
                      </span>
                    </div>
                  )}

                  <div className="space-y-2 text-xs">
                    <div className="flex items-start gap-2">
                      <span className="mono text-slate-500 min-w-[86px]">Category:</span>
                      <span className="text-slate-300">{selectedProject?.category || 'Project'}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="mono text-slate-500 min-w-[86px]">Status:</span>
                      <span className="text-slate-300">{selectedProject?.published ? 'Published' : 'In Development'}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="mono text-slate-500 min-w-[86px]">Platforms:</span>
                      <span className="text-slate-300">{selectedProject?.platforms.join(', ') || 'N/A'}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="mono text-slate-500 min-w-[86px]">Genre:</span>
                      <span className="text-slate-300">{selectedProject?.genre.join(', ') || 'N/A'}</span>
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
                    <div className="pt-2 border-t border-slate-800 space-y-2">
                      <div className="flex flex-wrap gap-1.5">
                        {selectedProject?.platforms?.map((p) => <span key={p} className="tag-cyan text-[10px]">{p}</span>)}
                        {selectedProject?.genre?.map((g) => <span key={g} className="tag-violet text-[10px]">{g}</span>)}
                      </div>
                    </div>
                  ) : null}
                </aside>
              </section>

              <section className="game-card border border-slate-800/90 bg-slate-900/35 p-5 sm:p-6 space-y-5">
                <div className="flex items-center gap-3">
                  <div className="section-label">ABOUT THIS PROJECT</div>
                  <div className="flex-1 h-px bg-slate-800" />
                  <span className="mono text-[10px] text-slate-600">{selectedProjectVisibleMediaCount} media</span>
                </div>

                <p className="text-sm text-slate-300 leading-relaxed">{selectedProject?.shortDescription}</p>

                {selectedProject?.features && selectedProject.features.length > 0 && (
                  <div>
                    <div className="section-label mb-2.5">KEY FEATURES</div>
                    <ul className="grid md:grid-cols-2 gap-x-8 gap-y-2">
                      {selectedProject.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-slate-400 leading-relaxed">
                          <span className="text-cyan-400 shrink-0 mt-0.5">&#9656;</span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div>
                  <div className="section-label mb-2.5">TECHNOLOGIES</div>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedProject?.skills.map((skill) => (
                      <span key={skill} className="tag-cyan text-[10px]">{skill}</span>
                    ))}
                  </div>
                </div>
              </section>

              {selectedProject?.contributions && selectedProject.contributions.length > 0 && (
                <section id="pd-contributions" className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Wrench size={14} className="text-cyan-400 shrink-0" />
                    <div className="section-label">MY WORK ON THIS PROJECT</div>
                    <div className="flex-1 h-px bg-slate-800" />
                    <span className="mono text-[10px] text-slate-600">{selectedProject.contributions.length} entries</span>
                  </div>
                  <div className="space-y-4">
                    {visibleSelectedProjectContributionScreenshots.map((contribution, contributionIndex) => {
                      const loadedContributionScreenshots = contribution.screenshot.filter((src) => isImageLoaded(src));

                      return (
                        <article key={contributionIndex} className="border border-slate-800/90 bg-slate-900/35 hover:bg-slate-900/50 transition-colors">
                          <div className="p-5 pb-4 flex items-start gap-4">
                            <span className="mono text-3xl font-black text-slate-800/80 tabular-nums shrink-0 leading-none select-none">
                              {String(contributionIndex + 1).padStart(2, '0')}
                            </span>
                            <div className="min-w-0">
                              <h4 className="font-bold text-cyan-300 text-sm sm:text-base leading-snug mb-2">{contribution.title}</h4>
                              <p className="text-sm text-slate-400 leading-relaxed">{contribution.description}</p>
                            </div>
                          </div>
                          {loadedContributionScreenshots.length > 0 && (
                            <div className="px-5 pb-5 pl-[calc(1.25rem+3rem+1rem)]">
                              <div className="mono text-[10px] text-slate-600 mb-2 uppercase tracking-wider">
                                {loadedContributionScreenshots.length} screenshot{loadedContributionScreenshots.length > 1 ? 's' : ''}
                              </div>
                              <div className="flex gap-2 overflow-x-auto pb-1">
                                {loadedContributionScreenshots.map((src, screenshotIndex) => (
                                  <button
                                    key={screenshotIndex}
                                    onClick={() => setLightbox(src)}
                                    className="group/img relative shrink-0 overflow-hidden border border-slate-800 hover:border-cyan-400/50 transition-all duration-200"
                                    style={{ width: '160px', height: '90px' }}
                                  >
                                    <img
                                      src={src}
                                      alt={`${contribution.title} ${screenshotIndex + 1}`}
                                      className="w-full h-full object-cover opacity-70 group-hover/img:opacity-100 group-hover/img:scale-105 transition-all duration-300"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity bg-slate-950/40">
                                      <span className="mono text-[9px] text-white bg-slate-950/80 border border-slate-700 px-1.5 py-0.5">EXPAND</span>
                                    </div>
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


