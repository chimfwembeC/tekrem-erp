import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Checkbox } from '@/Components/ui/checkbox';
import { Alert, AlertDescription } from '@/Components/ui/alert';
import {
  ArrowLeft,
  Save,
  AlertCircle,
  Clock,
  Target
} from 'lucide-react';
import useTranslate from '@/Hooks/useTranslate';
import useRoute from '@/Hooks/useRoute';

export default function Create() {
  const { t } = useTranslate();
  const route = useRoute();

  const { data, setData, post, processing, errors, reset } = useForm({
    name: '',
    description: '',
    response_time_hours: 4,
    resolution_time_hours: 24,
    escalation_time_hours: 48,
    is_active: true,
    is_default: false,
    business_hours_only: false,
    exclude_weekends: false,
    exclude_holidays: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('support.sla.store'), {
      onSuccess: () => reset(),
    });
  };

  const formatTimeDisplay = (hours: number) => {
    if (hours < 1) {
      return `${Math.round(hours * 60)} minutes`;
    } else if (hours < 24) {
      return `${hours} hour${hours !== 1 ? 's' : ''}`;
    } else {
      const days = Math.floor(hours / 24);
      const remainingHours = hours % 24;
      return remainingHours > 0 
        ? `${days} day${days !== 1 ? 's' : ''} ${remainingHours} hour${remainingHours !== 1 ? 's' : ''}`
        : `${days} day${days !== 1 ? 's' : ''}`;
    }
  };

  return (
    <AppLayout>
      <Head title={t('support.create_sla', 'Create SLA Policy')} />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" asChild>
              <a href={route('support.sla.index')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t('common.back', 'Back')}
              </a>
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {t('support.create_sla', 'Create SLA Policy')}
              </h1>
              <p className="text-muted-foreground">
                {t('support.create_sla_description', 'Define service level agreements and performance targets')}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t('support.sla_details', 'SLA Policy Details')}</CardTitle>
                  <CardDescription>
                    {t('support.sla_details_description', 'Basic information about the SLA policy')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="name">{t('support.name', 'Name')} *</Label>
                    <Input
                      id="name"
                      value={data.name}
                      onChange={(e) => setData('name', e.target.value)}
                      placeholder={t('support.sla_name_placeholder', 'Enter SLA policy name')}
                      className={errors.name ? 'border-red-500' : ''}
                    />
                    {errors.name && (
                      <p className="text-sm text-red-500 mt-1">{errors.name}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="description">{t('support.description', 'Description')}</Label>
                    <Textarea
                      id="description"
                      value={data.description}
                      onChange={(e) => setData('description', e.target.value)}
                      placeholder={t('support.sla_description_placeholder', 'Describe the SLA policy and its purpose')}
                      rows={3}
                      className={errors.description ? 'border-red-500' : ''}
                    />
                    {errors.description && (
                      <p className="text-sm text-red-500 mt-1">{errors.description}</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Time Targets */}
              <Card>
                <CardHeader>
                  <CardTitle>{t('support.time_targets', 'Time Targets')}</CardTitle>
                  <CardDescription>
                    {t('support.time_targets_description', 'Define response and resolution time commitments')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="response_time_hours">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          {t('support.response_time', 'Response Time')} (hours) *
                        </div>
                      </Label>
                      <Input
                        id="response_time_hours"
                        type="number"
                        min="0.5"
                        step="0.5"
                        value={data.response_time_hours}
                        onChange={(e) => setData('response_time_hours', parseFloat(e.target.value) || 0)}
                        className={errors.response_time_hours ? 'border-red-500' : ''}
                      />
                      <p className="text-sm text-muted-foreground mt-1">
                        {formatTimeDisplay(data.response_time_hours)}
                      </p>
                      {errors.response_time_hours && (
                        <p className="text-sm text-red-500 mt-1">{errors.response_time_hours}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="resolution_time_hours">
                        <div className="flex items-center gap-2">
                          <Target className="h-4 w-4" />
                          {t('support.resolution_time', 'Resolution Time')} (hours) *
                        </div>
                      </Label>
                      <Input
                        id="resolution_time_hours"
                        type="number"
                        min="1"
                        step="1"
                        value={data.resolution_time_hours}
                        onChange={(e) => setData('resolution_time_hours', parseFloat(e.target.value) || 0)}
                        className={errors.resolution_time_hours ? 'border-red-500' : ''}
                      />
                      <p className="text-sm text-muted-foreground mt-1">
                        {formatTimeDisplay(data.resolution_time_hours)}
                      </p>
                      {errors.resolution_time_hours && (
                        <p className="text-sm text-red-500 mt-1">{errors.resolution_time_hours}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="escalation_time_hours">
                      {t('support.escalation_time', 'Escalation Time')} (hours)
                    </Label>
                    <Input
                      id="escalation_time_hours"
                      type="number"
                      min="1"
                      step="1"
                      value={data.escalation_time_hours}
                      onChange={(e) => setData('escalation_time_hours', parseFloat(e.target.value) || 0)}
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      {t('support.escalation_time_help', 'Time before automatic escalation')} - {formatTimeDisplay(data.escalation_time_hours)}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Business Rules */}
              <Card>
                <CardHeader>
                  <CardTitle>{t('support.business_rules', 'Business Rules')}</CardTitle>
                  <CardDescription>
                    {t('support.business_rules_description', 'Configure when SLA timers are active')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="business_hours_only"
                        checked={data.business_hours_only}
                        onCheckedChange={(checked) => setData('business_hours_only', !!checked)}
                      />
                      <Label htmlFor="business_hours_only" className="text-sm font-medium">
                        {t('support.business_hours_only', 'Business Hours Only')}
                      </Label>
                    </div>
                    <p className="text-sm text-muted-foreground ml-6">
                      {t('support.business_hours_only_help', 'SLA timers only count during business hours (9 AM - 5 PM)')}
                    </p>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="exclude_weekends"
                        checked={data.exclude_weekends}
                        onCheckedChange={(checked) => setData('exclude_weekends', !!checked)}
                      />
                      <Label htmlFor="exclude_weekends" className="text-sm font-medium">
                        {t('support.exclude_weekends', 'Exclude Weekends')}
                      </Label>
                    </div>
                    <p className="text-sm text-muted-foreground ml-6">
                      {t('support.exclude_weekends_help', 'SLA timers pause during weekends')}
                    </p>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="exclude_holidays"
                        checked={data.exclude_holidays}
                        onCheckedChange={(checked) => setData('exclude_holidays', !!checked)}
                      />
                      <Label htmlFor="exclude_holidays" className="text-sm font-medium">
                        {t('support.exclude_holidays', 'Exclude Holidays')}
                      </Label>
                    </div>
                    <p className="text-sm text-muted-foreground ml-6">
                      {t('support.exclude_holidays_help', 'SLA timers pause during company holidays')}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Status */}
              <Card>
                <CardHeader>
                  <CardTitle>{t('support.status', 'Status')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="is_active"
                      checked={data.is_active}
                      onCheckedChange={(checked) => setData('is_active', !!checked)}
                    />
                    <Label htmlFor="is_active" className="text-sm font-medium">
                      {t('support.active_sla', 'Active SLA Policy')}
                    </Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {t('support.active_sla_help', 'Only active SLA policies can be assigned to tickets')}
                  </p>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="is_default"
                      checked={data.is_default}
                      onCheckedChange={(checked) => setData('is_default', !!checked)}
                    />
                    <Label htmlFor="is_default" className="text-sm font-medium">
                      {t('support.default_sla', 'Default SLA Policy')}
                    </Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {t('support.default_sla_help', 'Automatically applied to new tickets without a specific SLA')}
                  </p>
                </CardContent>
              </Card>

              {/* Actions */}
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <Button type="submit" className="w-full" disabled={processing}>
                      <Save className="h-4 w-4 mr-2" />
                      {processing ? t('common.creating', 'Creating...') : t('support.create_sla', 'Create SLA Policy')}
                    </Button>
                    
                    <Button type="button" variant="outline" className="w-full" asChild>
                      <a href={route('support.sla.index')}>
                        {t('common.cancel', 'Cancel')}
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Help */}
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {t('support.sla_help', 'SLA policies define service commitments and help track performance against targets.')}
                </AlertDescription>
              </Alert>
            </div>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
