// pages/admin/users/create.tsx
import AppLayout from '@/layouts/app-layout';
import { PageHeader } from '@/components/page-header';
import { UserForm } from './components/user-form';
import { Head } from '@inertiajs/react';
import { Users as UsersIcon } from 'lucide-react';
import type { BreadcrumbItem, Role } from '@/types';

interface CreateUserProps {
    roles: Role[];
}

export default function CreateUser({ roles }: CreateUserProps) {
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
            title: 'Create User',
            href: '/users/create',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create User" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <PageHeader
                    title="Create New User"
                    description="Add a new user to the system with appropriate permissions"
                    icon={UsersIcon}
                />

                <UserForm roles={roles} />
            </div>
        </AppLayout>
    );
}
