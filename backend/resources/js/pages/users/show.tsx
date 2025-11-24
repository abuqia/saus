/* eslint-disable @typescript-eslint/no-unused-vars */
import AppLayout from '@/layouts/app-layout';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { router, Link, Head, usePage } from '@inertiajs/react';
import {
    Users as UsersIcon,
    Edit,
    ArrowLeft,
    Mail,
    Phone,
    Calendar,
    Globe,
    Shield,
    CheckCircle,
    XCircle,
    Building,
    User,
} from 'lucide-react';
import type { BreadcrumbItem, User as UserType, PageProps } from '@/types';
import { StatusBadge } from '@/components/badges/status-badge';
import { PlanBadge } from '@/components/badges/plan-badge';
import { toast } from 'sonner';

interface UserShowProps {
    user: Omit<UserType, 'roles'> & {
        owned_tenants?: Array<{ id: number; name: string; slug: string; status: string }>;
        member_tenants?: Array<{ id: number; name: string; slug: string; role: string }>;
        roles?: Array<{ id: number; name: string; permissions: string[] }>;
    };
}

export default function UserShow({ user }: UserShowProps) {
    const { props } = usePage<PageProps>();
    const currentUser = props.auth.user;

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
        {
            title: 'Users',
            href: '/users',
        },
        {
            title: user.name,
            href: `/users/${user.id}`,
        },
    ];

    const handleStatusChange = async (status: string) => {
        try {
            await router.patch(`/users/${user.id}/status`, { status }, {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(`User ${status === 'active' ? 'activated' : 'suspended'} successfully`);
                },
                onError: () => {
                    toast.error('Failed to update user status');
                },
            });
        } catch (error) {
            toast.error('An error occurred while updating user status');
        }
    };

    const canEdit = currentUser.type === 'super_admin' || (currentUser.type === 'admin' && user.type !== 'super_admin');
    const canChangeStatus = canEdit && user.id !== currentUser.id;

    const handleSendVerification = async () => {
        try {
            await router.post(`/users/${user.id}/verify-email`, {}, {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Verification email sent');
                },
                onError: () => {
                    toast.error('Failed to send verification email');
                },
            });
        } catch {
            toast.error('An error occurred while sending verification email');
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`User - ${user.name}`} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <PageHeader
                    title="User Details"
                    description="View and manage user information"
                    icon={UsersIcon}
                    actions={
                        <div className="flex items-center gap-2">
                            <Button asChild variant="outline">
                                <Link href="/users">
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Back to Users
                                </Link>
                            </Button>
                            {canEdit && (
                                <Button asChild>
                                    <Link href={`/users/${user.id}/edit`}>
                                        <Edit className="mr-2 h-4 w-4" />
                                        Edit User
                                    </Link>
                                </Button>
                            )}
                        </div>
                    }
                />

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Left Column - User Info */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Profile Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Profile Information</CardTitle>
                                <CardDescription>
                                    Basic user details and contact information
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <Avatar className="h-16 w-16">
                                        <AvatarImage src={user.avatar} alt={user.name} />
                                        <AvatarFallback className="text-lg">
                                            {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h2 className="text-2xl font-bold">{user.name}</h2>
                                            <StatusBadge status={user.status} />
                                            <PlanBadge plan={user.plan} />
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                            <div className="flex items-center gap-1">
                                                <Shield className="h-4 w-4" />
                                                <span className="capitalize">{user.type.replace('_', ' ')}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                {user.email_verified_at ? (
                                                    <>
                                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                                        <span>Verified</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <XCircle className="h-4 w-4 text-amber-500" />
                                                        <span>Not Verified</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <Separator />

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <Mail className="h-4 w-4 text-muted-foreground" />
                                            <div>
                                                <p className="text-sm font-medium">Email</p>
                                                <p className="text-sm text-muted-foreground">{user.email}</p>
                                            </div>
                                        </div>
                                        {user.phone && (
                                            <div className="flex items-center gap-3">
                                                <Phone className="h-4 w-4 text-muted-foreground" />
                                                <div>
                                                    <p className="text-sm font-medium">Phone</p>
                                                    <p className="text-sm text-muted-foreground">{user.phone}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <Globe className="h-4 w-4 text-muted-foreground" />
                                            <div>
                                                <p className="text-sm font-medium">Timezone & Language</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {user.timezone} • {user.language.toUpperCase()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                            <div>
                                                <p className="text-sm font-medium">Last Login</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {user.last_login_at
                                                        ? new Date(user.last_login_at).toLocaleString()
                                                        : 'Never'
                                                    }
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {user.bio && (
                                    <>
                                        <Separator />
                                        <div>
                                            <p className="text-sm font-medium mb-2">Bio</p>
                                            <p className="text-sm text-muted-foreground">{user.bio}</p>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>

                        {/* Tenants Card */}
                        {(user.owned_tenants?.length || user.member_tenants?.length) ?
                            <Card>
                                <CardHeader>
                                    <CardTitle>Tenant Access</CardTitle>
                                    <CardDescription>
                                        Tenants owned by or shared with this user
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {(user.owned_tenants?.length ?? 0) > 0 && (
                                        <div>
                                            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                                                <Building className="h-4 w-4" />
                                                Owned Tenants ({user.owned_tenants?.length ?? 0})
                                            </h4>
                                            <div className="space-y-2">
                                                {(user.owned_tenants ?? []).map(tenant => (
                                                    <div key={tenant.id} className="flex items-center justify-between p-3 border rounded-lg">
                                                        <div>
                                                            <p className="font-medium">{tenant.name}</p>
                                                            <p className="text-sm text-muted-foreground">{tenant.slug}</p>
                                                        </div>
                                                        <Badge variant="outline" className="capitalize">
                                                            Owner
                                                        </Badge>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {(user.member_tenants?.length ?? 0) > 0 && (
                                        <div>
                                            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                                                <User className="h-4 w-4" />
                                                Member Tenants ({user.member_tenants?.length ?? 0})
                                            </h4>
                                            <div className="space-y-2">
                                                {((user.member_tenants ?? []) as Array<{ id: number; name: string; slug: string; role: string }>).map(tenant => (
                                                    <div key={tenant.id} className="flex items-center justify-between p-3 border rounded-lg">
                                                        <div>
                                                            <p className="font-medium">{tenant.name}</p>
                                                            <p className="text-sm text-muted-foreground">{tenant.slug}</p>
                                                        </div>
                                                        <Badge variant="secondary" className="capitalize">
                                                            {tenant.role}
                                                        </Badge>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                            : null
                        }
                    </div>

                    {/* Right Column - Actions & Metadata */}
                    <div className="space-y-6">
                        {/* Actions Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {canChangeStatus && (
                                    <>
                                        {user.status === 'active' && (
                                            <Button
                                                variant="outline"
                                                className="w-full justify-start text-amber-600 border-amber-200"
                                                onClick={() => handleStatusChange('suspended')}
                                            >
                                                <XCircle className="mr-2 h-4 w-4" />
                                                Suspend User
                                            </Button>
                                        )}
                                        {(user.status === 'suspended' || user.status === 'inactive') && (
                                            <Button
                                                variant="outline"
                                                className="w-full justify-start text-green-600 border-green-200"
                                                onClick={() => handleStatusChange('active')}
                                            >
                                                <CheckCircle className="mr-2 h-4 w-4" />
                                                Activate User
                                            </Button>
                                        )}
                                        <Separator />
                                    </>
                                )}
                                <Button asChild variant="outline" className="w-full justify-start">
                                    <Link href={`/users/${user.id}/email`}>
                                        <Mail className="mr-2 h-4 w-4" />
                                        Send Email
                                    </Link>
                                </Button>
                                <Button asChild variant="outline" className="w-full justify-start">
                                    <Link href={`/users/${user.id}/reset-password`}>
                                        <Shield className="mr-2 h-4 w-4" />
                                        Reset Password
                                    </Link>
                                </Button>

                            </CardContent>
                        </Card>

                        {/* Roles & Permissions */}
                        {user.roles && user.roles.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Roles & Permissions</CardTitle>
                                    <CardDescription>
                                        Assigned roles and their permissions
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {user.roles.map(role => (
                                        <div key={role.id} className="border rounded-lg p-3">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="font-medium capitalize">
                                                    {role.name.replace('_', ' ')}
                                                </span>
                                                <Badge variant="outline">
                                                    {role.permissions?.length || 0} permissions
                                                </Badge>
                                            </div>
                                            {role.permissions && role.permissions.length > 0 && (
                                                <div className="flex flex-wrap gap-1">
                                                    {role.permissions.slice(0, 3).map(permission => (
                                                        <Badge key={permission} variant="secondary" className="text-xs">
                                                            {permission.split('.')[0]}
                                                        </Badge>
                                                    ))}
                                                    {role.permissions.length > 3 && (
                                                        <Badge variant="outline" className="text-xs">
                                                            +{role.permissions.length - 3} more
                                                        </Badge>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        )}

                        {/* Metadata Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle>System Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">User ID:</span>
                                    <span className="font-mono">{user.id}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Created:</span>
                                    <span>{new Date(user.created_at).toLocaleDateString()}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">Email Verified:</span>
                                    {user.email_verified_at ? (
                                        <span>{new Date(user.email_verified_at).toLocaleDateString()}</span>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <span>Not verified</span>
                                            <Button size="sm" variant="outline" onClick={handleSendVerification}>
                                                Send verification
                                            </Button>
                                        </div>
                                    )}
                                </div>
                                {user.last_login_ip && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Last Login IP:</span>
                                        <span className="font-mono">{user.last_login_ip}</span>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
