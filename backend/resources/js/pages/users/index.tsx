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
import { router, Link, Head } from '@inertiajs/react';
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
} from 'lucide-react';
import { useState } from 'react';
import type { BreadcrumbItem, User, UsersPageProps } from '@/types';
import { toast } from 'sonner';
import { dashboard } from '@/routes';
import UserController from '@/actions/App/Http/Controllers/UserController';

export default function UsersIndex({ users, filters, stats }: UsersPageProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState(filters.search || '');

    const handlePageChange = (page: number) => {
        setIsLoading(true);
        router.get(UserController.index().url, { page, search: searchTerm, ...filters }, {
            preserveState: true,
            onFinish: () => setIsLoading(false),
        });
    };

    const handleSearch = (search: string) => {
        setSearchTerm(search);
        router.get(UserController.index().url, { search, ...filters }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleStatusChange = async (userId: number, status: string) => {
        try {
            await router.patch(UserController.updateStatus(userId).url, { status }, {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success("User status updated successfully");
                },
                onError: () => {
                    toast.error("Failed to update user status");
                },
            });
        } catch (error) {
            toast.error("An error occurred while updating user status");
        }
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
                        <AvatarImage src={row.original.avatar_url} alt={row.original.name} />
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
                        className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200"
                    />
                    <StatsCard
                        title="Active Users"
                        value={stats.active.toLocaleString()}
                        icon={CheckCircle}
                        description="Currently active"
                        className="bg-gradient-to-br from-green-50 to-green-100 border-green-200"
                    />
                    <StatsCard
                        title="Administrators"
                        value={stats.admins.toLocaleString()}
                        icon={UserCog}
                        description="Admin & Super Admin"
                        className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200"
                    />
                    <StatsCard
                        title="Verified"
                        value={stats.verified.toLocaleString()}
                        icon={ShieldCheck}
                        description="Email verified users"
                        className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200"
                    />
                </div>

                {/* Data Table Section */}
                <div className="bg-white rounded-lg border shadow-sm">
                    <GenericDataTable
                        columns={columns}
                        data={users.data}
                        searchKey="name"
                        searchPlaceholder="Search users by name, email..."
                        filters={<UserFilters currentFilters={filters} />}
                        isLoading={isLoading}
                        pagination={{
                            currentPage: users.current_page,
                            lastPage: users.last_page,
                            perPage: users.per_page,
                            total: users.total,
                            onPageChange: handlePageChange,
                        }}
                        onRowClick={(user) => router.visit(`/users/${user.id}`)}
                        className="p-6"
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
