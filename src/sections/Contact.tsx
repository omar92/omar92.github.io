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
  const isOpenToWork = data.personal.openToWork;
  const availabilityHeading = isOpenToWork ? 'AVAILABLE FOR WORK' : 'NOT CURRENTLY AVAILABLE';
  const availabilityIntro = isOpenToWork
    ? 'Available for contract work, full-time roles, and interesting collaborations. Reach out through any channel.'
    : 'Currently not open for new roles, but you can still reach out for select collaborations or important inquiries.';

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

  return (
    <section id="contact" ref={sectionRef} className="relative py-12 reveal-section" style={{ background: '#1b2838', borderTop: '1px solid rgba(0,0,0,0.3)' }}>
      <div className="w-full max-w-[1400px] mx-auto px-4 lg:px-8">
        <div className="ct-header mb-6">
          <div className="steam-section-header">
            <span className="text-sm font-semibold" style={{ color: '#c6d4df' }}>Contact</span>
          </div>
        </div>

        <div className="ct-content grid lg:grid-cols-2 gap-6 lg:gap-10">
          {/* Info panel */}
          <div className="ct-info space-y-4">
            <div className="rounded-sm overflow-hidden" style={{ background: '#16202d', border: '1px solid rgba(0,0,0,0.3)' }}>
              <div className="px-4 py-3 flex items-center gap-2" style={{ background: '#2a475e', borderBottom: '1px solid rgba(0,0,0,0.3)' }}>
                <span className={`w-2 h-2 rounded-full ${isOpenToWork ? 'bg-green-400 animate-pulse' : 'bg-amber-400'}`} />
                <span className="text-xs font-semibold" style={{ color: isOpenToWork ? '#a4d007' : '#f59e0b' }}>{availabilityHeading}</span>
              </div>
              <div className="p-4 space-y-4">
                <p className="text-sm leading-relaxed" style={{ color: '#c6d4df' }}>{availabilityIntro}</p>
                <div className="space-y-3">
                  <a href={`mailto:${data.personal.contacts.email}`} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-sm flex items-center justify-center shrink-0" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <Mail size={14} style={{ color: '#66c0f4' }} />
                    </div>
                    <span className="text-sm" style={{ color: '#8f98a0' }}>{data.personal.contacts.email}</span>
                  </a>
                  {data.personal.contacts.phone && (
                    <a href={`tel:${data.personal.contacts.phone}`} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-sm flex items-center justify-center shrink-0" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <Phone size={14} style={{ color: '#66c0f4' }} />
                      </div>
                      <span className="text-sm" style={{ color: '#8f98a0' }}>{data.personal.contacts.phone}</span>
                    </a>
                  )}
                  {data.personal.location && (
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-sm flex items-center justify-center shrink-0" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <MapPin size={14} style={{ color: '#8f98a0' }} />
                      </div>
                      <span className="text-sm" style={{ color: '#8f98a0' }}>{data.personal.location}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-sm overflow-hidden" style={{ background: '#16202d', border: '1px solid rgba(0,0,0,0.3)' }}>
              <div className="px-4 py-3" style={{ background: '#2a475e', borderBottom: '1px solid rgba(0,0,0,0.3)' }}>
                <span className="text-xs font-semibold" style={{ color: '#c6d4df' }}>Social Links</span>
              </div>
              <div className="p-4 flex flex-wrap gap-2">
                {data.personal.contacts.links.map((link) => {
                  const Icon = getSocialIcon(link);
                  if (!Icon) return null;
                  return (
                    <a
                      key={link.url}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-2 rounded-sm text-xs font-medium transition-all"
                      style={{ background: 'rgba(255,255,255,0.07)', color: '#8f98a0', border: '1px solid rgba(255,255,255,0.08)' }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLAnchorElement).style.color = '#c6d4df';
                        (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.12)';
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLAnchorElement).style.color = '#8f98a0';
                        (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.07)';
                      }}
                    >
                      <Icon size={13} />
                      {link.label || link.type || ''}
                    </a>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Message form */}
          <div className="ct-form rounded-sm overflow-hidden" style={{ border: '1px solid rgba(0,0,0,0.3)' }}>
            <div className="px-4 py-3" style={{ background: '#2a475e', borderBottom: '1px solid rgba(0,0,0,0.3)' }}>
              <span className="text-xs font-semibold" style={{ color: '#c6d4df' }}>Send Message</span>
            </div>
            {status === 'success' ? (
              <div className="p-10 flex flex-col items-center justify-center gap-4" style={{ background: '#16202d' }}>
                <CheckCircle size={36} style={{ color: '#a4d007' }} />
                <div className="font-semibold" style={{ color: '#e8f4fd' }}>Message Sent</div>
                <p className="text-sm text-center" style={{ color: '#8f98a0' }}>Your email client should have opened. Expect a reply within 24h.</p>
                <button onClick={() => setStatus('idle')} className="btn-ghost text-sm mt-2">Send Another</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-5 space-y-4" style={{ background: '#16202d' }}>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: '#8f98a0' }}>Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="Your name"
                      value={formState.name}
                      onChange={(e) => setFormState((s) => ({ ...s, name: e.target.value }))}
                      className="steam-input w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: '#8f98a0' }}>Email *</label>
                    <input
                      type="email"
                      required
                      placeholder="you@example.com"
                      value={formState.email}
                      onChange={(e) => setFormState((s) => ({ ...s, email: e.target.value }))}
                      className="steam-input w-full"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: '#8f98a0' }}>Subject</label>
                  <input
                    type="text"
                    placeholder="What's this about?"
                    value={formState.subject}
                    onChange={(e) => setFormState((s) => ({ ...s, subject: e.target.value }))}
                    className="steam-input w-full"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: '#8f98a0' }}>Message *</label>
                  <textarea
                    required
                    rows={8}
                    placeholder="Type your message..."
                    value={formState.message}
                    onChange={(e) => setFormState((s) => ({ ...s, message: e.target.value }))}
                    className="steam-input w-full resize-none"
                  />
                </div>
                <button type="submit" disabled={status === 'loading'} className="w-full flex items-center justify-center gap-2 btn-primary">
                  {status === 'loading' ? <><Loader2 size={14} className="animate-spin" />Sending...</> : <><Send size={14} />{isOpenToWork ? 'Send Message' : 'Send Inquiry'}</>}
                </button>
                {status === 'error' && <p className="text-xs text-rose-400 text-center">Unable to open mail app. Please email directly.</p>}
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;


