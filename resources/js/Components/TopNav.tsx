import React from 'react';
import { Link } from '@inertiajs/react';
import { router } from '@inertiajs/core';
import { 
  User, 
  Settings, 
  LogOut, 
  Globe, 
  Check, 
  ChevronDown,
  Bell
} from 'lucide-react';
import { Button } from '@/Components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '@/Components/ui/dropdown-menu';
import useRoute from '@/Hooks/useRoute';
import useTranslate from '@/Hooks/useTranslate';
import useTypedPage from '@/Hooks/useTypedPage';
import { ThemeToggle } from '@/Components/ThemeProvider';
import { Team } from '@/types';
import NotificationComponent from '@/Components/NotificationComponent';

interface TopNavProps {
  settings: Record<string, any>;
}

export default function TopNav({ settings }: TopNavProps) {
  const route = useRoute();
  const { t } = useTranslate();
  const page = useTypedPage();

  function switchToTeam(e: React.FormEvent, team: Team) {
    e.preventDefault();
    router.put(
      route('current-team.update'),
      {
        team_id: team.id,
      },
      {
        preserveState: false,
      },
    );
  }

  function logout(e: React.FormEvent) {
    e.preventDefault();
    router.post(route('logout'));
  }

  
  return (
    <div className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 md:pl-[calc(256px+24px)]">
      {/* Page Title */}
      <div className="flex-1">
        <h1 className="text-lg font-semibold">{settings.site_name || 'TekRem ERP'}</h1>
      </div>

      {/* Right side items */}
      <div className="flex items-center gap-4">
        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Language Switcher */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="flex items-center gap-1">
              <Globe className="h-5 w-5" />
              <span className="sr-only">{t('common.language', 'Language')}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{t('common.language', 'Language')}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup
              value={useTranslate().currentLanguage}
              onValueChange={(value) => {
                const { i18n } = useTranslate();
                i18n.changeLanguage(value);
              }}
            >
              <DropdownMenuRadioItem value="en">
                <div className="flex items-center">
                  {useTranslate().currentLanguage === 'en' && (
                    <Check className="mr-2 h-4 w-4" />
                  )}
                  <span>English</span>
                </div>
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="bem">
                <div className="flex items-center">
                  {useTranslate().currentLanguage === 'bem' && (
                    <Check className="mr-2 h-4 w-4" />
                  )}
                  <span>Bemba</span>
                </div>
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Notifications */}
        <NotificationComponent />

        {/* Teams Dropdown */}
        {page.props.jetstream.hasTeamFeatures && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-1">
                {page.props.auth.user?.current_team?.name}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60">
              <DropdownMenuLabel>Manage Team</DropdownMenuLabel>

              {/* Team Settings */}
              <DropdownMenuItem asChild>
                <Link
                  href={route('teams.show', [
                    page.props.auth.user?.current_team!,
                  ])}
                >
                  Team Settings
                </Link>
              </DropdownMenuItem>

              {page.props.jetstream.canCreateTeams && (
                <DropdownMenuItem asChild>
                  <Link href={route('teams.create')}>
                    Create New Team
                  </Link>
                </DropdownMenuItem>
              )}

              <DropdownMenuSeparator />

              <DropdownMenuLabel>Switch Teams</DropdownMenuLabel>

              {page.props.auth.user?.all_teams?.map(team => (
                <DropdownMenuItem key={team.id} asChild>
                  <button
                    className="w-full flex items-center"
                    onClick={e => switchToTeam(e, team)}
                  >
                    <div className="flex items-center">
                      {team.id == page.props.auth.user?.current_team_id && (
                        <Check className="mr-2 h-4 w-4 text-green-500" />
                      )}
                      <span>{team.name}</span>
                    </div>
                  </button>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* User Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            {page.props.jetstream.managesProfilePhotos ? (
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <img
                  className="h-8 w-8 rounded-full object-cover"
                  src={page.props.auth.user?.profile_photo_url}
                  alt={page.props.auth.user?.name}
                />
              </Button>
            ) : (
              <Button variant="ghost" className="flex items-center gap-1">
                {page.props.auth.user?.name}
                <ChevronDown className="h-4 w-4" />
              </Button>
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Manage Account</DropdownMenuLabel>

            <DropdownMenuItem asChild>
              <Link href={route('profile.show')} className="flex items-center">
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </Link>
            </DropdownMenuItem>

            {page.props.jetstream.hasApiFeatures && (
              <DropdownMenuItem asChild>
                <Link href={route('api-tokens.index')} className="flex items-center">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>API Tokens</span>
                </Link>
              </DropdownMenuItem>
            )}

            <DropdownMenuSeparator />

            <DropdownMenuItem asChild>
              <button
                className="w-full flex items-center"
                onClick={logout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log Out</span>
              </button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
