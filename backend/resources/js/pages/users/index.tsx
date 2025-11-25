/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import AppLayout from '@/layouts/app-layout';
import { PageHeader, StatsCard } from '@/components/page-header';
import { GenericDataTable } from '@/components/data-table/generic-data-table';
import { StatusBadge } from '@/components/badges/status-badge';
import { PlanBadge } from '@/components/badges/plan-badge';
import { UserActions } from './components/user-actions';
import { UserFilters } from './components/user-filters';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { router, Link, Head, usePage } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import {
    Users as UsersIcon,
    Plus,
    CheckCircle,
    Shield,
    Mail,
    Calendar,
    ShieldCheck,
    UserPlus,
    UserCog,
    Trash,
    MoreHorizontal,
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
import type { BreadcrumbItem, User, UsersPageProps } from '@/types';
import { toast } from 'sonner';
import { dashboard } from '@/routes';
import UserController from '@/actions/App/Http/Controllers/UserController';
import { Checkbox } from '@/components/ui/checkbox';

export default function UsersIndex({ users, filters, stats }: UsersPageProps) {
    const { props } = usePage<any>();
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedRows, setSelectedRows] = useState<User[]>([]);
    const [clientFilters, setClientFilters] = useState({
        status: filters.status || '',
        type: filters.type || '',
        plan: (filters as any).plan || '',
        sort_by: filters.sort_by || 'created_at',
        sort_direction: filters.sort_direction || 'desc',
    });

    const handlePageChange = (page: number) => {
        // client-side pagination handled in table
    };

    const handleSearch = (search: string) => {
        setSearchTerm(search);
    };

    useEffect(() => {
    }, [searchTerm]);

    const handleStatusChange = async (userId: number, status: string) => {
        setIsLoading(true)
        try {
            await router.patch(UserController.updateStatus(userId).url, { status }, {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success("User status updated successfully");
                    router.reload({ only: ['users'] });
                },
                onError: () => {
                    toast.error("Failed to update user status");
                },
            });
        } catch (error) {
            toast.error("An error occurred while updating user status");
        } finally {
            setIsLoading(false)
        }
    };

    const handleBulkDelete = async () => {
        const ids = selectedRows.map(u => u.id!).filter(Boolean);
        if (ids.length === 0) return;
        toast.warning(`Hapus ${ids.length} user?`, {
            description: 'Tindakan ini tidak dapat dibatalkan.',
            duration: 10000,
            closeButton: true,
            action: {
                label: 'Hapus',
                onClick: async () => {
                    setIsLoading(true);
                    try {
                        const response = await fetch('/users/bulk-destroy', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                            },
                            body: JSON.stringify({ ids }),
                        });
                        const result = await response.json();
                        if (result.success) {
                            toast.success(result.message || 'Berhasil menghapus user terpilih');
                            setSelectedRows([]);
                            router.reload({ only: ['users'] });
                        } else {
                            toast.error(result.message || 'Gagal menghapus user terpilih');
                        }
                    } catch (error) {
                        toast.error('Terjadi kesalahan saat menghapus user');
                    } finally {
                        setIsLoading(false);
                    }
                },
            },
        });
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const columns: ColumnDef<User>[] = [
        {
            accessorKey: 'name',
            header: 'User',
            cell: ({ row }) => (
                <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                        <AvatarImage src={row.original.avatar} alt={row.original.name} />
                        <AvatarFallback className="text-sm font-medium">
                            {row.original.name
                                .split(' ')
                                .map(n => n[0])
                                .join('')
                                .toUpperCase()
                                .slice(0, 2)}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                        <span className="font-medium text-sm">{row.original.name}</span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {row.original.email}
                        </span>
                    </div>
                </div>
            ),
            size: 250,
        },
        {
            accessorKey: 'type',
            header: 'Type',
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    {row.original.type !== 'user' && (
                        <Shield className="h-4 w-4 text-primary" />
                    )}
                    <span className="text-sm capitalize font-medium">
                        {row.original.type.replace('_', ' ')}
                    </span>
                </div>
            ),
            size: 120,
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => <StatusBadge status={row.original.status} />,
            size: 120,
        },
        {
            accessorKey: 'plan',
            header: 'Plan',
            cell: ({ row }) => <PlanBadge plan={row.original.plan} />,
            size: 120,
        },
        {
            accessorKey: 'roles',
            header: 'Roles',
            cell: ({ row }) => (
                <div className="flex flex-wrap gap-1 max-w-[180px]">
                    {(row.original.roles ?? []).slice(0, 3).map((role) => (
                        <Badge
                            key={role.id}
                            variant="secondary"
                            className="text-xs capitalize px-2 py-0 h-5"
                        >
                            {role.name.replace(/_/g, ' ')}
                        </Badge>
                    ))}
                    {(row.original.roles ?? []).length > 3 && (
                        <Badge variant="outline" className="text-xs px-2 py-0 h-5">
                            +{(row.original.roles ?? []).length - 3}
                        </Badge>
                    )}
                    {(row.original.roles ?? []).length === 0 && (
                        <span className="text-xs text-muted-foreground">No roles</span>
                    )}
                </div>
            ),
            size: 200,
        },
        {
            accessorKey: 'tenants_count',
            header: 'Tenants',
            cell: ({ row }) => (
                <div className="text-center">
                    <span className="text-sm font-semibold">
                        {row.original.tenants_count || 0}
                    </span>
                </div>
            ),
            size: 100,
        },
        {
            accessorKey: 'email_verified_at',
            header: 'Verified',
            cell: ({ row }) => (
                <div className="flex flex-col items-center">
                    {row.original.email_verified_at ? (
                        <>
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-xs text-muted-foreground mt-1">
                                {formatDate(row.original.email_verified_at)}
                            </span>
                        </>
                    ) : (
                        <span className="text-xs text-muted-foreground">Not verified</span>
                    )}
                </div>
            ),
            size: 120,
        },
        {
            accessorKey: 'created_at',
            header: 'Created',
            cell: ({ row }) => (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {formatDate(row.original.created_at)}
                </div>
            ),
            size: 130,
        },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => (
                <UserActions
                    user={row.original}
                    onStatusChange={handleStatusChange}
                />
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
            title: 'Users',
            href: UserController.index().url,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Users" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <PageHeader
                    title="User Management"
                    description="Manage user accounts, permissions, and access levels across the platform"
                    icon={UsersIcon}
                    actions={
                        <Button asChild className="shadow-sm">
                            <Link href="/users/create">
                                <Plus className="mr-2 h-4 w-4" />
                                Add New User
                            </Link>
                        </Button>
                    }
                />

                {/* Stats Overview */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <StatsCard
                        title="Total Users"
                        value={stats.total.toLocaleString()}
                        icon={UsersIcon}
                        description="All registered users"
                        className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 dark:bg-gradient-to-br dark:from-blue-800 dark:to-blue-900 dark:border-blue-800"
                    />
                    <StatsCard
                        title="Active Users"
                        value={stats.active.toLocaleString()}
                        icon={CheckCircle}
                        description="Currently active"
                        className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 dark:bg-gradient-to-br dark:from-green-800 dark:to-green-900 dark:border-green-800"
                    />
                    <StatsCard
                        title="Administrators"
                        value={stats.admins.toLocaleString()}
                        icon={UserCog}
                        description="Admin & Super Admin"
                        className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 dark:bg-gradient-to-br dark:from-purple-800 dark:to-purple-900 dark:border-purple-800"
                    />
                    <StatsCard
                        title="Verified"
                        value={stats.verified.toLocaleString()}
                        icon={ShieldCheck}
                        description="Email verified users"
                        className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 dark:bg-gradient-to-br dark:from-orange-800 dark:to-orange-900 dark:border-orange-800"
                    />
                </div>

                {/* Data Table Section */}
                <div className="bg-card rounded-lg border shadow-sm">
                        <GenericDataTable
                            columns={columns}
                            data={users.data}
                            searchKey="name"
                            searchPlaceholder="Search users by name, email..."
                            onSearch={handleSearch}
                            searchValue={searchTerm}
                            filters={
                                <div className="flex items-center gap-2">
                                    <UserFilters currentFilters={clientFilters} onChange={(f) => setClientFilters(prev => ({ ...prev, ...f }))} />
                                    {selectedRows.length > 0 && (
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-muted-foreground">
                                                {selectedRows.length} selected
                                            </span>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="outline" size="sm" className="h-9">
                                                        <MoreHorizontal className="h-4 w-4 mr-2" />
                                                        Actions
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Bulk Actions</DropdownMenuLabel>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem onClick={handleBulkDelete} className="text-destructive">
                                                        <Trash className="mr-2 h-4 w-4" />
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
                            initialPerPage={users.per_page}
                            clientFilters={clientFilters}
                            onRowClick={(user) => router.visit(`/users/${user.id}`)}
                            className="p-6"
                            enableRowSelection
                            onSelectionChange={setSelectedRows}
                            getRowId={(row) => String(row.id)}
                        />
                    </div>

                {/* Empty State Handling */}
                {users.data.length === 0 && !isLoading && (
                    <div className="text-center py-12">
                        <UsersIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                        <h3 className="mt-4 text-lg font-semibold">No users found</h3>
                        <p className="text-muted-foreground mt-2">
                            {searchTerm || Object.values(filters).some(Boolean)
                                ? "Try adjusting your search or filters to find what you're looking for."
                                : "Get started by creating your first user."
                            }
                        </p>
                        {!searchTerm && !Object.values(filters).some(Boolean) && (
                            <Button asChild className="mt-4">
                                <Link href="/users/create">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add New User
                                </Link>
                            </Button>
                        )}
                    </div>
                )}
            </div>

        </AppLayout>
    );
}

// Optional: Add display name for better debugging
UsersIndex.displayName = 'UsersIndex';
