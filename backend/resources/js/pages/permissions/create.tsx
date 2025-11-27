import AppLayout from '@/layouts/app-layout';
import { PageHeader } from '@/components/page-header';
import { PermissionForm } from './components/permission-form';
import { Head } from '@inertiajs/react';
import { Shield } from 'lucide-react';
import type { BreadcrumbItem } from '@/types';

export default function CreatePermission() {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
        {
            title: 'Permissions',
            href: '/permissions',
        },
        {
            title: 'Create Permission',
            href: '/permissions/create',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Permission" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <PageHeader
                    title="Create New Permission"
                    description="Add a new permission to the system with appropriate access controls"
                    icon={Shield}
                />

                <PermissionForm />
            </div>
        </AppLayout>
    );
}
