import React, { useMemo, useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useUsersListQuery } from '../hooks/useUsersListQuery';
import type { User } from '../types';
import { UpsertUserModal } from './UpsertUserModal';
import { DeleteUserDialog } from './DeleteUserDialog';
import { UserDetailsModal } from './UserDetailsModal';
import { UserActionsDropdown } from './UserActionsDropdown';
import { UserStatusBadge, UserAvatar } from './UserStatusBadge';
import { Users, UserPlus } from 'lucide-react';

export const UsersPage: React.FC = () => {
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize] = useState(10);
  const [search, setSearch] = useState('');

  const { data, isLoading } = useUsersListQuery({ page: pageIndex + 1, limit: pageSize, search });

  const [openUpsert, setOpenUpsert] = useState<{ open: boolean; mode: 'create' | 'edit'; user?: User | null }>({ open: false, mode: 'create', user: null });
  const [openDelete, setOpenDelete] = useState<{ open: boolean; user: User | null }>({ open: false, user: null });
  const [openDetails, setOpenDetails] = useState<{ open: boolean; user: User | null }>({ open: false, user: null });

  const columns = useMemo<ColumnDef<User>[]>(() => [
    { 
      accessorKey: 'user', 
      header: 'User', 
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <UserAvatar user={row.original} size="sm" showStatus />
          <div className="flex flex-col">
            <span className="font-medium">{row.original.fullName}</span>
            <span className="text-sm text-muted-foreground">{row.original.email}</span>
          </div>
        </div>
      )
    },
    { 
      accessorKey: 'status', 
      header: 'Status', 
      cell: ({ row }) => (
        <UserStatusBadge 
          user={row.original} 
          variant="compact" 
          showRole={true}
          showVerificationStatus={true}
          showActivityStatus={false}
        />
      )
    },
    { 
      accessorKey: 'lastLogin', 
      header: 'Last Activity',
      meta: { hideOnMobile: true },
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="text-sm font-medium">
            {row.original.lastLogin ? 'Logged in' : 'Never'}
          </span>
          {row.original.lastLogin && (
            <span className="text-xs text-muted-foreground">
              {new Date(row.original.lastLogin).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </span>
          )}
        </div>
      )
    },
    { 
      accessorKey: 'createdAt', 
      header: 'Joined',
      meta: { hideOnMobile: true },
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {new Date(row.original.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          })}
        </span>
      )
    },
    {
      id: 'actions',
      header: 'Actions',
      size: 50,
      cell: ({ row }) => (
        <UserActionsDropdown
          user={row.original}
          onEdit={(user) => setOpenUpsert({ open: true, mode: 'edit', user })}
          onDelete={(user) => setOpenDelete({ open: true, user })}
          onViewDetails={(user) => setOpenDetails({ open: true, user })}
        />
      ),
    },
  ], []);

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">User Management</h1>
            <p className="text-sm text-muted-foreground">
              Manage user accounts, roles, and permissions
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setOpenUpsert({ open: true, mode: 'create' })}>
            <UserPlus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Users
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.pagination?.total || 0}</div>
            <p className="text-xs text-muted-foreground">Active accounts</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Users
            </CardTitle>
            <UserPlus className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {data?.data?.filter(u => u.isActive).length || 0}
            </div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Verified
            </CardTitle>
            <Badge className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {data?.data?.filter(u => u.emailVerified).length || 0}
            </div>
            <p className="text-xs text-muted-foreground">Email verified</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Admins
            </CardTitle>
            <Badge className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {data?.data?.filter(u => u.role === 'admin' || u.role === 'superuser').length || 0}
            </div>
            <p className="text-xs text-muted-foreground">Administrative roles</p>
          </CardContent>
        </Card>
      </div>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Users Directory</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={data?.data || []}
            searchColumn="fullName"
            searchPlaceholder="Search users by name or email..."
            searchValue={search}
            onSearchChange={(v) => { setSearch(v); setPageIndex(0); }}
            isLoading={isLoading}
            pagination={{
              pageIndex,
              pageSize,
              pageCount: data?.pagination?.totalPages || 1,
              onPageChange: setPageIndex,
            }}
          />
        </CardContent>
      </Card>

      <UpsertUserModal
        open={openUpsert.open}
        mode={openUpsert.mode}
        user={openUpsert.user || undefined}
        onClose={() => setOpenUpsert({ open: false, mode: 'create', user: null })}
        onSuccess={() => { /* react-query invalidation handled in hooks */ }}
      />

      <DeleteUserDialog
        open={openDelete.open}
        user={openDelete.user}
        onClose={() => setOpenDelete({ open: false, user: null })}
        onSuccess={() => { /* react-query invalidation handled in hooks */ }}
      />

      <UserDetailsModal
        open={openDetails.open}
        user={openDetails.user}
        onClose={() => setOpenDetails({ open: false, user: null })}
        onEdit={(user) => {
          setOpenDetails({ open: false, user: null });
          setOpenUpsert({ open: true, mode: 'edit', user });
        }}
        onDelete={(user) => {
          setOpenDetails({ open: false, user: null });
          setOpenDelete({ open: true, user });
        }}
      />
    </div>
  );
};
