/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import AppLayout from '@/layouts/app-layout';
import { PageHeader, StatsCard } from '@/components/page-header';
import { GenericDataTable } from '@/components/data-table/generic-data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { router, Link, Head, usePage } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import {
    Shield,
    Plus,
    Calendar,
    MoreHorizontal,
    Trash,
    Key,
    Users,
    Folder,
    Settings,
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useEffect, useState } from 'react';
import type { BreadcrumbItem, PageProps } from '@/types';
import { toast } from 'sonner';
import { dashboard } from '@/routes';
import PermissionController from '@/actions/App/Http/Controllers/PermissionController';

interface Permission {
    id: number;
    name: string;
    guard_name: string;
    description?: string;
    created_at: string;
    updated_at: string;
    roles_count?: number;
}

interface PermissionsPageProps {
    permissions: {
        data: Permission[];
        meta: any;
    };
    filters: {
        search?: string;
        guard_name?: string;
        sort_by?: string;
        sort_direction?: string;
    };
    stats: {
        total: number;
        web: number;
        api: number;
        unused: number;
    };
}

export default function PermissionsIndex({ permissions, filters, stats }: PermissionsPageProps) {
    const { props } = usePage<any>();
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedRows, setSelectedRows] = useState<Permission[]>([]);
    const [clientFilters, setClientFilters] = useState({
        guard_name: filters.guard_name || '',
        sort_by: filters.sort_by || 'name',
        sort_direction: filters.sort_direction || 'asc',
    });

    const handleSearch = (search: string) => {
        setSearchTerm(search);
    };

    const handleBulkDelete = async () => {
        const ids = selectedRows.map(p => p.id).filter(Boolean);
        if (ids.length === 0) return;

        toast.warning(`Delete ${ids.length} permissions?`, {
            description: 'This action cannot be undone.',
            duration: 10000,
            closeButton: true,
            action: {
                label: 'Delete',
                onClick: async () => {
                    setIsLoading(true);
                    try {
                        const response = await fetch('/permissions/bulk-destroy', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                            },
                            body: JSON.stringify({ ids }),
                        });
                        const result = await response.json();
                        if (result.success) {
                            toast.success(result.message || 'Successfully deleted selected permissions');
                            setSelectedRows([]);
                            router.reload({ only: ['permissions'] });
                        } else {
                            toast.error(result.message || 'Failed to delete selected permissions');
                        }
                    } catch (error) {
                        toast.error('An error occurred while deleting permissions');
                    } finally {
                        setIsLoading(false);
                    }
                },
            },
        });
    };

    const handleSyncPermissions = async () => {
        setIsLoading(true);
        await router.post('/permissions/sync', {}, {
            preserveScroll: true,
            onSuccess: (page) => {
                const msg = (page?.props as any)?.flash?.success || 'Permissions synced successfully';
                toast.success(msg);
                router.reload({ only: ['permissions'] });
            },
            onError: (errors) => {
                toast.error('Failed to sync permissions');
            },
            onFinish: () => setIsLoading(false),
        });
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const getPermissionGroup = (name: string) => {
        if (name.includes('users.')) return 'Users';
        if (name.includes('roles.')) return 'Roles';
        if (name.includes('permissions.')) return 'Permissions';
        if (name.includes('tenants.')) return 'Tenants';
        if (name.includes('settings.')) return 'Settings';
        if (name.includes('themes.')) return 'Themes';
        return 'General';
    };

    const getGroupIcon = (group: string) => {
        switch (group) {
            case 'Users': return Users;
            case 'Roles': return Shield;
            case 'Permissions': return Key;
            case 'Tenants': return Folder;
            case 'Settings': return Settings;
            default: return Shield;
        }
    };

    const columns: ColumnDef<Permission>[] = [
        {
            accessorKey: 'name',
            header: 'Permission',
            cell: ({ row }) => {
                const group = getPermissionGroup(row.original.name);
                const GroupIcon = getGroupIcon(group);
                return (
                    <div className="flex gap-3 items-center">
                        <div className="flex justify-center items-center w-8 h-8 rounded-lg bg-primary/10">
                            <GroupIcon className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-medium">{row.original.name}</span>
                            <div className="flex gap-2 items-center mt-1">
                                <Badge variant="outline" className="text-xs capitalize">
                                    {group}
                                </Badge>
                                {row.original.description && (
                                    <span className="text-xs text-muted-foreground">
                                        {row.original.description}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                );
            },
            size: 300,
        },
        {
            accessorKey: 'guard_name',
            header: 'Guard',
            cell: ({ row }) => (
                <Badge variant={row.original.guard_name === 'web' ? 'default' : 'secondary'} className="capitalize">
                    {row.original.guard_name}
                </Badge>
            ),
            size: 100,
        },
        {
            accessorKey: 'roles_count',
            header: 'Roles',
            cell: ({ row }) => (
                <div className="text-center">
                    <span className="text-sm font-semibold">
                        {row.original.roles_count || 0}
                    </span>
                </div>
            ),
            size: 80,
        },
        {
            accessorKey: 'created_at',
            header: 'Created',
            cell: ({ row }) => (
                <div className="flex gap-2 items-center text-sm text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    {formatDate(row.original.created_at)}
                </div>
            ),
            size: 130,
        },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link href={`/permissions/${row.original.id}/edit`}>
                                Edit Permission
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => {
                                toast.warning(`Delete permission "${row.original.name}"?`, {
                                    action: {
                                        label: 'Delete',
                                        onClick: () => {
                                            router.delete(`/permissions/${row.original.id}`, {
                                                preserveScroll: true,
                                                onSuccess: () => toast.success('Permission deleted'),
                                            });
                                        },
                                    },
                                });
                            }}
                        >
                            <Trash className="mr-2 w-4 h-4" />
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
            size: 80,
            enableSorting: false,
        },
    ];

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: dashboard().url,
        },
        {
            title: 'Permissions',
            href: PermissionController.index().url,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Permissions" />

            <div className="flex overflow-x-auto flex-col flex-1 gap-4 p-4 h-full rounded-xl">
                <PageHeader
                    title="Permission Management"
                    description="Manage system permissions and access controls"
                    icon={Shield}
                    actions={
                        <div className="flex gap-2 items-center">
                            <Button
                                variant="outline"
                                onClick={handleSyncPermissions}
                                disabled={isLoading}
                            >
                                <Settings className="mr-2 w-4 h-4" />
                                Sync Permissions
                            </Button>
                            <Button asChild className="shadow-sm">
                                <Link href="/permissions/create">
                                    <Plus className="mr-2 w-4 h-4" />
                                    Add Permission
                                </Link>
                            </Button>
                        </div>
                    }
                />

                {/* Stats Overview */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <StatsCard
                        title="Total Permissions"
                        value={stats.total.toLocaleString()}
                        icon={Shield}
                        description="All system permissions"
                        className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 dark:bg-gradient-to-br dark:from-blue-950 dark:to-blue-900 dark:border-blue-800"
                    />
                    <StatsCard
                        title="Web Guard"
                        value={stats.web.toLocaleString()}
                        icon={Users}
                        description="Web interface permissions"
                        className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 dark:bg-gradient-to-br dark:from-green-950 dark:to-green-900 dark:border-green-800"
                    />
                    <StatsCard
                        title="API Guard"
                        value={stats.api.toLocaleString()}
                        icon={Key}
                        description="API access permissions"
                        className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 dark:bg-gradient-to-br dark:from-purple-950 dark:to-purple-900 dark:border-purple-800"
                    />
                    <StatsCard
                        title="Unused"
                        value={stats.unused.toLocaleString()}
                        icon={Shield}
                        description="Not assigned to any role"
                        className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 dark:bg-gradient-to-br dark:from-orange-950 dark:to-orange-900 dark:border-orange-800"
                    />
                </div>

                {/* Data Table Section */}
                <div className="rounded-lg border shadow-sm bg-card">
                    <GenericDataTable
                        columns={columns}
                        data={permissions.data}
                        searchKey="name"
                        searchPlaceholder="Search permissions by name..."
                        onSearch={handleSearch}
                        searchValue={searchTerm}
                        filters={
                            <div className="flex gap-2 items-center">
                                <div className="flex gap-2 items-center">
                                    <select
                                        value={clientFilters.guard_name}
                                        onChange={(e) => setClientFilters(prev => ({ ...prev, guard_name: e.target.value }))}
                                        className="px-3 py-1 h-9 text-sm bg-transparent rounded-md border shadow-sm border-input"
                                    >
                                        <option value="">All Guards</option>
                                        <option value="web">Web</option>
                                        <option value="api">API</option>
                                    </select>
                                </div>
                                {selectedRows.length > 0 && (
                                    <div className="flex gap-2 items-center">
                                        <span className="text-sm text-muted-foreground">
                                            {selectedRows.length} selected
                                        </span>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="outline" size="sm" className="h-9">
                                                    <MoreHorizontal className="mr-2 w-4 h-4" />
                                                    Actions
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Bulk Actions</DropdownMenuLabel>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem onClick={handleBulkDelete} className="text-destructive">
                                                    <Trash className="mr-2 w-4 h-4" />
                                                    Delete Selected
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                )}
                            </div>
                        }
                        isLoading={isLoading}
                        clientSide
                        initialPerPage={permissions.meta?.per_page || 20}
                        clientFilters={clientFilters}
                        onRowClick={(permission) => router.visit(`/permissions/${permission.id}/edit`)}
                        className="p-6"
                        enableRowSelection
                        onSelectionChange={setSelectedRows}
                        getRowId={(row) => String(row.id)}
                    />
                </div>

                {/* Empty State Handling */}
                {permissions.data.length === 0 && !isLoading && (
                    <div className="py-12 text-center">
                        <Shield className="mx-auto w-12 h-12 text-muted-foreground" />
                        <h3 className="mt-4 text-lg font-semibold">No permissions found</h3>
                        <p className="mt-2 text-muted-foreground">
                            {searchTerm || clientFilters.guard_name
                                ? "Try adjusting your search or filters to find what you're looking for."
                                : "Get started by creating your first permission or syncing from codebase."
                            }
                        </p>
                        <div className="flex gap-2 justify-center mt-4">
                            <Button
                                variant="outline"
                                onClick={handleSyncPermissions}
                                disabled={isLoading}
                            >
                                <Settings className="mr-2 w-4 h-4" />
                                Sync Permissions
                            </Button>
                            {!searchTerm && !clientFilters.guard_name && (
                                <Button asChild>
                                    <Link href="/permissions/create">
                                        <Plus className="mr-2 w-4 h-4" />
                                        Add Permission
                                    </Link>
                                </Button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
