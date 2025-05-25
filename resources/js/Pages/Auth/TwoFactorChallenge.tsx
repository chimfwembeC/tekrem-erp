import { useForm, Head } from '@inertiajs/react';
import React, { useRef, useState } from 'react';
import useRoute from '@/Hooks/useRoute';
import { AuthCard, FormInput, AuthButton, LinkButton } from '@/Components/Auth';
import { KeyRound, Key } from 'lucide-react';

export default function TwoFactorChallenge() {
  const route = useRoute();
  const [recovery, setRecovery] = useState(false);
  const form = useForm({
    code: '',
    recovery_code: '',
  });
  const recoveryCodeRef = useRef<HTMLInputElement>(null);
  const codeRef = useRef<HTMLInputElement>(null);

  function toggleRecovery(e: React.FormEvent) {
    e.preventDefault();
    const isRecovery = !recovery;
    setRecovery(isRecovery);

    setTimeout(() => {
      if (isRecovery) {
        recoveryCodeRef.current?.focus();
        form.setData('code', '');
      } else {
        codeRef.current?.focus();
        form.setData('recovery_code', '');
      }
    }, 100);
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    form.post(route('two-factor.login'));
  }

  return (
    <AuthCard
      title="Two-Factor Authentication"
      description={recovery
        ? "Enter your emergency recovery code to continue."
        : "Enter the code from your authenticator app."}
    >
      <Head title="Two-Factor Confirmation" />

      <div className="mb-6 flex items-center gap-2 p-4 text-sm border rounded bg-blue-50 text-blue-700 border-blue-200">
        {recovery ? (
          <>
            <Key className="h-5 w-5 flex-shrink-0" />
            <span>
              Please confirm access to your account by entering one of your emergency recovery codes.
            </span>
          </>
        ) : (
          <>
            <KeyRound className="h-5 w-5 flex-shrink-0" />
            <span>
              Please confirm access to your account by entering the authentication code provided by your authenticator application.
            </span>
          </>
        )}
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        {recovery ? (
          <FormInput
            label="Recovery Code"
            id="recovery_code"
            type="text"
            value={form.data.recovery_code}
            onChange={e => form.setData('recovery_code', e.currentTarget.value)}
            error={form.errors.recovery_code}
            ref={recoveryCodeRef}
            autoComplete="one-time-code"
          />
        ) : (
          <FormInput
            label="Authentication Code"
            id="code"
            type="text"
            inputMode="numeric"
            value={form.data.code}
            onChange={e => form.setData('code', e.currentTarget.value)}
            error={form.errors.code}
            autoFocus
            autoComplete="one-time-code"
            ref={codeRef}
          />
        )}

        <div className="flex flex-col space-y-4 pt-2">
          <AuthButton
            type="submit"
            isLoading={form.processing}
            loadingText="Verifying..."
          >
            Verify and Log in
          </AuthButton>

          <div className="text-center">
            <button
              type="button"
              className="text-sm text-muted-foreground hover:text-primary underline underline-offset-4 transition-colors"
              onClick={toggleRecovery}
            >
              {recovery ? 'Use an authentication code' : 'Use a recovery code'}
            </button>
          </div>
        </div>
      </form>
    </AuthCard>
  );
}
