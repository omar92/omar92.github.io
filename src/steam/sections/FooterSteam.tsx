import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Github, Linkedin, Twitter, ArrowUp } from 'lucide-react';
import data from '../../lib/portfolio';

gsap.registerPlugin(ScrollTrigger);

const getSocialIcon = (link: typeof data.personal.contacts.links[0]): typeof Github | null => {
  const type = (link.type || link.icon || link.label).toLowerCase();
  if (type.includes('github')) return Github;
  if (type.includes('linkedin')) return Linkedin;
  if (type.includes('twitter')) return Twitter;
  return null;
};

const Footer = () => {
  const footerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(footerRef.current, { opacity: 0 }, {
        opacity: 1, duration: 0.8, ease: 'power2.out',
        scrollTrigger: { trigger: footerRef.current, start: 'top 90%' },
      });
    });
    return () => ctx.revert();
  }, []);

  return (
    <footer ref={footerRef} className="relative py-8" style={{ background: '#171a21', borderTop: '1px solid #000' }}>
      <div className="w-full max-w-[1400px] mx-auto px-4 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-5">
          <div className="text-center md:text-left">
            <div className="text-sm font-semibold" style={{ color: '#c6d4df' }}>{data.personal.name}</div>
            <div className="text-xs" style={{ color: '#8f98a0' }}>{data.personal.title}</div>
          </div>

          <nav className="flex items-center gap-5">
            {['about', 'projects', 'experience', 'contact'].map((id) => (
              <a
                key={id}
                href={`#${id}`}
                className="text-xs font-medium transition-colors"
                style={{ color: '#8f98a0' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = '#66c0f4'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = '#8f98a0'; }}
              >
                {id}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {data.personal.contacts.links.map((link) => {
              const Icon = getSocialIcon(link);
              if (!Icon) return null;
              return (
                <a
                  key={link.url}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-sm flex items-center justify-center transition-all"
                  style={{ color: '#8f98a0', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = '#c6d4df'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = '#8f98a0'; }}
                >
                  <Icon size={14} />
                </a>
              );
            })}
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="w-8 h-8 rounded-sm flex items-center justify-center transition-all ml-1"
              style={{ color: '#8f98a0', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#66c0f4'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#8f98a0'; }}
              aria-label="Scroll to top"
            >
              <ArrowUp size={13} />
            </button>
          </div>
        </div>

        <div className="mt-6 pt-4 text-xs text-center" style={{ color: '#6b7a87', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          © {new Date().getFullYear()} {data.personal.name}. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;



