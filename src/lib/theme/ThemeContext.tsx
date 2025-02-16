import React from 'react';
import { supabase } from '../supabase';

type ColorScheme = {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
};

type Theme = {
  colors: ColorScheme;
};

type ThemeContextType = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const defaultTheme: Theme = {
  colors: {
    primary: '#4c584c',
    secondary: '#637363',
    accent: '#a3b1a3',
    background: '#f6f7f6',
    text: '#2d312d',
  },
};

const ThemeContext = React.createContext<ThemeContextType>({
  theme: defaultTheme,
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = React.useState<Theme>(defaultTheme);

  React.useEffect(() => {
    loadThemeSettings();
  }, []);

  React.useEffect(() => {
    // Update CSS variables
    Object.entries(theme.colors).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--color-${key}`, value);
    });
  }, [theme]);

  const loadThemeSettings = async () => {
    try {
      const { data: settings } = await supabase
        .from('settings')
        .select('*')
        .eq('key', 'theme_colors')
        .single();

      if (settings?.value) {
        const colors = JSON.parse(settings.value);
        setTheme({ colors });
      }
    } catch (error) {
      console.error('Error loading theme settings:', error);
    }
  };

  const handleSetTheme = React.useCallback((newTheme: Theme) => {
    setTheme(newTheme);
  }, []);

  const value = React.useMemo(
    () => ({
      theme,
      setTheme: handleSetTheme,
    }),
    [theme, handleSetTheme]
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = React.useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}