import React, { PropsWithChildren } from 'react';
import { Link, Head } from '@inertiajs/react';
import useRoute from '@/Hooks/useRoute';
import useTypedPage from '@/Hooks/useTypedPage';
import ApplicationMark from '@/Components/ApplicationMark';
import AppProvider from '@/Providers/AppProvider';
import { useTheme, ThemeToggle } from '@/Components/ThemeProvider';
import  { Button } from '@/Components/ui/button';
import MobileNav from '@/Components/MobileNav';
import MainNav from '@/Components/MainNav';
import GuestChatWidget from '@/Components/GuestChat/GuestChatWidget';

interface Props {
  title: string;
  showHeader?: boolean;
}

interface Setting {
  site_name: string,
  font_family: string,
}

export default function GuestLayout({
  title,
  showHeader = true,
  children,
}: PropsWithChildren<Props>) {
  const page = useTypedPage();
  const route = useRoute();
  const { theme } = useTheme();

  // Get settings from Inertia shared props
  const settings = page.props.settings || {};

  // console.log(settings);
  return (
    <AppProvider>
      <div className={`min-h-screen bg-background ${settings.font_family || 'font-sans'}`}>
        <Head title={title} />

      {/* Header */}
      {showHeader && (
        <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto flex h-16 items-center">
            <div className="flex justify-between w-full">
              {/* Logo */}
              <div className="flex items-center gap-2">
                <MobileNav settings={settings} />

                <Link href={route('home')} className="flex items-center gap-2">
                  <ApplicationMark className="h-8 w-8" />
                  <span className="font-bold text-xl hidden md:inline-block">
                    {settings.site_name || 'TekRem ERP'}
                  </span>
                </Link>
              </div>

              {/* Desktop Navigation */}
              <MainNav settings={settings} />

              {/* Right side items */}
              <div className="flex items-center gap-4">
                {/* Theme Toggle */}
                <div className="hidden md:flex">
                  <ThemeToggle />
                </div>

                {/* Auth Links */}
                <div className="hidden md:flex items-center gap-2">
                  {page.props.auth.user ? (
                    <Button asChild>
                      <Link href={route('dashboard')}>
                        Dashboard
                      </Link>
                    </Button>
                  ) : (
                    <>
                      <Button variant="ghost" asChild>
                        <Link href={route('login')}>
                          Login
                        </Link>
                      </Button>
                      <Button asChild>
                        <Link href={route('register')}>
                          Register
                        </Link>
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main>{children}</main>

      {/* Footer */}
      <footer className="border-t bg-background">
        <div className="container mx-auto py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground tracking-wider uppercase">About</h3>
              <p className="mt-4 text-base text-foreground/80">
                {settings.company_name || 'Technology Remedies Innovations'} provides innovative technology solutions for businesses in Zambia and beyond.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground tracking-wider uppercase">Services</h3>
              <ul className="mt-4 space-y-4">
                <li><a href="#" className="text-base text-foreground/80 hover:text-foreground">Web Development</a></li>
                <li><a href="#" className="text-base text-foreground/80 hover:text-foreground">Mobile Apps</a></li>
                <li><a href="#" className="text-base text-foreground/80 hover:text-foreground">Desktop Software</a></li>
                <li><a href="#" className="text-base text-foreground/80 hover:text-foreground">AI Solutions</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground tracking-wider uppercase">Contact</h3>
              <ul className="mt-4 space-y-4">
                <li className="text-base text-foreground/80">{settings.company_address || 'Lusaka, Zambia'}</li>
                <li className="text-base text-foreground/80">{settings.company_phone || '+260 976607840'}</li>
                <li className="text-base text-foreground/80">{settings.company_email || 'tekremsolutions@gmail.com'}</li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground tracking-wider uppercase">Legal</h3>
              <ul className="mt-4 space-y-4">
                <li><a href="#" className="text-base text-foreground/80 hover:text-foreground">Privacy Policy</a></li>
                <li><a href="#" className="text-base text-foreground/80 hover:text-foreground">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t pt-8 flex flex-col md:flex-row justify-between">
            <p className="text-base text-muted-foreground">
              &copy; {new Date().getFullYear()} {settings.company_name || 'Technology Remedies Innovations'}. All rights reserved.
            </p>
            <div className="mt-4 md:mt-0 flex space-x-6">
              <a href="#" className="text-muted-foreground hover:text-foreground">
                <span className="sr-only">Facebook</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground">
                <span className="sr-only">Twitter</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground">
                <span className="sr-only">LinkedIn</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Guest Chat Widget */}
      <GuestChatWidget />
      </div>
    </AppProvider>
  );
}
