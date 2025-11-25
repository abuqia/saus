import AppLayout from '@/layouts/app-layout';
import { PageHeader } from '@/components/page-header';
import { RoleForm } from './components/role-form';
import { Head } from '@inertiajs/react';
import { Shield } from 'lucide-react';
import type { BreadcrumbItem } from '@/types';

interface CreateRoleProps {
    guards: string[];
}

export default function CreateRole({ guards }: CreateRoleProps) {
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
            title: 'Create Role',
            href: '/roles/create',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Role" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <PageHeader
                    title="Create New Role"
                    description="Define a new role with specific permissions and access levels"
                    icon={Shield}
                />

                <RoleForm guards={guards} />
            </div>
        </AppLayout>
    );
}
