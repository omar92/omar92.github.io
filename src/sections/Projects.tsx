import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ExternalLink, Github, X, ChevronRight } from 'lucide-react';
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

  const categories = ['Showcase', 'All', ...Array.from(new Set(data.projects.map((p) => p.category)))];
  const filtered =
    activeFilter === 'Showcase' ? data.projects.filter((p) => p.featured) :
    activeFilter === 'All' ? data.projects :
    data.projects.filter((p) => p.category === activeFilter);

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
        <div className="pj-header mb-12">
          <div className="section-label mb-3">02 // PROJECTS</div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white">
            BUILT <span className="text-gradient-cyan">SYSTEMS</span>
          </h2>
        </div>

        {/* Filters */}
        <div className="pj-filters flex flex-wrap gap-2 mb-12">
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
        <DialogContent showCloseButton={false} className="max-w-2xl bg-slate-950 border border-slate-700 clip-tl p-0 gap-0">
          <DialogHeader className="p-6 pb-4 border-b border-slate-800">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="tag-violet mb-3 inline-block">{selectedProject?.category}</span>
                <DialogTitle className="text-2xl font-black text-white">{selectedProject?.name}</DialogTitle>
                <DialogDescription className="text-slate-400 mt-1 text-sm">{selectedProject?.shortDescription}</DialogDescription>
              </div>
              <button onClick={() => setSelectedProject(null)} className="shrink-0 text-slate-600 hover:text-white transition-colors mt-1">
                <X size={18} />
              </button>
            </div>
          </DialogHeader>
          <div className="p-6 space-y-6 overflow-y-auto max-h-[60vh]">
            {selectedProject?.image && (
              <img src={selectedProject.image} alt={selectedProject.name} className="w-full h-48 object-cover opacity-80" />
            )}
            <p className="text-slate-300 leading-relaxed">{selectedProject?.description}</p>
            {selectedProject?.features && selectedProject.features.length > 0 && (
              <ul className="space-y-2">
                {selectedProject.features.map((h, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-slate-400">
                    <span className="text-cyan-400 mono shrink-0 mt-0.5">&#9656;</span>{h}
                  </li>
                ))}
              </ul>
            )}
            <div>
              <div className="section-label mb-3">TECHNOLOGIES</div>
              <div className="flex flex-wrap gap-2">
                {selectedProject?.skills.map((t) => (
                  <span key={t} className="tag-cyan">{t}</span>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap gap-3 pt-2">
              {selectedProject?.links.map((link) => (
                <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer"
                  className={(link.type === 'github' || link.icon === 'github') ? 'btn-ghost flex items-center gap-2 text-sm' : 'btn-primary flex items-center gap-2 text-sm'}>
                  {(link.type === 'github' || link.icon === 'github') ? <Github size={14} /> : <ExternalLink size={14} />}
                  {link.label || link.text || 'VIEW'}
                </a>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default Projects;


