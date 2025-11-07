import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { type SidebarProps } from '@/types/navigation';
import { filterNavigationByRole } from '@/utils/role';
import { cn } from '@/lib/utils';
import { Link, useMatches } from '@tanstack/react-router';
import { ChevronDown, ChevronUp, Menu, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import BottomNav from './bottom-nav';
import { useAuth } from '@/features/authentication/hooks/useAuth';
import { useTranslation } from 'react-i18next';

export function Sidebar({
  isInsideSheet = false,
  onCollapsedChange,
  defaultCollapsed = false,
}: SidebarProps) {
  const { t } = useTranslation('dashboard');
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const matches = useMatches();
  const { user } = useAuth();

  const userRole = user?.role || 'user';

  const filteredNavigation = useMemo(() => {
    const base = filterNavigationByRole(userRole);
    return base.map((group) => ({
      ...group,
      items: userRole === 'superuser' 
        ? group.items 
        : group.items.filter((item) => item.path !== '/users'),
    }));
  }, [userRole]);

  const toggleCollapsed = () => {
    const newState = !collapsed;
    setCollapsed(newState);
    onCollapsedChange?.(newState);
  };

  const isActive = (path: string) => matches.some((match) => match.pathname.startsWith(path));
  const toggleExpanded = (path: string) =>
    setExpandedItems((prev) =>
      prev.includes(path) ? prev.filter((p) => p !== path) : [...prev, path],
    );

  useEffect(() => {
    if (isInsideSheet && collapsed) setCollapsed(false);
  }, [isInsideSheet, collapsed]);

  useEffect(() => {
    const currentPath = matches[matches.length - 1]?.pathname;
    if (!currentPath) return;
    filteredNavigation.forEach((group) => {
      group.items.forEach((item) => {
        if (item.children?.some((child) => currentPath.startsWith(child.path))) {
          setExpandedItems((prev) => (prev.includes(item.path) ? prev : [...prev, item.path]));
        }
      });
    });
  }, [matches, filteredNavigation]);

  const getGroupLabel = (groupName?: string, groupNameKey?: string) =>
    groupNameKey ? t(groupNameKey, { defaultValue: groupName }) : groupName;

  const getItemLabel = (title: string, titleKey?: string) =>
    titleKey ? t(titleKey, { defaultValue: title }) : title;

  // CONDITIONAL RETURNS ONLY AFTER ALL HOOKS ARE CALLED
  if (typeof window !== 'undefined' && window.innerWidth < 768) {
    return <BottomNav />;
  }

  if (filteredNavigation.length === 0) {
    return (
      <div
        className={cn(
          'h-screen transition-all duration-300 bg-gradient-to-b from-background to-background/95 text-foreground flex flex-col border-r border-border/40 shadow-sm',
          isInsideSheet ? 'w-full' : 'w-64',
        )}
      >
        <div className={cn('flex items-center', collapsed && !isInsideSheet && 'hidden')}>
          <img
            src="/images/simonair.png"
            alt="Simonair"
            className="h-15 w-15 object-contain mr-2"
          />
        </div>
        <div className="flex flex-1 items-center justify-center p-4 text-center">
          <p className="text-muted-foreground">{t('sidebar.empty')}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'h-screen transition-all duration-300 bg-gradient-to-b from-background to-background/95 text-foreground flex flex-col border-r border-border/40 shadow-sm',
        isInsideSheet ? 'w-full' : collapsed ? 'w-16' : 'w-64',
      )}
    >
      <div className="flex items-center justify-between p-5 border-b border-border bg-background/70 backdrop-blur">
        <div className={cn('flex items-center', collapsed && !isInsideSheet && 'hidden')}>
          <img
            src="/images/simonair.png"
            alt="Simonair"
            className="h-14 w-18 object-contain mr-2"
          />
        </div>
        {!isInsideSheet && (
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleCollapsed}
            className="text-primary hover:text-accent/90 hover:bg-accent/10 transition-colors"
          >
            {collapsed ? <Menu className="h-5 w-5" /> : <X className="h-5 w-5" />}
          </Button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto py-4 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
        <TooltipProvider delayDuration={200}>
          {filteredNavigation.map((group, index) => (
            <div key={index} className="mb-6">
              {(group.groupName || group.groupNameKey) && (!collapsed || isInsideSheet) && (
                <h2 className="px-4 mb-2 text-xs uppercase font-semibold tracking-wider text-muted-foreground/80">
                  {getGroupLabel(group.groupName, group.groupNameKey)}
                </h2>
              )}
              <div className="space-y-1 px-2">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const itemLabel = getItemLabel(item.title, item.titleKey);
                  const isItemExpanded = expandedItems.includes(item.path);

                  return (
                    <div key={item.path}>
                      {item.children && item.children.length > 0 ? (
                        <Collapsible open={isItemExpanded}>
                          <CollapsibleTrigger asChild>
                            {collapsed && !isInsideSheet ? (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    className={cn(
                                      'w-full flex items-center justify-center px-3 py-2 rounded-md transition-all duration-200',
                                      isActive(item.path)
                                        ? 'bg-primary/10 text-primary shadow-sm'
                                        : 'hover:bg-secondary/40 hover:text-foreground',
                                    )}
                                    onClick={() => toggleExpanded(item.path)}
                                  >
                                    {Icon && <Icon className="h-5 w-5" />}
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent side="right" className="font-medium">
                                  {itemLabel}
                                </TooltipContent>
                              </Tooltip>
                            ) : (
                              <Button
                                variant="ghost"
                                className={cn(
                                  'w-full flex items-center justify-between px-3 py-2 rounded-md transition-all duration-200',
                                  isActive(item.path)
                                    ? 'bg-primary/10 text-primary shadow-sm font-medium'
                                    : 'hover:bg-secondary/40 hover:text-foreground text-muted-foreground',
                                )}
                                onClick={() => toggleExpanded(item.path)}
                              >
                                <div className="flex items-center">
                                  {Icon && <Icon className="mr-3 h-5 w-5" />}
                                  <span className="font-medium">{itemLabel}</span>
                                </div>
                                {isItemExpanded ? (
                                  <ChevronUp className="h-4 w-4 opacity-70" />
                                ) : (
                                  <ChevronDown className="h-4 w-4 opacity-70" />
                                )}
                              </Button>
                            )}
                          </CollapsibleTrigger>
                          <CollapsibleContent
                            className={cn('space-y-1 pt-1', collapsed ? 'pl-2' : 'pl-9')}
                          >
                            {item.children.map((child) => {
                              const ChildIcon = child.icon;
                              const childLabel = getItemLabel(child.title, child.titleKey);
                              return collapsed && !isInsideSheet ? (
                                <Tooltip key={child.path}>
                                  <TooltipTrigger asChild>
                                    <Link
                                      to={child.path}
                                      className={cn(
                                        'flex items-center justify-center h-9 px-3 py-2 rounded-md transition-all duration-200',
                                        isActive(child.path)
                                          ? 'bg-primary/15 text-primary shadow-sm'
                                          : 'hover:bg-secondary/40 text-muted-foreground hover:text-foreground',
                                      )}
                                      aria-label={childLabel}
                                    >
                                      {ChildIcon && <ChildIcon className="h-4 w-4" />}
                                    </Link>
                                  </TooltipTrigger>
                                  <TooltipContent side="right" className="font-medium">
                                    {childLabel}
                                  </TooltipContent>
                                </Tooltip>
                              ) : (
                                <Link
                                  key={child.path}
                                  to={child.path}
                                  className={cn(
                                    'flex items-center h-9 px-3 py-2 rounded-md transition-all duration-200',
                                    isActive(child.path)
                                      ? 'bg-primary/15 text-primary shadow-sm font-medium'
                                      : 'hover:bg-secondary/40 text-muted-foreground hover:text-foreground',
                                  )}
                                >
                                  {ChildIcon && <ChildIcon className="mr-3 h-4 w-4" />}
                                  <span>{childLabel}</span>
                                </Link>
                              );
                            })}
                          </CollapsibleContent>
                        </Collapsible>
                      ) : (
                        <>
                          {collapsed && !isInsideSheet ? (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Link
                                  to={item.path}
                                  className={cn(
                                    'flex items-center justify-center px-3 py-2 rounded-md transition-all duration-200',
                                    isActive(item.path)
                                      ? 'bg-primary/10 text-primary shadow-sm'
                                      : 'hover:bg-secondary/40 text-muted-foreground hover:text-foreground',
                                  )}
                                >
                                  {Icon && <Icon className="h-5 w-5" />}
                                </Link>
                              </TooltipTrigger>
                              <TooltipContent side="right" className="font-medium">
                                {itemLabel}
                              </TooltipContent>
                            </Tooltip>
                          ) : (
                            <Link
                              to={item.path}
                              className={cn(
                                'flex items-center px-3 py-2 rounded-md transition-all duration-200',
                                isActive(item.path)
                                  ? 'bg-primary/10 text-primary shadow-sm'
                                  : 'hover:bg-secondary/40 text-muted-foreground hover:text-foreground',
                              )}
                              >
                                {Icon && <Icon className="mr-3 h-5 w-5" />}
                                <span className="font-medium">{itemLabel}</span>
                              </Link>
                            )}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </TooltipProvider>
      </nav>
      {(!collapsed || isInsideSheet) && (
        <div className="p-4 border-t border-border/40 text-xs text-muted-foreground bg-background/80 backdrop-blur">
          <div className="font-medium">
            © {new Date().getFullYear()} Simonair. All rights reserved.
          </div>
        </div>
      )}
    </div>
  );
}

export default Sidebar;
