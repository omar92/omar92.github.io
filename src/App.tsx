import { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Navigation from './sections/Navigation';
import Hero from './sections/Hero';
import About from './sections/About';
import Projects from './sections/Projects';
import Experience from './sections/Experience';
import Contact from './sections/Contact';
import Footer from './sections/Footer';
import AnimatedBackground from './components/AnimatedBackground';
import PortfolioEditor from './pages/PortfolioEditor';

gsap.registerPlugin(ScrollTrigger);

function App() {
  const normalizedPath = window.location.pathname.replace(/\/+$/, '');
  const isEditorRoute = normalizedPath.endsWith('/editor');

  useEffect(() => {
    if (isEditorRoute) {
      return;
    }

    // Initialize scroll-triggered animations
    const ctx = gsap.context(() => {
      // Reveal animations for sections
      gsap.utils.toArray<HTMLElement>('.reveal-section').forEach((section) => {
        gsap.fromTo(
          section,
          { opacity: 0.9, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: 'expo.out',
            scrollTrigger: {
              trigger: section,
              start: 'top 80%',
              toggleActions: 'play none none none',
            },
          }
        );
      });
    });

    return () => ctx.revert();
  }, [isEditorRoute]);

  if (isEditorRoute) {
    return <PortfolioEditor />;
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {/* Animated 3D Background */}
      <AnimatedBackground />
      
      {/* Content */}
      <div className="relative z-10">
        <Navigation />
        <main>
          <Hero />
          <About />
          <Projects />
          <Experience />
          <Contact />
        </main>
        <Footer />
      </div>
    </div>
  );
}

export default App;
