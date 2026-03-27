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
    <section id="experience" ref={sectionRef} className="relative py-12 reveal-section" style={{ background: '#1b2838', borderTop: '1px solid rgba(0,0,0,0.3)' }}>
      <div className="w-full max-w-[1400px] mx-auto px-4 lg:px-8">
        <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Work history */}
          <div className="lg:col-span-2">
            <div className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: '#8f98a0' }}>Work History</div>
            <div className="ex-list space-y-3">
              {data.experience.map((job, i) => (
                <div key={i} className="ex-item rounded-sm overflow-hidden" style={{ background: '#16202d', border: '1px solid rgba(0,0,0,0.3)' }}>
                  <div className="px-4 py-3 flex flex-wrap items-center justify-between gap-2" style={{ background: '#2a475e', borderBottom: '1px solid rgba(0,0,0,0.3)' }}>
                    <div>
                      <div className="font-semibold text-sm" style={{ color: '#e8f4fd' }}>{job.position}</div>
                      {job.company && (
                        job.url
                          ? <a href={job.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs hover:underline mt-0.5" style={{ color: '#66c0f4' }}>
                              {job.company} <ExternalLink size={10} />
                            </a>
                          : <div className="text-xs mt-0.5" style={{ color: '#66c0f4' }}>{job.company}</div>
                      )}
                    </div>
                    <div className="text-xs shrink-0" style={{ color: '#8f98a0' }}>
                      {job.startDate} – {job.endDate ?? 'Present'}
                    </div>
                  </div>

                  <div className="p-4 space-y-3">
                    {job.location && (
                      <div className="flex items-center gap-1.5 text-xs" style={{ color: '#8f98a0' }}>
                        <MapPin size={11} />{job.location}
                      </div>
                    )}

                    {job.description && (
                      <ul className="space-y-1.5">
                        {job.description.map((d, j) => (
                          <li key={j} className="flex items-start gap-2 text-sm" style={{ color: '#c6d4df' }}>
                            <span className="shrink-0 mt-0.5" style={{ color: '#66c0f4' }}>&#9656;</span>{d}
                          </li>
                        ))}
                      </ul>
                    )}

                    <div className="flex flex-wrap gap-1">
                      {job.skills?.map((t) => (
                        <span key={t} className="tag-cyan text-[10px]">{t}</span>
                      ))}
                    </div>

                    {job.projectIds && job.projectIds.length > 0 && (
                      <div>
                        <div className="text-[10px] uppercase tracking-wider mb-1 font-semibold" style={{ color: '#4a6b8a' }}>Related Projects</div>
                        <div className="flex flex-wrap gap-1">
                          {job.projectIds.map((pid) => {
                            const p = data.projects.find((x) => x.id === pid);
                            if (!p) return null;
                            return (
                              <button
                                key={pid}
                                onClick={() => openProject(pid)}
                                className="tag-violet cursor-pointer"
                                style={{ fontSize: '10px' }}
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

          {/* Education */}
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: '#8f98a0' }}>Education</div>
            <div className="ed-list space-y-3">
              {data.education.map((edu, i) => (
                <div key={i} className="ed-item rounded-sm overflow-hidden" style={{ background: '#16202d', border: '1px solid rgba(0,0,0,0.3)' }}>
                  <div className="px-4 py-3 flex items-center gap-3" style={{ background: '#2a475e', borderBottom: '1px solid rgba(0,0,0,0.3)' }}>
                    <GraduationCap size={14} style={{ color: '#66c0f4', flexShrink: 0 }} />
                    <div>
                      <div className="text-sm font-semibold leading-snug" style={{ color: '#e8f4fd' }}>{edu.degree}</div>
                      <div className="text-xs mt-0.5" style={{ color: '#66c0f4' }}>{edu.school}</div>
                    </div>
                  </div>
                  <div className="p-4 space-y-2">
                    <div className="text-xs" style={{ color: '#8f98a0' }}>{edu.startYear} – {edu.endYear ?? 'Present'}</div>
                    {edu.grade && <span className="tag-gold text-[10px]">{edu.grade}</span>}
                    {edu.projectIds && edu.projectIds.length > 0 && (
                      <div>
                        <div className="text-[10px] uppercase tracking-wider mb-1 font-semibold" style={{ color: '#4a6b8a' }}>Related Projects</div>
                        <div className="flex flex-wrap gap-1">
                          {edu.projectIds.map((pid) => {
                            const p = data.projects.find((x) => x.id === pid);
                            if (!p) return null;
                            return (
                              <button
                                key={pid}
                                onClick={() => openProject(pid)}
                                className="tag-violet cursor-pointer"
                                style={{ fontSize: '10px' }}
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
      </div>
    </section>
  );
};

export default Experience;



