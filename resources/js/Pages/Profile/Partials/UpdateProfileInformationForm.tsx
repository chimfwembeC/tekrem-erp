import { router } from '@inertiajs/core';
import { Link, useForm } from '@inertiajs/react';
import React, { useRef, useState } from 'react';
import useRoute from '@/Hooks/useRoute';
import { FormSection, ActionMessage, ProfileButton, ProfileInput } from '@/Components/Profile';
import { Button } from '@/Components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/Components/ui/avatar';
import { User } from '@/types';
import useTypedPage from '@/Hooks/useTypedPage';

interface Props {
  user: User;
}

export default function UpdateProfileInformationForm({ user }: Props) {
  const form = useForm({
    _method: 'PUT',
    name: user.name,
    email: user.email,
    photo: null as File | null,
  });
  const route = useRoute();
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const photoRef = useRef<HTMLInputElement>(null);
  const page = useTypedPage();
  const [verificationLinkSent, setVerificationLinkSent] = useState(false);

  function updateProfileInformation() {
    form.post(route('user-profile-information.update'), {
      errorBag: 'updateProfileInformation',
      preserveScroll: true,
      onSuccess: () => clearPhotoFileInput(),
    });
  }

  function selectNewPhoto() {
    photoRef.current?.click();
  }

  function updatePhotoPreview() {
    const photo = photoRef.current?.files?.[0];

    if (!photo) {
      return;
    }

    form.setData('photo', photo);

    const reader = new FileReader();

    reader.onload = e => {
      setPhotoPreview(e.target?.result as string);
    };

    reader.readAsDataURL(photo);
  }

  function deletePhoto() {
    router.delete(route('current-user-photo.destroy'), {
      preserveScroll: true,
      onSuccess: () => {
        setPhotoPreview(null);
        clearPhotoFileInput();
      },
    });
  }

  function clearPhotoFileInput() {
    if (photoRef.current?.value) {
      photoRef.current.value = '';
      form.setData('photo', null);
    }
  }

  return (
    <FormSection
      onSubmit={updateProfileInformation}
      title={'Profile Information'}
      description={`Update your account's profile information and email address.`}
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
      {/* <!-- Profile Photo --> */}
      {page.props.jetstream.managesProfilePhotos ? (
        <div className="col-span-6 sm:col-span-4">
          {/* <!-- Profile Photo File Input --> */}
          <input
            type="file"
            className="hidden"
            ref={photoRef}
            onChange={updatePhotoPreview}
          />

          <div className="space-y-2">
            <label className="text-sm font-medium">Photo</label>

            {photoPreview ? (
              // <!-- New Profile Photo Preview -->
              <div className="mt-2">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={photoPreview} alt={user.name} />
                  <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
              </div>
            ) : (
              // <!-- Current Profile Photo -->
              <div className="mt-2">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={user.profile_photo_url} alt={user.name} />
                  <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
              </div>
            )}

            <div className="flex gap-2 mt-2">
              <Button
                variant="outline"
                type="button"
                onClick={selectNewPhoto}
              >
                Select A New Photo
              </Button>

              {user.profile_photo_path && (
                <Button
                  variant="outline"
                  type="button"
                  onClick={deletePhoto}
                >
                  Remove Photo
                </Button>
              )}
            </div>

            {form.errors.photo && (
              <p className="text-sm font-medium text-destructive">{form.errors.photo}</p>
            )}
          </div>
        </div>
      ) : null}

      {/* <!-- Name --> */}
      <div className="col-span-6 sm:col-span-4">
        <ProfileInput
          label="Name"
          id="name"
          type="text"
          value={form.data.name}
          onChange={e => form.setData('name', e.currentTarget.value)}
          error={form.errors.name}
          autoComplete="name"
        />
      </div>

      {/* <!-- Email --> */}
      <div className="col-span-6 sm:col-span-4">
        <ProfileInput
          label="Email"
          id="email"
          type="email"
          value={form.data.email}
          onChange={e => form.setData('email', e.currentTarget.value)}
          error={form.errors.email}
        />

        {page.props.jetstream.hasEmailVerification &&
        user.email_verified_at === null ? (
          <div className="mt-2">
            <p className="text-sm text-muted-foreground">
              Your email address is unverified.{' '}
              <Link
                href={route('verification.send')}
                method="post"
                as="button"
                className="text-primary underline underline-offset-4 hover:text-primary/90"
                onClick={e => {
                  e.preventDefault();
                  setVerificationLinkSent(true);
                }}
              >
                Click here to re-send the verification email.
              </Link>
            </p>
            {verificationLinkSent && (
              <div className="mt-2 text-sm font-medium text-green-600">
                A new verification link has been sent to your email address.
              </div>
            )}
          </div>
        ) : null}
      </div>
    </FormSection>
  );
}
