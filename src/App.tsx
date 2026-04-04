import { useEffect, useState } from 'react';
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
import SteamPortfolio from './steam/SteamPortfolio';

gsap.registerPlugin(ScrollTrigger);

type DesignMode = 'main' | 'steam';

const DESIGN_STORAGE_KEY = 'portfolio-design-mode';

const getInitialDesignMode = (): DesignMode => {
  const saved = window.localStorage.getItem(DESIGN_STORAGE_KEY);
  return saved === 'steam' ? 'steam' : 'main';
};

function App() {
  const [designMode, setDesignMode] = useState<DesignMode>(getInitialDesignMode);
  const normalizedPath = window.location.pathname.replace(/\/+$/, '');
  const isEditorRoute = normalizedPath.endsWith('/editor');

  useEffect(() => {
    window.localStorage.setItem(DESIGN_STORAGE_KEY, designMode);
    document.body.setAttribute('data-design', designMode);
  }, [designMode]);

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

  useEffect(() => {
    if (isEditorRoute) {
      return;
    }

    const cards = Array.from(document.querySelectorAll<HTMLElement>('.pokemon-card.pokemon-card-main'));

    const handleMouseMove = (event: Event) => {
      const card = event.currentTarget as HTMLElement;
      const mouseEvent = event as MouseEvent;
      const rect = card.getBoundingClientRect();
      const x = mouseEvent.clientX - rect.left;
      const y = mouseEvent.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const normalizedX = (x - centerX) / centerX;
      const normalizedY = (y - centerY) / centerY;

      const rotateDivisor = 22;
      const translateY = -3;
      const scale = 1.008;
      const shineDistance = 12;
      const shineAngleRange = 10;
      const shineOpacity = 0.14;

      const rotateX = (y - centerY) / rotateDivisor;
      const rotateY = (centerX - x) / rotateDivisor;

      card.style.transform = `perspective(1000px) translateY(${translateY}px) scale(${scale}) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      card.style.setProperty('--shine-x', `${normalizedX * shineDistance}px`);
      card.style.setProperty('--shine-y', `${normalizedY * shineDistance}px`);
      card.style.setProperty('--shine-angle', `${-45 + normalizedX * shineAngleRange}deg`);
      card.style.setProperty('--shine-opacity', `${shineOpacity}`);
    };

    const handleMouseLeave = (event: Event) => {
      const card = event.currentTarget as HTMLElement;
      card.style.transform = '';
      card.style.setProperty('--shine-x', '0px');
      card.style.setProperty('--shine-y', '0px');
      card.style.setProperty('--shine-angle', '-45deg');
      card.style.setProperty('--shine-opacity', '0');
    };

    cards.forEach((card) => {
      card.addEventListener('mousemove', handleMouseMove);
      card.addEventListener('mouseleave', handleMouseLeave);
    });

    return () => {
      cards.forEach((card) => {
        card.removeEventListener('mousemove', handleMouseMove);
        card.removeEventListener('mouseleave', handleMouseLeave);
      });
    };
  }, [isEditorRoute]);

  if (isEditorRoute) {
    return <PortfolioEditor />;
  }

  const showSteam = designMode === 'steam';

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {showSteam ? (
        <SteamPortfolio
          mode={designMode}
          onToggleDesign={() => setDesignMode((prev) => (prev === 'main' ? 'steam' : 'main'))}
        />
      ) : (
        <>
          {/* Animated 3D Background */}
          <AnimatedBackground />

          {/* Content */}
          <div className="relative z-10">
            <Navigation
              mode={designMode}
              onToggleDesign={() => setDesignMode((prev) => (prev === 'main' ? 'steam' : 'main'))}
            />
            <main>
              <Hero />
              <About />
              <Projects />
              <Experience />
              <Contact />
            </main>
            <Footer />
          </div>
        </>
      )}
    </div>
  );
}

export default App;
