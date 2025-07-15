import type { UserRole } from '@/features/authentication/types';
import { type NavigationGroup } from '@/types/navigation';
import {
  Home,
  Users,
  Bell,
  Wrench,
  Settings,
  Fish,
  Calendar,
  Activity,
  ChefHat,
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
    groupName: 'Alat Simonair',
    items: [
      {
        title: 'Perangkat',
        path: '/devices',
        icon: Wrench,
        roles: ['superuser', 'admin', 'user'],
        children: [
          {
            title: 'Kelola Alat',
            path: '/devices/manage',
            icon: Settings,
            roles: ['superuser', 'admin', 'user'],
          },
          {
            title: 'Pakan Ikan',
            path: '/devices/feeder',
            icon: ChefHat,
            roles: ['superuser', 'admin', 'user'],
          },
          {
            title: 'Data Sensor',
            path: '/devices/sensors',
            icon: Activity,
            roles: ['superuser', 'admin', 'user'],
          },
          {
            title: 'Jadwal Pemberian',
            path: '/devices/schedule',
            icon: Calendar,
            roles: ['superuser', 'admin', 'user'],
          },
          {
            title: 'Data Ikan',
            path: '/devices/fish-data',
            icon: Fish,
            roles: ['superuser', 'admin', 'user'],
          },
        ],
      },
    ],
  },
  {
    groupName: 'Notifications',
    items: [
      {
        title: 'Notifikasi',
        path: '/notifications',
        icon: Bell,
        roles: ['superuser', 'admin', 'user'],
        exact: true,
      },
    ],
  },
  {
    groupName: 'User Management',
    items: [
      {
        title: 'Pengguna',
        path: '/users',
        icon: Users,
        roles: ['superuser'],
        exact: true,
      },
    ],
  },
];
