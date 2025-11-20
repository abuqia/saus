/* eslint-disable @typescript-eslint/no-explicit-any */
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard, settings } from '@/routes';
import { resolveUrl } from '@/lib/utils';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import {
    LayoutGrid,
    Settings,
    Users,
    Shield,
    Lock,
    Building2,
    Palette,
} from 'lucide-react';
import { useMemo } from 'react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Settings',
        href: settings(),
        icon: Settings,
    },
];

export function AppSidebar() {
    const { auth } = usePage().props as any;
    const user = auth?.user;
    const page = usePage();

    // Check if user has permissions
    const canManageUsers = user?.permissions?.includes('users.view') || user?.type === 'super_admin';
    const canManageRoles = user?.permissions?.includes('roles.view') || user?.type === 'super_admin';
    const canManagePermissions = user?.permissions?.includes('permissions.manage') || user?.type === 'super_admin';
    const canManageTenants = user?.permissions?.includes('tenants.view') || user?.type === 'super_admin';
    const canManageThemes = user?.permissions?.includes('themes.view') || user?.type === 'super_admin';

    // User Management Items
    const userManagementItems: NavItem[] = useMemo(() => {
        const items: NavItem[] = [];

        if (canManageUsers) {
            items.push({
                title: 'Users',
                href: '/users',
                icon: Users,
            });
        }

        if (canManageRoles) {
            items.push({
                title: 'Roles',
                href: '/roles',
                icon: Shield,
            });
        }

        if (canManagePermissions) {
            items.push({
                title: 'Permissions',
                href: '/permissions',
                icon: Lock,
            });
        }

        return items;
    }, [canManageUsers, canManageRoles, canManagePermissions]);

    // System Management Items
    const systemManagementItems: NavItem[] = useMemo(() => {
        const items: NavItem[] = [];

        if (canManageTenants) {
            items.push({
                title: 'Tenants',
                href: '/tenants',
                icon: Building2,
            });
        }

        if (canManageThemes) {
            items.push({
                title: 'Themes',
                href: '/themes',
                icon: Palette,
            });
        }

        return items;
    }, [canManageTenants, canManageThemes]);

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                {/* Main Navigation */}
                <NavMain items={mainNavItems} />

                {/* User Management Section */}
                {userManagementItems.length > 0 && (
                    <SidebarGroup>
                        <SidebarGroupLabel>User Management</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {userManagementItems.map((item) => (
                                    <SidebarMenuItem key={item.href as string}>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={page.url.startsWith(resolveUrl(item.href))}
                                    >
                                        <Link href={item.href} prefetch>
                                            {item.icon && <item.icon className="h-4 w-4" />}
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                )}

                {/* System Management Section */}
                {systemManagementItems.length > 0 && (
                    <SidebarGroup>
                        <SidebarGroupLabel>System</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {systemManagementItems.map((item) => (
                                    <SidebarMenuItem key={item.href as string}>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={page.url.startsWith(resolveUrl(item.href))}
                                    >
                                        <Link href={item.href} prefetch>
                                            {item.icon && <item.icon className="h-4 w-4" />}
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                )}
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
            </SidebarFooter>
        </Sidebar>
    );
}
