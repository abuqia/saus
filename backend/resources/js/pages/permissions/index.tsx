/* eslint-disable @typescript-eslint/no-unused-vars */
import AppLayout from '@/layouts/app-layout';
import { PageHeader, StatsCard } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { router } from '@inertiajs/react';
import { Lock, Plus, Trash, Search, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { useForm } from '@inertiajs/react';

interface Permission {
    id: number;
    name: string;
    display_name: string;
    guard_name: string;
    created_at: string;
}

interface PermissionGroup {
    category: string;
    permissions: Permission[];
}

interface PageProps {
    permissions: {
        data: Permission[];
        total: number;
    };
    groupedPermissions: PermissionGroup[];
    filters: {
        search?: string;
    };
    stats: {
        total: number;
        categories: number;
    };
}

export default function PermissionsIndex({ permissions, groupedPermissions, filters, stats }: PageProps) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        guard_name: 'web',
    });

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        post('/permissions', {
            preserveScroll: true,
            onSuccess: () => {
                setIsCreateOpen(false);
                reset();
            },
        });
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this permission?')) {
            router.delete(`/permissions/${id}`, {
                preserveScroll: true,
            });
        }
    };

    const handleSync = () => {
        router.post('/permissions/sync', {}, {
            preserveScroll: true,
        });
    };

    const filteredGroups = groupedPermissions.filter(group =>
        searchTerm === '' ||
        group.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        group.permissions.some(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <>
            <PageHeader
                title="Permissions"
                description="Manage system permissions and access control"
                icon={Lock}
                actions={
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={handleSync}>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Sync Cache
                        </Button>
                        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                            <DialogTrigger asChild>
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Create Permission
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <form onSubmit={handleCreate}>
                                    <DialogHeader>
                                        <DialogTitle>Create New Permission</DialogTitle>
                                        <DialogDescription>
                                            Add a new permission to the system. Use dot notation (e.g., users.create)
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="name">Permission Name</Label>
                                            <Input
                                                id="name"
                                                placeholder="e.g., users.create"
                                                value={data.name}
                                                onChange={(e) => setData('name', e.target.value)}
                                            />
                                            {errors.name && (
                                                <p className="text-sm text-destructive">{errors.name}</p>
                                            )}
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="guard_name">Guard Name</Label>
                                            <Input
                                                id="guard_name"
                                                value={data.guard_name}
                                                onChange={(e) => setData('guard_name', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                                            Cancel
                                        </Button>
                                        <Button type="submit" disabled={processing}>
                                            Create Permission
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                }
            />

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-2 mb-6">
                <StatsCard
                    title="Total Permissions"
                    value={stats.total}
                    icon={Lock}
                />
                <StatsCard
                    title="Categories"
                    value={stats.categories}
                    description="Permission groups"
                />
            </div>

            {/* Search */}
            <div className="mb-6">
                <div className="relative max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search permissions..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9"
                    />
                </div>
            </div>

            {/* Grouped Permissions */}
            <div className="grid gap-6">
                {filteredGroups.map((group) => (
                    <Card key={group.category}>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="capitalize">{group.category}</CardTitle>
                                    <CardDescription>
                                        {group.permissions.length} permissions
                                    </CardDescription>
                                </div>
                                <Badge variant="secondary">{group.category}</Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Display Name</TableHead>
                                        <TableHead>Guard</TableHead>
                                        <TableHead>Created</TableHead>
                                        <TableHead className="w-[100px]">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {group.permissions.map((permission) => (
                                        <TableRow key={permission.id}>
                                            <TableCell>
                                                <code className="text-sm">{permission.name}</code>
                                            </TableCell>
                                            <TableCell>{permission.display_name}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{permission.guard_name}</Badge>
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {new Date(permission.created_at).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDelete(permission.id)}
                                                >
                                                    <Trash className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {filteredGroups.length === 0 && (
                <Card>
                    <CardContent className="flex items-center justify-center p-12">
                        <div className="text-center">
                            <Lock className="mx-auto h-12 w-12 text-muted-foreground" />
                            <h3 className="mt-4 text-lg font-semibold">No permissions found</h3>
                            <p className="mt-2 text-sm text-muted-foreground">
                                Try adjusting your search or create a new permission.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}
        </>
    );
}

PermissionsIndex.layout = (page: React.ReactNode) => <AppLayout children={page} />;
