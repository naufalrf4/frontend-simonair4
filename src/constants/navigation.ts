import type { UserRole } from '@/features/users/types';
import { type NavigationGroup } from '@/types/navigation';
import {
  Home,
  Users,
  Wrench,
  Settings,
  Fish,
  Calendar,
  ChefHat,
  Thermometer,
  Database,
  AlertTriangle,
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
        title: 'Beranda',
        path: '/dashboard',
        icon: Home,
        roles: ['superuser', 'admin', 'user'],
        exact: true,
      },
    ],
  },
  {
    groupName: 'Perangkat',
    items: [
      {
        title: 'Perangkat',
        path: '/devices',
        icon: Thermometer,
        roles: ['superuser', 'admin', 'user'],
        children: [
          {
            title: 'Kelola Perangkat',
            path: '/devices/manage',
            icon: Wrench,
            roles: ['superuser', 'admin', 'user'],
          },
          {
            title: 'Data Sensor',
            path: '/devices/sensor-data',
            icon: Thermometer,
            roles: ['superuser', 'admin', 'user'],
          },
          {
            title: 'Data Manual',
            path: '/devices/manual-data',
            icon: ChefHat,
            roles: ['superuser', 'admin', 'user'],
          },
        ],
      },
    ],
  },
  {
    groupName: 'Data Budidaya',
    items: [
      {
        title: 'Budidaya',
        path: '/fish-farming',
        icon: Fish,
        roles: ['superuser', 'admin', 'user'],
        children: [
          {
            title: 'Pertumbuhan',
            path: '/fish-growth',
            icon: Fish,
            roles: ['superuser', 'admin', 'user'],
          },
          {
            title: 'Pakan Ikan',
            path: '/feeds',
            icon: Database,
            roles: ['superuser', 'admin', 'user'],
          },
          {
            title: 'Kematian Ikan',
            path: '/fish-mortality',
            icon: AlertTriangle,
            roles: ['superuser', 'admin', 'user'],
          },
          {
            title: 'Log Kualitas Air',
            path: '/water-events',
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
            title: 'Data User',
            path: '/users',
            icon: Users,
            roles: ['superuser'],
          },
        ],
      },
    ],
  },
];
