import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ExternalLink, Github, X, ChevronRight, Play, Monitor, Wrench } from 'lucide-react';
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
              <div className="p-5 flex flex-col flex-1 gap-3">
                {!project.image && (
                  <div className="flex flex-wrap gap-1.5 self-start">
                    {project.platforms.map((platform) => (
                      <span key={platform} className="tag-violet">{platform}</span>
                    ))}
                  </div>
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
      <Dialog
        open={!!selectedProject}
        onOpenChange={(open) => { if (!open) setSelectedProject(null); }}
      >
        <DialogContent
          showCloseButton={false}
          className="w-[98vw] max-w-[1600px] max-h-[94vh] h-[94vh] bg-slate-950 border border-slate-700/60 p-0 gap-0 flex flex-col overflow-hidden"
          onPointerDownOutside={(e) => { if (lightbox) e.preventDefault(); }}
          onInteractOutside={(e) => { if (lightbox) e.preventDefault(); }}
          onEscapeKeyDown={(e) => { if (lightbox) { e.preventDefault(); setLightbox(null); } }}
        >
          {/* ── Top bar: title + close ── */}
          <div className="shrink-0 flex items-start justify-between gap-4 px-6 pt-5 pb-4 border-b border-slate-800">
            <DialogHeader className="p-0 m-0 flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                {selectedProject?.platforms?.map((p) => (
                  <span key={p} className="tag-cyan text-[10px]">{p}</span>
                ))}
                {selectedProject?.genre?.map((g) => (
                  <span key={g} className="tag-violet text-[10px]">{g}</span>
                ))}
              </div>
              <DialogTitle className="text-2xl sm:text-3xl font-black text-white leading-tight">
                {selectedProject?.name}
              </DialogTitle>
              <DialogDescription className="text-slate-400 text-sm mt-1">
                {selectedProject?.shortDescription}
              </DialogDescription>
            </DialogHeader>
            <button
              onClick={() => setSelectedProject(null)}
              className="shrink-0 mt-1 text-slate-500 hover:text-white transition-colors border border-slate-800 hover:border-slate-600 p-1.5"
            >
              <X size={16} />
            </button>
          </div>

          {/* ── Two-panel body ── */}
          <div className="flex flex-1 overflow-hidden">

            {/* ── LEFT SIDEBAR ── */}
            <aside className="hidden lg:flex flex-col w-64 xl:w-72 shrink-0 border-r border-slate-800 overflow-y-auto">

              {/* Cover image */}
              {selectedProject?.image && (
                <div className="relative overflow-hidden h-40 shrink-0">
                  <img
                    src={selectedProject.image}
                    alt={selectedProject.name}
                    className="w-full h-full object-cover opacity-60"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
                </div>
              )}

              <div className="p-5 space-y-6 flex-1">
                {/* Links */}
                {selectedProject?.links && selectedProject.links.length > 0 && (
                  <div className="space-y-2">
                    {selectedProject.links.map((link) => (
                      <a
                        key={link.url}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={
                          (link.type === 'github' || link.icon === 'github')
                            ? 'btn-ghost flex items-center gap-2 text-sm w-full justify-center'
                            : 'btn-primary flex items-center gap-2 text-sm w-full justify-center'
                        }
                      >
                        {(link.type === 'github' || link.icon === 'github') ? <Github size={14} /> : <ExternalLink size={14} />}
                        {link.label || link.text || 'VIEW'}
                      </a>
                    ))}
                  </div>
                )}

                {/* Technologies */}
                <div>
                  <div className="section-label mb-2.5">TECHNOLOGIES</div>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedProject?.skills.map((t) => (
                      <span key={t} className="tag-cyan text-[10px]">{t}</span>
                    ))}
                  </div>
                </div>

                {/* Key features */}
                {selectedProject?.features && selectedProject.features.length > 0 && (
                  <div>
                    <div className="section-label mb-2.5">KEY FEATURES</div>
                    <ul className="space-y-2">
                      {selectedProject.features.map((f, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-slate-400 leading-snug">
                          <span className="text-cyan-400 shrink-0 mt-0.5">&#9656;</span>
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Contents index */}
                <div>
                  <div className="section-label mb-2.5">CONTENTS</div>
                  <div className="space-y-1">
                    <a href="#pd-about" className="flex items-center gap-2 text-xs text-slate-500 hover:text-cyan-400 transition-colors py-0.5">
                      <span className="w-1 h-1 bg-slate-600 rounded-full shrink-0" /> About
                    </a>
                    {(selectedProject?.videos?.length ?? 0) + (selectedProject?.screenshots?.length ?? 0) > 0 && (
                      <a href="#pd-media" className="flex items-center gap-2 text-xs text-slate-500 hover:text-cyan-400 transition-colors py-0.5">
                        <span className="w-1 h-1 bg-slate-600 rounded-full shrink-0" /> Media
                        <span className="ml-auto mono text-[10px] text-slate-600">
                          {(selectedProject?.videos?.length ?? 0) + (selectedProject?.screenshots?.length ?? 0)}
                        </span>
                      </a>
                    )}
                    {selectedProject?.contributions && selectedProject.contributions.length > 0 && (
                      <a href="#pd-contributions" className="flex items-center gap-2 text-xs text-slate-500 hover:text-cyan-400 transition-colors py-0.5">
                        <span className="w-1 h-1 bg-slate-600 rounded-full shrink-0" /> My Work
                        <span className="ml-auto mono text-[10px] text-slate-600">{selectedProject.contributions.length}</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </aside>

            {/* ── RIGHT MAIN SCROLL ── */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-6 sm:p-8 space-y-12">

                {/* ── About ── */}
                <section id="pd-about">
                  <div className="section-label mb-3">ABOUT</div>
                  <p className="text-slate-300 leading-relaxed text-sm sm:text-base max-w-3xl">{selectedProject?.description}</p>

                  {/* Mobile-only: features + tech + links */}
                  {selectedProject?.features && selectedProject.features.length > 0 && (
                    <div className="mt-6 lg:hidden">
                      <div className="section-label mb-2.5">KEY FEATURES</div>
                      <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-2">
                        {selectedProject.features.map((f, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-slate-400">
                            <span className="text-cyan-400 mono shrink-0 mt-0.5 text-[10px]">&#9656;</span>{f}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div className="mt-5 lg:hidden">
                    <div className="section-label mb-2.5">TECHNOLOGIES</div>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedProject?.skills.map((t) => <span key={t} className="tag-cyan text-[10px]">{t}</span>)}
                    </div>
                  </div>
                  {selectedProject?.links && selectedProject.links.length > 0 && (
                    <div className="mt-5 flex flex-wrap gap-3 lg:hidden">
                      {selectedProject.links.map((link) => (
                        <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer"
                          className={(link.type === 'github' || link.icon === 'github') ? 'btn-ghost flex items-center gap-2 text-sm' : 'btn-primary flex items-center gap-2 text-sm'}>
                          {(link.type === 'github' || link.icon === 'github') ? <Github size={14} /> : <ExternalLink size={14} />}
                          {link.label || link.text || 'VIEW'}
                        </a>
                      ))}
                    </div>
                  )}
                </section>

                {/* ── Media (videos + screenshots) ── */}
                {((selectedProject?.videos?.length ?? 0) + (selectedProject?.screenshots?.length ?? 0)) > 0 && (
                  <section id="pd-media">
                    <div className="flex items-center gap-3 mb-5">
                      <Play size={14} className="text-cyan-400 shrink-0" />
                      <div className="section-label">MEDIA</div>
                      <div className="flex-1 h-px bg-slate-800" />
                      <span className="mono text-[10px] text-slate-600">
                        {(selectedProject?.videos?.length ?? 0) + (selectedProject?.screenshots?.length ?? 0)} items — click screenshots to expand
                      </span>
                    </div>
                    <div className="flex gap-3 overflow-x-auto pb-2 items-start">
                      {/* Videos first */}
                      {selectedProject?.videos?.map((v, i) => (
                        <div key={`v-${i}`} className="shrink-0 space-y-1.5" style={{ width: '320px' }}>
                          <div className="mono text-[10px] text-slate-500 tracking-wider uppercase flex items-center gap-1.5">
                            <Play size={9} className="text-cyan-400/70" />{v.text}
                          </div>
                          {v.type === 'local' ? (
                            // eslint-disable-next-line jsx-a11y/media-has-caption
                            <video src={v.url} controls className="w-full border border-slate-800 bg-slate-900" style={{ height: '180px', objectFit: 'contain' }} />
                          ) : v.type === 'youtube' ? (
                            <div className="border border-slate-800 bg-slate-900" style={{ height: '180px' }}>
                              <iframe src={v.url} className="w-full h-full" allowFullScreen title={v.text} />
                            </div>
                          ) : null}
                        </div>
                      ))}
                      {/* Screenshots */}
                      {selectedProject?.screenshots?.map((src, i) => (
                        <div key={`s-${i}`} className="shrink-0 space-y-1.5" style={{ width: '320px' }}>
                          <div className="mono text-[10px] text-slate-500 tracking-wider uppercase flex items-center gap-1.5">
                            <Monitor size={9} className="text-cyan-400/70" />Screenshot {i + 1} / {selectedProject.screenshots.length}
                          </div>
                          <button
                            onClick={() => setLightbox(src)}
                            className="group relative w-full overflow-hidden border border-slate-800 hover:border-cyan-400/50 transition-all duration-200"
                            style={{ height: '180px' }}
                          >
                            <img
                              src={src}
                              alt={`Screenshot ${i + 1}`}
                              className="w-full h-full object-cover opacity-70 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300"
                            />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950/40">
                              <span className="mono text-[10px] text-white bg-slate-950/80 border border-slate-700 px-2 py-1">EXPAND</span>
                            </div>
                          </button>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* ── My Contributions ── */}
                {selectedProject?.contributions && selectedProject.contributions.length > 0 && (
                  <section id="pd-contributions">
                    <div className="flex items-center gap-3 mb-5">
                      <Wrench size={14} className="text-cyan-400 shrink-0" />
                      <div className="section-label">MY WORK ON THIS PROJECT</div>
                      <div className="flex-1 h-px bg-slate-800" />
                      <span className="mono text-[10px] text-slate-600">{selectedProject.contributions.length} contributions</span>
                    </div>
                    <div className="space-y-4">
                      {selectedProject.contributions.map((c, i) => (
                        <div key={i} className="group border border-slate-800 hover:border-slate-700 bg-slate-900/20 hover:bg-slate-900/40 transition-all duration-200">
                          <div className="flex items-start gap-4 p-5 pb-4">
                            <span className="mono text-3xl font-black text-slate-800/80 group-hover:text-slate-700 tabular-nums shrink-0 leading-none select-none">
                              {String(i + 1).padStart(2, '0')}
                            </span>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-cyan-300 text-sm sm:text-base leading-snug mb-2">{c.title}</h4>
                              <p className="text-sm text-slate-400 leading-relaxed">{c.description}</p>
                            </div>
                          </div>
                          {c.screenshot && c.screenshot.length > 0 && (
                            <div className="px-5 pb-5 pl-[calc(1.25rem+3rem+1rem)]">
                              <div className="mono text-[10px] text-slate-600 mb-2 uppercase tracking-wider">
                                {c.screenshot.length} screenshot{c.screenshot.length > 1 ? 's' : ''}
                              </div>
                              <div className="flex gap-2 overflow-x-auto pb-1">
                                {c.screenshot.map((src, si) => (
                                  <button
                                    key={si}
                                    onClick={() => setLightbox(src)}
                                    className="group/img relative shrink-0 overflow-hidden border border-slate-800 hover:border-cyan-400/50 transition-all duration-200"
                                    style={{ width: '160px', height: '90px' }}
                                  >
                                    <img
                                      src={src}
                                      alt={`${c.title} ${si + 1}`}
                                      className="w-full h-full object-cover opacity-60 group-hover/img:opacity-100 group-hover/img:scale-105 transition-all duration-300"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity bg-slate-950/40">
                                      <span className="mono text-[9px] text-white bg-slate-950/80 border border-slate-700 px-1.5 py-0.5">EXPAND</span>
                                    </div>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
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
            />
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default Projects;


