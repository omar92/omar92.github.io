import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ChevronDown, Github, Linkedin, Twitter, Code2, Cpu, Sparkles } from 'lucide-react';
import data from '../lib/portfolio';

const Hero = () => {
  const heroRef = useRef<HTMLElement>(null);
  const codeRef = useRef<HTMLDivElement>(null);
  const stats = data.stats.slice(0, 3);

  // Typing animation for code snippet
  useEffect(() => {
    if (!codeRef.current) return;
    
    const codeLines = [
      { text: 'const developer = {', delay: 1000 },
      { text: `  name: '${data.personal.name}',`, delay: 1400 },
      { text: `  role: '${data.personal.title}',`, delay: 1800 },
      { text: `  focus: '${data.personal.subtitle || data.personal.tagline}',`, delay: 2200 },
      { text: "  status: 'Available for work'", delay: 2600 },
      { text: '};', delay: 3000 },
    ];

    codeLines.forEach((line) => {
      const div = document.createElement('div');
      div.className = 'code-line opacity-0';
      codeRef.current?.appendChild(div);

      gsap.to(div, {
        opacity: 1,
        duration: 0.3,
        delay: line.delay / 1000,
        onStart: () => {
          let charIndex = 0;
          const typeChar = () => {
            if (charIndex < line.text.length) {
              div.textContent += line.text[charIndex];
              charIndex++;
              setTimeout(typeChar, 30);
            }
          };
          typeChar();
        },
      });
    });

    return () => {
      if (codeRef.current) {
        codeRef.current.innerHTML = '';
      }
    };
  }, []);

  // GSAP animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.3 });

      // Badge animation
      tl.fromTo(
        '.hero-badge',
        { opacity: 0, y: 20, scale: 0.9 },
        { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: 'expo.out' }
      );

      // Greeting
      tl.fromTo(
        '.hero-greeting',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'expo.out' },
        0.2
      );

      // Headline reveal with split effect
      tl.fromTo(
        '.hero-headline',
        { opacity: 0, y: 50, rotateX: -30 },
        { opacity: 1, y: 0, rotateX: 0, duration: 1, ease: 'expo.out' },
        0.4
      );

      // Subtitle
      tl.fromTo(
        '.hero-subtitle',
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'expo.out' },
        0.8
      );

      // Tagline
      tl.fromTo(
        '.hero-tagline',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'expo.out' },
        1.0
      );

      // CTA buttons
      tl.fromTo(
        '.hero-cta-primary',
        { opacity: 0, scale: 0.8 },
        { opacity: 1, scale: 1, duration: 0.7, ease: 'elastic.out(1, 0.5)' },
        1.2
      );

      tl.fromTo(
        '.hero-cta-secondary',
        { opacity: 0, scale: 0.8 },
        { opacity: 1, scale: 1, duration: 0.7, ease: 'elastic.out(1, 0.5)' },
        1.35
      );

      // Social links
      tl.fromTo(
        '.hero-social',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'expo.out' },
        1.5
      );

      // Code block
      tl.fromTo(
        '.code-block',
        { opacity: 0, x: 50, rotateY: -15 },
        { opacity: 1, x: 0, rotateY: 0, duration: 0.8, ease: 'expo.out' },
        0.6
      );

      // Tech stack icons
      tl.fromTo(
        '.tech-icon',
        { opacity: 0, scale: 0 },
        { opacity: 1, scale: 1, duration: 0.5, stagger: 0.1, ease: 'elastic.out(1, 0.5)' },
        1.8
      );

      // Scroll indicator
      tl.fromTo(
        '.scroll-indicator',
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'expo.out' },
        2.0
      );
    }, heroRef);

    return () => ctx.revert();
  }, []);

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      id="home"
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20"
    >
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-500/5 to-transparent pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 w-full px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left Column - Text Content */}
            <div className="order-2 lg:order-1">
              {/* Badge */}
              <div className="hero-badge inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-6">
                <Sparkles size={16} className="text-indigo-400" />
                <span className="text-sm text-indigo-300">Available for new projects</span>
              </div>

              {/* Greeting */}
              <p className="hero-greeting text-lg md:text-xl text-slate-400 mb-4 font-light">
                Hi there, I&apos;m
              </p>

              {/* Headline */}
              <h1
                className="hero-headline text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-6 leading-none"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                <span className="text-white">{data.personal.firstName}</span>
                <span className="text-gradient">{data.personal.lastName ? ` ${data.personal.lastName}` : '.'}</span>
              </h1>

              {/* Subtitle */}
              <p
                className="hero-subtitle text-2xl sm:text-3xl md:text-4xl font-semibold text-slate-200 mb-4"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {data.personal.title}
              </p>

              {/* Tagline */}
              <p className="hero-tagline text-base md:text-lg text-slate-400 max-w-xl mb-8 leading-relaxed">
                {data.personal.tagline}
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4 mb-10">
                <button
                  onClick={() => scrollToSection('#projects')}
                  className="hero-cta-primary px-8 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-medium rounded-full hover:from-indigo-500 hover:to-violet-500 transition-all hover:scale-105 btn-shine glow-indigo"
                >
                  View My Work
                </button>
                <button
                  onClick={() => scrollToSection('#contact')}
                  className="hero-cta-secondary px-8 py-4 border border-slate-600 text-slate-300 font-medium rounded-full hover:bg-slate-800/50 hover:border-indigo-500/30 transition-all hover:scale-105"
                >
                  Get In Touch
                </button>
              </div>

              {/* Social Links */}
              <div className="flex gap-3">
                <a
                  href={data.personal.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hero-social p-3 rounded-xl bg-slate-800/50 border border-slate-700 text-slate-400 hover:text-white hover:bg-indigo-500/20 hover:border-indigo-500/30 transition-all"
                  aria-label="GitHub"
                >
                  <Github size={20} />
                </a>
                <a
                  href={data.personal.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hero-social p-3 rounded-xl bg-slate-800/50 border border-slate-700 text-slate-400 hover:text-white hover:bg-indigo-500/20 hover:border-indigo-500/30 transition-all"
                  aria-label="LinkedIn"
                >
                  <Linkedin size={20} />
                </a>
                <a
                  href={data.personal.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hero-social p-3 rounded-xl bg-slate-800/50 border border-slate-700 text-slate-400 hover:text-white hover:bg-indigo-500/20 hover:border-indigo-500/30 transition-all"
                  aria-label="Twitter"
                >
                  <Twitter size={20} />
                </a>
              </div>
            </div>

            {/* Right Column - Code Block & Visual */}
            <div className="order-1 lg:order-2 flex flex-col items-center">
              {/* Code Block */}
              <div 
                className="code-block w-full max-w-md glass-card rounded-2xl p-6 transform perspective-1000"
                style={{ transformStyle: 'preserve-3d' }}
              >
                {/* Window Controls */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                  <div className="ml-4 text-xs text-slate-500 font-mono">developer.js</div>
                </div>
                
                {/* Code Content */}
                <div 
                  ref={codeRef}
                  className="font-mono text-sm space-y-1"
                >
                  <div className="text-purple-400">const <span className="text-blue-400">developer</span> = {'{'}</div>
                </div>
                
                {/* Syntax highlighting spans */}
                <style>{`
                  .code-line {
                    font-family: 'JetBrains Mono', 'Fira Code', monospace;
                    white-space: pre;
                  }
                  .code-line:nth-child(1) { color: #a78bfa; }
                  .code-line:nth-child(2),
                  .code-line:nth-child(3),
                  .code-line:nth-child(4),
                  .code-line:nth-child(5) { color: #94a3b8; }
                  .code-line:nth-child(2) span,
                  .code-line:nth-child(3) span,
                  .code-line:nth-child(4) span,
                  .code-line:nth-child(5) span { color: #fbbf24; }
                `}</style>

                {/* Tech Stack Icons */}
                <div className="mt-6 pt-4 border-t border-slate-700/50">
                  <p className="text-xs text-slate-500 mb-3">Tech Stack</p>
                  <div className="flex gap-3">
                    <div className="tech-icon p-2 rounded-lg bg-slate-800/50 text-indigo-400">
                      <Code2 size={20} />
                    </div>
                    <div className="tech-icon p-2 rounded-lg bg-slate-800/50 text-violet-400">
                      <Cpu size={20} />
                    </div>
                    <div className="tech-icon p-2 rounded-lg bg-slate-800/50 text-blue-400">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" fill="none"/>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Stats */}
              <div className="mt-8 grid grid-cols-3 gap-4 w-full max-w-md">
                {stats.map((stat) => (
                  <div key={stat.label} className="tech-icon text-center p-4 glass-card rounded-xl">
                    <div className="text-2xl font-bold text-gradient">{stat.value}{stat.suffix}</div>
                    <div className="text-xs text-slate-500 mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="scroll-indicator absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2">
        <span className="text-xs text-slate-500 tracking-widest uppercase">Scroll</span>
        <ChevronDown className="bounce text-slate-500" size={24} />
      </div>
    </section>
  );
};

export default Hero;
