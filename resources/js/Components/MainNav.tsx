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
          <Link href={route('home')}>
            <NavigationMenuLink 
              className={cn(
                navigationMenuTriggerStyle(),
                isActive(route('home'), true) ? 'bg-accent text-accent-foreground font-medium' : ''
              )}
            >
              Home
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
        
        <NavigationMenuItem>
          <Link href={route('about')}>
            <NavigationMenuLink 
              className={cn(
                navigationMenuTriggerStyle(),
                isActive(route('about')) ? 'bg-accent text-accent-foreground font-medium' : ''
              )}
            >
              About
            </NavigationMenuLink>
          </Link>
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
              <ListItem href="#" title="Web Development">
                Custom websites and web applications
              </ListItem>
              <ListItem href="#" title="Mobile Apps">
                Native and cross-platform mobile solutions
              </ListItem>
              <ListItem href="#" title="AI Solutions">
                Intelligent automation and data analysis
              </ListItem>
              <ListItem href="#" title="Cloud Services">
                Scalable and secure cloud infrastructure
              </ListItem>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        
        <NavigationMenuItem>
          <Link href={route('portfolio')}>
            <NavigationMenuLink 
              className={cn(
                navigationMenuTriggerStyle(),
                isActive(route('portfolio')) ? 'bg-accent text-accent-foreground font-medium' : ''
              )}
            >
              Portfolio
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
        
        <NavigationMenuItem>
          <Link href={route('contact')}>
            <NavigationMenuLink 
              className={cn(
                navigationMenuTriggerStyle(),
                isActive(route('contact')) ? 'bg-accent text-accent-foreground font-medium' : ''
              )}
            >
              Contact
            </NavigationMenuLink>
          </Link>
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
