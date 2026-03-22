import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Download, Gamepad2, Code2, Cpu, Layers, Zap, Trophy, Users } from 'lucide-react';
import data from '../lib/portfolio';

gsap.registerPlugin(ScrollTrigger);

const About = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const [counters, setCounters] = useState<number[]>(() => data.stats.map(() => 0));
  const hasAnimated = useRef(false);

  useEffect(() => {
    setCounters(data.stats.map(() => 0));
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Section label animation
      gsap.fromTo(
        '.about-label',
        { x: -50, opacity: 0, letterSpacing: '0.5em' },
        {
          x: 0,
          opacity: 1,
          letterSpacing: '0.2em',
          duration: 0.6,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 70%',
          },
        }
      );

      // Headline animation
      gsap.fromTo(
        '.about-headline',
        { y: 50, opacity: 0, rotateX: -45 },
        {
          y: 0,
          opacity: 1,
          rotateX: 0,
          duration: 0.8,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 70%',
          },
          delay: 0.1,
        }
      );

      // Body text animation
      gsap.fromTo(
        '.about-body',
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 60%',
          },
          delay: 0.3,
        }
      );

      // Skills animation
      gsap.fromTo(
        '.skill-category',
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.5,
          stagger: 0.1,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: '.skills-container',
            start: 'top 80%',
          },
        }
      );

      // Image reveal
      gsap.fromTo(
        '.about-image',
        { clipPath: 'inset(0 100% 0 0)' },
        {
          clipPath: 'inset(0 0% 0 0)',
          duration: 1,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: '.about-image-container',
            start: 'top 70%',
          },
          delay: 0.2,
        }
      );

      // Stats counter animation
      ScrollTrigger.create({
        trigger: statsRef.current,
        start: 'top 80%',
        onEnter: () => {
          if (!hasAnimated.current) {
            hasAnimated.current = true;
            animateCounters();
          }
        },
      });

      // Stats cards animation
      gsap.fromTo(
        '.stat-card',
        { y: 100, opacity: 0, rotate: (i: number) => (i - 1) * 5 },
        {
          y: 0,
          opacity: 1,
          rotate: (i: number) => (i - 1) * 2,
          duration: 0.8,
          stagger: 0.15,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: statsRef.current,
            start: 'top 85%',
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const animateCounters = () => {
    data.stats.forEach((stat, index) => {
      const duration = 2000;
      const startTime = Date.now();
      const endValue = stat.value;

      const updateCounter = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(eased * endValue);

        setCounters((prev) => {
          const newCounters = [...prev];
          newCounters[index] = current;
          return newCounters;
        });

        if (progress < 1) {
          requestAnimationFrame(updateCounter);
        }
      };

      requestAnimationFrame(updateCounter);
    });
  };

  const getSkillIcon = (category: string) => {
    switch (category) {
      case 'Game Engines':
        return <Gamepad2 size={20} className="text-indigo-400" />;
      case 'Programming':
        return <Code2 size={20} className="text-violet-400" />;
      case 'Technologies':
        return <Cpu size={20} className="text-blue-400" />;
      case 'AI & Tools':
        return <Layers size={20} className="text-purple-400" />;
      default:
        return <Code2 size={20} className="text-indigo-400" />;
    }
  };

  const getStatIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Zap size={24} className="text-amber-400" />;
      case 1:
        return <Trophy size={24} className="text-emerald-400" />;
      case 2:
        return <Users size={24} className="text-blue-400" />;
      default:
        return <Zap size={24} className="text-indigo-400" />;
    }
  };

  return (
    <section
      id="about"
      ref={sectionRef}
      className="relative py-24 lg:py-32"
    >
      <div className="w-full px-6 lg:px-12">
        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center mb-20">
          {/* Image */}
          <div className="about-image-container relative order-2 lg:order-1">
            <div className="relative aspect-[4/5] max-w-md mx-auto lg:mx-0 overflow-hidden rounded-2xl">
              <div
                className="about-image absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url('${data.personal.avatar}')` }}
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
            </div>
            {/* Decorative elements */}
            <div className="absolute -bottom-4 -right-4 w-32 h-32 border-2 border-indigo-500/30 rounded-2xl -z-10" />
            <div className="absolute -top-4 -left-4 w-24 h-24 bg-gradient-to-br from-indigo-500/20 to-violet-500/20 rounded-2xl -z-10" />
          </div>

          {/* Content */}
          <div className="order-1 lg:order-2">
            {/* Section Label */}
            <p className="about-label text-sm text-indigo-400 tracking-[0.2em] uppercase mb-4">
              About Me
            </p>

            {/* Headline */}
            <h2
              className="about-headline text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Crafting Digital
              <br />
              <span className="text-gradient">Experiences</span>
            </h2>

            {/* Body */}
            <p className="about-body text-slate-400 text-base lg:text-lg leading-relaxed mb-8">
              {data.personal.about}
            </p>

            {/* Skills */}
            <div className="skills-container space-y-6 mb-8">
              {data.skills.map((skillGroup, index) => (
                <div key={index} className="skill-category">
                  <div className="flex items-center gap-2 mb-3">
                    {getSkillIcon(skillGroup.category)}
                    <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
                      {skillGroup.category}
                    </h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {skillGroup.items.map((skill, skillIndex) => (
                      <span key={skillIndex} className="skill-tag">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* CTA */}
            <a
              href={data.personal.resume}
              className="inline-flex items-center gap-2 px-6 py-3 bg-slate-800/50 border border-slate-700 text-white font-medium rounded-full hover:bg-indigo-500/20 hover:border-indigo-500/30 transition-all group"
            >
              <Download size={18} className="group-hover:animate-bounce" />
              Download Resume
            </a>
          </div>
        </div>

        {/* Stats */}
        <div
          ref={statsRef}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {data.stats.map((stat, index) => (
            <div
              key={index}
              className="stat-card relative p-8 glass-card rounded-2xl overflow-hidden group hover:border-indigo-500/30 transition-all card-lift"
              style={{ transform: `rotate(${(index - 1) * 2}deg)` }}
            >
              {/* Background glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-xl bg-slate-800/50">
                    {getStatIcon(index)}
                  </div>
                </div>
                <div className="stat-value text-white mb-2">
                  {counters[index]}
                  <span className="text-gradient">{stat.suffix}</span>
                </div>
                <p className="text-slate-500 text-sm uppercase tracking-wider">
                  {stat.label}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default About;
