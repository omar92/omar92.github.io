import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Github, Linkedin, Twitter, ArrowUp } from 'lucide-react';
import data from '../lib/portfolio';

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
    <footer ref={footerRef} className="relative py-12 border-t border-slate-800/60">
      <div className="divider-cyan mb-12 mx-6 lg:mx-12" />
      <div className="w-full px-6 lg:px-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">

          {/* Brand */}
          <div>
            <div className="font-black text-white tracking-widest mb-1" style={{ fontFamily: 'Orbitron, monospace' }}>
              {data.personal.name.toUpperCase().replace(' ', ' ')}
            </div>
            <div className="section-label">{data.personal.title}</div>
          </div>

          {/* Nav links */}
          <nav className="flex gap-8">
            {['about', 'projects', 'experience', 'contact'].map((id) => (
              <a
                key={id}
                href={`#${id}`}
                className="mono text-xs text-slate-500 hover:text-cyan-400 transition-colors tracking-widest uppercase"
              >
                {id}
              </a>
            ))}
          </nav>

          {/* Socials + scroll top */}
          <div className="flex items-center gap-4">
            {data.personal.contacts.links.map((link) => {
              const Icon = getSocialIcon(link);
              if (!Icon) return null;
              return (
                <a
                  key={link.url}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-600 hover:text-cyan-400 transition-colors"
                >
                  <Icon size={15} />
                </a>
              );
            })}
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="w-8 h-8 flex items-center justify-center border border-slate-700 hover:border-cyan-400/50 hover:text-cyan-400 text-slate-500 transition-all ml-2"
              aria-label="Scroll to top"
            >
              <ArrowUp size={13} />
            </button>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-800/40 mono text-xs text-slate-600 text-center">
          &copy; {new Date().getFullYear()} {data.personal.name} â€” All rights reserved
        </div>
      </div>
    </footer>
  );
};

export default Footer;
