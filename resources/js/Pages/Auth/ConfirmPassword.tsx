import { useForm, Head } from '@inertiajs/react';
import React from 'react';
import useRoute from '@/Hooks/useRoute';
import { AuthCard, FormInput, AuthButton } from '@/Components/Auth';
import { ShieldCheck } from 'lucide-react';

export default function ConfirmPassword() {
  const route = useRoute();
  const form = useForm({
    password: '',
  });

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    form.post(route('password.confirm'), {
      onFinish: () => form.reset(),
    });
  }

  return (
    <AuthCard
      title="Secure Area"
      description="Please confirm your password to continue."
    >
      <Head title="Secure Area" />

      <div className="mb-6 flex items-center gap-2 p-4 text-sm border rounded bg-amber-50 text-amber-700 border-amber-200">
        <ShieldCheck className="h-5 w-5 flex-shrink-0" />
        <span>
          This is a secure area of the application. Please confirm your password
          before continuing.
        </span>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <FormInput
          label="Password"
          id="password"
          type="password"
          value={form.data.password}
          onChange={e => form.setData('password', e.currentTarget.value)}
          error={form.errors.password}
          required
          autoComplete="current-password"
          autoFocus
        />

        <div className="flex justify-end pt-2">
          <AuthButton
            type="submit"
            isLoading={form.processing}
            loadingText="Confirming..."
          >
            Confirm
          </AuthButton>
        </div>
      </form>
    </AuthCard>
  );
}
