import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ExternalLink, Github, X, ChevronRight, Play, Monitor, Gamepad2 } from 'lucide-react';
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
  const [activeFilter, setActiveFilter] = useState('Showcase');
  const [selectedProject, setSelectedProject] = useState<PortfolioProject | null>(null);
  const [lightbox, setLightbox] = useState<string | null>(null);

  const categories = ['Showcase', 'All', ...Array.from(new Set(data.projects.flatMap((p) => p.filterTags)))];
  const filtered =
    activeFilter === 'Showcase' ? data.projects.filter((p) => p.featured) :
    activeFilter === 'All' ? data.projects :
    data.projects.filter((p) => p.filterTags.includes(activeFilter));

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
          {filtered.map((project) => (
            <article
              key={project.id}
              className="pj-card game-card clip-tl group cursor-pointer flex flex-col"
              onClick={() => setSelectedProject(project)}
            >
              {/* Image */}
              {project.image && (
                <div className="relative overflow-hidden h-44 shrink-0">
                  <img src={project.image} alt={project.name} className="w-full h-full object-cover opacity-70 group-hover:opacity-90 group-hover:scale-105 transition-all duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                  <span className="absolute top-3 right-3 tag-violet">{project.category}</span>
                </div>
              )}

              {/* Body */}
              <div className="p-5 flex flex-col flex-1 gap-3">
                {!project.image && (
                  <span className="tag-violet self-start">{project.category}</span>
                )}
                <h3 className="font-bold text-white group-hover:text-cyan-400 transition-colors leading-snug">{project.name}</h3>
                <p className="text-sm text-slate-400 leading-relaxed flex-1 line-clamp-3">{project.description}</p>

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
                    {project.links.find(l => l.type === 'github' || l.icon === 'github') && (
                      <a href={project.links.find(l => l.type === 'github' || l.icon === 'github')!.url} onClick={(e) => e.stopPropagation()} target="_blank" rel="noopener noreferrer" className="text-slate-600 hover:text-white transition-colors">
                        <Github size={15} />
                      </a>
                    )}
                    {project.links.find(l => l.type === 'demo' || l.type === 'live' || l.type === 'website') && (
                      <a href={project.links.find(l => l.type === 'demo' || l.type === 'live' || l.type === 'website')!.url} onClick={(e) => e.stopPropagation()} target="_blank" rel="noopener noreferrer" className="text-slate-600 hover:text-cyan-400 transition-colors">
                        <ExternalLink size={15} />
                      </a>
                    )}
                  </div>
                  <span className="flex items-center gap-1 text-slate-600 group-hover:text-cyan-400 transition-colors mono text-xs">
                    VIEW <ChevronRight size={12} />
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Detail dialog */}
      <Dialog open={!!selectedProject} onOpenChange={(open) => !open && setSelectedProject(null)}>
        <DialogContent
          showCloseButton={false}
          className="w-[98vw] max-w-[1600px] max-h-[94vh] h-[94vh] bg-slate-950 border border-slate-700/60 p-0 gap-0 flex flex-col overflow-hidden"
          onPointerDownOutside={(e) => { if (lightbox) e.preventDefault(); }}
          onInteractOutside={(e) => { if (lightbox) e.preventDefault(); }}
          onEscapeKeyDown={(e) => { if (lightbox) { e.preventDefault(); setLightbox(null); } }}
        >

          {/* Hero banner */}
          <div className="relative h-52 sm:h-64 shrink-0 overflow-hidden">
            {selectedProject?.image ? (
              <img
                src={selectedProject.image}
                alt={selectedProject.name}
                className="w-full h-full object-cover opacity-50"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-slate-900 to-slate-800" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/60 to-transparent" />

            {/* Close */}
            <button
              onClick={() => setSelectedProject(null)}
              className="absolute top-4 right-4 z-10 text-slate-400 hover:text-white transition-colors bg-slate-900/80 border border-slate-700 p-1.5 backdrop-blur-sm"
            >
              <X size={16} />
            </button>

            {/* Info overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
              <div className="flex flex-wrap gap-1.5 mb-2">
                {selectedProject?.genre?.map((g) => (
                  <span key={g} className="tag-violet text-[10px]">{g}</span>
                ))}
                {selectedProject?.platforms?.map((p) => (
                  <span key={p} className="tag-cyan text-[10px]">{p}</span>
                ))}
              </div>
              {/* VisuallyHidden header for a11y */}
              <DialogHeader className="p-0 m-0">
                <DialogTitle className="text-2xl sm:text-3xl font-black text-white leading-tight">
                  {selectedProject?.name}
                </DialogTitle>
                <DialogDescription className="text-slate-400 text-sm mt-1 line-clamp-2">
                  {selectedProject?.shortDescription}
                </DialogDescription>
              </DialogHeader>
            </div>
          </div>

          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-5 sm:p-7 space-y-8">

              {/* Description */}
              <p className="text-slate-300 leading-relaxed text-sm sm:text-base">{selectedProject?.description}</p>

              {/* Videos */}
              {selectedProject?.videos && selectedProject.videos.length > 0 && (
                <div>
                  <div className="section-label mb-4 flex items-center gap-2">
                    <Play size={11} className="text-cyan-400" />
                    VIDEOS
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {selectedProject.videos.map((v, i) => (
                      v.type === 'local' ? (
                        <div key={i} className="space-y-2">
                          <div className="mono text-xs text-slate-500">{v.text}</div>
                          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                          <video
                            src={v.url}
                            controls
                            className="w-full border border-slate-800 bg-slate-900"
                          />
                        </div>
                      ) : v.type === 'youtube' ? (
                        <div key={i} className="space-y-2">
                          <div className="mono text-xs text-slate-500">{v.text}</div>
                          <div className="aspect-video border border-slate-800">
                            <iframe
                              src={v.url}
                              className="w-full h-full"
                              allowFullScreen
                              title={v.text}
                            />
                          </div>
                        </div>
                      ) : null
                    ))}
                  </div>
                </div>
              )}

              {/* Screenshots */}
              {selectedProject?.screenshots && selectedProject.screenshots.length > 0 && (
                <div>
                  <div className="section-label mb-4 flex items-center gap-2">
                    <Monitor size={11} className="text-cyan-400" />
                    SCREENSHOTS
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {selectedProject.screenshots.map((src, i) => (
                      <button
                        key={i}
                        onClick={() => setLightbox(src)}
                        className="group relative overflow-hidden border border-slate-800 hover:border-cyan-400/40 transition-colors"
                      >
                        <img
                          src={src}
                          alt={`Screenshot ${i + 1}`}
                          className="w-full aspect-video object-cover opacity-70 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300"
                        />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="mono text-[10px] text-cyan-400 bg-slate-950/80 px-2 py-1">EXPAND</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Key Features */}
              {selectedProject?.features && selectedProject.features.length > 0 && (
                <div>
                  <div className="section-label mb-4 flex items-center gap-2">
                    <Gamepad2 size={11} className="text-cyan-400" />
                    KEY FEATURES
                  </div>
                  <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-2">
                    {selectedProject.features.map((h, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-slate-400">
                        <span className="text-cyan-400 mono shrink-0 mt-0.5">&#9656;</span>
                        {h}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* My Contributions */}
              {selectedProject?.contributions && selectedProject.contributions.length > 0 && (
                <div>
                  <div className="section-label mb-5">MY CONTRIBUTIONS</div>
                  <div className="space-y-5">
                    {selectedProject.contributions.map((c, i) => (
                      <div key={i} className="border border-slate-800 bg-slate-900/30 p-5 hover:border-slate-700 transition-colors">
                        <div className="flex items-start gap-3 mb-3">
                          <span className="mono text-[11px] text-cyan-400/70 shrink-0 pt-0.5 tabular-nums">
                            {String(i + 1).padStart(2, '0')}
                          </span>
                          <h4 className="font-bold text-cyan-300 text-sm sm:text-base leading-snug">{c.title}</h4>
                        </div>
                        <p className="text-sm text-slate-400 leading-relaxed mb-4 pl-7">{c.description}</p>
                        {c.screenshot && c.screenshot.length > 0 && (
                          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 pl-7">
                            {c.screenshot.map((src, si) => (
                              <button
                                key={si}
                                onClick={() => setLightbox(src)}
                                className="group relative overflow-hidden border border-slate-800 hover:border-cyan-400/40 transition-colors"
                              >
                                <img
                                  src={src}
                                  alt={`${c.title} ${si + 1}`}
                                  className="w-full aspect-video object-cover opacity-60 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300"
                                />
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                  <span className="mono text-[10px] text-cyan-400 bg-slate-950/80 px-2 py-1">EXPAND</span>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Technologies */}
              <div>
                <div className="section-label mb-3">TECHNOLOGIES</div>
                <div className="flex flex-wrap gap-2">
                  {selectedProject?.skills.map((t) => (
                    <span key={t} className="tag-cyan">{t}</span>
                  ))}
                </div>
              </div>

              {/* Links */}
              {selectedProject?.links && selectedProject.links.length > 0 && (
                <div className="flex flex-wrap gap-3 pb-2 border-t border-slate-800 pt-6">
                  {selectedProject.links.map((link) => (
                    <a
                      key={link.url}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={
                        (link.type === 'github' || link.icon === 'github')
                          ? 'btn-ghost flex items-center gap-2 text-sm'
                          : 'btn-primary flex items-center gap-2 text-sm'
                      }
                    >
                      {(link.type === 'github' || link.icon === 'github')
                        ? <Github size={14} />
                        : <ExternalLink size={14} />
                      }
                      {link.label || link.text || 'VIEW'}
                    </a>
                  ))}
                </div>
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
            />
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default Projects;


