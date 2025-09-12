import type { UserRole } from '@/features/users/types';
import { type NavigationGroup } from '@/types/navigation';
import {
  Home,
  Users,
  Wrench,
  Fish,
  Calendar,
  ChefHat,
  Thermometer,
  Database,
  AlertTriangle,
  LineChart,
} from 'lucide-react';

export const roleConfigs: Record<UserRole, { title: string }> = {
  superuser: { title: 'Superuser' },
  admin: { title: 'Administrator' },
  user: { title: 'User' },
};

export const defaultNavigation: NavigationGroup[] = [
  {
    items: [
      {
        title: 'Home',
        path: '/dashboard',
        icon: Home,
        roles: ['superuser', 'admin', 'user'],
        exact: true,
      },
    ],
  },
  {
    groupName: 'Devices',
    items: [
      {
        title: 'Devices',
        path: '/devices',
        icon: Thermometer,
        roles: ['superuser', 'admin', 'user'],
        children: [
          {
            title: 'Manage Devices',
            path: '/devices/manage',
            icon: Wrench,
            roles: ['superuser', 'admin', 'user'],
          },
          {
            title: 'Sensor Trends',
            path: '/devices/sensor-trends',
            icon: LineChart,
            roles: ['superuser', 'admin', 'user'],
          },
          {
            title: 'Sensor Table',
            path: '/devices/sensor-data',
            icon: Thermometer,
            roles: ['superuser', 'admin', 'user'],
          },
        ],
      },
    ],
  },
  {
    groupName: 'Farming Data',
    items: [
      {
        title: 'Farming',
        path: '/farming',
        icon: Fish,
        roles: ['superuser', 'admin', 'user'],
        children: [
          {
            title: 'Growth',
            path: '/farming/fish-growth',
            icon: Fish,
            roles: ['superuser', 'admin', 'user'],
          },
          {
            title: 'Feed',
            path: '/farming/feeds',
            icon: Database,
            roles: ['superuser', 'admin', 'user'],
          },
          {
            title: 'Mortality',
            path: '/farming/fish-mortality',
            icon: AlertTriangle,
            roles: ['superuser', 'admin', 'user'],
          },
          {
            title: 'Manual Data',
            path: '/farming/manual-data',
            icon: ChefHat,
            roles: ['superuser', 'admin', 'user'],
          },
          {
            title: 'Water Change',
            path: '/farming/water-change',
            icon: Calendar,
            roles: ['superuser', 'admin', 'user'],
          },
        ],
      },
    ],
  },
  {
    groupName: 'Admin Panel',
    items: [
      {
        title: 'Admin',
        path: '/admin',
        icon: Users,
        roles: ['superuser'],
        children: [
          {
            title: 'User Data',
            path: '/admin/users',
            icon: Users,
            roles: ['superuser'],
          },
        ],
      },
    ],
  },
];
