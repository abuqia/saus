import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem, type PageProps } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, LogOut, Shield, AlertTriangle, Activity, BarChart3, Settings } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

export default function Dashboard() {
    const { props } = usePage<PageProps>();
    const isImpersonating = props.impersonating || false;
    const originalUser = props.original_user;
    const currentUser = props.auth.user;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <div className="flex flex-col gap-6 p-6">
                {/* Impersonation Banner */}
                {isImpersonating && originalUser && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Shield className="h-5 w-5 text-amber-600" />
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-amber-800">
                                            Impersonation Mode Active
                                        </span>
                                        <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">
                                            Viewing as {currentUser.name}
                                        </Badge>
                                    </div>
                                    <p className="text-amber-700 text-sm mt-1">
                                        You are currently impersonating <strong>{currentUser.name}</strong>.
                                        Original user: <strong>{originalUser.name}</strong> ({originalUser.email})
                                    </p>
                                </div>
                            </div>
                            <Button asChild variant="outline" size="sm" className="border-amber-300 text-amber-800 dark:border-red-600 dark:bg-red-600 dark:text-white dark:hover:bg-red-400">
                                <Link href="/users/stop-impersonate">
                                    <LogOut className="h-4 w-4 mr-2" />
                                    Stop Impersonating
                                </Link>
                            </Button>
                        </div>
                    </div>
                )}

                {/* Welcome Section */}
                <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                Welcome back, {currentUser.name}!
                                {currentUser.type !== 'user' && (
                                    <Badge variant="secondary" className="capitalize">
                                        {currentUser.type.replace('_', ' ')}
                                    </Badge>
                                )}
                            </CardTitle>
                            <CardDescription>
                                {isImpersonating
                                    ? `You are currently viewing the dashboard as ${currentUser.name}. All actions will be performed on their behalf.`
                                    : 'Here is your overview of the system and recent activities.'
                                }
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm">
                                        <Activity className="h-4 w-4 text-muted-foreground" />
                                        <span>Status:</span>
                                        <Badge
                                            variant={currentUser.status === 'active' ? 'default' : 'secondary'}
                                            className={
                                                currentUser.status === 'active'
                                                    ? 'bg-green-100 text-green-800 border-green-200'
                                                    : 'bg-gray-100 text-gray-800'
                                            }
                                        >
                                            {currentUser.status}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                                        <span>Plan:</span>
                                        <Badge variant="outline" className="capitalize">
                                            {currentUser.plan}
                                        </Badge>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="text-sm">
                                        <span className="text-muted-foreground">Email: </span>
                                        {currentUser.email}
                                    </div>
                                    {currentUser.email_verified_at ? (
                                        <div className="flex items-center gap-2 text-sm text-green-600">
                                            <Settings className="h-4 w-4" />
                                            Email Verified
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 text-sm text-amber-600">
                                            <AlertTriangle className="h-4 w-4" />
                                            Email Not Verified
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Stats */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                            <CardDescription>
                                Frequently used features
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {currentUser.type !== 'user' && (
                                    <Button asChild variant="outline" className="w-full justify-start">
                                        <Link href="/users">
                                            <Users className="h-4 w-4 mr-2" />
                                            Manage Users
                                        </Link>
                                    </Button>
                                )}

                                {isImpersonating && (
                                    <Button asChild variant="outline" className="w-full justify-start border-amber-200 text-amber-700mo">
                                        <Link href="/users/stop-impersonate">
                                            <LogOut className="h-4 w-4 mr-2" />
                                            Stop Impersonating
                                        </Link>
                                    </Button>
                                )}

                                <Button asChild variant="outline" className="w-full justify-start">
                                    <Link href="/settings/profile">
                                        <Settings className="h-4 w-4 mr-2" />
                                        Profile Settings
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Grid */}
                <div className="grid auto-rows-min gap-6 md:grid-cols-3">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm">System Overview</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="relative aspect-video overflow-hidden rounded-lg">
                                <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="text-center">
                                        <BarChart3 className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                                        <p className="text-sm text-muted-foreground">Charts & Analytics</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm">Recent Activity</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="relative aspect-video overflow-hidden rounded-lg">
                                <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="text-center">
                                        <Activity className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                                        <p className="text-sm text-muted-foreground">Activity Feed</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm">User Statistics</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="relative aspect-video overflow-hidden rounded-lg">
                                <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="text-center">
                                        <Users className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                                        <p className="text-sm text-muted-foreground">User Metrics</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Full Width Content Area */}
                <Card>
                    <CardHeader>
                        <CardTitle>Detailed Analytics</CardTitle>
                        <CardDescription>
                            Comprehensive overview of your platform performance
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="relative min-h-[400px] overflow-hidden rounded-lg border">
                            <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-center">
                                    <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold text-muted-foreground">Analytics Dashboard</h3>
                                    <p className="text-sm text-muted-foreground mt-2">
                                        {isImpersonating
                                            ? "Viewing analytics for the impersonated user"
                                            : "Your complete analytics overview will appear here"
                                        }
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Security Notice for Impersonation */}
                {isImpersonating && (
                    <Card className="border-amber-200 bg-amber-50">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-amber-800">
                                <AlertTriangle className="h-5 w-5" />
                                Security Notice
                            </CardTitle>
                            <CardDescription className="text-amber-700">
                                You are currently in impersonation mode. Remember to stop impersonating when you're done reviewing this user's account.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button asChild variant="outline" className="border-amber-300 text-amber-800 hover:bg-amber-100 dark:border-red-600 dark:bg-red-600 dark:text-white dark:hover:bg-red-400">
                                <Link href="/users/stop-impersonate">
                                    <LogOut className="h-4 w-4 mr-2" />
                                    Stop Impersonating Now
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
