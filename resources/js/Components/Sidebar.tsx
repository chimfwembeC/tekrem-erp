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
  BarChart3,
  DollarSign,
  CreditCard,
  Receipt,
  Wallet,
  TrendingUp,
  PieChart,
  Tag,
  FileText,
  HelpCircle,
  BookOpen,
  LifeBuoy,
  Ticket,
  Globe,
  FileEdit,
  Image,
  Layout,
  Navigation,
  Link2,
  Folder,
  Palette,
  Bot,
  Brain,
  Zap,
  FolderOpen,
  CheckSquare,
  User,
  Building,
  Calendar,
  Clock,
  GraduationCap,
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
  const { hasAnyRole, hasAnyPermission } = usePermissions();

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

  // Finance navigation items - only visible to admin and staff
  const financeItems = hasCrmAccess() ? [
    {
      href: route('finance.dashboard'),
      label: t('finance.dashboard', 'Dashboard'),
      icon: <LayoutDashboard className="h-5 w-5" />,
      active: route().current('finance.dashboard')
    },
    {
      href: route('finance.accounts.index'),
      label: t('finance.accounts', 'Accounts'),
      icon: <Wallet className="h-5 w-5" />,
      active: route().current('finance.accounts.*')
    },
    {
      href: route('finance.transactions.index'),
      label: t('finance.transactions', 'Transactions'),
      icon: <CreditCard className="h-5 w-5" />,
      active: route().current('finance.transactions.*')
    },
    {
      href: route('finance.invoices.index'),
      label: t('finance.invoices', 'Invoices'),
      icon: <Receipt className="h-5 w-5" />,
      active: route().current('finance.invoices.*')
    },
    {
      href: route('finance.payments.index'),
      label: t('finance.payments', 'Payments'),
      icon: <DollarSign className="h-5 w-5" />,
      active: route().current('finance.payments.*')
    },
    {
      href: route('finance.quotations.index'),
      label: t('finance.quotations', 'Quotations'),
      icon: <FileText className="h-5 w-5" />,
      active: route().current('finance.quotations.*')
    },
    {
      href: route('finance.expenses.index'),
      label: t('finance.expenses', 'Expenses'),
      icon: <TrendingUp className="h-5 w-5" />,
      active: route().current('finance.expenses.*')
    },
    {
      href: route('finance.budgets.index'),
      label: t('finance.budgets', 'Budgets'),
      icon: <PieChart className="h-5 w-5" />,
      active: route().current('finance.budgets.*')
    },
    {
      href: route('finance.categories.index'),
      label: t('finance.categories', 'Categories'),
      icon: <Tag className="h-5 w-5" />,
      active: route().current('finance.categories.*')
    },
    {
      href: route('finance.reports.index'),
      label: t('finance.reports', 'Reports'),
      icon: <BarChart3 className="h-5 w-5" />,
      active: route().current('finance.reports.*')
    },
  ] : [];

  // Support navigation items - only visible to admin and staff
  const supportItems = hasCrmAccess() ? [
    {
      href: route('support.dashboard'),
      label: t('support.dashboard', 'Dashboard'),
      icon: <LayoutDashboard className="h-5 w-5" />,
      active: route().current('support.dashboard')
    },
    {
      href: route('support.tickets.index'),
      label: t('support.tickets', 'Tickets'),
      icon: <Ticket className="h-5 w-5" />,
      active: route().current('support.tickets.*')
    },
    {
      href: route('support.knowledge-base.index'),
      label: t('support.knowledge_base', 'Knowledge Base'),
      icon: <BookOpen className="h-5 w-5" />,
      active: route().current('support.knowledge-base.*')
    },
    {
      href: route('support.faq.index'),
      label: t('support.faq', 'FAQ'),
      icon: <HelpCircle className="h-5 w-5" />,
      active: route().current('support.faq.*')
    },
    {
      href: route('support.categories.index'),
      label: t('support.categories', 'Categories'),
      icon: <Tag className="h-5 w-5" />,
      active: route().current('support.categories.*')
    },
    {
      href: route('support.analytics.dashboard'),
      label: t('support.analytics', 'Analytics'),
      icon: <BarChart3 className="h-5 w-5" />,
      active: route().current('support.analytics.*')
    },
  ] : [];

  // CMS navigation items - only visible to admin and staff
  const cmsItems = hasCrmAccess() ? [
    {
      href: route('cms.dashboard'),
      label: t('cms.dashboard', 'Dashboard'),
      icon: <LayoutDashboard className="h-5 w-5" />,
      active: route().current('cms.dashboard')
    },
    {
      href: route('cms.pages.index'),
      label: t('cms.pages', 'Pages'),
      icon: <FileEdit className="h-5 w-5" />,
      active: route().current('cms.pages.*')
    },
    {
      href: route('cms.media.index'),
      label: t('cms.media', 'Media Library'),
      icon: <Image className="h-5 w-5" />,
      active: route().current('cms.media.*')
    },
    {
      href: route('cms.templates.index'),
      label: t('cms.templates', 'Templates'),
      icon: <Layout className="h-5 w-5" />,
      active: route().current('cms.templates.*')
    },
    {
      href: route('cms.menus.index'),
      label: t('cms.menus', 'Menus'),
      icon: <Navigation className="h-5 w-5" />,
      active: route().current('cms.menus.*')
    },
    {
      href: route('cms.redirects.index'),
      label: t('cms.redirects', 'Redirects'),
      icon: <Link2 className="h-5 w-5" />,
      active: route().current('cms.redirects.*')
    },
    {
      href: route('cms.analytics'),
      label: t('cms.analytics', 'Analytics'),
      icon: <BarChart3 className="h-5 w-5" />,
      active: route().current('cms.analytics.*')
    },
  ] : [];

  // Projects navigation items - only visible to admin and staff
  const projectsItems = hasCrmAccess() ? [
    {
      href: route('projects.dashboard'),
      label: t('projects.dashboard', 'Dashboard'),
      icon: <LayoutDashboard className="h-5 w-5" />,
      active: route().current('projects.dashboard')
    },
    {
      href: route('projects.index'),
      label: t('projects.projects', 'All Projects'),
      icon: <FolderOpen className="h-5 w-5" />,
      active: route().current('projects.index') || route().current('projects.show') || route().current('projects.edit') || route().current('projects.create')
    },
    {
      href: route('projects.my-tasks'),
      label: t('projects.my_tasks', 'My Tasks'),
      icon: <CheckSquare className="h-5 w-5" />,
      active: route().current('projects.my-tasks')
    },
    {
      href: route('projects.tags.index'),
      label: t('projects.tags', 'Tags'),
      icon: <Tag className="h-5 w-5" />,
      active: route().current('projects.tags.*')
    },
    {
      href: route('projects.templates.index'),
      label: t('projects.templates', 'Templates'),
      icon: <Layout className="h-5 w-5" />,
      active: route().current('projects.templates.*')
    },
    {
      href: route('projects.analytics'),
      label: t('projects.analytics', 'Analytics'),
      icon: <BarChart3 className="h-5 w-5" />,
      active: route().current('projects.analytics.*')
    },
  ] : [];

  // HR navigation items - only visible to admin and staff
  const hrItems = hasCrmAccess() ? [
    {
      href: route('hr.dashboard'),
      label: t('hr.dashboard', 'Dashboard'),
      icon: <LayoutDashboard className="h-5 w-5" />,
      active: route().current('hr.dashboard')
    },
    {
      href: route('hr.employees.index'),
      label: t('hr.employees', 'Employees'),
      icon: <Users className="h-5 w-5" />,
      active: route().current('hr.employees.*')
    },
    {
      href: route('hr.departments.index'),
      label: t('hr.departments', 'Departments'),
      icon: <Building className="h-5 w-5" />,
      active: route().current('hr.departments.*')
    },
    {
      href: route('hr.leave.index'),
      label: t('hr.leave', 'Leave Management'),
      icon: <Calendar className="h-5 w-5" />,
      active: route().current('hr.leave.*')
    },
    {
      href: route('hr.performance.index'),
      label: t('hr.performance', 'Performance'),
      icon: <TrendingUp className="h-5 w-5" />,
      active: route().current('hr.performance.*')
    },
    {
      href: route('hr.attendance.index'),
      label: t('hr.attendance', 'Attendance'),
      icon: <Clock className="h-5 w-5" />,
      active: route().current('hr.attendance.*')
    },
    {
      href: route('hr.training.index'),
      label: t('hr.training', 'Training'),
      icon: <GraduationCap className="h-5 w-5" />,
      active: route().current('hr.training.*')
    },
    {
      href: route('hr.analytics.dashboard'),
      label: t('hr.analytics', 'Analytics'),
      icon: <BarChart3 className="h-5 w-5" />,
      active: route().current('hr.analytics.*')
    },
  ] : [];

  // AI navigation items - only visible to admin and staff
  const aiItems = hasCrmAccess() ? [
    {
      href: route('ai.dashboard'),
      label: t('ai.dashboard', 'Dashboard'),
      icon: <LayoutDashboard className="h-5 w-5" />,
      active: route().current('ai.dashboard')
    },
    {
      href: route('ai.services.index'),
      label: t('ai.services', 'Services'),
      icon: <Settings className="h-5 w-5" />,
      active: route().current('ai.services.*')
    },
    {
      href: route('ai.models.index'),
      label: t('ai.models', 'Models'),
      icon: <Brain className="h-5 w-5" />,
      active: route().current('ai.models.*')
    },
    {
      href: route('ai.conversations.index'),
      label: t('ai.conversations', 'Conversations'),
      icon: <MessageSquare className="h-5 w-5" />,
      active: route().current('ai.conversations.*')
    },
    {
      href: route('ai.prompt-templates.index'),
      label: t('ai.prompt_templates', 'Templates'),
      icon: <FileText className="h-5 w-5" />,
      active: route().current('ai.prompt-templates.*')
    },
    {
      href: route('ai.analytics.dashboard'),
      label: t('ai.analytics', 'Analytics'),
      icon: <BarChart3 className="h-5 w-5" />,
      active: route().current('ai.analytics.*')
    },
  ] : [];

  // Customer-only navigation
  // const customerItems = hasAnyRole(['customer']) ? [
  //   {
  //     href: route('customer.orders'),
  //     label: t('customer.orders', 'My Orders'),
  //     icon: <Receipt className="h-5 w-5" />,
  //     active: route().current('customer.orders')
  //   },
  //   {
  //     href: route('customer.support'),
  //     label: t('customer.support', 'Support'),
  //     icon: <LifeBuoy className="h-5 w-5" />,
  //     active: route().current('customer.support')
  //   },
  //   {
  //     href: route('customer.billing'),
  //     label: t('customer.billing', 'Billing'),
  //     icon: <CreditCard className="h-5 w-5" />,
  //     active: route().current('customer.billing')
  //   },
  // ] : [];


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

        {/* Finance Navigation - Only visible to admin and staff */}
        {hasCrmAccess() && (
          <Collapsible className="mt-2">
            <CollapsibleTrigger className={cn(
              "w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors",
              route().current('finance.*')
                ? "bg-primary/10 text-primary font-semibold"
                : "text-foreground/70 hover:text-foreground hover:bg-accent"
            )}>
              <div className="flex items-center gap-3">
                <DollarSign className="h-5 w-5" />
                <span>{t('finance.title', 'Finance')}</span>
              </div>
              <ChevronRight className="h-4 w-4 transition-transform data-[state=open]:rotate-90" />
            </CollapsibleTrigger>
            <CollapsibleContent className="pl-4 mt-1 space-y-1">
              {financeItems.map((item) => (
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

        {/* Projects Navigation - Only visible to admin and staff */}
        {hasCrmAccess() && (
          <Collapsible className="mt-2">
            <CollapsibleTrigger className={cn(
              "w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors",
              route().current('projects.*')
                ? "bg-primary/10 text-primary font-semibold"
                : "text-foreground/70 hover:text-foreground hover:bg-accent"
            )}>
              <div className="flex items-center gap-3">
                <FolderOpen className="h-5 w-5" />
                <span>{t('projects.title', 'Projects')}</span>
              </div>
              <ChevronRight className="h-4 w-4 transition-transform data-[state=open]:rotate-90" />
            </CollapsibleTrigger>
            <CollapsibleContent className="pl-4 mt-1 space-y-1">
              {projectsItems.map((item) => (
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

        {/* HR Navigation - Only visible to admin and staff */}
        {hasCrmAccess() && (
          <Collapsible className="mt-2">
            <CollapsibleTrigger className={cn(
              "w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors",
              route().current('hr.*')
                ? "bg-primary/10 text-primary font-semibold"
                : "text-foreground/70 hover:text-foreground hover:bg-accent"
            )}>
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5" />
                <span>{t('hr.title', 'HR')}</span>
              </div>
              <ChevronRight className="h-4 w-4 transition-transform data-[state=open]:rotate-90" />
            </CollapsibleTrigger>
            <CollapsibleContent className="pl-4 mt-1 space-y-1">
              {hrItems.map((item) => (
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

        {/* Support Navigation - Only visible to admin and staff */}
        {hasCrmAccess() && (
          <Collapsible className="mt-2">
            <CollapsibleTrigger className={cn(
              "w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors",
              route().current('support.*')
                ? "bg-primary/10 text-primary font-semibold"
                : "text-foreground/70 hover:text-foreground hover:bg-accent"
            )}>
              <div className="flex items-center gap-3">
                <LifeBuoy className="h-5 w-5" />
                <span>{t('support.title', 'Support')}</span>
              </div>
              <ChevronRight className="h-4 w-4 transition-transform data-[state=open]:rotate-90" />
            </CollapsibleTrigger>
            <CollapsibleContent className="pl-4 mt-1 space-y-1">
              {supportItems.map((item) => (
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

        {/* AI Navigation - Only visible to admin and staff */}
        {hasCrmAccess() && (
          <Collapsible className="mt-2">
            <CollapsibleTrigger className={cn(
              "w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors",
              route().current('ai.*')
                ? "bg-primary/10 text-primary font-semibold"
                : "text-foreground/70 hover:text-foreground hover:bg-accent"
            )}>
              <div className="flex items-center gap-3">
                <Bot className="h-5 w-5" />
                <span>{t('ai.title', 'AI')}</span>
              </div>
              <ChevronRight className="h-4 w-4 transition-transform data-[state=open]:rotate-90" />
            </CollapsibleTrigger>
            <CollapsibleContent className="pl-4 mt-1 space-y-1">
              {aiItems.map((item) => (
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

        {/* CMS Navigation - Only visible to admin and staff */}
        {hasCrmAccess() && (
          <Collapsible className="mt-2">
            <CollapsibleTrigger className={cn(
              "w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors",
              route().current('cms.*')
                ? "bg-primary/10 text-primary font-semibold"
                : "text-foreground/70 hover:text-foreground hover:bg-accent"
            )}>
              <div className="flex items-center gap-3">
                <Globe className="h-5 w-5" />
                <span>{t('cms.title', 'CMS')}</span>
              </div>
              <ChevronRight className="h-4 w-4 transition-transform data-[state=open]:rotate-90" />
            </CollapsibleTrigger>
            <CollapsibleContent className="pl-4 mt-1 space-y-1">
              {cmsItems.map((item) => (
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

        {/* Customer Navigation - Only visible to customers */}
        {/* {hasAnyRole(['customer']) && (
          <Collapsible className="mt-2">
            <CollapsibleTrigger className={cn(
              "w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors",
              route().current('customer.*')
                ? "bg-primary/10 text-primary font-semibold"
                : "text-foreground/70 hover:text-foreground hover:bg-accent"
            )}>
              <div className="flex items-center gap-3">
                <UserPlus className="h-5 w-5" />
                <span>{t('customer.title', 'Customer')}</span>
              </div>
              <ChevronRight className="h-4 w-4 transition-transform data-[state=open]:rotate-90" />
            </CollapsibleTrigger>
            <CollapsibleContent className="pl-4 mt-1 space-y-1">
              {customerItems.map((item) => (
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
        )} */}

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
