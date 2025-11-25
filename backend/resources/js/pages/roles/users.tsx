import AppLayout from '@/layouts/app-layout';
import { PageHeader } from '@/components/page-header';
import { GenericDataTable } from '@/components/data-table/generic-data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { router, Link, Head } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import {
    Shield,
    ArrowLeft,
    Users,
    Mail,
    Calendar,
    CheckCircle,
    XCircle,
    User,
} from 'lucide-react';
import { useState } from 'react';
import type { BreadcrumbItem, User as UserType, Role } from '@/types';

interface RoleUsersProps {
    role: Role;
    users: {
        data: UserType[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}

export default function RoleUsers({ role, users }: RoleUsersProps) {
    const [isLoading, setIsLoading] = useState(false);

    const handlePageChange = (page: number) => {
        setIsLoading(true);
        router.get(`/roles/${role.id}/users`, { page }, {
            preserveState: true,
            onFinish: () => setIsLoading(false),
        });
    };

    const columns: ColumnDef<UserType>[] = [
        {
            accessorKey: 'name',
            header: 'User',
            cell: ({ row }) => (
                <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={row.original.avatar} alt={row.original.name} />
                        <AvatarFallback className="text-xs">
                            {row.original.name.split(' ').map(n => n[0]).join('').toUpperCase()}
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
                <Badge variant="outline" className="capitalize">
                    {row.original.type.replace('_', ' ')}
                </Badge>
            ),
            size: 120,
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => (
                <Badge
                    variant={row.original.status === 'active' ? 'default' : 'secondary'}
                    className={
                        row.original.status === 'active'
                            ? 'bg-green-100 text-green-800 border-green-200'
                            : 'bg-gray-100 text-gray-800'
                    }
                >
                    {row.original.status === 'active' ? (
                        <CheckCircle className="h-3 w-3 mr-1" />
                    ) : (
                        <XCircle className="h-3 w-3 mr-1" />
                    )}
                    {row.original.status}
                </Badge>
            ),
            size: 120,
        },
        {
            accessorKey: 'created_at',
            header: 'Member Since',
            cell: ({ row }) => (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {new Date(row.original.created_at!).toLocaleDateString()}
                </div>
            ),
            size: 140,
        },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => (
                <Button
                    variant="outline"
                    size="sm"
                    asChild
                >
                    <Link href={`/users/${row.original.id}`}>
                        <User className="h-4 w-4 mr-1" />
                        View
                    </Link>
                </Button>
            ),
            size: 100,
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
        {
            title: role.label || role.name.replace(/_/g, ' '),
            href: `/roles/${role.id}`,
        },
        {
            title: 'Assigned Users',
            href: `/roles/${role.id}/users`,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Users - ${role.name}`} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <PageHeader
                    title="Assigned Users"
                    description={`Users assigned to ${role.label || role.name} role`}
                    icon={Users}
                    actions={
                        <div className="flex items-center gap-2">
                            <Button asChild variant="outline">
                                <Link href={`/roles/${role.id}`}>
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Back to Role
                                </Link>
                            </Button>
                            <Button asChild variant="outline">
                                <Link href="/users">
                                    <User className="mr-2 h-4 w-4" />
                                    Manage Users
                                </Link>
                            </Button>
                        </div>
                    }
                />

                {/* Role Summary */}
                <div className="grid gap-4 md:grid-cols-4 mb-6">
                    <div className="col-span-4">
                        <div className="flex items-center gap-4 p-4 border rounded-lg bg-muted/50">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                                <Shield className="h-6 w-6 text-primary" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold capitalize">
                                    {role.label || role.name.replace(/_/g, ' ')}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    {role.users_count || 0} users assigned to this role
                                </p>
                            </div>
                            <Badge variant="outline" className="text-sm">
                                {role.name}
                            </Badge>
                        </div>
                    </div>
                </div>

                {/* Data Table */}
                <div className="bg-white rounded-lg border shadow-sm">
                    <GenericDataTable
                        columns={columns}
                        data={users.data}
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

                {/* Empty State */}
                {users.data.length === 0 && !isLoading && (
                    <div className="text-center py-12">
                        <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                        <h3 className="mt-4 text-lg font-semibold">No users assigned</h3>
                        <p className="text-muted-foreground mt-2">
                            There are no users assigned to this role yet.
                        </p>
                        <Button asChild className="mt-4">
                            <Link href="/users">
                                <User className="mr-2 h-4 w-4" />
                                Manage Users
                            </Link>
                        </Button>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
