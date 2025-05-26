import { useMemo } from 'react';
import useRoute from '@/Hooks/useRoute';
import useTranslate from '@/Hooks/useTranslate';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  isActive?: boolean;
}

export default function useBreadcrumbs(): BreadcrumbItem[] {
  const route = useRoute();
  const { t } = useTranslate();

  return useMemo(() => {
    const currentRoute = route().current();
    const breadcrumbs: BreadcrumbItem[] = [];

    // Always start with Dashboard for authenticated routes
    if (currentRoute && !currentRoute.startsWith('website.') && currentRoute !== 'dashboard') {
      breadcrumbs.push({
        label: t('navigation.dashboard', 'Dashboard'),
        href: route('dashboard'),
      });
    }

    // Route-specific breadcrumb generation
    if (currentRoute) {
      // CRM Module
      if (currentRoute.startsWith('crm.')) {
        breadcrumbs.push({
          label: t('crm.title', 'CRM'),
          href: route('crm.dashboard'),
        });

        if (currentRoute.startsWith('crm.clients.')) {
          breadcrumbs.push({
            label: t('crm.clients', 'Clients'),
            href: route('crm.clients.index'),
          });

          if (currentRoute === 'crm.clients.create') {
            breadcrumbs.push({
              label: t('common.create', 'Create'),
              isActive: true,
            });
          } else if (currentRoute === 'crm.clients.edit') {
            breadcrumbs.push({
              label: t('common.edit', 'Edit'),
              isActive: true,
            });
          } else if (currentRoute === 'crm.clients.show') {
            breadcrumbs.push({
              label: t('common.details', 'Details'),
              isActive: true,
            });
          }
        }

        if (currentRoute.startsWith('crm.leads.')) {
          breadcrumbs.push({
            label: t('crm.leads', 'Leads'),
            href: route('crm.leads.index'),
          });

          if (currentRoute === 'crm.leads.create') {
            breadcrumbs.push({
              label: t('common.create', 'Create'),
              isActive: true,
            });
          } else if (currentRoute === 'crm.leads.edit') {
            breadcrumbs.push({
              label: t('common.edit', 'Edit'),
              isActive: true,
            });
          } else if (currentRoute === 'crm.leads.show') {
            breadcrumbs.push({
              label: t('common.details', 'Details'),
              isActive: true,
            });
          }
        }

        if (currentRoute.startsWith('crm.communications.')) {
          breadcrumbs.push({
            label: t('crm.communications', 'Communications'),
            href: route('crm.communications.index'),
          });

          if (currentRoute === 'crm.communications.create') {
            breadcrumbs.push({
              label: t('common.create', 'Create'),
              isActive: true,
            });
          } else if (currentRoute === 'crm.communications.edit') {
            breadcrumbs.push({
              label: t('common.edit', 'Edit'),
              isActive: true,
            });
          } else if (currentRoute === 'crm.communications.show') {
            breadcrumbs.push({
              label: t('common.details', 'Details'),
              isActive: true,
            });
          }
        }

        if (currentRoute.startsWith('crm.livechat.')) {
          breadcrumbs.push({
            label: t('crm.chat', 'LiveChat'),
            href: route('crm.livechat.index'),
          });

          if (currentRoute === 'crm.livechat.show') {
            breadcrumbs.push({
              label: t('crm.conversation', 'Conversation'),
              isActive: true,
            });
          }
        }

        if (currentRoute.startsWith('crm.analytics.')) {
          breadcrumbs.push({
            label: t('crm.analytics', 'Analytics'),
            href: route('crm.analytics.dashboard'),
          });

          if (currentRoute === 'crm.analytics.reports') {
            breadcrumbs.push({
              label: t('common.reports', 'Reports'),
              isActive: true,
            });
          }
        }

        if (currentRoute === 'crm.dashboard') {
          breadcrumbs.push({
            label: t('navigation.dashboard', 'Dashboard'),
            isActive: true,
          });
        }
      }

      // Finance Module
      if (currentRoute.startsWith('finance.')) {
        breadcrumbs.push({
          label: t('finance.title', 'Finance'),
          href: route('finance.dashboard'),
        });

        if (currentRoute.startsWith('finance.accounts.')) {
          breadcrumbs.push({
            label: t('finance.accounts', 'Accounts'),
            href: route('finance.accounts.index'),
          });

          if (currentRoute === 'finance.accounts.create') {
            breadcrumbs.push({
              label: t('common.create', 'Create'),
              isActive: true,
            });
          } else if (currentRoute === 'finance.accounts.edit') {
            breadcrumbs.push({
              label: t('common.edit', 'Edit'),
              isActive: true,
            });
          } else if (currentRoute === 'finance.accounts.show') {
            breadcrumbs.push({
              label: t('common.details', 'Details'),
              isActive: true,
            });
          }
        }

        if (currentRoute.startsWith('finance.transactions.')) {
          breadcrumbs.push({
            label: t('finance.transactions', 'Transactions'),
            href: route('finance.transactions.index'),
          });

          if (currentRoute === 'finance.transactions.create') {
            breadcrumbs.push({
              label: t('common.create', 'Create'),
              isActive: true,
            });
          } else if (currentRoute === 'finance.transactions.edit') {
            breadcrumbs.push({
              label: t('common.edit', 'Edit'),
              isActive: true,
            });
          } else if (currentRoute === 'finance.transactions.show') {
            breadcrumbs.push({
              label: t('common.details', 'Details'),
              isActive: true,
            });
          }
        }

        if (currentRoute.startsWith('finance.invoices.')) {
          breadcrumbs.push({
            label: t('finance.invoices', 'Invoices'),
            href: route('finance.invoices.index'),
          });

          if (currentRoute === 'finance.invoices.create') {
            breadcrumbs.push({
              label: t('common.create', 'Create'),
              isActive: true,
            });
          } else if (currentRoute === 'finance.invoices.edit') {
            breadcrumbs.push({
              label: t('common.edit', 'Edit'),
              isActive: true,
            });
          } else if (currentRoute === 'finance.invoices.show') {
            breadcrumbs.push({
              label: t('common.details', 'Details'),
              isActive: true,
            });
          }
        }

        if (currentRoute.startsWith('finance.payments.')) {
          breadcrumbs.push({
            label: t('finance.payments', 'Payments'),
            href: route('finance.payments.index'),
          });

          if (currentRoute === 'finance.payments.create') {
            breadcrumbs.push({
              label: t('common.create', 'Create'),
              isActive: true,
            });
          } else if (currentRoute === 'finance.payments.edit') {
            breadcrumbs.push({
              label: t('common.edit', 'Edit'),
              isActive: true,
            });
          } else if (currentRoute === 'finance.payments.show') {
            breadcrumbs.push({
              label: t('common.details', 'Details'),
              isActive: true,
            });
          }
        }

        if (currentRoute.startsWith('finance.expenses.')) {
          breadcrumbs.push({
            label: t('finance.expenses', 'Expenses'),
            href: route('finance.expenses.index'),
          });

          if (currentRoute === 'finance.expenses.create') {
            breadcrumbs.push({
              label: t('common.create', 'Create'),
              isActive: true,
            });
          } else if (currentRoute === 'finance.expenses.edit') {
            breadcrumbs.push({
              label: t('common.edit', 'Edit'),
              isActive: true,
            });
          } else if (currentRoute === 'finance.expenses.show') {
            breadcrumbs.push({
              label: t('common.details', 'Details'),
              isActive: true,
            });
          }
        }

        if (currentRoute.startsWith('finance.budgets.')) {
          breadcrumbs.push({
            label: t('finance.budgets', 'Budgets'),
            href: route('finance.budgets.index'),
          });

          if (currentRoute === 'finance.budgets.create') {
            breadcrumbs.push({
              label: t('common.create', 'Create'),
              isActive: true,
            });
          } else if (currentRoute === 'finance.budgets.edit') {
            breadcrumbs.push({
              label: t('common.edit', 'Edit'),
              isActive: true,
            });
          } else if (currentRoute === 'finance.budgets.show') {
            breadcrumbs.push({
              label: t('common.details', 'Details'),
              isActive: true,
            });
          }
        }

        if (currentRoute.startsWith('finance.reports.')) {
          breadcrumbs.push({
            label: t('common.reports', 'Reports'),
            href: route('finance.reports.index'),
          });

          if (currentRoute === 'finance.reports.income-statement') {
            breadcrumbs.push({
              label: t('finance.income_statement', 'Income Statement'),
              isActive: true,
            });
          } else if (currentRoute === 'finance.reports.cash-flow') {
            breadcrumbs.push({
              label: t('finance.cash_flow', 'Cash Flow'),
              isActive: true,
            });
          } else if (currentRoute === 'finance.reports.balance-sheet') {
            breadcrumbs.push({
              label: t('finance.balance_sheet', 'Balance Sheet'),
              isActive: true,
            });
          } else if (currentRoute === 'finance.reports.expense-report') {
            breadcrumbs.push({
              label: t('finance.expense_report', 'Expense Report'),
              isActive: true,
            });
          }
        }

        if (currentRoute === 'finance.dashboard') {
          breadcrumbs.push({
            label: t('navigation.dashboard', 'Dashboard'),
            isActive: true,
          });
        }
      }

      // HR Module
      if (currentRoute.startsWith('hr.')) {
        breadcrumbs.push({
          label: t('hr.title', 'HR'),
          href: route('hr.dashboard'),
        });

        if (currentRoute === 'hr.dashboard') {
          breadcrumbs.push({
            label: t('navigation.dashboard', 'Dashboard'),
            isActive: true,
          });
        }
      }

      // Projects Module
      if (currentRoute.startsWith('projects.')) {
        breadcrumbs.push({
          label: t('projects.title', 'Projects'),
          href: route('projects.dashboard'),
        });

        if (currentRoute === 'projects.dashboard') {
          breadcrumbs.push({
            label: t('navigation.dashboard', 'Dashboard'),
            isActive: true,
          });
        }
      }

      // Support Module
      if (currentRoute.startsWith('support.')) {
        breadcrumbs.push({
          label: t('support.title', 'Support'),
          href: route('support.dashboard'),
        });

        if (currentRoute === 'support.dashboard') {
          breadcrumbs.push({
            label: t('navigation.dashboard', 'Dashboard'),
            isActive: true,
          });
        }
      }

      // Analytics Module
      if (currentRoute.startsWith('analytics.')) {
        breadcrumbs.push({
          label: t('analytics.title', 'Analytics'),
          href: route('analytics.dashboard'),
        });

        if (currentRoute === 'analytics.dashboard') {
          breadcrumbs.push({
            label: t('navigation.dashboard', 'Dashboard'),
            isActive: true,
          });
        }
      }

      // Settings
      if (currentRoute.startsWith('settings.')) {
        breadcrumbs.push({
          label: t('navigation.settings', 'Settings'),
          href: route('settings.index'),
        });

        if (currentRoute === 'settings.general') {
          breadcrumbs.push({
            label: t('settings.general', 'General'),
            isActive: true,
          });
        } else if (currentRoute === 'settings.users') {
          breadcrumbs.push({
            label: t('settings.users', 'Users'),
            isActive: true,
          });
        } else if (currentRoute === 'settings.advanced.index') {
          breadcrumbs.push({
            label: t('settings.advanced', 'Advanced'),
            isActive: true,
          });
        } else if (currentRoute === 'settings.notifications') {
          breadcrumbs.push({
            label: t('navigation.notifications', 'Notifications'),
            isActive: true,
          });
        }
      }

      // AI Conversation Export (under CRM)
      if (currentRoute.startsWith('crm.ai-conversations.')) {
        breadcrumbs.push({
          label: t('crm.title', 'CRM'),
          href: route('crm.dashboard'),
        });
        breadcrumbs.push({
          label: 'AI Conversation Export',
          isActive: true,
        });
      }

      // Profile
      if (currentRoute === 'profile.show') {
        breadcrumbs.push({
          label: t('navigation.profile', 'Profile'),
          isActive: true,
        });
      }

      // Notifications
      if (currentRoute === 'notifications.index') {
        breadcrumbs.push({
          label: t('navigation.notifications', 'Notifications'),
          isActive: true,
        });
      }

      // Dashboard
      if (currentRoute === 'dashboard') {
        breadcrumbs.push({
          label: t('navigation.dashboard', 'Dashboard'),
          isActive: true,
        });
      }
    }

    return breadcrumbs;
  }, [route, t]);
}
