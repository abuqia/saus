import AppLayout from '@/layouts/app-layout';
import { PageHeader } from '@/components/page-header';
import { RoleForm } from './components/role-form';
import { Head } from '@inertiajs/react';
import { Shield } from 'lucide-react';
import type { BreadcrumbItem, Role } from '@/types';

interface EditRoleProps {
    role: Role;
    guards: string[];
}

export default function EditRole({ role, guards }: EditRoleProps) {
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
            title: role.name?.replace(/_/g, ' ') || 'Role',
            href: `/roles/${role.id}`,
        },
        {
            title: 'Edit',
            href: `/roles/${role.id}/edit`,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Role - ${role.name}`} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <PageHeader
                    title="Edit Role"
                    description={`Update ${role.name}'s information and settings`}
                    icon={Shield}
                />

                <RoleForm role={role} guards={guards} isEdit={true} />
            </div>
        </AppLayout>
    );
}
