import { useForm } from '@inertiajs/react';
import React, { useRef } from 'react';
import useRoute from '@/Hooks/useRoute';
import { FormSection, ActionMessage, ProfileButton, ProfileInput } from '@/Components/Profile';

export default function UpdatePasswordForm() {
  const route = useRoute();
  const form = useForm({
    current_password: '',
    password: '',
    password_confirmation: '',
  });
  const passwordRef = useRef<HTMLInputElement>(null);
  const currentPasswordRef = useRef<HTMLInputElement>(null);

  function updatePassword() {
    form.put(route('user-password.update'), {
      errorBag: 'updatePassword',
      preserveScroll: true,
      onSuccess: () => form.reset(),
      onError: () => {
        if (form.errors.password) {
          form.reset('password', 'password_confirmation');
          passwordRef.current?.focus();
        }

        if (form.errors.current_password) {
          form.reset('current_password');
          currentPasswordRef.current?.focus();
        }
      },
    });
  }

  return (
    <FormSection
      onSubmit={updatePassword}
      title={'Update Password'}
      description={
        'Ensure your account is using a long, random password to stay secure.'
      }
      renderActions={() => (
        <>
          <ActionMessage on={form.recentlySuccessful} className="mr-3">
            Saved.
          </ActionMessage>

          <ProfileButton
            isLoading={form.processing}
            loadingText="Saving..."
          >
            Save
          </ProfileButton>
        </>
      )}
    >
      <div className="col-span-6 sm:col-span-4">
        <ProfileInput
          label="Current Password"
          id="current_password"
          type="password"
          ref={currentPasswordRef}
          value={form.data.current_password}
          onChange={e => form.setData('current_password', e.currentTarget.value)}
          error={form.errors.current_password}
          autoComplete="current-password"
        />
      </div>

      <div className="col-span-6 sm:col-span-4">
        <ProfileInput
          label="New Password"
          id="password"
          type="password"
          value={form.data.password}
          onChange={e => form.setData('password', e.currentTarget.value)}
          error={form.errors.password}
          autoComplete="new-password"
          ref={passwordRef}
        />
      </div>

      <div className="col-span-6 sm:col-span-4">
        <ProfileInput
          label="Confirm Password"
          id="password_confirmation"
          type="password"
          value={form.data.password_confirmation}
          onChange={e => form.setData('password_confirmation', e.currentTarget.value)}
          error={form.errors.password_confirmation}
          autoComplete="new-password"
        />
      </div>
    </FormSection>
  );
}
