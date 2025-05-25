import { useForm, Head } from '@inertiajs/react';
import React from 'react';
import useRoute from '@/Hooks/useRoute';
import { AuthCard, FormInput, AuthButton, LinkButton } from '@/Components/Auth';

interface Props {
  status: string;
}

export default function ForgotPassword({ status }: Props) {
  const route = useRoute();
  const form = useForm({
    email: '',
  });

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    form.post(route('password.email'));
  }

  return (
    <AuthCard
      title="Forgot Password"
      description="Enter your email to receive a password reset link."
    >
      <Head title="Forgot Password" />

      <div className="mb-6 text-sm text-muted-foreground">
        Forgot your password? No problem. Just let us know your email address
        and we will email you a password reset link that will allow you to
        choose a new one.
      </div>

      {status && (
        <div className="mb-6 p-4 text-sm border rounded bg-green-50 text-green-600 border-green-200">
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

        <div className="flex flex-col space-y-4 pt-2">
          <AuthButton
            type="submit"
            isLoading={form.processing}
            loadingText="Sending link..."
          >
            Email Password Reset Link
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
