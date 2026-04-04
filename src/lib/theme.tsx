import { createContext, useContext, useEffect, type ReactNode } from 'react';

const ThemeContext = createContext<{ theme: 'dark' } | null>(null);

const THEME = 'dark' as const;

const applyThemeToDom = () => {
  const root = document.documentElement;
  root.classList.add('dark');
  root.setAttribute('data-theme', THEME);
  root.style.colorScheme = THEME;
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  useEffect(() => {
    applyThemeToDom();
  }, []);

  return <ThemeContext.Provider value={{ theme: THEME }}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};
