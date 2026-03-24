import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Github, Linkedin, Twitter, ChevronDown, Zap, MapPin, Mail, UserCircle2 } from 'lucide-react';
import data from '../lib/portfolio';

const Hero = () => {
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.4 });

      tl.fromTo('.h-status',  { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.5, ease: 'expo.out' });
      tl.fromTo('.h-line',    { opacity: 0, y: 60, skewX: -3 }, { opacity: 1, y: 0, skewX: 0, duration: 0.9, stagger: 0.1, ease: 'expo.out' }, 0.2);
      tl.fromTo('.h-role',    { opacity: 0, x: -24 }, { opacity: 1, x: 0, duration: 0.6, ease: 'expo.out' }, 0.7);
      tl.fromTo('.h-tagline', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.5, ease: 'expo.out' }, 0.9);
      tl.fromTo('.h-cta',     { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'expo.out' }, 1.1);
      tl.fromTo('.h-social',  { opacity: 0, scale: 0 }, { opacity: 1, scale: 1, duration: 0.4, stagger: 0.06, ease: 'elastic.out(1,0.5)' }, 1.3);
      tl.fromTo('.h-stat',    { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.4, stagger: 0.08, ease: 'expo.out' }, 1.2);
      tl.fromTo('.h-panel',   { opacity: 0, x: 40 }, { opacity: 1, x: 0, duration: 0.7, ease: 'expo.out' }, 0.6);

      gsap.to('.h-float', { y: -14, duration: 3.5, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 1 });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  const scrollTo = (href: string) => document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });

  const firstName = data.personal.firstName ?? data.personal.name.split(' ')[0];
  const lastName  = data.personal.lastName  ?? data.personal.name.split(' ').slice(1).join(' ');
  const allFeaturedProjects = data.projects.filter((project) => project.featured);
  const featuredProjects = allFeaturedProjects.slice(0, 3);
  const releasedProjectsCount = data.projects.filter((project) =>
    project.filterTags.some((tag) => {
      const normalizedTag = tag.trim().toLowerCase();
      return normalizedTag === 'published';
    })
  ).length;

  return (
    <section id="home" ref={heroRef} className="relative min-h-screen flex flex-col justify-center pt-16 overflow-hidden">
      {/* Scanline overlay */}
      <div className="absolute inset-0 pointer-events-none z-[1]"
        style={{ background: 'repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,0.04) 3px,rgba(0,0,0,0.04) 4px)' }} />

      {/* Radial ambient glow */}
      <div className="absolute inset-0 pointer-events-none z-[1]"
        style={{ background: 'radial-gradient(ellipse 70% 55% at 50% 45%, rgba(0,229,255,0.04) 0%, transparent 70%)' }} />

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-48 pointer-events-none z-[2]"
        style={{ background: 'linear-gradient(to top, #050510, transparent)' }} />

      <div className="relative z-10 w-full px-6 lg:px-16 xl:px-24">
        {/* Status bar */}
        <div className="h-status flex items-center gap-3 mb-10">
          <span className="inline-block w-2 h-2 bg-green-400 rounded-full"
            style={{ boxShadow: '0 0 8px rgba(74,222,128,0.8)', animation: 'pulse 2s infinite' }} />
          <span className="mono text-xs tracking-[0.3em] text-green-400/80">SYSTEM : ONLINE</span>
          <span className="mono text-xs text-slate-700 ml-auto hidden sm:block">{'// build 2026.03'}</span>
        </div>

        <div className="grid lg:grid-cols-5 gap-10 lg:gap-16 items-center">
          {/* Left -- 3 cols: Name + info */}
          <div className="lg:col-span-3">
            <div className="overflow-hidden mb-1">
              <h1
                className="h-line glitch-text text-[clamp(3.8rem,11vw,9rem)] font-black leading-none text-white tracking-tight"
                data-text={firstName}
              >
                {firstName}
              </h1>
            </div>
            <div className="overflow-hidden mb-6">
              <h1
                className="h-line text-[clamp(3.8rem,11vw,9rem)] font-black leading-none text-gradient-cyan tracking-tight"
                data-text={lastName}
              >
                {lastName}
              </h1>
            </div>

            {/* Role */}
            <div className="h-role flex items-center gap-3 mb-6">
              <div className="w-10 h-px bg-cyan-400/60" />
              <span className="mono uppercase tracking-[0.3em] text-cyan-400 text-sm">{data.personal.title}</span>
            </div>

            {/* Tagline */}
            <p className="h-tagline text-lg text-slate-400 max-w-lg mb-10 leading-relaxed">
              {data.personal.tagline}
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4 mb-10">
              <button onClick={() => scrollTo('#projects')} className="h-cta btn-primary inline-flex items-center gap-2">
                <Zap size={14} />
                VIEW PROJECTS
              </button>
              <button onClick={() => scrollTo('#contact')} className="h-cta btn-ghost">
                CONTACT ME
              </button>
            </div>

            {/* Social links */}
            <div className="flex gap-2.5">
              {data.personal.github && (
                <a href={data.personal.github} target="_blank" rel="noopener noreferrer"
                  className="h-social p-2.5 border border-slate-700/60 text-slate-500 hover:text-cyan-400 hover:border-cyan-400/40 transition-all">
                  <Github size={18} />
                </a>
              )}
              {data.personal.linkedin && (
                <a href={data.personal.linkedin} target="_blank" rel="noopener noreferrer"
                  className="h-social p-2.5 border border-slate-700/60 text-slate-500 hover:text-cyan-400 hover:border-cyan-400/40 transition-all">
                  <Linkedin size={18} />
                </a>
              )}
              {data.personal.twitter && (
                <a href={data.personal.twitter} target="_blank" rel="noopener noreferrer"
                  className="h-social p-2.5 border border-slate-700/60 text-slate-500 hover:text-cyan-400 hover:border-cyan-400/40 transition-all">
                  <Twitter size={18} />
                </a>
              )}
            </div>
          </div>

          {/* Right -- 2 cols: Stats + Panel */}
          <div className="lg:col-span-2 space-y-4">
            <div className="h-panel game-card clip-tl p-6 space-y-6">
              <div>
                <div className="section-label mb-2">OPERATOR PROFILE</div>
                <div className="text-xl font-bold text-white">{data.personal.title}</div>
                {data.personal.subtitle && (
                  <div className="mono text-xs text-slate-500 mt-1">{data.personal.subtitle}</div>
                )}
              </div>

              <div className="space-y-3">
                {data.personal.location && (
                  <div className="h-stat flex items-center gap-3 text-slate-400">
                    <MapPin size={15} className="text-cyan-400" />
                    <span className="mono text-xs">{data.personal.location}</span>
                  </div>
                )}
                {data.personal.email && (
                  <div className="h-stat flex items-center gap-3 text-slate-400">
                    <Mail size={15} className="text-cyan-400" />
                    <span className="mono text-xs break-all">{data.personal.email}</span>
                  </div>
                )}
                <div className="h-stat flex items-center gap-3 text-slate-400">
                  <UserCircle2 size={15} className="text-cyan-400" />
                  <span className="mono text-xs">Open to collaborations</span>
                </div>
              </div>
            </div>

            <div className="h-panel h-float game-card clip-card hud-corners p-6 space-y-5">
              <div className="flex items-center justify-between">
                <div className="section-label">ACTIVE MISSION LOG</div>
                <span className="mono text-[10px] text-green-400/80">LIVE</span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="h-stat border border-slate-800/80 bg-slate-950/50 px-3 py-2">
                  <div className="mono text-lg font-black text-white">{data.projects.length}</div>
                  <div className="section-label text-[9px]">PROJECTS</div>
                </div>
                <div className="h-stat border border-slate-800/80 bg-slate-950/50 px-3 py-2">
                  <div className="mono text-lg font-black text-white">{data.experience.length}</div>
                  <div className="section-label text-[9px]">ROLES</div>
                </div>
                <div className="h-stat border border-slate-800/80 bg-slate-950/50 px-3 py-2">
                  <div className="mono text-lg font-black text-white">{releasedProjectsCount}</div>
                  <div className="section-label text-[9px]">PUBLISHED</div>
                </div>
              </div>

              <div>
                <div className="section-label mb-2">FEATURED BUILDS</div>
                <div className="space-y-2">
                  {featuredProjects.length > 0 ? (
                    featuredProjects.map((project) => (
                      <button
                        key={project.id}
                        onClick={() => scrollTo('#projects')}
                        className="h-stat w-full text-left border border-slate-800/80 bg-slate-950/40 hover:border-cyan-400/35 hover:bg-cyan-400/5 transition-all px-3 py-2"
                      >
                        <div className="mono text-xs text-slate-200">{project.name}</div>
                        <div className="mono text-[10px] text-slate-500 mt-0.5">{project.category || 'Project'}</div>
                      </button>
                    ))
                  ) : (
                    <div className="h-stat border border-slate-800/80 bg-slate-950/40 px-3 py-2">
                      <div className="mono text-xs text-slate-400">View projects to explore latest work.</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll cue */}
      <button
        onClick={() => scrollTo('#about')}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 group"
      >
        <span className="section-label text-[10px] group-hover:opacity-100 opacity-50 transition-opacity">SCROLL</span>
        <ChevronDown size={18} className="text-slate-600 group-hover:text-cyan-400 transition-colors animate-float" />
      </button>
    </section>
  );
};

export default Hero;



