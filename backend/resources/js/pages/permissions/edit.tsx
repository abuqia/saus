import AppLayout from '@/layouts/app-layout';
import { PageHeader } from '@/components/page-header';
import { PermissionForm } from './components/permission-form';
import { Head } from '@inertiajs/react';
import { Shield } from 'lucide-react';
import type { BreadcrumbItem, Permission } from '@/types';

interface EditPermissionProps {
    permission: Permission;
}

export default function EditPermission({ permission }: EditPermissionProps) {
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
            title: permission.name,
            href: `/permissions/${permission.id}`,
        },
        {
            title: 'Edit',
            href: `/permissions/${permission.id}/edit`,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Permission - ${permission.name}`} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <PageHeader
                    title="Edit Permission"
                    description={`Update ${permission.name} permission details`}
                    icon={Shield}
                />

                <PermissionForm permission={permission} isEdit={true} />
            </div>
        </AppLayout>
    );
}
