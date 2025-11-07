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
        titleKey: 'sidebar.items.home',
        path: '/dashboard',
        icon: Home,
        roles: ['superuser', 'admin', 'user'],
        exact: true,
      },
    ],
  },
  {
    groupName: 'Devices',
    groupNameKey: 'sidebar.groups.devices',
    items: [
      {
        title: 'Devices',
        titleKey: 'sidebar.items.devicesRoot',
        path: '/devices',
        icon: Thermometer,
        roles: ['superuser', 'admin', 'user'],
        children: [
          {
            title: 'Manage Devices',
            titleKey: 'sidebar.items.manageDevices',
            path: '/devices/manage',
            icon: Wrench,
            roles: ['superuser', 'admin', 'user'],
          },
          {
            title: 'Sensor Trends',
            titleKey: 'sidebar.items.sensorTrends',
            path: '/devices/sensor-trends',
            icon: LineChart,
            roles: ['superuser', 'admin', 'user'],
          },
          {
            title: 'Sensor Table',
            titleKey: 'sidebar.items.sensorTable',
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
    groupNameKey: 'sidebar.groups.farming',
    items: [
      {
        title: 'Farming',
        titleKey: 'sidebar.items.farmingRoot',
        path: '/farming',
        icon: Fish,
        roles: ['superuser', 'admin', 'user'],
        children: [
          {
            title: 'Growth',
            titleKey: 'sidebar.items.growth',
            path: '/farming/fish-growth',
            icon: Fish,
            roles: ['superuser', 'admin', 'user'],
          },
          {
            title: 'Feed',
            titleKey: 'sidebar.items.feeds',
            path: '/farming/feeds',
            icon: Database,
            roles: ['superuser', 'admin', 'user'],
          },
          {
            title: 'Mortality',
            titleKey: 'sidebar.items.mortality',
            path: '/farming/fish-mortality',
            icon: AlertTriangle,
            roles: ['superuser', 'admin', 'user'],
          },
          {
            title: 'Manual Data',
            titleKey: 'sidebar.items.manualData',
            path: '/farming/manual-data',
            icon: ChefHat,
            roles: ['superuser', 'admin', 'user'],
          },
          {
            title: 'Water Change',
            titleKey: 'sidebar.items.waterChange',
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
    groupNameKey: 'sidebar.groups.admin',
    items: [
      {
        title: 'Admin',
        titleKey: 'sidebar.items.adminRoot',
        path: '/admin',
        icon: Users,
        roles: ['superuser'],
        children: [
          {
            title: 'User Data',
            titleKey: 'sidebar.items.userData',
            path: '/admin/users',
            icon: Users,
            roles: ['superuser'],
          },
        ],
      },
    ],
  },
];
