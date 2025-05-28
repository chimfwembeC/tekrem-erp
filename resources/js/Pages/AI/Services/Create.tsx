import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Switch } from '@/Components/ui/switch';
import { Badge } from '@/Components/ui/badge';
import { Bot, Brain, Zap, ArrowLeft, Save, TestTube } from 'lucide-react';
import useTranslate from '@/Hooks/useTranslate';
import { toast } from 'sonner';

interface FormData {
  name: string;
  provider: string;
  api_key: string;
  api_url: string;
  description: string;
  is_enabled: boolean;
  is_default: boolean;
  priority: number;
  supported_features: string[];
  cost_per_token: string;
  rate_limit_per_minute: string;
  max_tokens_per_request: string;
  configuration: Record<string, any>;
}

export default function CreateService() {
  const { t } = useTranslate();
  const [isTestingConnection, setIsTestingConnection] = useState(false);

  const { data, setData, post, processing, errors, reset } = useForm<FormData>({
    name: '',
    provider: '',
    api_key: '',
    api_url: '',
    description: '',
    is_enabled: true,
    is_default: false,
    priority: 0,
    supported_features: [],
    cost_per_token: '',
    rate_limit_per_minute: '',
    max_tokens_per_request: '',
    configuration: {},
  });

  const providers = [
    { value: 'mistral', label: t('ai.mistral', 'Mistral AI'), icon: <Bot className="h-4 w-4" /> },
    { value: 'openai', label: t('ai.openai', 'OpenAI'), icon: <Brain className="h-4 w-4" /> },
    { value: 'anthropic', label: t('ai.anthropic', 'Anthropic'), icon: <Zap className="h-4 w-4" /> },
  ];

  const availableFeatures = [
    'chat',
    'completion',
    'embedding',
    'image',
    'audio',
    'analysis'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('ai.services.store'), {
      onSuccess: () => {
        toast.success(t('ai.service_created', 'Service created successfully'));
      },
      onError: () => {
        toast.error(t('common.error', 'An error occurred'));
      }
    });
  };

  const handleProviderChange = (provider: string) => {
    setData(prev => ({
      ...prev,
      provider,
      api_url: getDefaultApiUrl(provider),
      supported_features: getDefaultFeatures(provider)
    }));
  };

  const getDefaultApiUrl = (provider: string): string => {
    switch (provider) {
      case 'mistral':
        return 'https://api.mistral.ai/v1';
      case 'openai':
        return 'https://api.openai.com/v1';
      case 'anthropic':
        return 'https://api.anthropic.com/v1';
      default:
        return '';
    }
  };

  const getDefaultFeatures = (provider: string): string[] => {
    switch (provider) {
      case 'mistral':
        return ['chat', 'completion', 'embedding'];
      case 'openai':
        return ['chat', 'completion', 'embedding', 'image', 'audio'];
      case 'anthropic':
        return ['chat', 'completion', 'analysis'];
      default:
        return ['chat', 'completion'];
    }
  };

  const handleFeatureToggle = (feature: string) => {
    setData(prev => ({
      ...prev,
      supported_features: prev.supported_features.includes(feature)
        ? prev.supported_features.filter(f => f !== feature)
        : [...prev.supported_features, feature]
    }));
  };

  const testConnection = async () => {
    if (!data.provider || !data.api_key) {
      toast.error('Please select a provider and enter an API key first');
      return;
    }

    setIsTestingConnection(true);
    try {
      const response = await fetch(route('ai.dashboard.test-connection'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
        },
        body: JSON.stringify({
          provider: data.provider,
          api_key: data.api_key,
          api_url: data.api_url
        })
      });

      const result = await response.json();

      if (result.success) {
        toast.success(t('ai.connection_successful', 'Connection successful'));
      } else {
        toast.error(t('ai.connection_failed', 'Connection failed') + ': ' + result.message);
      }
    } catch (error) {
      toast.error(t('ai.connection_failed', 'Connection failed'));
    } finally {
      setIsTestingConnection(false);
    }
  };

  return (
    <AppLayout
      title={t('ai.create_service', 'Create AI Service')}
      renderHeader={() => (
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('common.back', 'Back')}
            </Button>
            <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
              {t('ai.create_service', 'Create AI Service')}
            </h2>
          </div>
        </div>
      )}
    >
      <Head title={t('ai.create_service', 'Create AI Service')} />

      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('ai.service_configuration', 'Service Configuration')}</CardTitle>
              <CardDescription>
                {t('ai.service_configuration', 'Configure your AI service provider settings')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{t('ai.service_name', 'Service Name')} *</Label>
                  <Input
                    id="name"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    placeholder="Enter service name"
                    className={errors.name ? 'border-red-500' : ''}
                  />
                  {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="provider">{t('ai.provider', 'Provider')} *</Label>
                  <Select value={data.provider} onValueChange={handleProviderChange}>
                    <SelectTrigger className={errors.provider ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select provider" />
                    </SelectTrigger>
                    <SelectContent>
                      {providers.map((provider) => (
                        <SelectItem key={provider.value} value={provider.value}>
                          <div className="flex items-center gap-2">
                            {provider.icon}
                            {provider.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.provider && <p className="text-sm text-red-500">{errors.provider}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">{t('common.description', 'Description')}</Label>
                <Textarea
                  id="description"
                  value={data.description}
                  onChange={(e) => setData('description', e.target.value)}
                  placeholder="Enter service description"
                  rows={3}
                />
              </div>

              {/* API Configuration */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">{t('ai.api_configuration', 'API Configuration')}</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="api_key">{t('ai.api_key', 'API Key')}</Label>
                    <Input
                      id="api_key"
                      type="password"
                      value={data.api_key}
                      onChange={(e) => setData('api_key', e.target.value)}
                      placeholder="Enter API key"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="api_url">{t('ai.api_url', 'API URL')}</Label>
                    <Input
                      id="api_url"
                      value={data.api_url}
                      onChange={(e) => setData('api_url', e.target.value)}
                      placeholder="Enter API URL"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={testConnection}
                    disabled={isTestingConnection || !data.provider || !data.api_key}
                  >
                    <TestTube className="h-4 w-4 mr-2" />
                    {isTestingConnection ? 'Testing...' : t('ai.test_connection', 'Test Connection')}
                  </Button>
                </div>
              </div>

              {/* Supported Features */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">{t('ai.supported_features', 'Supported Features')}</h3>
                <div className="flex flex-wrap gap-2">
                  {availableFeatures.map((feature) => (
                    <Badge
                      key={feature}
                      variant={data.supported_features.includes(feature) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => handleFeatureToggle(feature)}
                    >
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">{t('common.settings', 'Settings')}</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="priority">{t('common.priority', 'Priority')}</Label>
                    <Input
                      id="priority"
                      type="number"
                      min="0"
                      value={data.priority}
                      onChange={(e) => setData('priority', parseInt(e.target.value) || 0)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cost_per_token">{t('ai.cost_per_token', 'Cost per Token')}</Label>
                    <Input
                      id="cost_per_token"
                      type="number"
                      step="0.00000001"
                      value={data.cost_per_token}
                      onChange={(e) => setData('cost_per_token', e.target.value)}
                      placeholder="0.00002"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="rate_limit">{t('ai.rate_limit_per_minute', 'Rate Limit (per minute)')}</Label>
                    <Input
                      id="rate_limit"
                      type="number"
                      min="1"
                      value={data.rate_limit_per_minute}
                      onChange={(e) => setData('rate_limit_per_minute', e.target.value)}
                      placeholder="100"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max_tokens">{t('ai.max_tokens_per_request', 'Max Tokens per Request')}</Label>
                  <Input
                    id="max_tokens"
                    type="number"
                    min="1"
                    value={data.max_tokens_per_request}
                    onChange={(e) => setData('max_tokens_per_request', e.target.value)}
                    placeholder="4000"
                    className="max-w-xs"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="is_enabled"
                        checked={data.is_enabled}
                        onCheckedChange={(checked) => setData('is_enabled', checked)}
                      />
                      <Label htmlFor="is_enabled">{t('ai.enabled', 'Enabled')}</Label>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {t('ai.enabled_description', 'Enable this service for use')}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="is_default"
                        checked={data.is_default}
                        onCheckedChange={(checked) => setData('is_default', checked)}
                      />
                      <Label htmlFor="is_default">{t('common.default', 'Default')}</Label>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {t('ai.default_description', 'Set as default service')}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => window.history.back()}
            >
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button type="submit" disabled={processing}>
              <Save className="h-4 w-4 mr-2" />
              {processing ? t('common.saving', 'Saving...') : t('common.save', 'Save')}
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
