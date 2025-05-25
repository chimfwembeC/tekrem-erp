import { Link, useForm, Head } from '@inertiajs/react';
import React from 'react';
import useRoute from '@/Hooks/useRoute';
import { AuthCard, FormInput, FormCheckbox, AuthButton, LinkButton } from '@/Components/Auth';

interface Props {
  canResetPassword: boolean;
  status: string;
}

export default function Login({ canResetPassword, status }: Props) {
  const route = useRoute();
  const form = useForm({
    email: '',
    password: '',
    remember: false,
  });

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    form.post(route('login'), {
      onFinish: () => form.reset('password'),
    });
  }

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
