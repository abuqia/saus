/* eslint-disable @typescript-eslint/no-unused-vars */
import AppLayout from '@/layouts/app-layout';
import { PageHeader, StatsCard } from '@/components/page-header';
import { DataTable } from '@/components/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { router, Link } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { Shield, Plus, MoreVertical, Edit, Trash, Users, Eye } from 'lucide-react';
import { useState } from 'react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface Role {
    id: number;
    name: string;
    display_name: string;
    guard_name: string;
    permissions_count: number;
    users_count: number;
    created_at: string;
    is_system: boolean;
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
        sort_by: string;
        sort_direction: string;
        per_page: number;
    };
    stats: {
        total: number;
        with_users: number;
        system_roles: number;
    };
}

export default function RolesIndex({ roles, filters, stats }: PageProps) {
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const handleDelete = () => {
        if (deleteId) {
            router.delete(`/roles/${deleteId}`, {
                preserveScroll: true,
                onSuccess: () => setDeleteId(null),
            });
        }
    };

    const columns: ColumnDef<Role>[] = [
        {
            accessorKey: 'display_name',
            header: 'Role Name',
            cell: ({ row }) => (
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <Shield className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <div className="font-medium">{row.original.display_name}</div>
                        <div className="text-sm text-muted-foreground">{row.original.name}</div>
                    </div>
                </div>
            ),
        },
        {
            accessorKey: 'permissions_count',
            header: 'Permissions',
            cell: ({ row }) => (
                <Badge variant="secondary">{row.original.permissions_count} permissions</Badge>
            ),
        },
        {
            accessorKey: 'users_count',
            header: 'Users',
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{row.original.users_count}</span>
                </div>
            ),
        },
        {
            accessorKey: 'guard_name',
            header: 'Guard',
            cell: ({ row }) => <Badge variant="outline">{row.original.guard_name}</Badge>,
        },
        {
            accessorKey: 'created_at',
            header: 'Created',
            cell: ({ row }) => (
                <span className="text-sm text-muted-foreground">
                    {new Date(row.original.created_at).toLocaleDateString()}
                </span>
            ),
        },
        {
            id: 'actions',
            cell: ({ row }) => {
                const role = row.original;

                return (
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
                                <Link href={`/roles/${role.id}`}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    View Details
                                </Link>
                            </DropdownMenuItem>
                            {!role.is_system && (
                                <>
                                    <DropdownMenuItem asChild>
                                        <Link href={`/roles/${role.id}/edit`}>
                                            <Edit className="mr-2 h-4 w-4" />
                                            Edit
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        className="text-destructive"
                                        onClick={() => setDeleteId(role.id)}
                                    >
                                        <Trash className="mr-2 h-4 w-4" />
                                        Delete
                                    </DropdownMenuItem>
                                </>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ];

    return (
        <>
            <PageHeader
                title="Roles"
                description="Manage user roles and permissions"
                icon={Shield}
                actions={
                    <Button asChild>
                        <Link href="/roles/create">
                            <Plus className="mr-2 h-4 w-4" />
                            Create Role
                        </Link>
                    </Button>
                }
            />

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-3 mb-6">
                <StatsCard
                    title="Total Roles"
                    value={stats.total}
                    icon={Shield}
                />
                <StatsCard
                    title="Roles with Users"
                    value={stats.with_users}
                    icon={Users}
                />
                <StatsCard
                    title="System Roles"
                    value={stats.system_roles}
                    description="Protected system roles"
                />
            </div>

            {/* Data Table */}
            <div className="rounded-lg border bg-card">
                <DataTable
                    columns={columns}
                    data={roles.data}
                    searchKey="display_name"
                    searchPlaceholder="Search roles..."
                />
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the role
                            and remove it from all users.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

RolesIndex.layout = (page: React.ReactNode) => <AppLayout children={page} />;
