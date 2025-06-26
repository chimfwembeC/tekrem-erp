import React from 'react';
import { Link } from '@inertiajs/react';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/Components/ui/navigation-menu';
import { cn } from '@/lib/utils';
import useRoute from '@/Hooks/useRoute';
import useActiveRoute from '@/Hooks/useActiveRoute';
import { ThemeToggle } from '@/Components/ThemeProvider';
import useTypedPage from '@/Hooks/useTypedPage';

interface MainNavProps {
  settings: Record<string, any>;
}

export default function MainNav({ settings }: MainNavProps) {
  const route = useRoute();
  const { isActive } = useActiveRoute();
  const page = useTypedPage();

  return (
    <NavigationMenu className="hidden md:flex">
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <Link
              href={route('home')}
              className={cn(
                navigationMenuTriggerStyle(),
                isActive(route('home'), true) ? 'bg-accent text-accent-foreground font-medium' : ''
              )}
            >
              Home
            </Link>
          </NavigationMenuLink>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <Link
              href={route('about')}
              className={cn(
                navigationMenuTriggerStyle(),
                isActive(route('about')) ? 'bg-accent text-accent-foreground font-medium' : ''
              )}
            >
              About
            </Link>
          </NavigationMenuLink>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuTrigger
            className={cn(
              isActive(route('services')) ? 'bg-accent text-accent-foreground font-medium' : ''
            )}
          >
            Services
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
              <li className="row-span-3">
                <NavigationMenuLink asChild>
                  <a
                    className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-primary/50 to-primary p-6 no-underline outline-none focus:shadow-md"
                    href={route('services')}
                  >
                    <div className="mt-4 mb-2 text-lg font-medium text-white">
                      Our Services
                    </div>
                    <p className="text-sm leading-tight text-white/90">
                      Comprehensive technology solutions for modern businesses
                    </p>
                  </a>
                </NavigationMenuLink>
              </li>
              <ListItem href={route('services.web-development')} title="Web Development">
                Custom websites and web applications
              </ListItem>
              <ListItem href={route('services.mobile-apps')} title="Mobile Apps">
                Native and cross-platform mobile solutions
              </ListItem>
              <ListItem href={route('services.ai-solutions')} title="AI Solutions">
                Intelligent automation and data analysis
              </ListItem>
              <ListItem href={route('services.cloud-services')} title="Cloud Services">
                Scalable and secure cloud infrastructure
              </ListItem>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuTrigger
            className={cn(
              isActive('/guest/portfolio') ? 'bg-accent text-accent-foreground font-medium' : ''
            )}
          >
            Portfolio
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
              <li className="row-span-3">
                <NavigationMenuLink asChild>
                  <a
                    className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-purple-500/50 to-purple-600 p-6 no-underline outline-none focus:shadow-md"
                    href="/guest/portfolio"
                  >
                    <div className="mt-4 mb-2 text-lg font-medium text-white">
                      Our Portfolio
                    </div>
                    <p className="text-sm leading-tight text-white/90">
                      Explore our successful projects and case studies
                    </p>
                  </a>
                </NavigationMenuLink>
              </li>
              <ListItem href="/guest/portfolio" title="View Projects">
                Browse our completed projects and case studies
              </ListItem>
              <ListItem href="/guest/testimonials" title="Testimonials">
                Read what our clients say about us
              </ListItem>
              <ListItem href="/guest/portfolio/services" title="Service Examples">
                See examples of our different service offerings
              </ListItem>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuTrigger
            className={cn(
              isActive('/guest/support') || isActive('/guest/inquiry') || isActive('/guest/quote') || isActive('/guest/project') ? 'bg-accent text-accent-foreground font-medium' : ''
            )}
          >
            Get Started
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
              <li className="row-span-3">
                <NavigationMenuLink asChild>
                  <a
                    className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-green-500/50 to-green-600 p-6 no-underline outline-none focus:shadow-md"
                    href="/guest/inquiry"
                  >
                    <div className="mt-4 mb-2 text-lg font-medium text-white">
                      Get Started
                    </div>
                    <p className="text-sm leading-tight text-white/90">
                      Contact us for inquiries, quotes, and support
                    </p>
                  </a>
                </NavigationMenuLink>
              </li>
              <ListItem href="/guest/inquiry" title="General Inquiry">
                Ask questions or get more information
              </ListItem>
              <ListItem href="/guest/quote" title="Request Quote">
                Get a detailed quote for your project
              </ListItem>
              <ListItem href="/guest/project" title="Project Consultation">
                Discuss your project requirements
              </ListItem>
              <ListItem href="/guest/support" title="Support Center">
                Access help articles and submit tickets
              </ListItem>
              <ListItem href="/guest/support" title="Support Chat">
               Chat With Supporting Agents & submit tickets
              </ListItem>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <Link
              href={route('contact')}
              className={cn(
                navigationMenuTriggerStyle(),
                isActive(route('contact')) ? 'bg-accent text-accent-foreground font-medium' : ''
              )}
            >
              Contact
            </Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
