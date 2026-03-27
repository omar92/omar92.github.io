import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Github, Linkedin, Twitter, Youtube, Facebook, ChevronDown, ThumbsUp, Monitor } from 'lucide-react';
import data from '../lib/portfolio';

const getSocialIcon = (link: typeof data.personal.contacts.links[0]): typeof Github | null => {
  const type = (link.type || link.icon || link.label).toLowerCase();
  if (type.includes('github')) return Github;
  if (type.includes('linkedin')) return Linkedin;
  if (type.includes('twitter') || type === 'x') return Twitter;
  if (type.includes('youtube')) return Youtube;
  if (type.includes('facebook')) return Facebook;
  return null;
};

const Hero = () => {
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.2 });
      tl.fromTo('.h-featured-label', { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' });
      tl.fromTo('.h-main-banner',    { opacity: 0 },          { opacity: 1, duration: 0.6, ease: 'power2.out' }, 0.1);
      tl.fromTo('.h-sidebar',        { opacity: 0, x: 20 },  { opacity: 1, x: 0, duration: 0.5, ease: 'power2.out' }, 0.3);
      tl.fromTo('.h-capsule',        { opacity: 0, y: 16 },  { opacity: 1, y: 0, duration: 0.4, stagger: 0.07, ease: 'power2.out' }, 0.5);
    }, heroRef);
    return () => ctx.revert();
  }, []);

  const scrollTo = (href: string) => document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });

  const firstName = data.personal.firstName ?? data.personal.name.split(' ')[0];
  const lastName  = data.personal.lastName  ?? data.personal.name.split(' ').slice(1).join(' ');
  const featuredProject = data.projects.find((p) => p.featured && p.image) ?? data.projects.find((p) => p.featured) ?? data.projects[0];
  const recentProjects  = data.projects.filter((p) => p.id !== featuredProject?.id).slice(0, 4);
  const releasedCount   = data.projects.filter((p) => p.published).length;

  return (
    <section id="home" ref={heroRef} className="relative pt-[52px]" style={{ background: '#1b2838' }}>

      {/* ── "Featured & Recommended" section label ── */}
      <div className="h-featured-label w-full px-4 lg:px-8 pt-6 pb-3">
        <div className="flex items-center gap-3">
          <h2 className="text-base font-semibold" style={{ color: '#c6d4df', letterSpacing: '0.02em' }}>
            Featured Developer
          </h2>
          <span className="text-xs px-2 py-0.5 rounded-sm font-medium" style={{ background: 'rgba(102,192,244,0.15)', color: '#66c0f4', border: '1px solid rgba(102,192,244,0.25)' }}>
            {data.personal.openToWork ? 'Available for Work' : 'Not Available'}
          </span>
        </div>
      </div>

      {/* ── Main featured banner ── */}
      <div className="w-full px-4 lg:px-8 pb-4">
        <div className="flex gap-4 lg:gap-6 items-start">

          {/* ── Left: big banner ── */}
          <div className="h-main-banner flex-1 min-w-0">
            <div className="relative rounded-sm overflow-hidden" style={{ aspectRatio: '16/7', background: '#16202d', minHeight: 240 }}>
              {featuredProject?.image ? (
                <img src={featuredProject.image} alt={featuredProject.name} className="absolute inset-0 w-full h-full object-cover opacity-30" />
              ) : null}
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(27,40,56,0.97) 40%, rgba(27,40,56,0.6) 75%, rgba(27,40,56,0.1) 100%)' }} />
              <div className="relative z-10 h-full flex flex-col justify-end p-6 lg:p-10">
                <p className="text-xs font-semibold tracking-widest mb-2 uppercase" style={{ color: '#66c0f4' }}>
                  {data.personal.title}
                </p>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-none mb-1" style={{ color: '#e8f4fd' }}>
                  {firstName}
                </h1>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-none text-gradient-cyan mb-4">
                  {lastName}
                </h1>
                <p className="text-sm lg:text-base mb-5 max-w-md" style={{ color: '#8f98a0', lineHeight: 1.6 }}>
                  {data.personal.tagline}
                </p>
                <div className="flex items-center gap-4 mb-5">
                  <div className="flex items-center gap-1.5">
                    <ThumbsUp size={14} style={{ color: '#66c0f4' }} />
                    <span className="text-sm font-semibold" style={{ color: '#66c0f4' }}>Overwhelmingly Positive</span>
                  </div>
                  <span className="text-xs" style={{ color: '#8f98a0' }}>
                    ({data.projects.length} Projects, {releasedCount} Released)
                  </span>
                </div>
                <div className="flex flex-wrap gap-3 mb-4">
                  <button onClick={() => scrollTo('#projects')} className="btn-primary text-sm px-6 py-2.5">
                    View Projects
                  </button>
                  <button onClick={() => scrollTo('#contact')} className="btn-ghost text-sm px-6 py-2.5">
                    Contact
                  </button>
                  <div className="flex gap-2 items-center">
                    {data.personal.contacts.links.map((link) => {
                      const Icon = getSocialIcon(link);
                      if (!Icon) return null;
                      return (
                        <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer"
                          className="w-8 h-8 flex items-center justify-center rounded-sm transition-all"
                          style={{ background: 'rgba(255,255,255,0.08)', color: '#8f98a0' }}
                          onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = '#c6d4df'; (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.14)'; }}
                          onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = '#8f98a0'; (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.08)'; }}
                        >
                          <Icon size={15} />
                        </a>
                      );
                    })}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Monitor size={12} style={{ color: '#8f98a0' }} />
                  <span className="text-xs" style={{ color: '#8f98a0' }}>Web · Mobile · Desktop · VR</span>
                  {data.personal.openToWork && (
                    <span className="ml-2 text-xs px-1.5 py-0.5 rounded-sm" style={{ background: 'rgba(106,184,13,0.15)', color: '#a4d007', border: '1px solid rgba(106,184,13,0.3)' }}>
                      Open to Work
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Mini capsule row */}
            <div className="mt-3">
              <p className="text-xs mb-2 font-medium" style={{ color: '#8f98a0' }}>More Projects</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {recentProjects.map((project) => (
                  <button key={project.id} onClick={() => scrollTo('#projects')}
                    className="h-capsule text-left rounded-sm overflow-hidden transition-all"
                    style={{ background: '#16202d', border: '1px solid rgba(0,0,0,0.3)' }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#1e3048'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#16202d'; }}
                  >
                    {project.image ? (
                      <div className="h-16 overflow-hidden">
                        <img src={project.image} alt={project.name} className="w-full h-full object-cover opacity-70" />
                      </div>
                    ) : (
                      <div className="h-16 flex items-center justify-center text-lg font-bold" style={{ background: '#0d1926', color: '#4a6d8c' }}>
                        {project.name[0]}
                      </div>
                    )}
                    <div className="px-2 py-1.5">
                      <p className="text-xs font-medium leading-snug truncate" style={{ color: '#c6d4df' }}>{project.name}</p>
                      <p className="text-[10px] mt-0.5 truncate" style={{ color: '#8f98a0' }}>{project.category || 'Project'}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── Right sidebar ── */}
          <div className="h-sidebar hidden lg:flex flex-col gap-3 w-[220px] xl:w-[260px] shrink-0">
            <div className="rounded-sm overflow-hidden" style={{ background: '#16202d', border: '1px solid rgba(0,0,0,0.3)' }}>
              <div className="px-4 py-2.5" style={{ background: '#2a475e', borderBottom: '1px solid rgba(0,0,0,0.3)' }}>
                <span className="text-xs font-semibold" style={{ color: '#c6d4df' }}>Developer Profile</span>
              </div>
              <div className="p-4 space-y-3 text-sm">
                <div>
                  <p className="text-[10px] uppercase font-semibold mb-1" style={{ color: '#4a6b8a' }}>Title</p>
                  <p style={{ color: '#c6d4df' }}>{data.personal.title}</p>
                </div>
                {data.personal.location && (
                  <div>
                    <p className="text-[10px] uppercase font-semibold mb-1" style={{ color: '#4a6b8a' }}>Location</p>
                    <p style={{ color: '#c6d4df' }}>{data.personal.location}</p>
                  </div>
                )}
                <div>
                  <p className="text-[10px] uppercase font-semibold mb-1" style={{ color: '#4a6b8a' }}>Status</p>
                  <p style={{ color: data.personal.openToWork ? '#a4d007' : '#c6d4df' }}>
                    {data.personal.openToWork ? 'Open to Work' : 'Not Available'}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-semibold mb-1" style={{ color: '#4a6b8a' }}>Portfolio</p>
                  <p style={{ color: '#c6d4df' }}>{data.projects.length} projects · {releasedCount} released</p>
                </div>
              </div>
            </div>

            <div className="rounded-sm overflow-hidden" style={{ background: '#16202d', border: '1px solid rgba(0,0,0,0.3)' }}>
              <div className="px-4 py-2.5" style={{ background: '#2a475e', borderBottom: '1px solid rgba(0,0,0,0.3)' }}>
                <span className="text-xs font-semibold" style={{ color: '#c6d4df' }}>Popular Tags</span>
              </div>
              <div className="p-3 flex flex-wrap gap-1.5">
                {data.skills.slice(0, 3).flatMap((sg) => sg.items.slice(0, 3)).slice(0, 9).map((skill) => (
                  <span key={skill} className="tag-cyan text-[10px]">{skill}</span>
                ))}
              </div>
            </div>

            <button onClick={() => scrollTo('#contact')} className="w-full btn-primary text-sm py-2.5">
              Add to Network
            </button>
            <button onClick={() => scrollTo('#about')} className="w-full btn-ghost text-sm py-2.5">
              View Profile
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-center pb-4">
        <button onClick={() => scrollTo('#about')} className="flex flex-col items-center gap-1 group">
          <ChevronDown size={18} className="animate-float" style={{ color: '#4a6b8a' }} />
        </button>
      </div>
    </section>
  );
};

export default Hero;



