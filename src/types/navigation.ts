import type { UserRole } from "@/features/users/types";

export interface SidebarProps {
  userRole?: UserRole;
  navigationItems?: NavigationGroup[];
  isInsideSheet?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  defaultCollapsed?: boolean;
}

export type NavigationItem = {
  title: string;
  titleKey?: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: UserRole[];
  children?: Array<Omit<NavigationItem, 'children'>>;
  exact?: boolean;
};

export type NavigationGroup = {
  groupName?: string;
  groupNameKey?: string;
  items: NavigationItem[];
};
