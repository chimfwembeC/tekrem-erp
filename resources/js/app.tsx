import './bootstrap';
import '../css/app.css';
import './i18n'; // Import i18n configuration

import React from 'react';
import { createRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/react';
import { RouteContext } from '@/Hooks/useRoute';
import { ThemeProvider } from '@/Components/ThemeProvider';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { initializeTheme } from '@/lib/themes';

// Initialize theme as early as possible to prevent flash of wrong theme
initializeTheme();

const appName =
  window.document.getElementsByTagName('title')[0]?.innerText || 'Laravel';

createInertiaApp({
  title: title => `${title} - ${appName}`,
  progress: {
    color: '#4B5563',
  },
  resolve: name => {
    const pages = import.meta.glob('./Pages/**/*.tsx');
    const jsxPages = import.meta.glob('./Pages/**/*.jsx');

    // Try to resolve .tsx first, then .jsx
    if (pages[`./Pages/${name}.tsx`]) {
      return resolvePageComponent(`./Pages/${name}.tsx`, pages);
    }

    return resolvePageComponent(`./Pages/${name}.jsx`, jsxPages);
  },
  setup({ el, App, props }) {
    const root = createRoot(el);
    return root.render(
      <RouteContext.Provider value={(window as any).route}>
        {/* ThemeProvider is applied inside the App component to ensure it has access to Inertia context */}
        <App {...props} />
      </RouteContext.Provider>,
    );
  },
});
