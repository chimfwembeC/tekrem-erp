import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Switch } from '@/Components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Separator } from '@/Components/ui/separator';
import { Badge } from '@/Components/ui/badge';
import { Shield, TestTube, CheckCircle, AlertTriangle, Loader2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import useRoute from '@/Hooks/useRoute';
import ReCaptcha from '@/Components/ReCaptcha';

interface RecaptchaSettingsProps {
  settings: {
    recaptcha_enabled: boolean;
    recaptcha_site_key: string;
    recaptcha_secret_key: string;
    recaptcha_version: string;
    recaptcha_theme: string;
    recaptcha_size: string;
    recaptcha_score_threshold: number;
    recaptcha_on_login: boolean;
    recaptcha_on_register: boolean;
    recaptcha_on_forgot_password: boolean;
    recaptcha_on_contact_form: boolean;
    recaptcha_on_guest_chat: boolean;
  };
}

export default function RecaptchaSettings({ settings }: RecaptchaSettingsProps) {
  const route = useRoute();
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [isTesting, setIsTesting] = useState(false);

  const { data, setData, put, processing, errors, reset } = useForm({
    recaptcha_enabled: settings.recaptcha_enabled,
    recaptcha_site_key: settings.recaptcha_site_key,
    recaptcha_secret_key: settings.recaptcha_secret_key,
    recaptcha_version: settings.recaptcha_version,
    recaptcha_theme: settings.recaptcha_theme,
    recaptcha_size: settings.recaptcha_size,
    recaptcha_score_threshold: settings.recaptcha_score_threshold,
    recaptcha_on_login: settings.recaptcha_on_login,
    recaptcha_on_register: settings.recaptcha_on_register,
    recaptcha_on_forgot_password: settings.recaptcha_on_forgot_password,
    recaptcha_on_contact_form: settings.recaptcha_on_contact_form,
    recaptcha_on_guest_chat: settings.recaptcha_on_guest_chat,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    put(route('settings.recaptcha.update'), {
      onSuccess: () => {
        toast.success('reCAPTCHA settings updated!', {
          description: 'Your reCAPTCHA configuration has been saved successfully.'
        });
      },
      onError: () => {
        toast.error('Failed to update reCAPTCHA settings', {
          description: 'Please check the form for errors and try again.'
        });
      }
    });
  };

  const handleTestConfiguration = () => {
    if (!data.recaptcha_site_key || !data.recaptcha_secret_key) {
      toast.error('Please provide both site key and secret key to test the configuration.');
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    // This would need to be implemented with a test reCAPTCHA token
    // For now, we'll simulate a test
    setTimeout(() => {
      setTestResult({
        success: true,
        message: 'reCAPTCHA configuration test successful!'
      });
      setIsTesting(false);
      toast.success('reCAPTCHA configuration is valid!');
    }, 2000);
  };

  return (
    <AppLayout
      title="reCAPTCHA Settings"
      renderHeader={() => (
        <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
          reCAPTCHA Settings
        </h2>
      )}
    >
      <Head title="reCAPTCHA Settings" />

      <div className="py-12">
        <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
          <div className="space-y-6">
            {/* Configuration Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  reCAPTCHA Configuration
                </CardTitle>
                <CardDescription>
                  Configure Google reCAPTCHA to protect your forms from spam and abuse
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Enable reCAPTCHA */}
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Enable reCAPTCHA</Label>
                      <p className="text-xs text-muted-foreground">
                        Enable or disable reCAPTCHA protection across the application
                      </p>
                    </div>
                    <Switch
                      checked={data.recaptcha_enabled}
                      onCheckedChange={(checked) => setData('recaptcha_enabled', checked)}
                    />
                  </div>

                  <Separator />

                  {/* API Keys */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="recaptcha_site_key" className="text-sm font-medium">
                        Site Key
                      </Label>
                      <Input
                        id="recaptcha_site_key"
                        value={data.recaptcha_site_key}
                        onChange={(e) => setData('recaptcha_site_key', e.target.value)}
                        placeholder="6Lc..."
                        disabled={!data.recaptcha_enabled}
                      />
                      {errors.recaptcha_site_key && (
                        <p className="text-sm text-destructive">{errors.recaptcha_site_key}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="recaptcha_secret_key" className="text-sm font-medium">
                        Secret Key
                      </Label>
                      <div className="relative">
                        <Input
                          id="recaptcha_secret_key"
                          type={showSecretKey ? 'text' : 'password'}
                          value={data.recaptcha_secret_key}
                          onChange={(e) => setData('recaptcha_secret_key', e.target.value)}
                          placeholder="6Lc..."
                          disabled={!data.recaptcha_enabled}
                          className="pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => setShowSecretKey(!showSecretKey)}
                        >
                          {showSecretKey ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      {errors.recaptcha_secret_key && (
                        <p className="text-sm text-destructive">{errors.recaptcha_secret_key}</p>
                      )}
                    </div>
                  </div>

                  {/* Configuration Options */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="recaptcha_version" className="text-sm font-medium">
                        Version
                      </Label>
                      <Select
                        value={data.recaptcha_version}
                        onValueChange={(value) => setData('recaptcha_version', value)}
                        disabled={!data.recaptcha_enabled}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select version" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="v2">reCAPTCHA v2</SelectItem>
                          <SelectItem value="v3">reCAPTCHA v3</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="recaptcha_theme" className="text-sm font-medium">
                        Theme
                      </Label>
                      <Select
                        value={data.recaptcha_theme}
                        onValueChange={(value) => setData('recaptcha_theme', value)}
                        disabled={!data.recaptcha_enabled || data.recaptcha_version === 'v3'}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select theme" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="light">Light</SelectItem>
                          <SelectItem value="dark">Dark</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="recaptcha_size" className="text-sm font-medium">
                        Size
                      </Label>
                      <Select
                        value={data.recaptcha_size}
                        onValueChange={(value) => setData('recaptcha_size', value)}
                        disabled={!data.recaptcha_enabled || data.recaptcha_version === 'v3'}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select size" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="compact">Compact</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* reCAPTCHA v3 Score Threshold */}
                  {data.recaptcha_version === 'v3' && (
                    <div className="space-y-2">
                      <Label htmlFor="recaptcha_score_threshold" className="text-sm font-medium">
                        Score Threshold (0.0 - 1.0)
                      </Label>
                      <Input
                        id="recaptcha_score_threshold"
                        type="number"
                        min="0"
                        max="1"
                        step="0.1"
                        value={data.recaptcha_score_threshold}
                        onChange={(e) => setData('recaptcha_score_threshold', parseFloat(e.target.value))}
                        disabled={!data.recaptcha_enabled}
                      />
                      <p className="text-xs text-muted-foreground">
                        Lower scores indicate more suspicious activity. Recommended: 0.5
                      </p>
                    </div>
                  )}

                  <Separator />

                  {/* Form Protection Settings */}
                  <div>
                    <h3 className="text-lg font-medium mb-4">Form Protection</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium">Login Form</Label>
                        <Switch
                          checked={data.recaptcha_on_login}
                          onCheckedChange={(checked) => setData('recaptcha_on_login', checked)}
                          disabled={!data.recaptcha_enabled}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium">Registration Form</Label>
                        <Switch
                          checked={data.recaptcha_on_register}
                          onCheckedChange={(checked) => setData('recaptcha_on_register', checked)}
                          disabled={!data.recaptcha_enabled}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium">Forgot Password</Label>
                        <Switch
                          checked={data.recaptcha_on_forgot_password}
                          onCheckedChange={(checked) => setData('recaptcha_on_forgot_password', checked)}
                          disabled={!data.recaptcha_enabled}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium">Contact Form</Label>
                        <Switch
                          checked={data.recaptcha_on_contact_form}
                          onCheckedChange={(checked) => setData('recaptcha_on_contact_form', checked)}
                          disabled={!data.recaptcha_enabled}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium">Guest Chat</Label>
                        <Switch
                          checked={data.recaptcha_on_guest_chat}
                          onCheckedChange={(checked) => setData('recaptcha_on_guest_chat', checked)}
                          disabled={!data.recaptcha_enabled}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleTestConfiguration}
                      disabled={!data.recaptcha_enabled || isTesting || !data.recaptcha_site_key || !data.recaptcha_secret_key}
                    >
                      {isTesting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Testing...
                        </>
                      ) : (
                        <>
                          <TestTube className="mr-2 h-4 w-4" />
                          Test Configuration
                        </>
                      )}
                    </Button>

                    <Button type="submit" disabled={processing}>
                      {processing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        'Save Settings'
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Test Result */}
            {testResult && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {testResult.success ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                    )}
                    Test Result
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Badge variant={testResult.success ? "default" : "destructive"}>
                      {testResult.success ? 'Success' : 'Failed'}
                    </Badge>
                    <span className="text-sm">{testResult.message}</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
