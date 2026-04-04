import { useTheme } from '../lib/theme';
import { Sun, Moon } from 'lucide-react';

export const ThemeToggle = () => {
  const { theme, toggle } = useTheme();
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
      title={theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
      className="p-2 rounded-full border border-sky-200 text-slate-700 bg-white/95 hover:bg-white dark:border-cyan-400/30 dark:text-slate-100 dark:bg-neutral-900/90 dark:hover:bg-neutral-800 transition-colors"
    >
      {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
    </button>
  );
};
