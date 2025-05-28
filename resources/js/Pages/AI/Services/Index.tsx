import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Badge } from '@/Components/ui/badge';
import { Switch } from '@/Components/ui/switch';
import { 
  Bot, 
  Brain, 
  Zap, 
  Settings, 
  Plus, 
  Eye, 
  Edit, 
  Trash2,
  CheckCircle,
  AlertCircle,
  Star,
  Activity
} from 'lucide-react';
import useTranslate from '@/Hooks/useTranslate';
import { toast } from 'sonner';

interface Service {
  id: number;
  name: string;
  slug: string;
  provider: string;
  description: string;
  is_enabled: boolean;
  is_default: boolean;
  priority: number;
  models_count: number;
  created_at: string;
  updated_at: string;
}

interface Props {
  services: {
    data: Service[];
    links: any[];
    current_page: number;
    last_page: number;
    from: number;
    to: number;
    total: number;
  };
  providers: string[];
  filters: {
    search?: string;
    provider?: string;
    status?: string;
  };
}

export default function ServicesIndex({ services, providers, filters }: Props) {
  const { t } = useTranslate();
  const [search, setSearch] = useState(filters.search || '');
  const [provider, setProvider] = useState(filters.provider || 'all');
  const [status, setStatus] = useState(filters.status || 'all');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.get(route('ai.services.index'), {
      search,
      provider: provider === 'all' ? '' : provider,
      status: status === 'all' ? '' : status
    }, { preserveState: true });
  };

  const handleProviderChange = (value: string) => {
    setProvider(value);
    router.get(route('ai.services.index'), {
      search,
      provider: value === 'all' ? '' : value,
      status: status === 'all' ? '' : status
    }, { preserveState: true });
  };

  const handleStatusChange = (value: string) => {
    setStatus(value);
    router.get(route('ai.services.index'), {
      search,
      provider: provider === 'all' ? '' : provider,
      status: value === 'all' ? '' : value
    }, { preserveState: true });
  };

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'mistral':
        return <Bot className="h-4 w-4" />;
      case 'openai':
        return <Brain className="h-4 w-4" />;
      case 'anthropic':
        return <Zap className="h-4 w-4" />;
      default:
        return <Bot className="h-4 w-4" />;
    }
  };

  const getProviderColor = (provider: string) => {
    switch (provider) {
      case 'mistral':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'openai':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'anthropic':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const handleToggleStatus = async (service: Service) => {
    try {
      const response = await fetch(route('ai.services.toggle-status', service.id), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
        }
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message);
        router.reload({ only: ['services'] });
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error('Failed to update service status');
    }
  };

  const handleSetDefault = async (service: Service) => {
    try {
      const response = await fetch(route('ai.services.set-default', service.id), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
        }
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message);
        router.reload({ only: ['services'] });
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error('Failed to set default service');
    }
  };

  const handleDelete = (service: Service) => {
    if (confirm(`Are you sure you want to delete the service "${service.name}"?`)) {
      router.delete(route('ai.services.destroy', service.id));
    }
  };

  return (
    <AppLayout
      title={t('ai.services', 'AI Services')}
      renderHeader={() => (
        <div className="flex justify-between items-center">
          <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            {t('ai.services', 'AI Services')}
          </h2>
          <Link href={route('ai.services.create')}>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {t('ai.create_service', 'Create Service')}
            </Button>
          </Link>
        </div>
      )}
    >
      <Head title={t('ai.services', 'AI Services')} />

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('ai.service_configuration', 'Service Configuration')}</CardTitle>
            <CardDescription>
              {t('ai.service_configuration', 'Manage your AI service providers and configurations')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="flex flex-col sm:flex-row justify-between mb-6 gap-4">
              <form onSubmit={handleSearch} className="flex gap-2 flex-1">
                <Input
                  type="text"
                  placeholder={t('common.search', 'Search services...')}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="max-w-sm"
                />
                <Button type="submit" variant="secondary">
                  {t('common.search', 'Search')}
                </Button>
              </form>
              
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-sm">{t('ai.provider', 'Provider')}:</span>
                  <Select value={provider} onValueChange={handleProviderChange}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="All Providers" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Providers</SelectItem>
                      {providers.map((p) => (
                        <SelectItem key={p} value={p}>
                          {t(`ai.${p}`, p.charAt(0).toUpperCase() + p.slice(1))}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-sm">{t('common.status', 'Status')}:</span>
                  <Select value={status} onValueChange={handleStatusChange}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="enabled">{t('ai.enabled', 'Enabled')}</SelectItem>
                      <SelectItem value="disabled">{t('ai.disabled', 'Disabled')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Services Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {services.data.length > 0 ? (
                services.data.map((service) => (
                  <Card key={service.id} className="relative">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          {getProviderIcon(service.provider)}
                          <div>
                            <CardTitle className="text-lg">{service.name}</CardTitle>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${getProviderColor(service.provider)}`}
                              >
                                {t(`ai.${service.provider}`, service.provider)}
                              </Badge>
                              {service.is_default && (
                                <Badge variant="outline" className="text-xs">
                                  <Star className="h-3 w-3 mr-1" />
                                  {t('common.default', 'Default')}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {service.is_enabled ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <AlertCircle className="h-5 w-5 text-red-500" />
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      {service.description && (
                        <p className="text-sm text-muted-foreground mb-3">
                          {service.description}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                        <span>{service.models_count} {t('ai.models', 'models')}</span>
                        <span>{t('common.priority', 'Priority')}: {service.priority}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={service.is_enabled}
                            onCheckedChange={() => handleToggleStatus(service)}
                          />
                          <span className="text-sm">
                            {service.is_enabled ? t('ai.enabled', 'Enabled') : t('ai.disabled', 'Disabled')}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <Link href={route('ai.services.show', service.id)}>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link href={route('ai.services.edit', service.id)}>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          {!service.is_default && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSetDefault(service)}
                              title="Set as default"
                            >
                              <Star className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(service)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-full text-center py-8">
                  <Bot className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    {t('common.no_results', 'No services found')}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {t('ai.create_first_service', 'Create your first AI service to get started')}
                  </p>
                  <Link href={route('ai.services.create')}>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      {t('ai.create_service', 'Create Service')}
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Pagination */}
            {services.last_page > 1 && (
              <div className="mt-6 flex justify-between items-center">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Showing {services.from} to {services.to} of {services.total} services
                </div>
                <div className="flex gap-1">
                  {services.links.map((link, i) => {
                    if (link.url === null) {
                      return (
                        <Button
                          key={i}
                          variant="outline"
                          size="sm"
                          disabled
                          dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                      );
                    }

                    return (
                      <Link key={i} href={link.url}>
                        <Button
                          variant={link.active ? "default" : "outline"}
                          size="sm"
                          dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
