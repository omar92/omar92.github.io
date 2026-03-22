import { useState, useEffect } from 'react';
import { gsap } from 'gsap';
import { Menu, X, Code2 } from 'lucide-react';
import data from '../lib/portfolio';

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const brandLastName = data.personal.lastName;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Entrance animation
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.nav-logo',
        { y: -20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: 'expo.out', delay: 0.2 }
      );

      gsap.fromTo(
        '.nav-link',
        { x: 30, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.5,
          ease: 'expo.out',
          stagger: 0.08,
          delay: 0.4,
        }
      );

      gsap.fromTo(
        '.nav-cta',
        { scale: 0.8, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.6,
          ease: 'elastic.out(1, 0.5)',
          delay: 0.8,
        }
      );
    });

    return () => ctx.revert();
  }, []);

  const navLinks = [
    { href: '#home', label: 'Home' },
    { href: '#about', label: 'About' },
    { href: '#projects', label: 'Projects' },
    { href: '#experience', label: 'Experience' },
    { href: '#contact', label: 'Contact' },
  ];

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled ? 'glass-nav' : 'bg-transparent'
        }`}
      >
        <div className="w-full px-6 lg:px-12">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <a
              href="#home"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('#home');
              }}
              className="nav-logo flex items-center gap-2 text-2xl font-bold tracking-tight group"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 group-hover:from-indigo-500 group-hover:to-violet-500 transition-all">
                <Code2 size={20} className="text-white" />
              </div>
              <span className="text-white">{data.personal.firstName}</span>
              {brandLastName ? <span className="text-gradient">{brandLastName}</span> : null}
            </a>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection(link.href);
                  }}
                  className="nav-link relative text-sm font-medium text-slate-400 hover:text-white transition-colors link-underline"
                >
                  {link.label}
                </a>
              ))}
              <a
                href={`mailto:${data.personal.email}`}
                className="nav-cta px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-medium rounded-full hover:from-indigo-500 hover:to-violet-500 transition-all btn-shine"
              >
                Let&apos;s Talk
              </a>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 text-slate-300 hover:text-white transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div
        className={`fixed inset-0 z-40 bg-slate-900/98 backdrop-blur-xl transition-all duration-500 md:hidden ${
          isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
      >
        <div className="flex flex-col items-center justify-center h-full gap-8">
          {navLinks.map((link, index) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => {
                e.preventDefault();
                scrollToSection(link.href);
              }}
              className="text-3xl font-bold text-white hover:text-indigo-400 transition-colors"
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                animationDelay: `${index * 100}ms`,
              }}
            >
              {link.label}
            </a>
          ))}
          <a
            href={`mailto:${data.personal.email}`}
            className="mt-4 px-8 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-lg font-medium rounded-full hover:from-indigo-500 hover:to-violet-500 transition-all"
          >
            Let&apos;s Talk
          </a>
        </div>
      </div>
    </>
  );
};

export default Navigation;
