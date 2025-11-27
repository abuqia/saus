/* eslint-disable @typescript-eslint/no-unused-vars */
import AppLayout from '@/layouts/app-layout';
import { PageHeader, StatsCard } from '@/components/page-header';
import { GenericDataTable } from '@/components/data-table/generic-data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { router, Link, Head } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import {
    Shield,
    Plus,
    Users,
    Key,
    Calendar,
    MoreVertical,
    Edit,
    Trash,
    Eye,
    ShieldOffIcon,
} from 'lucide-react';
import { useState } from 'react';
import type { BreadcrumbItem, Role, RolesPageProps } from '@/types';
import { RoleActions } from './components/role-actions';
import { RoleFilters } from './components/role-filters';
import { RoleBulkActions } from './components/role-bulk-actions';
import { toast } from 'sonner';

export default function RolesIndex({ roles, filters, stats }: RolesPageProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [clientFilters, setClientFilters] = useState({
        guard_name: filters.guard_name || '',
        sort_by: filters.sort_by || 'name',
        sort_direction: filters.sort_direction || 'asc',
    });
    const [selectedRows, setSelectedRows] = useState<Role[]>([]);

    const handlePageChange = (page: number) => {
        // client-side pagination handled in table
    };

    const handleSearch = (search: string) => {
        setSearchTerm(search);
    };

    const handleDelete = async (roleId: number) => {
        if (!confirm('Are you sure you want to delete this role? This action cannot be undone.')) {
            return;
        }

        try {
            await router.delete(`/roles/${roleId}`, {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Role deleted successfully');
                },
                onError: () => {
                    toast.error('Failed to delete role');
                },
            });
        } catch (error) {
            toast.error('An error occurred while deleting the role');
        }
    };

    const handleBulkDelete = async (ids: number[]) => {
        try {
            const response = await fetch('/roles/bulk-destroy', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({ ids }),
            });

            const result = await response.json();

            if (result.success) {
                toast.success(result.message);
                setSelectedRows([]);
                router.reload({ only: ['roles'] });
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            toast.error('An error occurred while deleting roles');
        }
    };

    const formatDate = (dateString: string | null | undefined) => {
        if (!dateString) return 'N/A';
        const d = new Date(dateString);
        try {
            return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
        } catch {
            return 'N/A';
        }
    };

    const columns: ColumnDef<Role>[] = [
        {
            accessorKey: 'name',
            header: 'Role',
            cell: ({ row }) => (
                <div className="flex gap-3 items-center">
                    <div className="flex justify-center items-center w-10 h-10 rounded-lg bg-primary/10">
                        <Shield className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-medium capitalize">
                            {row.original.label || row.original.name.replace(/_/g, ' ')}
                        </span>
                        {row.original.description && (
                            <span className="text-xs text-muted-foreground">
                                {row.original.description}
                            </span>
                        )}
                    </div>
                </div>
            ),
            size: 250,
        },
        {
            accessorKey: 'users_count',
            header: 'Users',
            cell: ({ row }) => (
                <div className="flex gap-2 items-center">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{row.original.users_count || 0}</span>
                </div>
            ),
            size: 100,
        },
        {
            accessorKey: 'permissions_count',
            header: 'Permissions',
            cell: ({ row }) => (
                <div className="flex gap-2 items-center">
                    <Key className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{row.original.permissions_count || 0}</span>
                </div>
            ),
            size: 120,
        },
        {
            accessorKey: 'guard_name',
            header: 'Guard',
            cell: ({ row }) => (
                <Badge variant="outline" className="capitalize">
                    {row.original.guard_name}
                </Badge>
            ),
            size: 100,
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
            size: 120,
        },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => (
                <RoleActions
                    role={row.original}
                    onDelete={handleDelete}
                />
            ),
            size: 80,
            enableSorting: false,
        },
    ];

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: '/',
        },
        {
            title: 'Roles & Permissions',
            href: '/roles',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Roles & Permissions" />

            <div className="flex overflow-x-auto flex-col flex-1 gap-4 p-4 h-full rounded-xl">
                <PageHeader
                    title="Roles & Permissions"
                    description="Manage user roles and their permissions"
                    icon={Shield}
                    actions={
                        <Button asChild className="shadow-sm">
                            <Link href="/roles/create">
                                <Plus className="mr-2 w-4 h-4" />
                                Create Role
                            </Link>
                        </Button>
                    }
                />

                {/* Stats Overview */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <StatsCard
                        title="Total Roles"
                        value={stats.total.toLocaleString()}
                        icon={Shield}
                        description="All system roles"
                        className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 dark:bg-gradient-to-br dark:from-blue-950 dark:to-blue-900 dark:border-blue-800"
                    />
                    <StatsCard
                        title="Assigned Users"
                        value={stats.total_users.toLocaleString()}
                        icon={Users}
                        description="Users with roles"
                        className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 dark:bg-gradient-to-br dark:from-green-950 dark:to-green-900 dark:border-green-800"
                    />
                    <StatsCard
                        title="Total Permissions"
                        value={stats.total_permissions.toLocaleString()}
                        icon={Key}
                        description="Available permissions"
                        className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 dark:bg-gradient-to-br dark:from-purple-950 dark:to-purple-900 dark:border-purple-800"
                    />
                    <StatsCard
                        title="Default Guard"
                        value="Web"
                        icon={ShieldOffIcon}
                        description="Primary guard"
                        className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 dark:bg-gradient-to-br dark:from-orange-950 dark:to-orange-900 dark:border-orange-800"
                    />
                </div>

                {/* Data Table Section */}
                <div className="rounded-lg border shadow-sm bg-card">
                    <GenericDataTable
                        columns={columns}
                        data={roles.data}
                        searchKey="name"
                        searchPlaceholder="Search roles by name..."
                        onSearch={handleSearch}
                        searchValue={searchTerm}
                        clientSide
                        initialPerPage={roles.per_page}
                        clientFilters={clientFilters}
                        filters={
                            <div className="flex gap-2 items-center">
                                <RoleFilters currentFilters={clientFilters} onChange={(f) => setClientFilters(prev => ({ ...prev, ...f }))} />
                                <RoleBulkActions
                                    selectedRows={selectedRows}
                                    onBulkDelete={handleBulkDelete}
                                />
                            </div>
                        }
                        enableRowSelection
                        onRowSelectionChange={setSelectedRows}
                        isLoading={isLoading}
                        getRowId={(row) => String((row as Role).id)}
                        onRowClick={(role) => router.visit(`/roles/${role.id}`)}
                        className="p-6"
                    />
                </div>

                {/* Empty State Handling */}
                {roles.data.length === 0 && !isLoading && (
                    <div className="py-12 text-center">
                        <Shield className="mx-auto w-12 h-12 text-muted-foreground" />
                        <h3 className="mt-4 text-lg font-semibold">No roles found</h3>
                        <p className="mt-2 text-muted-foreground">
                            {searchTerm || Object.values(filters).some(Boolean)
                                ? "Try adjusting your search or filters to find what you're looking for."
                                : "Get started by creating your first role."
                            }
                        </p>
                        {!searchTerm && !Object.values(filters).some(Boolean) && (
                            <Button asChild className="mt-4">
                                <Link href="/roles/create">
                                    <Plus className="mr-2 w-4 h-4" />
                                    Create Role
                                </Link>
                            </Button>
                        )}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
