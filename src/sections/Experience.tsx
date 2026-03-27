import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MapPin, GraduationCap, ExternalLink } from 'lucide-react';
import data from '../lib/portfolio';

gsap.registerPlugin(ScrollTrigger);

const Experience = () => {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.ex-header', { opacity: 0, y: 40 }, {
        opacity: 1, y: 0, duration: 0.8, ease: 'expo.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 70%' },
      });
      gsap.fromTo('.ex-item', { opacity: 0, x: -30 }, {
        opacity: 1, x: 0, duration: 0.6, stagger: 0.12, ease: 'expo.out',
        scrollTrigger: { trigger: '.ex-list', start: 'top 75%' },
      });
      gsap.fromTo('.ed-item', { opacity: 0, x: 30 }, {
        opacity: 1, x: 0, duration: 0.6, stagger: 0.12, ease: 'expo.out',
        scrollTrigger: { trigger: '.ed-list', start: 'top 78%' },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const openProject = (id: string) => {
    window.dispatchEvent(new CustomEvent('open-project', { detail: { id } }));
  };

  return (
    <section id="experience" ref={sectionRef} className="relative py-28 lg:py-36 reveal-section">
      <div className="divider-cyan mb-24 mx-6 lg:mx-12" />
      <div className="w-full px-6 lg:px-12">

        <div className="ex-header mb-16">
          <div className="section-label mb-3">03 // EXPERIENCE</div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white">
            CAREER <span className="text-gradient-cyan">LOG</span>
          </h2>
        </div>

        <div className="grid lg:grid-cols-3 gap-12 lg:gap-16">
          {/* Timeline */}
          <div className="lg:col-span-2">
            <div className="section-label mb-8">WORK HISTORY</div>
            <div className="ex-list relative">
              {/* Vertical line */}
              <div className="absolute left-0 top-3 w-px h-full bg-gradient-to-b from-cyan-400/40 via-cyan-400/10 to-transparent" />

              <div className="space-y-10 pl-8">
                {data.experience.map((job, i) => (
                  <div key={i} className="ex-item relative group">
                    {/* Diamond dot */}
                    <div className="absolute -left-8 -translate-x-1/2 top-1.5 w-3 h-3 rotate-45 border border-cyan-400/60 bg-slate-950 group-hover:bg-cyan-400 group-hover:border-cyan-400 transition-all" />

                    <div className="game-card clip-tl p-6 group-hover:border-cyan-400/20 transition-all">
                      <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                        <div>
                          <div className="font-bold text-white text-lg leading-tight">{job.position}</div>
                          {job.company && (
                            job.url
                              ? <a href={job.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-cyan-400 mono text-sm hover:underline mt-0.5">
                                  {job.company} <ExternalLink size={11} />
                                </a>
                              : <div className="text-cyan-400 mono text-sm mt-0.5">{job.company}</div>
                          )}
                        </div>
                        <div className="mono text-xs text-slate-500 shrink-0 pt-1">
                          {job.startDate} -- {job.endDate ?? 'PRESENT'}
                        </div>
                      </div>

                      {job.location && (
                        <div className="flex items-center gap-1.5 text-slate-500 mono text-xs mb-4">
                          <MapPin size={11} />{job.location}
                        </div>
                      )}

                      {job.description && (
                        <ul className="space-y-2 mb-4">
                          {job.description.map((d, j) => (
                            <li key={j} className="flex items-start gap-2.5 text-sm text-slate-400">
                              <span className="text-cyan-400/60 shrink-0 mt-0.5">&#9656;</span>{d}
                            </li>
                          ))}
                        </ul>
                      )}

                      <div className="flex flex-wrap gap-2 mb-4">
                        {job.skills?.map((t) => (
                          <span key={t} className="tag-cyan text-[10px]">{t}</span>
                        ))}
                      </div>

                      {job.projectIds && job.projectIds.length > 0 && (
                        <div>
                          <div className="section-label mb-2">RELATED PROJECTS</div>
                          <div className="flex flex-wrap gap-2">
                            {job.projectIds.map((pid) => {
                              const p = data.projects.find((x) => x.id === pid);
                              if (!p) return null;
                              return (
                                <button
                                  key={pid}
                                  onClick={() => openProject(pid)}
                                  className="tag-violet hover:bg-violet-400/20 transition-colors cursor-pointer"
                                >
                                  {p.name}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Education */}
          <div>
            <div className="section-label mb-8">EDUCATION</div>
            <div className="ed-list space-y-6">
              {data.education.map((edu, i) => (
                <div key={i} className="ed-item game-card clip-tr p-6 group hover:border-violet-400/20 transition-all">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="shrink-0 w-8 h-8 flex items-center justify-center border border-slate-700 group-hover:border-violet-400/40">
                      <GraduationCap size={14} className="text-slate-600 group-hover:text-violet-400 transition-colors" />
                    </div>
                    <div>
                      <div className="font-bold text-white text-sm leading-snug">{edu.degree}</div>
                      <div className="text-violet-400 mono text-xs mt-0.5">{edu.school}</div>
                    </div>
                  </div>
                  <div className="mono text-xs text-slate-500 mb-3">{edu.startYear} — {edu.endYear ?? 'PRESENT'}</div>
                  {edu.grade && <div className="tag-gold self-start">{edu.grade}</div>}

                  {edu.projectIds && edu.projectIds.length > 0 && (
                    <div className="mt-4">
                      <div className="section-label mb-2">RELATED PROJECTS</div>
                      <div className="flex flex-wrap gap-2">
                        {edu.projectIds.map((pid) => {
                          const p = data.projects.find((x) => x.id === pid);
                          if (!p) return null;
                          return (
                            <button
                              key={pid}
                              onClick={() => openProject(pid)}
                              className="tag-violet hover:bg-violet-400/20 transition-colors cursor-pointer"
                            >
                              {p.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Experience;



