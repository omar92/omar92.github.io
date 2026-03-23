import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Download, Shield, Cpu, Layers, Globe, Network, Zap } from 'lucide-react';
import data from '../lib/portfolio';

gsap.registerPlugin(ScrollTrigger);

const SPEC_ICONS = [Shield, Cpu, Layers, Globe, Network, Zap];

const About = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [counters, setCounters] = useState<number[]>(() => data.stats.map(() => 0));
  const hasAnimated = useRef(false);

  function animateCounters() {
    data.stats.forEach((stat, i) => {
      const obj = { value: 0 };
      gsap.to(obj, {
        value: stat.value,
        duration: 1.8,
        ease: 'expo.out',
        onUpdate: () => {
          setCounters((prev) => {
            const next = [...prev];
            next[i] = Math.round(obj.value);
            return next;
          });
        },
      });
    });
  }

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.ab-header', { opacity: 0, y: 40 }, {
        opacity: 1, y: 0, duration: 0.8, ease: 'expo.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 70%' },
      });
      gsap.fromTo('.ab-text', { opacity: 0, x: -30 }, {
        opacity: 1, x: 0, duration: 0.7, ease: 'expo.out',
        scrollTrigger: { trigger: '.ab-content', start: 'top 75%' },
      });
      gsap.fromTo('.ab-spec', { opacity: 0, y: 20 }, {
        opacity: 1, y: 0, duration: 0.4, stagger: 0.07, ease: 'expo.out',
        scrollTrigger: { trigger: '.ab-specs', start: 'top 80%' },
      });
      gsap.fromTo('.ab-skill', { opacity: 0, scale: 0.7 }, {
        opacity: 1, scale: 1, duration: 0.4, stagger: 0.03, ease: 'elastic.out(1,0.5)',
        scrollTrigger: { trigger: '.ab-skills', start: 'top 82%' },
      });
      ScrollTrigger.create({
        trigger: '.ab-stats',
        start: 'top 82%',
        onEnter: () => {
          if (!hasAnimated.current) { hasAnimated.current = true; animateCounters(); }
        },
      });
      gsap.fromTo('.ab-stat', { opacity: 0, y: 28 }, {
        opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'expo.out',
        scrollTrigger: { trigger: '.ab-stats', start: 'top 82%' },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section id="about" ref={sectionRef} className="relative py-28 lg:py-36 reveal-section">
      <div className="divider-cyan mb-24 mx-6 lg:mx-12" />
      <div className="w-full px-6 lg:px-12">

        {/* Header */}
        <div className="ab-header mb-16">
          <div className="section-label mb-3">01 // ABOUT ME</div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white">
            WHO I <span className="text-gradient-cyan">AM</span>
          </h2>
        </div>

        <div className="ab-content grid lg:grid-cols-2 gap-16 lg:gap-24">
          {/* Left */}
          <div className="ab-text space-y-8">
            <p className="text-lg text-slate-300 leading-relaxed">{data.personal.about}</p>

            {/* Specializations */}
            <div className="ab-specs space-y-3">
              {data.skills.slice(0, 5).map((sg, i) => {
                const Icon = SPEC_ICONS[i % SPEC_ICONS.length];
                return (
                  <div key={sg.category} className="ab-spec flex items-start gap-4 group">
                    <div className="shrink-0 w-9 h-9 flex items-center justify-center border border-slate-700 group-hover:border-cyan-400/50 group-hover:bg-cyan-400/5 transition-all">
                      <Icon size={16} className="text-slate-600 group-hover:text-cyan-400 transition-colors" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-200 mb-0.5">{sg.category}</div>
                      <div className="mono text-xs text-slate-500">{sg.items.join(' Â· ')}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            <a
              href={data.personal.resume}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary inline-flex items-center gap-2"
            >
              <Download size={14} />
              DOWNLOAD RESUME
            </a>
          </div>

          {/* Right */}
          <div className="space-y-10">
            {/* Skill tags */}
            <div className="ab-skills">
              <div className="section-label mb-5">TECH STACK</div>
              <div className="flex flex-wrap gap-2">
                {data.skills.flatMap((sg) => sg.items).map((skill) => (
                  <span key={skill} className="ab-skill tag-cyan hover:bg-cyan-400/15 transition-colors cursor-default">{skill}</span>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="ab-stats grid grid-cols-2 gap-4">
              {data.stats.map((stat, i) => (
                <div key={i} className="ab-stat game-card clip-tl hud-corners p-5 group hover:border-cyan-400/25 transition-all">
                  <div className="text-4xl font-black mono text-white mb-1 group-hover:text-cyan-400 transition-colors">
                    {counters[i]}<span className="text-cyan-400 text-3xl">{stat.suffix}</span>
                  </div>
                  <div className="section-label text-[10px]">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
