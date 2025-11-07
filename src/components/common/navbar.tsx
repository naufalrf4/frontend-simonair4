import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { roleConfigs } from '@/constants/navigation';
import { cn } from '@/lib/utils';
import { useMatches } from '@tanstack/react-router';
import { ChevronDown, LogOut, Settings, Loader2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Notifications } from './notification-bar';
import { filterNavigationByRole } from '@/utils/role';
import { useNavigate } from '@tanstack/react-router';
import type { UserRole } from '@/features/users/types';
import { useAuth } from '@/features/authentication/hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { LanguageToggle } from './language-toggle';

function getInitials(name?: string): string {
  if (!name) return 'U';
  return name
    .split(' ')
    .map((word) => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const matches = useMatches();
  const navigate = useNavigate();
  const { t } = useTranslation('common');

  const userRole = user?.role?.toLowerCase() as UserRole | undefined;
  const roleConfig = userRole ? roleConfigs[userRole] || { title: userRole } : { title: '' };
  const userName = user?.fullName || 'Unknown User';
  const userEmail = user?.email || '';

  const filteredNavigation = useMemo(() => {
    return filterNavigationByRole(userRole || 'user').flatMap((group) => group.items);
  }, [userRole]);

  const currentPath = matches[matches.length - 1]?.pathname || '/';
  const currentTitle = useMemo(() => {
    const item = filteredNavigation.find((nav) => nav.path === currentPath);
    return item?.title || t('navbar.currentTitleFallback');
  }, [currentPath, filteredNavigation, t]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate({ to: '/login', replace: true });
  };

  const userDropdown =
    isAuthenticated && user ? (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="relative pl-2 pr-0 hover:bg-primary/10 focus:bg-primary/10 transition-colors duration-200 group"
            disabled={!user}
          >
            <div className="relative">
              <Avatar className="h-10 w-10 mr-2 border border-border ring-2 ring-primary/20">
                <AvatarImage src="" alt={userName} />
                <AvatarFallback className="bg-primary/10 text-primary font-medium text-xl">
                  {getInitials(userName)}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="hidden md:flex flex-col items-start mr-2">
              <span className="text-sm font-medium leading-none text-foreground">{userName}</span>
              <span className="text-xs text-muted-foreground truncate max-w-[120px] group-hover:text-primary/80 transition-colors duration-200">
                {userEmail}
              </span>
            </div>
            <ChevronDown className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-all duration-200 group-data-[state=open]:rotate-180 group-data-[state=open]:text-primary" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-64" align="end">
          <DropdownMenuLabel className="p-4">
            <div className="flex flex-col space-y-2">
              <p className="text-sm font-semibold text-foreground">{userName}</p>
              <p className="text-xs text-muted-foreground">{userEmail}</p>
              <Badge
                variant="outline"
                className="mt-1 w-fit px-2.5 py-0.5 font-medium text-primary border-primary/20 bg-primary/10"
              >
                {typeof roleConfig === 'object' ? roleConfig.title : userRole}
              </Badge>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-border/60" />
          <DropdownMenuItem
            asChild
            className="flex items-center py-2.5 hover:bg-primary/10 focus:bg-primary/10 cursor-pointer transition-colors duration-200 rounded-md"
          >
            <div>
              <Settings className="mr-3 h-4 w-4" />
              <span className="font-medium">{t('navbar.settings')}</span>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={handleLogout}
            className="flex items-center py-2.5 text-destructive hover:text-destructive focus:text-destructive hover:bg-destructive/10 focus:bg-destructive/10 cursor-pointer transition-colors duration-200 rounded-md"
            disabled={!user}
          >
            {!user ? (
              <>
                <Loader2 className="mr-3 h-4 w-4 animate-spin" />
                <span className="font-medium">{t('navbar.loggingOut')}</span>
              </>
            ) : (
              <>
                <LogOut className="mr-3 h-4 w-4" />
                <span className="font-medium">{t('navbar.logout')}</span>
              </>
            )}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ) : null;

  return (
    <>
      {/* DESKTOP */}
      <header
        className={cn(
          'hidden md:flex sticky top-0 z-50 w-full px-4 lg:px-6 border-b border-border bg-background transition-all duration-200 min-h-[4.5rem]',
          scrolled ? 'shadow-sm bg-background/80 backdrop-blur-sm' : 'bg-background',
        )}
      >
        <div className="flex w-full items-center justify-between h-[4.5rem]">
          <div className="flex items-center gap-4">
            <span className="text-lg font-semibold text-primary">{currentTitle}</span>
          </div>
          <div className="flex items-center gap-4">
            <LanguageToggle />
            <Notifications />
            {userDropdown}
          </div>
        </div>
      </header>

      {/* MOBILE */}
      <header
        className={cn(
          'sticky top-0 z-30 flex md:hidden w-full px-5 py-3 transition-all duration-200',
          scrolled ? 'shadow-md bg-background/90 backdrop-blur-md' : 'bg-background',
        )}
      >
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-4">
            {userDropdown}
            <div className="flex flex-col justify-center">
              <span className="text-lg font-semibold text-primary">{currentTitle}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <Notifications />
          </div>
        </div>
      </header>
    </>
  );
}

export default Navbar;
