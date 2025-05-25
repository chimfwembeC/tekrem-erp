import React, { createContext, useContext, useEffect, useState } from 'react';
import useTypedPage from '@/Hooks/useTypedPage';
import { Theme, getTheme, setTheme as setSystemTheme, themes, initializeTheme } from '@/lib/themes';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/Components/ui/button';

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

interface ThemeProviderState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  themes: typeof themes;
}

const initialState: ThemeProviderState = {
  theme: 'system',
  setTheme: () => null,
  themes,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'tekrem-ui-theme',
  ...props
}: ThemeProviderProps) {
  // Try to use Inertia page context, but don't fail if it's not available
  let settings = {};
  try {
    const page = useTypedPage();
    settings = page.props.settings || {};
  } catch (error) {
    // If useTypedPage fails, we'll just use the default theme
    console.log('ThemeProvider: Using default theme settings (not in Inertia context)');
  }

  // Get theme from settings or localStorage or default
  const [theme, setThemeState] = useState<Theme>(
    () => {
      try {
        // First check if settings has dark_mode
        if (settings &&
            'dark_mode' in settings &&
            settings.dark_mode &&
            ['light', 'dark', 'system'].includes(settings.dark_mode)) {
          return settings.dark_mode as Theme;
        }
      } catch (error) {
        // Ignore errors when accessing settings
      }

      return getTheme() || defaultTheme;
    }
  );

  // Initialize theme system
  useEffect(() => {
    return initializeTheme();
  }, []);

  // Apply theme changes
  useEffect(() => {
    setSystemTheme(theme);
  }, [theme]);

  // Theme setter function
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    setSystemTheme(newTheme);
  };

  const value = {
    theme,
    setTheme,
    themes,
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error('useTheme must be used within a ThemeProvider');

  return context;
};

// ThemeToggle component for easy theme switching

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {theme === 'dark' ? (
        <Sun className="h-5 w-5 text-yellow-500" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}

// ThemeSelect component for selecting from all available themes
export function ThemeSelect() {
  const { theme, setTheme, themes } = useTheme();

  return (
    <div className="relative inline-block w-full">
      <div className="flex flex-col space-y-2">
        {themes.map((t) => (
          <button
            key={t.name}
            onClick={() => setTheme(t.name as Theme)}
            className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
              theme === t.name
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100'
                : 'hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <div
              className="w-5 h-5 rounded-full border border-gray-300 dark:border-gray-600 flex-shrink-0"
              style={{
                backgroundColor: t.color,
                boxShadow: t.name === 'system' ? 'inset 0 0 0 1px #000' : undefined
              }}
            />
            <span className="text-sm font-medium">{t.label}</span>
            {theme === t.name && (
              <svg className="w-4 h-4 ml-auto text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
