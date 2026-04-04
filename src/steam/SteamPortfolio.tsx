import './steam-overrides.css';
import AnimatedBackgroundSteam from './AnimatedBackgroundSteam';
import NavigationSteam from './sections/NavigationSteam';
import HeroSteam from './sections/HeroSteam';
import AboutSteam from './sections/AboutSteam';
import ProjectsSteam from './sections/ProjectsSteam';
import ExperienceSteam from './sections/ExperienceSteam';
import ContactSteam from './sections/ContactSteam';
import FooterSteam from './sections/FooterSteam';

const SteamPortfolio = () => {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <AnimatedBackgroundSteam />
      <div className="relative z-10">
        <NavigationSteam />
        <main>
          <HeroSteam />
          <AboutSteam />
          <ProjectsSteam />
          <ExperienceSteam />
          <ContactSteam />
        </main>
        <FooterSteam />
      </div>
    </div>
  );
};

export default SteamPortfolio;
