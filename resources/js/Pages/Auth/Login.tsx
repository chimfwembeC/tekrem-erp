import { Link, useForm, Head } from '@inertiajs/react';
import React, { useState } from 'react';
import useRoute from '@/Hooks/useRoute';
import useTypedPage from '@/Hooks/useTypedPage';
import { AuthCard, FormInput, FormCheckbox, AuthButton, LinkButton } from '@/Components/Auth';
import ReCaptcha from '@/Components/ReCaptcha';

interface Props {
  canResetPassword: boolean;
  status: string;
}

export default function Login({ canResetPassword, status }: Props) {
  const route = useRoute();
  const page = useTypedPage();
  const [recaptchaToken, setRecaptchaToken] = useState<string>('');
  const recaptcha = page.props.recaptcha;
  const form = useForm({
    email: '',
    password: '',
    remember: false,
    recaptcha_token: '',
  });

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Set reCAPTCHA token if enabled
    if (recaptcha?.enabled && recaptchaToken) {
      form.setData('recaptcha_token', recaptchaToken);
    }

    form.post(route('login'), {
      onFinish: () => {
        form.reset('password');
        setRecaptchaToken('');
      },
    });
  }

  const handleRecaptchaVerify = (token: string) => {
    setRecaptchaToken(token);
  };

  const handleRecaptchaExpired = () => {
    setRecaptchaToken('');
  };

  return (
    <AuthCard title="Login" description="Welcome back! Please sign in to your account.">
      <Head title="Login" />

      {status && (
        <div className="mb-4 p-4 text-sm border rounded bg-green-50 text-green-600 border-green-200">
          {status}
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        <FormInput
          label="Email"
          id="email"
          type="email"
          value={form.data.email}
          onChange={e => form.setData('email', e.currentTarget.value)}
          error={form.errors.email}
          required
          autoFocus
        />

        <FormInput
          label="Password"
          id="password"
          type="password"
          value={form.data.password}
          onChange={e => form.setData('password', e.currentTarget.value)}
          error={form.errors.password}
          required
          autoComplete="current-password"
        />

        <FormCheckbox
          label="Remember me"
          name="remember"
          checked={form.data.remember}
          onChange={(checked) => form.setData('remember', checked)}
        />

        {recaptcha?.enabled && (
          <ReCaptcha
            siteKey={recaptcha.site_key}
            theme={recaptcha.theme as 'light' | 'dark'}
            size={recaptcha.size as 'normal' | 'compact'}
            onVerify={handleRecaptchaVerify}
            onExpired={handleRecaptchaExpired}
            error={form.errors.recaptcha_token}
            label="Security Verification"
            required
          />
        )}

        <div className="flex flex-col space-y-4">
          <AuthButton
            type="submit"
            isLoading={form.processing}
            loadingText="Logging in..."
          >
            Log in
          </AuthButton>

          <div className="flex flex-col space-y-2 sm:flex-row sm:justify-between sm:space-y-0 text-center sm:text-left">
            {canResetPassword && (
              <LinkButton href={route('password.request')}>
                Forgot your password?
              </LinkButton>
            )}

            <LinkButton href={route('register')}>
              Need an account?
            </LinkButton>
          </div>
        </div>
      </form>
    </AuthCard>
  );
}
