import AppLayout from '@/layouts/app-layout';
import { PageHeader } from '@/components/page-header';
import { UserForm } from './components/user-form';
import { Head } from '@inertiajs/react';
import { Users as UsersIcon } from 'lucide-react';
import type { BreadcrumbItem, User, Role } from '@/types';

interface EditUserProps {
    user: User & { roles?: number[] };
    roles: Role[];
}

export default function EditUser({ user, roles }: EditUserProps) {
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
            title: 'Edit',
            href: `/users/${user.id}/edit`,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit User - ${user.name}`} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <PageHeader
                    title="Edit User"
                    description={`Update ${user.name}'s information and permissions`}
                    icon={UsersIcon}
                />

                <UserForm user={user} roles={roles} isEdit={true} />
            </div>
        </AppLayout>
    );
}
