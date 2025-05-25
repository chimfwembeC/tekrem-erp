import { Link, useForm, Head } from '@inertiajs/react';
import React from 'react';
import useRoute from '@/Hooks/useRoute';
import { AuthCard, AuthButton, LinkButton } from '@/Components/Auth';
import { Mail, UserCog, LogOut } from 'lucide-react';

interface Props {
  status: string;
}

export default function VerifyEmail({ status }: Props) {
  const route = useRoute();
  const form = useForm({});
  const verificationLinkSent = status === 'verification-link-sent';

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    form.post(route('verification.send'));
  }

  return (
    <AuthCard
      title="Email Verification"
      description="Please verify your email address to continue."
    >
      <Head title="Email Verification" />

      <div className="mb-6 flex items-center gap-2 p-4 text-sm border rounded bg-blue-50 text-blue-700 border-blue-200">
        <Mail className="h-5 w-5 flex-shrink-0" />
        <span>
          Before continuing, could you verify your email address by clicking on
          the link we just emailed to you? If you didn't receive the email, we
          will gladly send you another.
        </span>
      </div>

      {verificationLinkSent && (
        <div className="mb-6 p-4 text-sm border rounded bg-green-50 text-green-600 border-green-200">
          A new verification link has been sent to the email address you
          provided during registration.
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-6">
        <AuthButton
          type="submit"
          isLoading={form.processing}
          loadingText="Sending..."
        >
          Resend Verification Email
        </AuthButton>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t">
          <LinkButton href={route('profile.show')} className="flex items-center gap-1">
            <UserCog className="h-4 w-4" />
            <span>Edit Profile</span>
          </LinkButton>

          <Link
            href={route('logout')}
            method="post"
            as="button"
            className="flex items-center gap-1 text-sm text-destructive hover:text-destructive/90"
          >
            <LogOut className="h-4 w-4" />
            <span>Log Out</span>
          </Link>
        </div>
      </form>
    </AuthCard>
  );
}
