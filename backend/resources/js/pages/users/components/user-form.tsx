/* eslint-disable @typescript-eslint/no-explicit-any */
import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Save, ArrowLeft } from 'lucide-react';
import { Link } from '@inertiajs/react';
import type { User, Role } from '@/types';

interface UserFormProps {
    user?: Omit<User, 'roles'> & { roles?: number[] };
    roles: Role[];
    isEdit?: boolean;
}

type FormData = {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    type: 'super_admin' | 'admin' | 'user';
    status: 'active' | 'inactive' | 'suspended' | 'banned';
    plan: 'free' | 'starter' | 'pro' | 'enterprise';
    phone: string;
    bio: string;
    timezone: string;
    language: string;
    roles: number[];
};

export function UserForm({ user, roles, isEdit = false }: UserFormProps) {
    const { data, setData, errors, processing, post, put } = useForm<FormData>({
        name: user?.name || '',
        email: user?.email || '',
        password: '',
        password_confirmation: '',
        type: user?.type || 'user',
        status: user?.status || 'active',
        plan: user?.plan || 'free',
        phone: user?.phone || '',
        bio: user?.bio || '',
        timezone: user?.timezone || 'UTC',
        language: user?.language || 'en',
        roles: (user?.roles as number[] | undefined) ?? [],
    });

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEdit) {
            put(`/users/${user?.id}`, {
                preserveScroll: true,
            });
        } else {
            post('/users', {
                preserveScroll: true,
            });
        }
    };

    const handleRoleChange = (roleId: number, checked: boolean) => {
        if (checked) {
            setData('roles', [...data.roles, roleId]);
        } else {
            setData('roles', data.roles.filter((id: number) => id !== roleId));
        }
    };

    return (
        <form onSubmit={onSubmit} className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-3">
                {/* Main Form */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Basic Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Basic Information</CardTitle>
                            <CardDescription>
                                User's personal details and account information
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Full Name *</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={e => setData('name', e.target.value)}
                                        placeholder="Enter full name"
                                        required
                                    />
                                    {errors.name && (
                                        <p className="text-sm text-destructive">{errors.name}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address *</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={e => setData('email', e.target.value)}
                                        placeholder="Enter email address"
                                        required
                                    />
                                    {errors.email && (
                                        <p className="text-sm text-destructive">{errors.email}</p>
                                    )}
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone Number</Label>
                                    <Input
                                        id="phone"
                                        value={data.phone}
                                        onChange={e => setData('phone', e.target.value)}
                                        placeholder="Enter phone number"
                                    />
                                    {errors.phone && (
                                        <p className="text-sm text-destructive">{errors.phone}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="type">User Type *</Label>
                                    <Select value={data.type} onValueChange={value => setData('type', value as any)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select user type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="user">User</SelectItem>
                                            <SelectItem value="admin">Admin</SelectItem>
                                            <SelectItem value="super_admin">Super Admin</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.type && (
                                        <p className="text-sm text-destructive">{errors.type}</p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="bio">Bio</Label>
                                <Textarea
                                    id="bio"
                                    value={data.bio}
                                    onChange={e => setData('bio', e.target.value)}
                                    placeholder="Tell us a little about this user..."
                                    rows={3}
                                />
                                {errors.bio && (
                                    <p className="text-sm text-destructive">{errors.bio}</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Password Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Password</CardTitle>
                            <CardDescription>
                                {isEdit ? 'Change password (leave blank to keep current)' : 'Set initial password'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="password">
                                        Password {!isEdit && '*'}
                                    </Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={data.password}
                                        onChange={e => setData('password', e.target.value)}
                                        placeholder={isEdit ? "New password" : "Enter password"}
                                    />
                                    {errors.password && (
                                        <p className="text-sm text-destructive">{errors.password}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password_confirmation">
                                        Confirm Password {!isEdit && '*'}
                                    </Label>
                                    <Input
                                        id="password_confirmation"
                                        type="password"
                                        value={data.password_confirmation}
                                        onChange={e => setData('password_confirmation', e.target.value)}
                                        placeholder="Confirm password"
                                    />
                                    {errors.password_confirmation && (
                                        <p className="text-sm text-destructive">{errors.password_confirmation}</p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Roles & Permissions */}
                    {roles.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Roles & Permissions</CardTitle>
                                <CardDescription>
                                    Assign roles to control user permissions
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {roles.map(role => (
                                        <div key={role.id} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`role-${role.id}`}
                                                checked={role.id != null && data.roles.includes(role.id!)}
                                                onCheckedChange={checked =>
                                                    handleRoleChange(role.id!, checked as boolean)
                                                }
                                            />
                                            <Label
                                                htmlFor={`role-${role.id}`}
                                                className="flex items-center gap-2 cursor-pointer"
                                            >
                                                <span className="capitalize">
                                                    {role.name.replace('_', ' ')}
                                                </span>
                                                {role.label && (
                                                    <Badge variant="outline" className="text-xs">
                                                        {role.label}
                                                    </Badge>
                                                )}
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                                {errors.roles && (
                                    <p className="text-sm text-destructive mt-2">{errors.roles}</p>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Account Settings */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Account Settings</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="status">Status</Label>
                                <Select value={data.status} onValueChange={value => setData('status', value as any)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="inactive">Inactive</SelectItem>
                                        <SelectItem value="suspended">Suspended</SelectItem>
                                        <SelectItem value="banned">Banned</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.status && (
                                    <p className="text-sm text-destructive">{errors.status}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="plan">Subscription Plan</Label>
                                <Select value={data.plan} onValueChange={value => setData('plan', value as any)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select plan" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="free">Free</SelectItem>
                                        <SelectItem value="starter">Starter</SelectItem>
                                        <SelectItem value="pro">Pro</SelectItem>
                                        <SelectItem value="enterprise">Enterprise</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.plan && (
                                    <p className="text-sm text-destructive">{errors.plan}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="timezone">Timezone</Label>
                                <Select value={data.timezone} onValueChange={value => setData('timezone', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select timezone" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="UTC">UTC</SelectItem>
                                        <SelectItem value="America/New_York">Eastern Time</SelectItem>
                                        <SelectItem value="America/Chicago">Central Time</SelectItem>
                                        <SelectItem value="America/Denver">Mountain Time</SelectItem>
                                        <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                                        <SelectItem value="Europe/London">London</SelectItem>
                                        <SelectItem value="Europe/Paris">Paris</SelectItem>
                                        <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.timezone && (
                                    <p className="text-sm text-destructive">{errors.timezone}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="language">Language</Label>
                                <Select value={data.language} onValueChange={value => setData('language', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select language" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="en">English</SelectItem>
                                        <SelectItem value="es">Spanish</SelectItem>
                                        <SelectItem value="fr">French</SelectItem>
                                        <SelectItem value="de">German</SelectItem>
                                        <SelectItem value="ja">Japanese</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.language && (
                                    <p className="text-sm text-destructive">{errors.language}</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Form Actions */}
                    <Card>
                        <CardContent className="pt-6">
                            <div className="space-y-3">
                                <Button type="submit" className="w-full" disabled={processing}>
                                    {processing ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            {isEdit ? 'Updating...' : 'Creating...'}
                                        </>
                                    ) : (
                                        <>
                                            <Save className="mr-2 h-4 w-4" />
                                            {isEdit ? 'Update User' : 'Create User'}
                                        </>
                                    )}
                                </Button>
                                <Button asChild variant="outline" className="w-full">
                                    <Link href="/users">
                                        <ArrowLeft className="mr-2 h-4 w-4" />
                                        Back to Users
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </form>
    );
}
