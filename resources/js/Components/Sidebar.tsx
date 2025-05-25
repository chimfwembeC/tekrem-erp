import React from 'react';
import { Link } from '@inertiajs/react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/Components/ui/sheet';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  MessageSquare,
  MessageCircle,
  Menu,
  ChevronDown,
  ChevronRight,
  Settings,
  Cog,
  BarChart3
} from 'lucide-react';
import { Button } from '@/Components/ui/button';
import useRoute from '@/Hooks/useRoute';
import useActiveRoute from '@/Hooks/useActiveRoute';
import usePermissions from '@/Hooks/usePermissions';
import useTranslate from '@/Hooks/useTranslate';
import useTypedPage from '@/Hooks/useTypedPage';
import ApplicationMark from '@/Components/ApplicationMark';
import { cn } from '@/lib/utils';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/Components/ui/collapsible';

interface SidebarProps {
  settings: Record<string, any>;
}

export default function Sidebar({ settings }: SidebarProps) {
  const route = useRoute();
  const { isActive } = useActiveRoute();
  const page = useTypedPage();
  const { t } = useTranslate();
  const { hasAnyRole } = usePermissions();

  // Check if user has access to CRM
  const hasCrmAccess = (): boolean => {
    return hasAnyRole(['admin', 'staff']);
  };

  // Define navigation items
  const navItems = [
    {
      href: route('dashboard'),
      label: t('navigation.dashboard', 'Dashboard'),
      icon: <LayoutDashboard className="h-5 w-5" />,
      active: route().current('dashboard')
    },
  ];

  // CRM navigation items - only visible to admin and staff
  const crmItems = hasCrmAccess() ? [
    {
      href: route('crm.dashboard'),
      label: t('crm.dashboard', 'Dashboard'),
      icon: <LayoutDashboard className="h-5 w-5" />,
      active: route().current('crm.dashboard')
    },
    {
      href: route('crm.clients.index'),
      label: t('crm.clients', 'Clients'),
      icon: <Users className="h-5 w-5" />,
      active: route().current('crm.clients.*')
    },
    {
      href: route('crm.leads.index'),
      label: t('crm.leads', 'Leads'),
      icon: <UserPlus className="h-5 w-5" />,
      active: route().current('crm.leads.*')
    },
    {
      href: route('crm.communications.index'),
      label: t('crm.communications', 'Communications'),
      icon: <MessageSquare className="h-5 w-5" />,
      active: route().current('crm.communications.*')
    },
    {
      href: route('crm.livechat.index'),
      label: t('crm.chat', 'Chat'),
      icon: <MessageCircle className="h-5 w-5" />,
      active: route().current('crm.livechat.*')
    },
    {
      href: route('crm.analytics.dashboard'),
      label: t('crm.analytics', 'Analytics'),
      icon: <BarChart3 className="h-5 w-5" />,
      active: route().current('crm.analytics.*')
    },
  ] : [];

  // Sidebar content component to avoid duplication
  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-4 py-3">
        <ApplicationMark className="h-8 w-8" />
        <span className="font-bold text-xl">{settings.site_name || 'TekRem ERP'}</span>
      </div>

      <div className="mt-6 flex flex-col gap-1 px-2">
        {/* Main Navigation */}
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
              item.active
                ? "bg-primary/10 text-primary font-semibold"
                : "text-foreground/70 hover:text-foreground hover:bg-accent"
            )}
          >
            {item.icon}
            {item.label}
          </Link>
        ))}

        {/* CRM Navigation - Only visible to admin and staff */}
        {hasCrmAccess() && (
          <Collapsible className="mt-2">
            <CollapsibleTrigger className={cn(
              "w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors",
              route().current('crm.*')
                ? "bg-primary/10 text-primary font-semibold"
                : "text-foreground/70 hover:text-foreground hover:bg-accent"
            )}>
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5" />
                <span>{t('crm.title', 'CRM')}</span>
              </div>
              <ChevronRight className="h-4 w-4 transition-transform data-[state=open]:rotate-90" />
            </CollapsibleTrigger>
            <CollapsibleContent className="pl-4 mt-1 space-y-1">
              {crmItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    item.active
                      ? "bg-primary/10 text-primary font-semibold"
                      : "text-foreground/70 hover:text-foreground hover:bg-accent"
                  )}
                >
                  {item.icon}
                  {item.label}
                </Link>
              ))}
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Settings Navigation - Only visible to admin users */}
        {hasAnyRole(['admin']) && (
          <div className="mt-4 pt-4 border-t border-border">
            <Link
              href={route('settings.index')}
              className={cn(
                "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                route().current('settings.*')
                  ? "bg-primary/10 text-primary font-semibold"
                  : "text-foreground/70 hover:text-foreground hover:bg-accent"
              )}
            >
              <Settings className="h-5 w-5" />
              <span>{t('settings.title', 'Settings')}</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-10">
        <div className="flex flex-col flex-grow border-r border-border bg-background">
          <SidebarContent />
        </div>
      </div>

      {/* Mobile Sidebar (Drawer) */}
      <div className="md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="ml-1">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[280px] sm:w-[350px] p-0">
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
