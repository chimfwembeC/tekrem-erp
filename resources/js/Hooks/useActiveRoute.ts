import { usePage } from '@inertiajs/react';
import { InertiaSharedProps } from '@/types';

export default function useActiveRoute() {
  const page = usePage<InertiaSharedProps>();
  const currentRoute = page.url;

  /**
   * Check if the given route is active
   * @param route The route to check
   * @param exact If true, only return true if the route exactly matches
   */
  const isActive = (route: string, exact: boolean = false): boolean => {
    if (exact) {
      return currentRoute === route;
    }
    
    // Handle home route specially
    if (route === '/' && currentRoute === '/') {
      return true;
    }
    
    // For other routes, check if the current URL starts with the route
    // but make sure we're not matching partial segments
    if (route !== '/' && currentRoute.startsWith(route)) {
      // Check if the next character after the route is a slash or the end of the string
      const nextChar = currentRoute.charAt(route.length);
      return nextChar === '' || nextChar === '/';
    }
    
    return false;
  };

  return { isActive, currentRoute };
}
