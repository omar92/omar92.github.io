import { useEffect, useRef, useState, type FormEvent } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Mail, Phone, MapPin, Send, Github, Linkedin, Twitter, Youtube, Facebook, Loader2, CheckCircle } from 'lucide-react';
import data from '../lib/portfolio';

gsap.registerPlugin(ScrollTrigger);

const getSocialIcon = (link: typeof data.personal.contacts.links[0]): typeof Github | null => {
  const type = (link.type || link.icon || link.label).toLowerCase();
  if (type.includes('github')) return Github;
  if (type.includes('linkedin')) return Linkedin;
  if (type.includes('twitter') || type === 'x') return Twitter;
  if (type.includes('youtube')) return Youtube;
  if (type.includes('facebook')) return Facebook;
  return null;
};

const Contact = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [formState, setFormState] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const buildMailtoUrl = () => {
    const subject = formState.subject.trim() || `Message from ${formState.name.trim()}`;
    const body = [
      `Name: ${formState.name.trim()}`,
      `Email: ${formState.email.trim()}`,
      '',
      formState.message.trim(),
    ].join('\n');

    return `mailto:${data.personal.contacts.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.ct-header', { opacity: 0, y: 40 }, {
        opacity: 1, y: 0, duration: 0.8, ease: 'expo.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 70%' },
      });
      gsap.fromTo('.ct-info', { opacity: 0, x: -30 }, {
        opacity: 1, x: 0, duration: 0.7, ease: 'expo.out',
        scrollTrigger: { trigger: '.ct-content', start: 'top 75%' },
      });
      gsap.fromTo('.ct-form', { opacity: 0, x: 30 }, {
        opacity: 1, x: 0, duration: 0.7, ease: 'expo.out',
        scrollTrigger: { trigger: '.ct-content', start: 'top 75%' },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const mailtoUrl = buildMailtoUrl();
      window.location.href = mailtoUrl;

      setStatus('success');
      setFormState({ name: '', email: '', subject: '', message: '' });
    } catch {
      setStatus('error');
    }
  };

  const inputClass = 'w-full bg-slate-900/50 border border-slate-700 focus:border-cyan-400/50 focus:outline-none px-4 py-3 mono text-sm text-slate-200 placeholder-slate-600 transition-colors';

  return (
    <section id="contact" ref={sectionRef} className="relative py-28 lg:py-36 reveal-section">
      <div className="divider-cyan mb-24 mx-6 lg:mx-12" />
      <div className="w-full px-6 lg:px-12">

        <div className="ct-header mb-16">
          <div className="section-label mb-3">04 // CONTACT</div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white">
            INITIATE <span className="text-gradient-cyan">CONTACT</span>
          </h2>
        </div>

        <div className="ct-content grid lg:grid-cols-2 gap-16 lg:gap-24">
          {/* Info panel */}
          <div className="ct-info flex flex-col gap-10 lg:h-full lg:justify-between">
            <div className="space-y-10">
              <p className="text-lg text-slate-300 leading-relaxed">
                Available for contract work, full-time roles, and interesting collaborations. Reach out through any channel.
              </p>

              <div className="space-y-5">
                <a href={`mailto:${data.personal.contacts.email}`} className="flex items-center gap-4 group">
                  <div className="w-10 h-10 flex items-center justify-center border border-slate-700 group-hover:border-cyan-400/50 group-hover:bg-cyan-400/5 transition-all">
                    <Mail size={16} className="text-slate-600 group-hover:text-cyan-400 transition-colors" />
                  </div>
                  <span className="mono text-sm text-slate-400 group-hover:text-cyan-400 transition-colors">{data.personal.contacts.email}</span>
                </a>
                {data.personal.contacts.phone && (
                  <a href={`tel:${data.personal.contacts.phone}`} className="flex items-center gap-4 group">
                    <div className="w-10 h-10 flex items-center justify-center border border-slate-700 group-hover:border-cyan-400/50 group-hover:bg-cyan-400/5 transition-all">
                      <Phone size={16} className="text-slate-600 group-hover:text-cyan-400 transition-colors" />
                    </div>
                    <span className="mono text-sm text-slate-400 group-hover:text-cyan-400 transition-colors">{data.personal.contacts.phone}</span>
                  </a>
                )}
                {data.personal.location && (
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 flex items-center justify-center border border-slate-700">
                      <MapPin size={16} className="text-slate-600" />
                    </div>
                    <span className="mono text-sm text-slate-400">{data.personal.location}</span>
                  </div>
                )}
              </div>

              <div>
                <div className="section-label mb-5">SOCIAL LINKS</div>
                <div className="flex gap-3">
                  {data.personal.contacts.links.map((link) => {
                    const Icon = getSocialIcon(link);
                    if (!Icon) return null;
                    return (
                      <a
                        key={link.url}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 flex items-center justify-center border border-slate-700 hover:border-cyan-400/50 hover:bg-cyan-400/5 transition-all"
                      >
                        <Icon size={15} className="text-slate-400 hover:text-cyan-400 transition-colors" />
                      </a>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="game-card p-6 clip-tl">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="mono text-xs text-green-400">AVAILABLE FOR WORK</span>
              </div>
              <p className="text-sm text-slate-400">Open to new opportunities -- game industry, simulation, or system-level engineering.</p>
            </div>
          </div>

          {/* Terminal form */}
          <div className="ct-form">
            {/* Window chrome */}
            <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 border border-slate-700 border-b-0">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
              <span className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
              <span className="mono text-xs text-slate-500 ml-3">SEND_MESSAGE.exe</span>
            </div>

            {status === 'success' ? (
              <div className="border border-slate-700 bg-slate-900/50 p-12 flex flex-col items-center justify-center gap-4">
                <CheckCircle size={40} className="text-cyan-400" />
                <div className="text-white font-bold text-lg">MESSAGE TRANSMITTED</div>
                <p className="mono text-sm text-slate-400 text-center">Packet received. Expect a response within 24h.</p>
                <button onClick={() => setStatus('idle')} className="btn-ghost text-sm mt-2">SEND ANOTHER</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="border border-slate-700 bg-slate-900/30 p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="section-label block mb-1.5">NAME *</label>
                    <input
                      type="text"
                      required
                      placeholder="Your name"
                      value={formState.name}
                      onChange={(e) => setFormState((s) => ({ ...s, name: e.target.value }))}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="section-label block mb-1.5">EMAIL *</label>
                    <input
                      type="email"
                      required
                      placeholder="you@example.com"
                      value={formState.email}
                      onChange={(e) => setFormState((s) => ({ ...s, email: e.target.value }))}
                      className={inputClass}
                    />
                  </div>
                </div>
                <div>
                  <label className="section-label block mb-1.5">SUBJECT</label>
                  <input
                    type="text"
                    placeholder="What's this about?"
                    value={formState.subject}
                    onChange={(e) => setFormState((s) => ({ ...s, subject: e.target.value }))}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="section-label block mb-1.5">MESSAGE *</label>
                  <textarea
                    required
                    rows={9}
                    placeholder="Type your message..."
                    value={formState.message}
                    onChange={(e) => setFormState((s) => ({ ...s, message: e.target.value }))}
                    className={`${inputClass} resize-none`}
                  />
                </div>
                <button type="submit" disabled={status === 'loading'} className="btn-primary w-full flex items-center justify-center gap-2">
                  {status === 'loading' ? <><Loader2 size={14} className="animate-spin" />TRANSMITTING...</> : <><Send size={14} />SEND MESSAGE</>}
                </button>
                {status === 'error' && (
                  <p className="mono text-xs text-rose-400 text-center">Unable to open your mail app. Please email me directly.</p>
                )}
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;


