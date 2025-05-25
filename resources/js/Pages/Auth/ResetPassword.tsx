import { useForm, Head } from '@inertiajs/react';
import React from 'react';
import useRoute from '@/Hooks/useRoute';
import { AuthCard, FormInput, AuthButton, LinkButton } from '@/Components/Auth';

interface Props {
  token: string;
  email: string;
}

export default function ResetPassword({ token, email }: Props) {
  const route = useRoute();
  const form = useForm({
    token,
    email,
    password: '',
    password_confirmation: '',
  });

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    form.post(route('password.update'), {
      onFinish: () => form.reset('password', 'password_confirmation'),
    });
  }

  return (
    <AuthCard
      title="Reset Password"
      description="Create a new secure password for your account."
    >
      <Head title="Reset Password" />

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

        <div className="flex flex-col space-y-4 pt-2">
          <AuthButton
            type="submit"
            isLoading={form.processing}
            loadingText="Resetting..."
          >
            Reset Password
          </AuthButton>

          <div className="text-center">
            <LinkButton href={route('login')}>
              Back to login
            </LinkButton>
          </div>
        </div>
      </form>
    </AuthCard>
  );
}
