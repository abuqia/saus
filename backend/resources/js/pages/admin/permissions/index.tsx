import { Head, Link, router } from '@inertiajs/react';
import { Edit, Key, MoreVertical, Plus, Search, Trash2 } from 'lucide-react';
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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Permission {
  id: number;
  name: string;
  roles_count: number;
  users_count: number;
  created_at: string;
}

interface GroupedPermissions {
  [module: string]: {
    count: number;
    permissions: Permission[];
  };
}

interface PageProps {
  permissions: {
    data: Permission[];
    current_page: number;
    last_page: number;
    total: number;
  };
  groupedPermissions: GroupedPermissions;
  filters: {
    search?: string;
    module?: string;
  };
  modules: string[];
  statistics: {
    total: number;
    modules: number;
  };
}

export default function PermissionsIndex({
//   permissions,
  groupedPermissions,
  filters,
  modules,
  statistics,
}: PageProps) {
  const [search, setSearch] = useState(filters.search || '');
  const [expandedModules, setExpandedModules] = useState<string[]>([]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.get('/admin/permissions', { search }, { preserveState: true });
  };

  const handleFilter = (module: string) => {
    router.get('/admin/permissions', { ...filters, module }, { preserveState: true });
  };

  const handleDelete = (permissionId: number, permissionName: string) => {
    if (
      confirm(
        `Are you sure you want to delete the permission "${permissionName}"? This action cannot be undone.`
      )
    ) {
      router.delete(`/admin/permissions/${permissionId}`);
    }
  };

  const toggleModule = (module: string) => {
    setExpandedModules((prev) =>
      prev.includes(module) ? prev.filter((m) => m !== module) : [...prev, module]
    );
  };

  const getModuleColor = (module: string) => {
    const colors: Record<string, string> = {
      users: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      roles: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      permissions: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      tenants: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      team: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      links: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
      pages: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300',
      themes: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300',
      media: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
      analytics: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300',
      settings: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
    };
    return colors[module] || 'bg-gray-100 text-gray-800';
  };

  return (
    <AdminLayout>
      <Head title="Permissions Management" />

      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Permissions</h1>
            <p className="text-muted-foreground">
              Manage all system permissions and their assignments
            </p>
          </div>
          <Link href="/admin/permissions/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Permission
            </Button>
          </Link>
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Permissions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Permission Modules</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {statistics.modules}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Organized by feature area
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filter Permissions</CardTitle>
            <CardDescription>Search and filter permissions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 md:flex-row">
              {/* Search */}
              <form onSubmit={handleSearch} className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search permissions..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </form>

              {/* Module Filter */}
              <Select
                value={filters.module || 'all'}
                onValueChange={(value) => handleFilter(value)}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Module" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Modules</SelectItem>
                  {modules.map((module) => (
                    <SelectItem key={module} value={module}>
                      {module.charAt(0).toUpperCase() + module.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Grouped Permissions */}
        <div className="space-y-4">
          {Object.entries(groupedPermissions).map(([module, data]) => (
            <Card key={module}>
              <Collapsible
                open={expandedModules.includes(module)}
                onOpenChange={() => toggleModule(module)}
              >
                <CollapsibleTrigger className="w-full">
                  <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                          <Key className="h-5 w-5 text-primary" />
                        </div>
                        <div className="text-left">
                          <CardTitle className="capitalize">{module}</CardTitle>
                          <CardDescription>
                            {data.count} permission{data.count !== 1 ? 's' : ''}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge className={getModuleColor(module)}>{data.count}</Badge>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {data.permissions.map((permission) => (
                        <div
                          key={permission.id}
                          className="flex items-center justify-between rounded-lg border p-3 hover:bg-accent/50 transition-colors"
                        >
                          <div className="flex-1">
                            <div className="font-medium text-sm">{permission.name}</div>
                            <div className="flex gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {permission.roles_count} roles
                              </Badge>
                              <Badge variant="secondary" className="text-xs">
                                {permission.users_count} users
                              </Badge>
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem asChild>
                                <Link href={`/admin/permissions/${permission.id}`}>
                                  <Key className="mr-2 h-4 w-4" />
                                  View Details
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/admin/permissions/${permission.id}/edit`}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() =>
                                  handleDelete(permission.id, permission.name)
                                }
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          ))}
        </div>

        {Object.keys(groupedPermissions).length === 0 && (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <Key className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No permissions found</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Try adjusting your search criteria
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
