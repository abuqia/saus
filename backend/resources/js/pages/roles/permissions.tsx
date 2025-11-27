import { PageHeader } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Key, Search, Shield } from 'lucide-react';
import * as React from 'react';
import { toast } from 'sonner';

type PermissionItem = {
    id: number;
    name: string;
    label?: string;
    description?: string;
    assigned?: boolean;
};

type PermissionModule = {
    module: string;
    permissions: PermissionItem[];
};

interface RolePermissionsProps {
    role: {
        id: number;
        name: string;
        guard_name: string;
        label?: string;
        permissions_count?: number;
    };
    permissions: PermissionModule[];
    modules?: string[];
}

export default function RolePermissions({
    role,
    permissions,
}: RolePermissionsProps) {
    const [selected, setSelected] = React.useState<Set<number>>(() => {
        const initial = new Set<number>();
        for (const group of permissions) {
            for (const p of group.permissions) {
                if (p.assigned) initial.add(p.id);
            }
        }
        return initial;
    });

    const [search, setSearch] = React.useState('');
    const [saving, setSaving] = React.useState(false);
    const [groupBy, setGroupBy] = React.useState<'module' | 'model' | 'none'>(
        'model',
    );

    const normalized = search.trim().toLowerCase();

    const filteredPermissions = React.useMemo(() => {
        const flatten = (perms: PermissionModule[]): PermissionItem[] => {
            const items: PermissionItem[] = [];
            for (const g of perms) for (const p of g.permissions) items.push(p);
            return items;
        };

        const byModel = (name: string): string => {
            const first = (name || '').split('.')[0];
            return first || 'General';
        };

        const source = normalized
            ? permissions.map((group) => ({
                  ...group,
                  permissions: group.permissions.filter((p) => {
                      const label = (p.label || '').toLowerCase();
                      const name = (p.name || '').toLowerCase();
                      const desc = (p.description || '').toLowerCase();
                      return (
                          label.includes(normalized) ||
                          name.includes(normalized) ||
                          desc.includes(normalized)
                      );
                  }),
              }))
            : permissions;

        if (groupBy === 'module') {
            return source.filter((group) => group.permissions.length > 0);
        }

        const items = flatten(source);
        const groups: Record<string, PermissionItem[]> = {};
        if (groupBy === 'model') {
            for (const p of items) {
                const key = byModel(p.name);
                if (!groups[key]) groups[key] = [];
                groups[key].push(p);
            }
        } else {
            groups['All'] = items;
        }

        return Object.entries(groups)
            .map(([module, perms]) => ({ module, permissions: perms }))
            .filter((g) => g.permissions.length > 0);
    }, [permissions, normalized, groupBy]);

    const togglePermission = (id: number, checked: boolean) => {
        setSelected((prev) => {
            const next = new Set(prev);
            if (checked) next.add(id);
            else next.delete(id);
            return next;
        });
    };

    const moduleAssignedCount = (group: PermissionModule) =>
        group.permissions.filter((p) => selected.has(p.id)).length;
    const moduleTotal = (group: PermissionModule) => group.permissions.length;

    const toggleModule = (group: PermissionModule, checked: boolean) => {
        const ids = group.permissions.map((p) => p.id);
        setSelected((prev) => {
            const next = new Set(prev);
            if (checked) {
                ids.forEach((id) => next.add(id));
            } else {
                ids.forEach((id) => next.delete(id));
            }
            return next;
        });
    };

    const toggleAll = (checked: boolean) => {
        if (checked) {
            const next = new Set<number>();
            for (const group of permissions) {
                for (const p of group.permissions) next.add(p.id);
            }
            setSelected(next);
        } else {
            setSelected(new Set<number>());
        }
    };

    const totalSelected = selected.size;
    const totalPermissions = permissions.reduce(
        (sum, g) => sum + g.permissions.length,
        0,
    );

    const handleSave = async () => {
        setSaving(true);
        try {
            const response = await fetch(`/roles/${role.id}/sync-permissions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN':
                        document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute('content') || '',
                },
                body: JSON.stringify({ permissions: Array.from(selected) }),
            });
            const result = await response.json();
            if (response.ok && result.success) {
                toast.success(
                    result.message || 'Permissions updated successfully',
                );
                router.reload({ only: ['role', 'permissions'] });
            } else {
                toast.error(result.message || 'Failed to update permissions');
            }
        } catch {
            toast.error('An error occurred while updating permissions');
        } finally {
            setSaving(false);
        }
    };

    const breadcrumbs = [
        { title: 'Dashboard', href: '/' },
        { title: 'Roles & Permissions', href: '/roles' },
        {
            title: role.label || role.name.replace(/_/g, ' '),
            href: `/roles/${role.id}`,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Manage Permissions - ${role.label || role.name}`} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <PageHeader
                    title="Manage Permissions"
                    description="Assign or remove permissions for this role"
                    icon={Key}
                    actions={
                        <div className="flex items-center gap-2">
                            <Button asChild variant="outline">
                                <Link href={`/roles/${role.id}`}>
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Back to Role
                                </Link>
                            </Button>
                            <Button onClick={handleSave} disabled={saving}>
                                {saving ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </div>
                    }
                />

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="h-5 w-5 text-primary" />
                                <span className="capitalize">
                                    {role.label || role.name.replace(/_/g, ' ')}
                                </span>
                                <Badge variant="outline" className="capitalize">
                                    {role.guard_name}
                                </Badge>
                            </CardTitle>
                            <CardDescription>
                                {totalSelected} of {totalPermissions} permissions
                                selected
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="relative w-full max-w-sm">
                                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        placeholder="Search permissions by name, label, description..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="pl-9"
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <Select
                                        value={groupBy}
                                        onValueChange={(v) =>
                                            setGroupBy(v as typeof groupBy)
                                        }
                                    >
                                        <SelectTrigger className="h-9 w-[160px]">
                                            <SelectValue placeholder="Group by" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="module">
                                                Group by Module
                                            </SelectItem>
                                            <SelectItem value="model">
                                                Group by Model
                                            </SelectItem>
                                            <SelectItem value="none">
                                                No Grouping
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Checkbox
                                        checked={
                                            totalSelected === totalPermissions &&
                                            totalPermissions > 0
                                        }
                                        onCheckedChange={(v) => toggleAll(!!v)}
                                        aria-label="Select all permissions"
                                    />
                                    <span className="text-sm">Select All</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Separator />

                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {filteredPermissions.map((group) => (
                            <Card key={group.module} className="overflow-hidden">
                                <CardHeader>
                                    <CardTitle className="flex items-center justify-between">
                                        <span className="capitalize">
                                            {group.module || 'General'}
                                        </span>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <span>
                                                {moduleAssignedCount(group)} /{' '}
                                                {moduleTotal(group)} selected
                                            </span>
                                            <Checkbox
                                                checked={
                                                    moduleAssignedCount(group) ===
                                                        moduleTotal(group) &&
                                                    moduleTotal(group) > 0
                                                }
                                                onCheckedChange={(v) =>
                                                    toggleModule(group, !!v)
                                                }
                                                aria-label="Select all in module"
                                            />
                                        </div>
                                    </CardTitle>
                                    <CardDescription>
                                        Manage permissions within this module
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {group.permissions.map((p) => (
                                        <div
                                            key={p.id}
                                            className="flex items-start gap-3 rounded-md border p-2"
                                        >
                                            <Checkbox
                                                checked={selected.has(p.id)}
                                                onCheckedChange={(v) =>
                                                    togglePermission(p.id, !!v)
                                                }
                                                aria-label={`Toggle ${p.name}`}
                                            />
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-medium capitalize">
                                                        {(
                                                            p.label || p.name
                                                        ).replace(/\./g, ' • ')}
                                                    </span>
                                                    <Badge
                                                        variant="outline"
                                                        className="text-xs"
                                                    >
                                                        {group.module || 'General'}
                                                    </Badge>
                                                </div>
                                                {p.description && (
                                                    <p className="mt-1 text-xs text-muted-foreground">
                                                        {p.description}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    {group.permissions.length === 0 && (
                                        <p className="text-sm text-muted-foreground">
                                            No permissions match your search.
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                        {filteredPermissions.length === 0 && (
                            <div className="col-span-3 text-center text-muted-foreground">
                                No permissions found.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
