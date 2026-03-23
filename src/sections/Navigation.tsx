import { useState, useEffect } from 'react';
import { gsap } from 'gsap';
import { Menu, X } from 'lucide-react';
import data from '../lib/portfolio';

const NAV_LINKS = [
  { href: '#home',       label: 'HOME' },
  { href: '#about',      label: 'ABOUT' },
  { href: '#projects',   label: 'PROJECTS' },
  { href: '#experience', label: 'EXPERIENCE' },
  { href: '#contact',    label: 'CONTACT' },
] as const;

const Navigation = () => {
  const [scrolled,   setScrolled]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeId,   setActiveId]   = useState('home');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const sections = document.querySelectorAll('section[id]');
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) setActiveId(e.target.id); }),
      { threshold: 0.25 }
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.nav-root', { y: -80, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: 'expo.out', delay: 0.2 });
    });
    return () => ctx.revert();
  }, []);

  const scrollTo = (href: string) => {
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
    setMobileOpen(false);
  };

  const initials = `${data.personal.firstName?.[0] ?? ''}${data.personal.lastName?.[0] ?? ''}`;

  return (
    <>
      <nav className={`nav-root fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'glass-nav' : ''}`}>
        <div className="w-full px-6 lg:px-14">
          <div className="flex items-center justify-between h-16">
            <button onClick={() => scrollTo('#home')} className="flex items-center gap-3 group">
              <div className="relative w-9 h-9 flex items-center justify-center">
                <div className="absolute inset-0 border border-cyan-400/40 rotate-45 group-hover:border-cyan-400 transition-all duration-300" />
                <span className="mono text-xs font-bold text-cyan-400 z-10">{initials}</span>
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-xs font-bold tracking-widest text-white" style={{ fontFamily: 'Orbitron, monospace' }}>{(data.personal.firstName ?? '').toUpperCase()}</span>
                <span className="section-label text-[9px]">{(data.personal.title ?? '').toUpperCase()}</span>
              </div>
            </button>
            <div className="hidden md:flex items-center">
              {NAV_LINKS.map((link) => {
                const active = activeId === link.href.slice(1);
                return (
                  <button key={link.href} onClick={() => scrollTo(link.href)}
                    className={`nav-link relative px-4 py-2 mono text-xs tracking-widest transition-all ${active ? 'text-cyan-400' : 'text-slate-400 hover:text-slate-200'}`}>
                    {active && <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-cyan-400 rounded-full" />}
                    {link.label}
                  </button>
                );
              })}
              <a href={data.personal.resume} target="_blank" rel="noopener noreferrer" className="nav-cta btn-primary ml-6 text-xs py-2 px-5">RESUME</a>
            </div>
            <button onClick={() => setMobileOpen((v) => !v)} className="md:hidden p-2 border border-cyan-400/30 text-cyan-400 hover:bg-cyan-400/10 transition-all">
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </nav>
      {mobileOpen && (
        <div className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-8" style={{ backdropFilter: 'blur(24px)', background: 'rgba(5,5,16,0.97)' }}>
          {NAV_LINKS.map((link) => (
            <button key={link.href} onClick={() => scrollTo(link.href)} className="text-2xl tracking-widest text-slate-300 hover:text-cyan-400 transition-colors" style={{ fontFamily: 'Orbitron, monospace' }}>{link.label}</button>
          ))}
          <a href={data.personal.resume} target="_blank" rel="noopener noreferrer" className="btn-primary mt-4">RESUME</a>
        </div>
      )}
    </>
  );
};

export default Navigation;