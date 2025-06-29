import { Link, useForm, Head } from '@inertiajs/react';
import React, { useState } from 'react';
import useRoute from '@/Hooks/useRoute';
import useTypedPage from '@/Hooks/useTypedPage';
import { AuthCard, FormInput, FormCheckbox, AuthButton, LinkButton } from '@/Components/Auth';
import ReCaptcha from '@/Components/ReCaptcha';

export default function Register() {
  const page = useTypedPage();
  const route = useRoute();
  const [recaptchaToken, setRecaptchaToken] = useState<string>('');
  const recaptcha = page.props.recaptcha;
  const form = useForm({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    terms: false,
    recaptcha_token: '',
  });

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Set reCAPTCHA token if enabled
    if (recaptcha?.enabled && recaptchaToken) {
      form.setData('recaptcha_token', recaptchaToken);
    }

    form.post(route('register'), {
      onFinish: () => {
        form.reset('password', 'password_confirmation');
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
    <AuthCard title="Register" description="Create a new account to get started.">
      <Head title="Register" />

      <form onSubmit={onSubmit} className="space-y-4">
        <FormInput
          label="Name"
          id="name"
          type="text"
          value={form.data.name}
          onChange={e => form.setData('name', e.currentTarget.value)}
          error={form.errors.name}
          required
          autoFocus
          autoComplete="name"
        />

        <FormInput
          label="Email"
          id="email"
          type="email"
          value={form.data.email}
          onChange={e => form.setData('email', e.currentTarget.value)}
          error={form.errors.email}
          required
        />

        <FormInput
          label="Password"
          id="password"
          type="password"
          value={form.data.password}
          onChange={e => form.setData('password', e.currentTarget.value)}
          error={form.errors.password}
          required
          autoComplete="new-password"
        />

        <FormInput
          label="Confirm Password"
          id="password_confirmation"
          type="password"
          value={form.data.password_confirmation}
          onChange={e => form.setData('password_confirmation', e.currentTarget.value)}
          error={form.errors.password_confirmation}
          required
          autoComplete="new-password"
        />

        {page.props.jetstream.hasTermsAndPrivacyPolicyFeature && (
          <div className="space-y-2">
            <FormCheckbox
              id="terms"
              name="terms"
              checked={form.data.terms}
              onChange={(checked) => form.setData('terms', checked)}
              required
              label={
                <span className="text-sm text-muted-foreground">
                  I agree to the{' '}
                  <Link
                    target="_blank"
                    href={route('terms.show')}
                    className="text-primary underline underline-offset-4 hover:text-primary/90"
                  >
                    Terms of Service
                  </Link>
                  {' '}and{' '}
                  <Link
                    target="_blank"
                    href={route('policy.show')}
                    className="text-primary underline underline-offset-4 hover:text-primary/90"
                  >
                    Privacy Policy
                  </Link>
                </span>
              }
            />
            {form.errors.terms && (
              <p className="text-sm font-medium text-destructive">{form.errors.terms}</p>
            )}
          </div>
        )}

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

        <div className="flex flex-col space-y-4 pt-2">
          <AuthButton
            type="submit"
            isLoading={form.processing}
            loadingText="Registering..."
          >
            Register
          </AuthButton>

          <div className="text-center">
            <LinkButton href={route('login')}>
              Already have an account? Sign in
            </LinkButton>
          </div>
        </div>
      </form>
    </AuthCard>
  );
}
