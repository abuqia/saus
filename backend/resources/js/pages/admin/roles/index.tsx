import { Head, Link, router } from '@inertiajs/react';
import { Copy, Edit, MoreVertical, Plus, Search, Shield, Trash2 } from 'lucide-react';
import { useState } from 'react';
import AdminLayout from '@/layouts/admin-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface Role {
  id: number;
  name: string;
  permissions_count: number;
  users_count: number;
  created_at: string;
}

interface PageProps {
  roles: {
    data: Role[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  filters: {
    search?: string;
  };
  statistics: {
    total: number;
    system_roles: number;
    custom_roles: number;
  };
}

export default function RolesIndex({ roles, filters, statistics }: PageProps) {
  const [search, setSearch] = useState(filters.search || '');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.get('/admin/roles', { search }, { preserveState: true });
  };

  const handleDelete = (roleId: number, roleName: string) => {
    if (
      confirm(
        `Are you sure you want to delete the role "${roleName}"? This action cannot be undone.`
      )
    ) {
      router.delete(`/admin/roles/${roleId}`);
    }
  };

  const handleDuplicate = (roleId: number) => {
    router.post(`/admin/roles/${roleId}/duplicate`);
  };

  const isSystemRole = (name: string) => {
    return [
      'super_admin',
      'admin',
      'user',
      'tenant_owner',
      'tenant_admin',
      'tenant_editor',
      'tenant_viewer',
    ].includes(name);
  };

  const getRoleColor = (name: string) => {
    const colors: Record<string, string> = {
      super_admin: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      admin: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
      tenant_owner: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      tenant_admin: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      tenant_editor: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      tenant_viewer: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
      user: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
    };
    return colors[name] || 'bg-gray-100 text-gray-800';
  };

  return (
    <AdminLayout>
      <Head title="Roles Management" />

      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Roles</h1>
            <p className="text-muted-foreground">
              Manage roles and their permissions
            </p>
          </div>
          <Link href="/admin/roles/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Role
            </Button>
          </Link>
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Roles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">System Roles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {statistics.system_roles}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Cannot be modified
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Custom Roles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {statistics.custom_roles}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                User-defined roles
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card>
          <CardHeader>
            <CardTitle>Search Roles</CardTitle>
            <CardDescription>Find roles by name</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search roles..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Roles Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Role Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Permissions</TableHead>
                  <TableHead>Users</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roles.data.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                          <Shield className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium capitalize">
                            {role.name.replace(/_/g, ' ')}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {role.name}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getRoleColor(role.name)}>
                        {isSystemRole(role.name) ? 'System' : 'Custom'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{role.permissions_count} permissions</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{role.users_count} users</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(role.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/roles/${role.id}`}>
                              <Shield className="mr-2 h-4 w-4" />
                              View Details
                            </Link>
                          </DropdownMenuItem>
                          {!isSystemRole(role.name) && (
                            <>
                              <DropdownMenuItem asChild>
                                <Link href={`/admin/roles/${role.id}/edit`}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit Role
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDuplicate(role.id)}
                              >
                                <Copy className="mr-2 h-4 w-4" />
                                Duplicate
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => handleDelete(role.id, role.name)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Role
                              </DropdownMenuItem>
                            </>
                          )}
                          {isSystemRole(role.name) && (
                            <DropdownMenuItem disabled>
                              <span className="text-xs text-muted-foreground">
                                System role cannot be modified
                              </span>
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {roles.data.length === 0 && (
              <div className="py-12 text-center">
                <Shield className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No roles found</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Try adjusting your search criteria
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {roles.last_page > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {roles.data.length} of {roles.total} roles
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                disabled={roles.current_page === 1}
                onClick={() =>
                  router.get('/admin/roles', {
                    ...filters,
                    page: roles.current_page - 1,
                  })
                }
              >
                Previous
              </Button>
              <Button
                variant="outline"
                disabled={roles.current_page === roles.last_page}
                onClick={() =>
                  router.get('/admin/roles', {
                    ...filters,
                    page: roles.current_page + 1,
                  })
                }
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
