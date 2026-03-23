import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Mail, MapPin, Phone, Send, Github, Linkedin, Twitter, Youtube, Facebook, ExternalLink, Loader2, CheckCircle, MessageSquare } from 'lucide-react';
import data from '../lib/portfolio';

gsap.registerPlugin(ScrollTrigger);

const Contact = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const socialLinks = data.personal.contacts.links;

  const getSocialIcon = (icon?: string, label?: string) => {
    const normalized = (icon || label || '').toLowerCase();

    if (normalized.includes('github')) return <Github size={22} />;
    if (normalized.includes('linkedin')) return <Linkedin size={22} />;
    if (normalized === 'x' || normalized.includes('twitter')) return <Twitter size={22} />;
    if (normalized.includes('youtube')) return <Youtube size={22} />;
    if (normalized.includes('facebook')) return <Facebook size={22} />;

    return <ExternalLink size={22} />;
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Section label
      gsap.fromTo(
        '.contact-label',
        { x: -30, opacity: 0, letterSpacing: '0.3em' },
        {
          x: 0,
          opacity: 1,
          letterSpacing: '0.2em',
          duration: 0.5,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 70%',
          },
        }
      );

      // Headline
      gsap.fromTo(
        '.contact-headline',
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 70%',
          },
          delay: 0.1,
        }
      );

      // Body
      gsap.fromTo(
        '.contact-body',
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 70%',
          },
          delay: 0.4,
        }
      );

      // Social icons
      gsap.fromTo(
        '.contact-social',
        { opacity: 0, scale: 0 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.4,
          stagger: 0.1,
          ease: 'elastic.out(1, 0.5)',
          scrollTrigger: {
            trigger: '.contact-socials',
            start: 'top 90%',
          },
          delay: 0.5,
        }
      );

      // Form
      gsap.fromTo(
        '.contact-form',
        { opacity: 0, x: 100 },
        {
          opacity: 1,
          x: 0,
          duration: 0.7,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: '.contact-form',
            start: 'top 80%',
          },
          delay: 0.3,
        }
      );

      // Form fields
      gsap.fromTo(
        '.form-field',
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
          stagger: 0.1,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: '.contact-form',
            start: 'top 80%',
          },
          delay: 0.6,
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setIsSubmitted(true);
    setFormState({ name: '', email: '', message: '' });

    // Reset success message after 5 seconds
    setTimeout(() => setIsSubmitted(false), 5000);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormState((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <section
      id="contact"
      ref={sectionRef}
      className="relative py-24 lg:py-32"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-500/5 to-transparent pointer-events-none" />

      <div className="relative w-full px-6 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 max-w-6xl mx-auto">
          {/* Left Column - Info */}
          <div>
            <div className="contact-label inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-4">
              <MessageSquare size={16} className="text-indigo-400" />
              <span className="text-sm text-indigo-300">Get In Touch</span>
            </div>

            <h2
              className="contact-headline text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Let&apos;s Create
              <br />
              <span className="text-gradient">Something Amazing</span>
            </h2>

            <p className="contact-body text-slate-400 text-base lg:text-lg mb-8 leading-relaxed">
              Have a project in mind? Let&apos;s discuss how we can bring your vision
              to life. I&apos;m always open to new opportunities and collaborations.
            </p>

            {/* Contact Info */}
            <div className="space-y-4 mb-8">
              <a
                href={`mailto:${data.personal.email}`}
                className="flex items-center gap-4 p-4 glass-card rounded-xl hover:border-indigo-500/30 transition-all group"
              >
                <div className="p-3 bg-indigo-500/10 rounded-lg group-hover:bg-indigo-500/20 transition-colors">
                  <Mail size={20} className="text-indigo-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">Email</p>
                  <p className="text-white group-hover:text-indigo-400 transition-colors">
                    {data.personal.email}
                  </p>
                </div>
              </a>

              {data.personal.phone && (
                <a
                  href={`tel:${data.personal.phone.replace(/\s+/g, '')}`}
                  className="flex items-center gap-4 p-4 glass-card rounded-xl hover:border-indigo-500/30 transition-all group"
                >
                  <div className="p-3 bg-indigo-500/10 rounded-lg group-hover:bg-indigo-500/20 transition-colors">
                    <Phone size={20} className="text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Phone</p>
                    <p className="text-white group-hover:text-indigo-400 transition-colors">
                      {data.personal.phone}
                    </p>
                  </div>
                </a>
              )}

              <div className="flex items-center gap-4 p-4 glass-card rounded-xl">
                <div className="p-3 bg-violet-500/10 rounded-lg">
                  <MapPin size={20} className="text-violet-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">Location</p>
                  <p className="text-white">{data.personal.location}</p>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div>
              <p className="text-sm text-slate-500 mb-4">Follow me on</p>
              <div className="contact-socials flex flex-wrap gap-3">
                {socialLinks.map((link, index) => (
                  <a
                    key={`${link.url}-${index}`}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="contact-social p-4 glass-card rounded-xl text-slate-400 hover:text-white hover:bg-indigo-500/20 hover:border-indigo-500/30 transition-all hover:scale-110"
                    aria-label={link.label || 'Social Link'}
                    title={link.label || link.url}
                  >
                    {getSocialIcon(link.icon, link.label)}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Form */}
          <div className="contact-form p-8 glass-card rounded-2xl">
            <h3
              className="text-2xl font-bold text-white mb-6"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Send a Message
            </h3>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="form-field">
                <label htmlFor="name" className="block text-sm text-slate-400 mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formState.name}
                  onChange={handleChange}
                  required
                  className="form-input"
                  placeholder="John Doe"
                />
              </div>

              <div className="form-field">
                <label htmlFor="email" className="block text-sm text-slate-400 mb-2">
                  Your Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formState.email}
                  onChange={handleChange}
                  required
                  className="form-input"
                  placeholder="john@example.com"
                />
              </div>

              <div className="form-field">
                <label htmlFor="message" className="block text-sm text-slate-400 mb-2">
                  Your Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formState.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="form-input resize-none"
                  placeholder="Tell me about your project..."
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || isSubmitted}
                className={`w-full py-4 px-6 rounded-xl font-medium flex items-center justify-center gap-2 transition-all ${
                  isSubmitted
                    ? 'bg-emerald-500 text-white'
                    : 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:from-indigo-500 hover:to-violet-500'
                } disabled:opacity-70 glow-indigo`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Sending...
                  </>
                ) : isSubmitted ? (
                  <>
                    <CheckCircle size={20} />
                    Message Sent!
                  </>
                ) : (
                  <>
                    <Send size={20} />
                    Send Message
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
