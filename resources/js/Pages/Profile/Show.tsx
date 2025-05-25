import React from 'react';
import DeleteUserForm from '@/Pages/Profile/Partials/DeleteUserForm';
import LogoutOtherBrowserSessions from '@/Pages/Profile/Partials/LogoutOtherBrowserSessionsForm';
import TwoFactorAuthenticationForm from '@/Pages/Profile/Partials/TwoFactorAuthenticationForm';
import UpdatePasswordForm from '@/Pages/Profile/Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from '@/Pages/Profile/Partials/UpdateProfileInformationForm';
import NotificationSettings from '@/Pages/Profile/Partials/NotificationSettings';
import useTypedPage from '@/Hooks/useTypedPage';
import { SectionBorder } from '@/Components/Profile';
import AppLayout from '@/Layouts/AppLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { User, Bell } from 'lucide-react';
import { Session } from '@/types';

interface NotificationPreferences {
  email_notifications: boolean;
  push_notifications: boolean;
  sms_notifications: boolean;
  security_alerts: boolean;
  chat_notifications: boolean;
  task_reminders: boolean;
  calendar_reminders: boolean;
  marketing_emails: boolean;
  lead_notifications: boolean;
  client_notifications: boolean;
  communication_notifications: boolean;
  frequency: string;
  quiet_hours_enabled: boolean;
  quiet_hours_start: string;
  quiet_hours_end: string;
}

interface Props {
  sessions: Session[];
  confirmsTwoFactorAuthentication: boolean;
  notificationPreferences?: NotificationPreferences;
}

export default function Show({
  sessions,
  confirmsTwoFactorAuthentication,
  notificationPreferences,
}: Props) {
  const page = useTypedPage();

  return (
    <AppLayout
      title={'Profile'}
      renderHeader={() => (
        <div className="flex items-center gap-2">
          <User className="h-6 w-6 text-gray-600 dark:text-gray-400" />
          <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            Profile Settings
          </h2>
        </div>
      )}
    >
      <div>
        <div className="max-w-7xl mx-auto py-10 sm:px-6 lg:px-8">
          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Notifications
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-6">
              {page.props.jetstream.canUpdateProfileInformation ? (
                <div>
                  <UpdateProfileInformationForm user={page.props.auth.user!} />
                  <SectionBorder />
                </div>
              ) : null}

              {page.props.jetstream.canUpdatePassword ? (
                <div className="mt-10 sm:mt-0">
                  <UpdatePasswordForm />
                  <SectionBorder />
                </div>
              ) : null}

              {page.props.jetstream.canManageTwoFactorAuthentication ? (
                <div className="mt-10 sm:mt-0">
                  <TwoFactorAuthenticationForm
                    requiresConfirmation={confirmsTwoFactorAuthentication}
                  />
                  <SectionBorder />
                </div>
              ) : null}

              <div className="mt-10 sm:mt-0">
                <LogoutOtherBrowserSessions sessions={sessions} />
              </div>

              {page.props.jetstream.hasAccountDeletionFeatures ? (
                <>
                  <SectionBorder />
                  <div className="mt-10 sm:mt-0">
                    <DeleteUserForm />
                  </div>
                </>
              ) : null}
            </TabsContent>

            <TabsContent value="notifications" className="space-y-6">
              <NotificationSettings preferences={notificationPreferences} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AppLayout>
  );
}
