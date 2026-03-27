import { useEffect, useMemo, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Download, ThumbsUp } from 'lucide-react';
import data from '../lib/portfolio';
import { fetchGitHubUserStats, type GitHubUserStats } from '../lib/github';

gsap.registerPlugin(ScrollTrigger);

const NOW_MS = Date.now();

const About = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  const yearsExperience = useMemo(() => {
    const dates = data.experience
      .map((e) => new Date(e.startDate))
      .filter((d) => !isNaN(d.getTime()));
    if (!dates.length) return 0;
    const earliest = new Date(Math.min(...dates.map((d) => d.getTime())));
    return Math.floor((NOW_MS - earliest.getTime()) / (1000 * 60 * 60 * 24 * 365.25));
  }, []);

  const [githubUserStats, setGithubUserStats] = useState<GitHubUserStats | null>(null);

  useEffect(() => {
    const githubUrl = data.personal.contacts.links.find(
      (l) => l.icon?.toLowerCase() === 'github' || l.label?.toLowerCase() === 'github',
    )?.url;
    if (!githubUrl) return;
    let cancelled = false;
    try {
      const username = new URL(githubUrl).pathname.split('/').filter(Boolean)[0];
      if (username) {
        fetchGitHubUserStats(username).then((stats) => {
          if (!cancelled && stats) setGithubUserStats(stats);
        });
      }
    } catch { /* ignore invalid URL */ }
    return () => { cancelled = true; };
  }, []);

  const liveStats = useMemo(() => {
    return data.stats.map((stat) => {
      const label = stat.label.toLowerCase();
      if (label.includes('year')) return { ...stat, value: yearsExperience };
      if (label.includes('project')) return { ...stat, value: data.projects.length };
      if (githubUserStats) {
        if (label.includes('repo')) return { ...stat, value: githubUserStats.public_repos };
        if (label.includes('star')) return { ...stat, value: githubUserStats.total_stars };
        if (label.includes('fork')) return { ...stat, value: githubUserStats.total_forks };
      }
      return stat;
    });
  }, [yearsExperience, githubUserStats]);

  const liveStatsRef = useRef(liveStats);
  useEffect(() => { liveStatsRef.current = liveStats; }, [liveStats]);

  const techStackSkills = useMemo(() => {
    const featuredProjects = data.projects.filter((p) => p.featured);
    const sourceProjects = featuredProjects.length > 0 ? featuredProjects : data.projects;
    const skillCounts = sourceProjects.reduce<Record<string, { label: string; count: number }>>((counts, project) => {
      project.skills.forEach((skill) => {
        const normalized = skill.trim().toLowerCase();
        if (!normalized) return;
        const existing = counts[normalized];
        if (existing) { existing.count += 1; return; }
        counts[normalized] = { label: skill.trim(), count: 1 };
      });
      return counts;
    }, {});
    return Object.values(skillCounts)
      .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
      .map((s) => s.label);
  }, []);

  const [counters, setCounters] = useState<number[]>(() => data.stats.map(() => 0));

  function animateCounters() {
    liveStatsRef.current.forEach((stat, i) => {
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
      gsap.fromTo('.ab-header', { opacity: 0, y: 30 }, {
        opacity: 1, y: 0, duration: 0.6, ease: 'power2.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 70%' },
      });
      gsap.fromTo('.ab-content', { opacity: 0, y: 20 }, {
        opacity: 1, y: 0, duration: 0.6, ease: 'power2.out',
        scrollTrigger: { trigger: '.ab-content', start: 'top 75%' },
      });
      ScrollTrigger.create({
        trigger: '.ab-stats',
        start: 'top 82%',
        onEnter: () => {
          if (!hasAnimated) {
            setHasAnimated(true);
            animateCounters();
          }
        },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, [hasAnimated]);

  return (
    <section id="about" ref={sectionRef} className="relative py-12 reveal-section" style={{ background: '#1b2838', borderTop: '1px solid rgba(0,0,0,0.3)' }}>
      <div className="w-full max-w-[1400px] mx-auto px-4 lg:px-8">
        {/* Steam profile-page 2-column grid */}
        <div className="ab-content grid lg:grid-cols-[1fr_340px] gap-6">

          {/* Left: bio + skills */}
          <div className="space-y-6">

            {/* Bio */}
            <div className="rounded-sm overflow-hidden" style={{ background: '#16202d', border: '1px solid rgba(0,0,0,0.3)' }}>
              <div className="px-5 py-3" style={{ background: '#1e3048', borderBottom: '1px solid rgba(0,0,0,0.3)' }}>
                <span className="text-xs font-semibold" style={{ color: '#c6d4df' }}>Bio</span>
              </div>
              <div className="p-5">
                <p className="text-sm leading-relaxed" style={{ color: '#8f98a0' }}>{data.personal.about}</p>
                {data.personal.resume && (
                  <a href={data.personal.resume} target="_blank" rel="noopener noreferrer"
                    className="btn-ghost inline-flex items-center gap-2 mt-4 text-xs px-4 py-2">
                    <Download size={13} />
                    Download Resume
                  </a>
                )}
              </div>
            </div>

            {/* Specializations */}
            {data.skills.length > 0 && (
              <div className="rounded-sm overflow-hidden" style={{ background: '#16202d', border: '1px solid rgba(0,0,0,0.3)' }}>
                <div className="px-5 py-3" style={{ background: '#1e3048', borderBottom: '1px solid rgba(0,0,0,0.3)' }}>
                  <span className="text-xs font-semibold" style={{ color: '#c6d4df' }}>Specializations</span>
                </div>
                <div className="p-5 space-y-4">
                  {data.skills.slice(0, 5).map((sg) => (
                    <div key={sg.category}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-medium" style={{ color: '#c6d4df' }}>{sg.category}</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {sg.items.map((item) => (
                          <span key={item} className="tag-cyan text-[11px]">{item}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tech stack tags (like Steam game tags) */}
            {techStackSkills.length > 0 && (
              <div className="rounded-sm overflow-hidden" style={{ background: '#16202d', border: '1px solid rgba(0,0,0,0.3)' }}>
                <div className="px-5 py-3" style={{ background: '#1e3048', borderBottom: '1px solid rgba(0,0,0,0.3)' }}>
                  <span className="text-xs font-semibold" style={{ color: '#c6d4df' }}>Popular Tags for This Developer</span>
                </div>
                <div className="ab-skills p-4 flex flex-wrap gap-1.5">
                  {techStackSkills.slice(0, 20).map((skill) => (
                    <span key={skill} className="ab-skill tag-cyan text-[11px] cursor-default">{skill}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: stats panel (like Steam "Game Details" sidebar) */}
          <div className="space-y-4">

            {/* Review-style rating */}
            <div className="rounded-sm overflow-hidden" style={{ background: '#16202d', border: '1px solid rgba(0,0,0,0.3)' }}>
              <div className="px-5 py-3" style={{ background: '#1e3048', borderBottom: '1px solid rgba(0,0,0,0.3)' }}>
                <span className="text-xs font-semibold" style={{ color: '#c6d4df' }}>Overall Reputation</span>
              </div>
              <div className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <ThumbsUp size={18} style={{ color: '#66c0f4' }} />
                  <span className="text-base font-semibold" style={{ color: '#66c0f4' }}>Overwhelmingly Positive</span>
                </div>
                <p className="text-xs" style={{ color: '#8f98a0' }}>
                  {yearsExperience}+ years of industry experience across {data.projects.length} projects.
                </p>
              </div>
            </div>

            {/* Stats grid */}
            <div className="ab-stats rounded-sm overflow-hidden" style={{ background: '#16202d', border: '1px solid rgba(0,0,0,0.3)' }}>
              <div className="px-5 py-3" style={{ background: '#1e3048', borderBottom: '1px solid rgba(0,0,0,0.3)' }}>
                <span className="text-xs font-semibold" style={{ color: '#c6d4df' }}>Stats</span>
              </div>
              <div className="p-4 grid grid-cols-2 gap-3">
                {liveStats.map((stat, i) => (
                  <div key={i} className="ab-stat p-3 rounded-sm" style={{ background: '#1b2838' }}>
                    <div className="text-2xl font-black mb-0.5" style={{ color: '#e8f4fd' }}>
                      {hasAnimated ? stat.value : counters[i]}<span className="text-base" style={{ color: '#66c0f4' }}>{stat.suffix}</span>
                    </div>
                    <div className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#8f98a0' }}>{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Meta-info panel */}
            <div className="rounded-sm overflow-hidden" style={{ background: '#16202d', border: '1px solid rgba(0,0,0,0.3)' }}>
              <div className="px-5 py-3" style={{ background: '#1e3048', borderBottom: '1px solid rgba(0,0,0,0.3)' }}>
                <span className="text-xs font-semibold" style={{ color: '#c6d4df' }}>Details</span>
              </div>
              <div className="p-4 space-y-2.5 text-sm">
                {[
                  { label: 'Title', value: data.personal.title },
                  { label: 'Experience', value: `${yearsExperience}+ years` },
                  { label: 'Projects', value: `${data.projects.length}` },
                  { label: 'Released', value: `${data.projects.filter((p) => p.published).length}` },
                  { label: 'Status', value: data.personal.openToWork ? 'Open to Work' : 'Not Available' },
                ].filter((r) => r.value).map((row) => (
                  <div key={row.label} className="flex items-start gap-2">
                    <span className="shrink-0 text-xs font-medium w-20" style={{ color: '#4a6b8a' }}>{row.label}</span>
                    <span style={{ color: row.label === 'Status' && data.personal.openToWork ? '#a4d007' : '#c6d4df' }}>{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
