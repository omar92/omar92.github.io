import { createContext, useState, useContext, useEffect, type ReactNode } from 'react';

type ThemeMode = 'light' | 'dark' | 'steam';

const THEME_ORDER: ThemeMode[] = ['light', 'dark', 'steam'];

const ThemeContext = createContext<{ theme: ThemeMode; toggle: () => void } | null>(null);

const resolveInitialTheme = (): ThemeMode => {
  if (typeof window === 'undefined') {
    return 'light';
  }

  const stored = window.localStorage.getItem('theme');
  if (stored === 'light' || stored === 'dark' || stored === 'steam') {
    return stored;
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const applyThemeToDom = (theme: ThemeMode) => {
  const root = document.documentElement;
  root.classList.toggle('dark', theme === 'dark' || theme === 'steam');
  root.classList.toggle('theme-steam', theme === 'steam');
  root.setAttribute('data-theme', theme);
  root.style.colorScheme = theme === 'light' ? 'light' : 'dark';
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<ThemeMode>(resolveInitialTheme);

  useEffect(() => {
    applyThemeToDom(theme);
    window.localStorage.setItem('theme', theme);
  }, [theme]);

  const toggle = () => {
    setTheme((prev) => {
      const index = THEME_ORDER.indexOf(prev);
      return THEME_ORDER[(index + 1) % THEME_ORDER.length];
    });
  };

  return <ThemeContext.Provider value={{ theme, toggle }}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};
