/* eslint-disable @typescript-eslint/no-unused-vars */
import AppLayout from '@/layouts/app-layout';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { router, Link, Head } from '@inertiajs/react';
import {
    Shield,
    Edit,
    ArrowLeft,
    Users,
    Key,
    Calendar,
    UserCheck,
    UserX,
} from 'lucide-react';
import type { BreadcrumbItem, Role as RoleType } from '@/types';

interface RoleShowProps {
    role: RoleType & {
        permissions?: Array<{ id: number; name: string; module: string }>;
        users?: Array<{ id: number; name: string; email: string; status: string }>;
    };
}

export default function RoleShow({ role }: RoleShowProps) {
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
            title: role.name?.replace(/_/g, ' ') || 'Role Details',
            href: `/roles/${role.id}`,
        },
    ];

    const canEdit = role.name !== 'super_admin';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Role - ${role.name}`} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <PageHeader
                    title="Role Details"
                    description="View and manage role information and permissions"
                    icon={Shield}
                    actions={
                        <div className="flex items-center gap-2">
                            <Button asChild variant="outline">
                                <Link href="/roles">
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Back to Roles
                                </Link>
                            </Button>
                            {canEdit && (
                                <Button asChild>
                                    <Link href={`/roles/${role.id}/edit`}>
                                        <Edit className="mr-2 h-4 w-4" />
                                        Edit Role
                                    </Link>
                                </Button>
                            )}
                        </div>
                    }
                />

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Left Column - Role Info */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Basic Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Role Information</CardTitle>
                                <CardDescription>
                                    Basic role details and configuration
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-primary/10">
                                        <Shield className="h-8 w-8 text-primary" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h2 className="text-2xl font-bold capitalize">
                                                {role.name?.replace(/_/g, ' ')}
                                            </h2>
                                            <Badge variant="outline" className="capitalize">
                                                {role.guard_name}
                                            </Badge>
                                            {role.name === 'super_admin' && (
                                                <Badge variant="default" className="bg-red-100 text-red-800 border-red-200">
                                                    System Protected
                                                </Badge>
                                            )}
                                        </div>
                                    {role.label && (
                                        <p className="text-muted-foreground">{role.label}</p>
                                    )}
                                    {role.description && (
                                        <p className="text-sm text-muted-foreground mt-1">{role.description}</p>
                                    )}
                                    </div>
                                </div>

                                <Separator />

                                <div className="grid gap-6 md:grid-cols-2">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <Users className="h-4 w-4 text-muted-foreground" />
                                            <div>
                                                <p className="text-sm font-medium">Assigned Users</p>
                                                <p className="text-2xl font-bold text-primary">
                                                    {role.users_count || 0}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Key className="h-4 w-4 text-muted-foreground" />
                                            <div>
                                                <p className="text-sm font-medium">Permissions</p>
                                                <p className="text-2xl font-bold text-primary">
                                                    {role.permissions_count || 0}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                            <div>
                                                <p className="text-sm font-medium">Created</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {role.created_at ? new Date(role.created_at).toLocaleDateString() : 'N/A'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                            <div>
                                                <p className="text-sm font-medium">Last Updated</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {role.updated_at ? new Date(role.updated_at).toLocaleDateString() : 'N/A'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Permissions */}
                        {role.permissions && role.permissions.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Assigned Permissions</CardTitle>
                                    <CardDescription>
                                        Permissions granted to this role ({role.permissions.length} total)
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                                        {role.permissions.map(permission => (
                                            <div key={permission.id} className="border rounded-lg p-3">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="font-medium text-sm capitalize">
                                                        {permission.name.replace(/\./g, ' • ')}
                                                    </span>
                                                    <Badge variant="outline" className="text-xs">
                                                        {permission.module || 'General'}
                                                    </Badge>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Right Column - Actions & Users */}
                    <div className="space-y-6">
                        {/* Quick Actions */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {canEdit && (
                                    <Button asChild variant="outline" className="w-full justify-start">
                                        <Link href={`/roles/${role.id}/permissions`}>
                                            <Key className="mr-2 h-4 w-4" />
                                            Manage Permissions
                                        </Link>
                                    </Button>
                                )}
                                <Button asChild variant="outline" className="w-full justify-start">
                                    <Link href={`/roles/${role.id}/users`}>
                                        <Users className="mr-2 h-4 w-4" />
                                        View Assigned Users
                                    </Link>
                                </Button>
                                {canEdit && (
                                    <Button asChild variant="outline" className="w-full justify-start">
                                        <Link href={`/roles/${role.id}/edit`}>
                                            <Edit className="mr-2 h-4 w-4" />
                                            Edit Role Details
                                        </Link>
                                    </Button>
                                )}
                            </CardContent>
                        </Card>

                        {/* Recent Users */}
                        {role.users && role.users.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Recent Users</CardTitle>
                                    <CardDescription>
                                        Users assigned to this role
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {role.users.slice(0, 5).map(user => (
                                        <div key={user.id} className="flex items-center justify-between p-2 border rounded-lg">
                                            <div>
                                                <p className="font-medium text-sm">{user.name}</p>
                                                <p className="text-xs text-muted-foreground">{user.email}</p>
                                            </div>
                                            <Badge
                                                variant={user.status === 'active' ? 'default' : 'secondary'}
                                                className={
                                                    user.status === 'active'
                                                        ? 'bg-green-100 text-green-800 border-green-200'
                                                        : 'bg-gray-100 text-gray-800'
                                                }
                                            >
                                                {user.status === 'active' ? (
                                                    <UserCheck className="h-3 w-3 mr-1" />
                                                ) : (
                                                    <UserX className="h-3 w-3 mr-1" />
                                                )}
                                                {user.status}
                                            </Badge>
                                        </div>
                                    ))}
                                    {role.users.length > 5 && (
                                        <Button asChild variant="ghost" className="w-full">
                                            <Link href={`/roles/${role.id}/users`}>
                                                View all {role.users.length} users
                                            </Link>
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* System Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle>System Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Role ID:</span>
                                    <span className="font-mono">{role.id}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Guard Name:</span>
                                    <span className="capitalize">{role.guard_name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Internal Name:</span>
                                    <span className="font-mono">{role.name}</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
