/* eslint-disable @typescript-eslint/no-unused-vars */
import AppLayout from '@/layouts/app-layout';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { router, Link, Head, useForm } from '@inertiajs/react';
import {
    Key,
    ArrowLeft,
    User,
    Mail,
    Shield,
    Eye,
    EyeOff,
    CheckCircle2,
    AlertCircle,
} from 'lucide-react';
import type { BreadcrumbItem, User as UserType, PageProps } from '@/types';
import { useState } from 'react';
import { toast } from 'sonner';

interface ResetPasswordProps {
    user: {
        avatar: string | undefined;
        id: number;
        name: string;
        email: string;
    };
}

export default function ResetPassword({ user }: ResetPasswordProps) {
    const { data, setData, processing, post, errors } = useForm({
        password: '',
        password_confirmation: '',
        notify_user: true,
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
        {
            title: 'Reset Password',
            href: `/users/${user.id}/reset-password`,
        },
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        post(`/users/${user.id}/reset-password`, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Password reset successfully!');
                // Redirect back to user detail page after a short delay
                setTimeout(() => {
                    router.visit(`/users/${user.id}`);
                }, 1500);
            },
            onError: () => {
                toast.error('Failed to reset password. Please check the form and try again.');
            },
        });
    };

    const generateStrongPassword = () => {
        const length = 12;
        const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
        let password = "";

        // Ensure at least one of each required character type
        password += "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[Math.floor(Math.random() * 26)];
        password += "abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 26)];
        password += "0123456789"[Math.floor(Math.random() * 10)];
        password += "!@#$%^&*"[Math.floor(Math.random() * 8)];

        // Fill the rest randomly
        for (let i = password.length; i < length; i++) {
            password += charset[Math.floor(Math.random() * charset.length)];
        }

        // Shuffle the password
        password = password.split('').sort(() => 0.5 - Math.random()).join('');

        setData({
            ...data,
            password: password,
            password_confirmation: password,
        });
    };

    const passwordStrength = {
        length: data.password.length >= 8,
        uppercase: /[A-Z]/.test(data.password),
        lowercase: /[a-z]/.test(data.password),
        number: /[0-9]/.test(data.password),
        special: /[!@#$%^&*]/.test(data.password),
    };

    const strengthScore = Object.values(passwordStrength).filter(Boolean).length;
    const strengthText = [
        'Very Weak',
        'Weak',
        'Fair',
        'Good',
        'Strong',
        'Very Strong'
    ][strengthScore];

    const strengthColor = [
        'text-red-500',
        'text-orange-500',
        'text-yellow-500',
        'text-lime-500',
        'text-green-500',
        'text-emerald-500'
    ][strengthScore];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Reset Password - ${user.name}`} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <PageHeader
                    title="Reset Password"
                    description="Set a new password for the user account"
                    icon={Key}
                    actions={
                        <Button asChild variant="outline">
                            <Link href={`/users/${user.id}`}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to User
                            </Link>
                        </Button>
                    }
                />

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Main Form */}
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Set New Password</CardTitle>
                                <CardDescription>
                                    Create a strong new password for {user.name}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* User Information */}
                                    <div className="flex items-center gap-4 p-4 border rounded-lg bg-muted/50">
                                        <Avatar className="h-12 w-12">
                                            <AvatarImage src={user.avatar} alt={user.name} />
                                            <AvatarFallback>
                                                <User className="h-6 w-6" />
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <p className="font-medium text-lg">{user.name}</p>
                                            <p className="text-sm text-muted-foreground">{user.email}</p>
                                        </div>
                                        <Badge variant="outline">
                                            <Shield className="h-3 w-3 mr-1" />
                                            Reset Password
                                        </Badge>
                                    </div>

                                    {/* Password Field */}
                                    <div className="space-y-3">
                                        <Label htmlFor="password">New Password *</Label>
                                        <div className="relative">
                                            <Input
                                                id="password"
                                                type={showPassword ? "text" : "password"}
                                                value={data.password}
                                                onChange={e => setData('password', e.target.value)}
                                                placeholder="Enter new password"
                                                required
                                                className="pr-10"
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                {showPassword ? (
                                                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                                                ) : (
                                                    <Eye className="h-4 w-4 text-muted-foreground" />
                                                )}
                                            </Button>
                                        </div>
                                        {errors.password && (
                                            <p className="text-sm text-destructive flex items-center gap-1">
                                                <AlertCircle className="h-4 w-4" />
                                                {errors.password}
                                            </p>
                                        )}

                                        {/* Password Strength Indicator */}
                                        {data.password && (
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-muted-foreground">Password Strength:</span>
                                                    <span className={`font-medium ${strengthColor}`}>
                                                        {strengthText}
                                                    </span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className={`h-2 rounded-full transition-all duration-300 ${
                                                            strengthScore === 0 ? 'bg-red-500 w-1/6' :
                                                            strengthScore === 1 ? 'bg-orange-500 w-2/6' :
                                                            strengthScore === 2 ? 'bg-yellow-500 w-3/6' :
                                                            strengthScore === 3 ? 'bg-lime-500 w-4/6' :
                                                            strengthScore === 4 ? 'bg-green-500 w-5/6' :
                                                            'bg-emerald-500 w-full'
                                                        }`}
                                                    />
                                                </div>
                                                <div className="grid grid-cols-2 gap-2 text-xs">
                                                    <div className={`flex items-center gap-1 ${passwordStrength.length ? 'text-green-600' : 'text-muted-foreground'}`}>
                                                        <CheckCircle2 className="h-3 w-3" />
                                                        At least 8 characters
                                                    </div>
                                                    <div className={`flex items-center gap-1 ${passwordStrength.uppercase ? 'text-green-600' : 'text-muted-foreground'}`}>
                                                        <CheckCircle2 className="h-3 w-3" />
                                                        Uppercase letter
                                                    </div>
                                                    <div className={`flex items-center gap-1 ${passwordStrength.lowercase ? 'text-green-600' : 'text-muted-foreground'}`}>
                                                        <CheckCircle2 className="h-3 w-3" />
                                                        Lowercase letter
                                                    </div>
                                                    <div className={`flex items-center gap-1 ${passwordStrength.number ? 'text-green-600' : 'text-muted-foreground'}`}>
                                                        <CheckCircle2 className="h-3 w-3" />
                                                        Number
                                                    </div>
                                                    <div className={`flex items-center gap-1 ${passwordStrength.special ? 'text-green-600' : 'text-muted-foreground'}`}>
                                                        <CheckCircle2 className="h-3 w-3" />
                                                        Special character
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Confirm Password Field */}
                                    <div className="space-y-2">
                                        <Label htmlFor="password_confirmation">Confirm New Password *</Label>
                                        <div className="relative">
                                            <Input
                                                id="password_confirmation"
                                                type={showConfirmPassword ? "text" : "password"}
                                                value={data.password_confirmation}
                                                onChange={e => setData('password_confirmation', e.target.value)}
                                                placeholder="Confirm new password"
                                                required
                                                className="pr-10"
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            >
                                                {showConfirmPassword ? (
                                                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                                                ) : (
                                                    <Eye className="h-4 w-4 text-muted-foreground" />
                                                )}
                                            </Button>
                                        </div>
                                        {errors.password_confirmation && (
                                            <p className="text-sm text-destructive flex items-center gap-1">
                                                <AlertCircle className="h-4 w-4" />
                                                {errors.password_confirmation}
                                            </p>
                                        )}
                                    </div>

                                    {/* Notify User Checkbox */}
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            id="notify_user"
                                            checked={data.notify_user}
                                            onChange={e => setData('notify_user', e.target.checked)}
                                            className="rounded border-gray-300 text-primary focus:ring-primary"
                                        />
                                        <Label htmlFor="notify_user" className="text-sm">
                                            Send password reset notification email to user
                                        </Label>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex flex-col gap-3 sm:flex-row">
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                            className="flex-1"
                                        >
                                            {processing ? (
                                                <>
                                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                                                    Resetting Password...
                                                </>
                                            ) : (
                                                <>
                                                    <Key className="mr-2 h-4 w-4" />
                                                    Reset Password
                                                </>
                                            )}
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={generateStrongPassword}
                                            className="sm:flex-none"
                                        >
                                            Generate Strong Password
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => router.visit(`/users/${user.id}`)}
                                            className="sm:flex-none"
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Security Tips */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Security Tips</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                <div className="flex items-start gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                    <span>Use a unique password that hasn't been used before</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                    <span>Include a mix of uppercase, lowercase, numbers, and symbols</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                    <span>Aim for at least 12 characters in length</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                    <span>Avoid common words, phrases, or personal information</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* User Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle>User Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-12 w-12">
                                        <AvatarImage src={user.avatar} alt={user.name} />
                                        <AvatarFallback className="text-sm">
                                            {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-medium">{user.name}</p>
                                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                                            <Mail className="h-3 w-3" />
                                            {user.email}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-sm space-y-1">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">User ID:</span>
                                        <span className="font-mono">{user.id}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Important Notice */}
                        <Card className="border-amber-200 bg-amber-50">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-amber-800">
                                    <AlertCircle className="h-5 w-5" />
                                    Important Notice
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="text-sm text-amber-700">
                                <p>
                                    Resetting the password will immediately invalidate the user's current password.
                                    They will need to use the new password for their next login.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
