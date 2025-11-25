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
    const [selectedRows, setSelectedRows] = useState<Role[]>([]);

    const handlePageChange = (page: number) => {
        setIsLoading(true);
        router.get('/roles', { page, search: searchTerm, ...filters }, {
            preserveState: true,
            onFinish: () => setIsLoading(false),
        });
    };

    const handleSearch = (search: string) => {
        setSearchTerm(search);
        router.get('/roles', { search, ...filters }, {
            preserveState: true,
            replace: true,
        });
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

    const columns: ColumnDef<Role>[] = [
        {
            accessorKey: 'name',
            header: 'Role',
            cell: ({ row }) => (
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <Shield className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-medium text-sm capitalize">
                            {row.original.name.replace(/_/g, ' ')}
                        </span>
                        <span className="text-xs text-muted-foreground">
                            {row.original.label || 'No description'}
                        </span>
                    </div>
                </div>
            ),
            size: 250,
        },
        {
            accessorKey: 'users_count',
            header: 'Users',
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{row.original.users_count || 0}</span>
                </div>
            ),
            size: 100,
        },
        {
            accessorKey: 'permissions_count',
            header: 'Permissions',
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <Key className="h-4 w-4 text-muted-foreground" />
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
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {new Date(row.original.created_at!).toLocaleDateString()}
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

            <PageHeader
                title="Roles & Permissions"
                description="Manage user roles and their permissions"
                icon={Shield}
                actions={
                    <Button asChild className="shadow-sm">
                        <Link href="/roles/create">
                            <Plus className="mr-2 h-4 w-4" />
                            Create Role
                        </Link>
                    </Button>
                }
            />

            {/* Stats Overview */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
                <StatsCard
                    title="Total Roles"
                    value={stats.total.toLocaleString()}
                    icon={Shield}
                    description="All system roles"
                    className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200"
                />
                <StatsCard
                    title="Assigned Users"
                    value={stats.total_users.toLocaleString()}
                    icon={Users}
                    description="Users with roles"
                    className="bg-gradient-to-br from-green-50 to-green-100 border-green-200"
                />
                <StatsCard
                    title="Total Permissions"
                    value={stats.total_permissions.toLocaleString()}
                    icon={Key}
                    description="Available permissions"
                    className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200"
                />
                <StatsCard
                    title="Default Guard"
                    value="Web"
                    description="Primary guard"
                    className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200"
                />
            </div>

            {/* Data Table Section */}
            <div className="bg-white rounded-lg border shadow-sm">
                <GenericDataTable
                    columns={columns}
                    data={roles.data}
                    searchKey="name"
                    searchPlaceholder="Search roles by name..."
                    filters={
                        <div className="flex items-center gap-2">
                            <RoleFilters currentFilters={filters} />
                            <RoleBulkActions
                                selectedRows={selectedRows}
                                onBulkDelete={handleBulkDelete}
                            />
                        </div>
                    }
                    onRowSelectionChange={setSelectedRows}
                    isLoading={isLoading}
                    pagination={{
                        currentPage: roles.current_page,
                        lastPage: roles.last_page,
                        perPage: roles.per_page,
                        total: roles.total,
                        onPageChange: handlePageChange,
                    }}
                    onRowClick={(role) => router.visit(`/roles/${role.id}`)}
                    className="p-6"
                />
            </div>

            {/* Empty State Handling */}
            {roles.data.length === 0 && !isLoading && (
                <div className="text-center py-12">
                    <Shield className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-semibold">No roles found</h3>
                    <p className="text-muted-foreground mt-2">
                        {searchTerm || Object.values(filters).some(Boolean)
                            ? "Try adjusting your search or filters to find what you're looking for."
                            : "Get started by creating your first role."
                        }
                    </p>
                    {!searchTerm && !Object.values(filters).some(Boolean) && (
                        <Button asChild className="mt-4">
                            <Link href="/roles/create">
                                <Plus className="mr-2 h-4 w-4" />
                                Create Role
                            </Link>
                        </Button>
                    )}
                </div>
            )}
        </AppLayout>
    );
}
