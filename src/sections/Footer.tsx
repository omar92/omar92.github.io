import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Github, Linkedin, Twitter, Heart, Code2, ArrowUp } from 'lucide-react';
import data from '../lib/portfolio';

gsap.registerPlugin(ScrollTrigger);

const Footer = () => {
  const footerRef = useRef<HTMLElement>(null);
  const brandName = data.personal.name.replace(/\s+/g, '');

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Brand background
      gsap.fromTo(
        '.footer-brand-bg',
        { opacity: 0, scale: 0.9 },
        {
          opacity: 0.03,
          scale: 1,
          duration: 1,
          ease: 'smooth',
          scrollTrigger: {
            trigger: footerRef.current,
            start: 'top 90%',
          },
        }
      );

      // Links
      gsap.fromTo(
        '.footer-link',
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
          stagger: 0.08,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: footerRef.current,
            start: 'top 90%',
          },
          delay: 0.2,
        }
      );

      // Social icons
      gsap.fromTo(
        '.footer-social',
        { opacity: 0, scale: 0 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.3,
          stagger: 0.05,
          ease: 'elastic.out(1, 0.5)',
          scrollTrigger: {
            trigger: footerRef.current,
            start: 'top 90%',
          },
          delay: 0.6,
        }
      );

      // Copyright
      gsap.fromTo(
        '.footer-copyright',
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.5,
          ease: 'smooth',
          scrollTrigger: {
            trigger: footerRef.current,
            start: 'top 90%',
          },
          delay: 0.8,
        }
      );
    }, footerRef);

    return () => ctx.revert();
  }, []);

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navLinks = [
    { href: '#home', label: 'Home' },
    { href: '#about', label: 'About' },
    { href: '#projects', label: 'Projects' },
    { href: '#experience', label: 'Experience' },
    { href: '#contact', label: 'Contact' },
  ];

  return (
    <footer
      ref={footerRef}
      className="relative py-16 border-t border-slate-800 overflow-hidden"
    >
      {/* Large brand name background */}
      <div
        className="footer-brand-bg absolute inset-0 flex items-center justify-center pointer-events-none select-none"
        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
      >
        <span className="text-[20vw] font-black text-white whitespace-nowrap">
          {brandName}
        </span>
      </div>

      <div className="relative z-10 w-full px-6 lg:px-12">
        <div className="max-w-6xl mx-auto">
          {/* Top Section */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12">
            {/* Brand */}
            <div className="text-center md:text-left">
              <a
                href="#home"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection('#home');
                }}
                className="flex items-center gap-2 text-2xl font-bold group"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 group-hover:from-indigo-500 group-hover:to-violet-500 transition-all">
                  <Code2 size={20} className="text-white" />
                </div>
                <span className="text-white">{data.personal.firstName}</span>
                {data.personal.lastName ? <span className="text-gradient">{data.personal.lastName}</span> : null}
              </a>
              <p className="text-slate-500 text-sm mt-1">{data.personal.title}</p>
            </div>

            {/* Navigation */}
            <nav className="flex flex-wrap justify-center gap-6">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection(link.href);
                  }}
                  className="footer-link text-sm text-slate-500 hover:text-white transition-colors link-underline"
                >
                  {link.label}
                </a>
              ))}
            </nav>

            {/* Social Links */}
            <div className="flex gap-3">
              <a
                href={data.personal.github}
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social p-2.5 glass-card rounded-lg text-slate-500 hover:text-white hover:bg-indigo-500/20 transition-all"
                aria-label="GitHub"
              >
                <Github size={18} />
              </a>
              <a
                href={data.personal.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social p-2.5 glass-card rounded-lg text-slate-500 hover:text-white hover:bg-indigo-500/20 transition-all"
                aria-label="LinkedIn"
              >
                <Linkedin size={18} />
              </a>
              <a
                href={data.personal.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social p-2.5 glass-card rounded-lg text-slate-500 hover:text-white hover:bg-indigo-500/20 transition-all"
                aria-label="Twitter"
              >
                <Twitter size={18} />
              </a>
            </div>
          </div>

          {/* Divider */}
          <div className="w-full h-px bg-slate-800 mb-8" />

          {/* Bottom Section */}
          <div className="footer-copyright flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500">
            <p className="flex items-center gap-1">
              &copy; {new Date().getFullYear()} {data.personal.name}. Made with
              <Heart size={14} className="text-indigo-500 fill-indigo-500" />
            </p>
            <div className="flex items-center gap-4">
              <p>All rights reserved.</p>
              <button
                onClick={scrollToTop}
                className="p-2 glass-card rounded-lg hover:bg-indigo-500/20 hover:text-white transition-all"
                aria-label="Scroll to top"
              >
                <ArrowUp size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
