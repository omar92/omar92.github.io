import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ExternalLink, Github, Play, Star, GitFork, FolderGit2 } from 'lucide-react';
import data, { type PortfolioProject } from '../lib/portfolio';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

gsap.registerPlugin(ScrollTrigger);

const Projects = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [selectedProject, setSelectedProject] = useState<PortfolioProject | null>(null);
  const [filter, setFilter] = useState('All');

  const filters = ['All', ...Array.from(new Set(data.projects.flatMap((project) => project.filterTags)))];

  const filteredProjects = filter === 'All'
    ? data.projects
    : data.projects.filter((p) => p.filterTags.includes(filter));

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Section label
      gsap.fromTo(
        '.projects-label',
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 70%',
          },
        }
      );

      // Headline
      gsap.fromTo(
        '.projects-headline',
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 70%',
          },
          delay: 0.1,
        }
      );

      // Description
      gsap.fromTo(
        '.projects-description',
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 70%',
          },
          delay: 0.3,
        }
      );

      // Filter buttons
      gsap.fromTo(
        '.filter-btn',
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
          stagger: 0.05,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: '.filter-container',
            start: 'top 80%',
          },
        }
      );

      // Project cards
      gsap.fromTo(
        '.project-card',
        { opacity: 0, y: 50, rotateY: -15 },
        {
          opacity: 1,
          y: 0,
          rotateY: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: '.projects-grid',
            start: 'top 80%',
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const handleOpenProject = (event: Event) => {
      const customEvent = event as CustomEvent<{ projectId?: string }>;
      const projectId = customEvent.detail?.projectId;
      if (!projectId) return;

      const matchedProject = data.projects.find((project) => project.id === projectId);
      if (!matchedProject) return;

      setFilter('All');
      setSelectedProject(matchedProject);
    };

    window.addEventListener('open-project', handleOpenProject);
    return () => window.removeEventListener('open-project', handleOpenProject);
  }, []);

  const getProjectImage = (project: PortfolioProject) => {
    if (project.image.startsWith('http')) {
      return project.image;
    }
    const fallbacks: Record<string, string> = {
      '3ashara-talwa': 'https://images.unsplash.com/photo-1611996908543-160275cc2f11?w=800&q=80',
      'estimation-kings': 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=800&q=80',
      'rhythm-attack': 'https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?w=800&q=80',
      'zinad-games': 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&q=80',
      'unity-scroll': 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80',
      'cityville': 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&q=80',
    };
    return fallbacks[project.id] || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&q=80';
  };

  return (
    <section
      id="projects"
      ref={sectionRef}
      className="relative py-24 lg:py-32"
    >
      <div className="w-full px-6 lg:px-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="projects-label inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-4">
            <FolderGit2 size={16} className="text-indigo-400" />
            <span className="text-sm text-indigo-300">Portfolio</span>
          </div>
          <h2
            className="projects-headline text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Featured <span className="text-gradient">Projects</span>
          </h2>
          <p className="projects-description text-slate-400 max-w-2xl mx-auto">
            A selection of games and interactive experiences I&apos;ve crafted throughout my career
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="filter-container flex flex-wrap justify-center gap-2 mb-12">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`filter-btn px-4 py-2 text-sm font-medium rounded-full transition-all ${
                filter === f
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white'
                  : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50 hover:text-white'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Projects Grid */}
        <div className="projects-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="project-card group cursor-pointer"
              onClick={() => setSelectedProject(project)}
              style={{ perspective: '1000px' }}
            >
              {/* Image */}
              <div className="relative aspect-video overflow-hidden rounded-t-xl">
                <img
                  src={getProjectImage(project)}
                  alt={project.name}
                  className="project-image w-full h-full object-cover"
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                
                {/* Stats badge */}
                {project.stats?.stars && (
                  <div className="absolute top-3 right-3 flex items-center gap-3">
                    <span className="flex items-center gap-1 px-2 py-1 bg-slate-900/80 rounded-full text-xs text-amber-400">
                      <Star size={12} fill="currentColor" />
                      {project.stats?.stars}
                    </span>
                    {project.stats?.forks && (
                      <span className="flex items-center gap-1 px-2 py-1 bg-slate-900/80 rounded-full text-xs text-slate-400">
                        <GitFork size={12} />
                        {project.stats?.forks}
                      </span>
                    )}
                  </div>
                )}

                {/* Category badge */}
                <div className="absolute top-3 left-3">
                  <span className="px-3 py-1 bg-gradient-to-r from-indigo-600/80 to-violet-600/80 backdrop-blur-sm rounded-full text-xs font-medium text-white">
                    {project.category}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors">
                  {project.name}
                </h3>
                <p className="text-slate-400 text-sm line-clamp-2 mb-4">
                  {project.shortDescription}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {project.tags.slice(0, 3).map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-slate-800/50 rounded text-xs text-slate-500"
                    >
                      {tag}
                    </span>
                  ))}
                  {project.tags.length > 3 && (
                    <span className="px-2 py-1 bg-slate-800/50 rounded text-xs text-slate-500">
                      +{project.tags.length - 3}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Project Detail Dialog */}
      <Dialog open={!!selectedProject} onOpenChange={() => setSelectedProject(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto glass-card border-slate-700 text-white">
          {selectedProject && (
            <>
              {/* Header Image */}
              <div className="relative aspect-video -mx-6 -mt-6 mb-6 overflow-hidden rounded-t-lg">
                <img
                  src={getProjectImage(selectedProject)}
                  alt={selectedProject.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
              </div>

              <DialogHeader>
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-3 py-1 bg-indigo-500/20 border border-indigo-500/30 rounded-full text-xs font-medium text-indigo-400">
                    {selectedProject.category}
                  </span>
                  {selectedProject.stats?.stars && (
                    <span className="flex items-center gap-1 text-xs text-amber-400">
                      <Star size={14} fill="currentColor" />
                      {selectedProject.stats.stars} stars
                    </span>
                  )}
                </div>
                <DialogTitle
                  className="text-3xl font-bold text-white"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  {selectedProject.name}
                </DialogTitle>
                <DialogDescription className="text-slate-400">
                  {selectedProject.description}
                </DialogDescription>
              </DialogHeader>

              {/* Features */}
              {selectedProject.features && (
                <div className="mt-6">
                  <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3">
                    Key Features
                  </h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedProject.features.map((feature, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-2 text-sm text-slate-400"
                      >
                        <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-1.5 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Videos */}
              {selectedProject.videos && selectedProject.videos.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3">
                    Videos
                  </h4>
                  <div className="grid gap-4">
                    {selectedProject.videos.map((video, index) => (
                      <div key={index} className="aspect-video rounded-lg overflow-hidden">
                        <iframe
                          src={video}
                          title={`Video ${index + 1}`}
                          className="w-full h-full"
                          allowFullScreen
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Screenshots */}
              {selectedProject.screenshots.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3">
                    Screenshots
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedProject.screenshots.map((screenshot, index) => (
                      <div key={index} className="aspect-video rounded-lg overflow-hidden border border-slate-700">
                        <img
                          src={screenshot}
                          alt={`${selectedProject.name} screenshot ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Platform & Genre */}
              {(selectedProject.platforms.length > 0 || selectedProject.genre.length > 0) && (
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {selectedProject.platforms.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-2">
                        Platforms
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedProject.platforms.map((platform, index) => (
                          <span
                            key={`${platform}-${index}`}
                            className="px-3 py-1 bg-slate-800/50 border border-slate-700 rounded-full text-sm text-slate-400"
                          >
                            {platform}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedProject.genre.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-2">
                        Genre
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedProject.genre.map((genre, index) => (
                          <span
                            key={`${genre}-${index}`}
                            className="px-3 py-1 bg-slate-800/50 border border-slate-700 rounded-full text-sm text-slate-400"
                          >
                            {genre}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Tags */}
              <div className="mt-6">
                <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3">
                  Technologies
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedProject.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-slate-800/50 border border-slate-700 rounded-full text-sm text-slate-400"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Links */}
              {selectedProject.links.length > 0 && (
                <div className="mt-6 flex flex-wrap gap-3">
                  {selectedProject.links.map((link, index) => (
                    <a
                      key={index}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-medium transition-all ${
                        link.type === 'github'
                          ? 'bg-slate-800 text-white hover:bg-slate-700'
                          : link.type === 'store'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30'
                          : 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:from-indigo-500 hover:to-violet-500'
                      }`}
                    >
                      {link.type === 'github' && <Github size={18} />}
                      {link.type === 'store' && <Play size={18} />}
                      {link.type !== 'github' && link.type !== 'store' && <ExternalLink size={18} />}
                      {link.text}
                    </a>
                  ))}
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default Projects;
