import { useState, useEffect } from 'react';
import { Menu, X, ShoppingCart } from 'lucide-react';
import data from '../lib/portfolio';

const NAV_LINKS = [
  { href: '#home',       label: 'STORE' },
  { href: '#about',      label: 'ABOUT' },
  { href: '#projects',   label: 'PROJECTS' },
  { href: '#experience', label: 'EXPERIENCE' },
  { href: '#contact',    label: 'CONTACT' },
] as const;

const Navigation = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeId,   setActiveId]   = useState('home');

  useEffect(() => {
    const sections = document.querySelectorAll('section[id]');
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) setActiveId(e.target.id); }),
      { threshold: 0.25 }
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  const scrollTo = (href: string) => {
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
    setMobileOpen(false);
  };

  const initials = `${data.personal.firstName?.[0] ?? ''}${data.personal.lastName?.[0] ?? ''}`;

  return (
    <>
      {/* Steam top bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-[52px]" style={{ background: '#171a21', borderBottom: '1px solid #000' }}>
        <div className="w-full max-w-[1400px] mx-auto h-full flex items-center px-4 lg:px-8 gap-0">

          {/* Logo / Brand */}
          <button
            onClick={() => scrollTo('#home')}
            className="flex items-center gap-2.5 mr-6 shrink-0 group"
          >
            <div className="w-8 h-8 rounded flex items-center justify-center text-sm font-bold"
              style={{ background: 'linear-gradient(to bottom, #4a7ebf, #1b4f8a)', color: '#c7e3f7', boxShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>
              {initials}
            </div>
            <span className="text-sm font-semibold tracking-wide hidden sm:block"
              style={{ color: '#c6d4df' }}>
              {data.personal.name}
            </span>
          </button>

          {/* Nav links - Steam style tabs */}
          <nav className="hidden md:flex items-stretch h-full">
            {NAV_LINKS.map((link) => {
              const active = activeId === link.href.slice(1);
              return (
                <button
                  key={link.href}
                  onClick={() => scrollTo(link.href)}
                  className="relative flex items-center px-4 text-xs font-semibold tracking-wider transition-all duration-150 h-full border-b-2"
                  style={{
                    color: active ? '#c6d4df' : '#8f98a0',
                    borderBottomColor: active ? '#66c0f4' : 'transparent',
                    background: active ? 'rgba(102,192,244,0.08)' : 'transparent',
                  }}
                  onMouseEnter={(e) => {
                    if (!active) {
                      (e.currentTarget as HTMLButtonElement).style.color = '#c6d4df';
                      (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.05)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      (e.currentTarget as HTMLButtonElement).style.color = '#8f98a0';
                      (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                    }
                  }}
                >
                  {link.label}
                </button>
              );
            })}
          </nav>

          <div className="flex-1" />

          {/* Right side: Resume button */}
          <div className="hidden md:flex items-center gap-3">
            {data.personal.resume && (
              <a
                href={data.personal.resume}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 btn-primary text-xs px-4 py-1.5"
              >
                <ShoppingCart size={13} />
                Resume
              </a>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="md:hidden p-2 ml-2 rounded transition-colors"
            style={{ color: '#8f98a0' }}
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 flex flex-col gap-0 pt-[52px]"
          style={{ background: '#171a21' }}
        >
          {NAV_LINKS.map((link) => (
            <button
              key={link.href}
              onClick={() => scrollTo(link.href)}
              className="px-6 py-4 text-left text-sm font-semibold tracking-wider transition-colors border-b"
              style={{ color: '#c6d4df', borderColor: 'rgba(255,255,255,0.05)' }}
            >
              {link.label}
            </button>
          ))}
          {data.personal.resume && (
            <a
              href={data.personal.resume}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary mx-6 mt-6 text-sm justify-center"
            >
              Resume
            </a>
          )}
        </div>
      )}
    </>
  );
};

export default Navigation;
