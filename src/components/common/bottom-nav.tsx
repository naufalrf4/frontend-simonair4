import { Link, useMatches } from '@tanstack/react-router';
import { useMemo, useState, useEffect } from 'react';
import { filterNavigationByRole } from '@/utils/role';
import { cn } from '@/lib/utils';
import { useAuth } from '@/features/authentication/hooks/useAuth';

export function BottomNav() {
  const matches = useMatches();
  const { user } = useAuth();
  const userRole = user?.role || 'user';
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const filteredNavigation = useMemo(() => {
    return filterNavigationByRole(userRole).flatMap((group) => group.items);
  }, [userRole]);

  // Scroll behavior
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY + 10) {
        // Scrolling down - hide the navigation
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY - 5) {
        // Scrolling up - show the navigation
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // HELPER FUNCTIONS AFTER HOOKS
  const isActive = (path: string) =>
    matches.some((match) => match.pathname === path);

  // RENDER - NO EARLY RETURNS IN THIS COMPONENT
  return (
    <nav className={cn(
      "fixed bottom-0 left-0 w-full z-50 bg-gradient-to-t from-background/95 to-background/80 border-t border-border flex justify-around shadow-2xl md:hidden backdrop-blur-lg transition-all duration-200",
      isVisible ? "translate-y-0" : "translate-y-full"
    )}>
      {filteredNavigation.map((item) => {
        const active = isActive(item.path);
        const Icon = item.icon;
        
        return (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              'flex flex-col items-center justify-center flex-1 py-2 px-1 transition-all duration-150 relative group',
              active
                ? 'text-primary font-semibold'
                : 'text-muted-foreground hover:text-primary'
            )}
            aria-label={item.title}
          >
            <span
              className={cn(
                'flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200',
                active
                  ? 'bg-primary/10 shadow-md ring-2 ring-primary/80 text-primary'
                  : 'bg-transparent hover:bg-primary/5'
              )}
            >
              {Icon && (
                <Icon
                  className={cn(
                    'w-6 h-6',
                    active
                      ? 'text-primary drop-shadow'
                      : 'text-muted-foreground group-hover:text-primary'
                  )}
                />
              )}
            </span>
            <span
              className={cn(
                'text-xs font-medium mt-1 transition-colors duration-150 tracking-wide',
                active ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'
              )}
            >
              {item.title}
            </span>
            {active && (
              <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-primary shadow" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}

export default BottomNav;
