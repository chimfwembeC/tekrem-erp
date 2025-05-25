import React from 'react';
import { Link } from '@inertiajs/react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/Components/ui/sheet';
import { Menu, X } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import useRoute from '@/Hooks/useRoute';
import useActiveRoute from '@/Hooks/useActiveRoute';
import { ThemeSelect, ThemeToggle } from '@/Components/ThemeProvider';
import useTypedPage from '@/Hooks/useTypedPage';
import ApplicationMark from '@/Components/ApplicationMark';

interface MobileNavProps {
  settings: Record<string, any>;
}

export default function MobileNav({ settings }: MobileNavProps) {
  const route = useRoute();
  const { isActive } = useActiveRoute();
  const page = useTypedPage();
  
  const navItems = [
    { href: route('home'), label: 'Home' },
    { href: route('about'), label: 'About' },
    { href: route('services'), label: 'Services' },
    { href: route('portfolio'), label: 'Portfolio' },
    { href: route('contact'), label: 'Contact' },
  ];

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] sm:w-[400px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ApplicationMark className="h-8 w-8" />
            <span>{settings.site_name || 'TekRem ERP'}</span>
          </SheetTitle>
        </SheetHeader>
        
        <div className="mt-8 flex flex-col gap-4">
          <nav className="flex flex-col gap-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center px-4 py-2 text-base font-medium rounded-md transition-colors ${
                  isActive(item.href)
                    ? 'bg-primary/10 text-primary font-semibold'
                    : 'text-foreground/70 hover:text-foreground hover:bg-accent'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          
          <div className="border-t border-border pt-4 mt-2">
            <div className="px-4 py-2">
              <h3 className="text-sm font-medium mb-2">Theme</h3>
              <div className="flex items-center justify-between">
                <span className="text-sm">Toggle theme:</span>
                <ThemeToggle />
              </div>
              <div className="mt-4">
                <ThemeSelect />
              </div>
            </div>
          </div>
          
          <div className="border-t border-border pt-4 mt-2">
            <div className="px-4 py-2">
              {page.props.auth.user ? (
                <Link
                  href={route('dashboard')}
                  className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-primary hover:bg-primary/90"
                >
                  Dashboard
                </Link>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link
                    href={route('login')}
                    className="flex items-center px-4 py-2 text-base font-medium rounded-md text-foreground/70 hover:text-foreground hover:bg-accent"
                  >
                    Login
                  </Link>
                  <Link
                    href={route('register')}
                    className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-primary hover:bg-primary/90"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
