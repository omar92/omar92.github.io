import { useTheme } from '../lib/theme';
import { Sun, Moon, Gamepad2 } from 'lucide-react';

export const ThemeToggle = () => {
  const { theme, toggle } = useTheme();
  const nextTheme = theme === 'light' ? 'dark' : theme === 'dark' ? 'steam' : 'light';

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Switch to ${nextTheme} theme`}
      title={`Current: ${theme}. Click for ${nextTheme}.`}
      className="p-2 rounded-full border border-sky-200 text-slate-700 bg-white/95 hover:bg-white dark:border-cyan-400/30 dark:text-slate-100 dark:bg-neutral-900/90 dark:hover:bg-neutral-800 transition-colors"
    >
      {theme === 'light' && <Moon size={18} />}
      {theme === 'dark' && <Gamepad2 size={18} />}
      {theme === 'steam' && <Sun size={18} />}
    </button>
  );
};
