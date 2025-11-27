import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { router, useForm } from '@inertiajs/react';
import { AlertCircle, Shield } from 'lucide-react';
import { toast } from 'sonner';

interface PermissionFormProps {
    permission?: {
        id: number;
        name: string;
        guard_name: string;
        description?: string;
    };
    isEdit?: boolean;
}

export function PermissionForm({ permission, isEdit = false }: PermissionFormProps) {
    const { data, setData, processing, errors, post, put } = useForm({
        name: permission?.name || '',
        guard_name: permission?.guard_name || 'web',
        description: permission?.description || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const url = isEdit ? `/permissions/${permission?.id}` : '/permissions';
        const method = isEdit ? put : post;

        method(url, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(`Permission ${isEdit ? 'updated' : 'created'} successfully!`);
                router.visit('/permissions');
            },
            onError: () => {
                toast.error(`Failed to ${isEdit ? 'update' : 'create'} permission. Please check the form.`);
            },
        });
    };

    return (
        <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
                <Card>
                    <CardHeader>
                        <CardTitle>
                            {isEdit ? 'Edit Permission' : 'Create New Permission'}
                        </CardTitle>
                        <CardDescription>
                            {isEdit
                                ? 'Update the permission details and access controls.'
                                : 'Add a new permission to the system with appropriate access controls.'
                            }
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Permission Name */}
                            <div className="space-y-2">
                                <Label htmlFor="name">Permission Name *</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    placeholder="e.g., users.create, settings.update"
                                    required
                                />
                                {errors.name && (
                                    <p className="text-sm text-destructive flex items-center gap-1">
                                        <AlertCircle className="h-4 w-4" />
                                        {errors.name}
                                    </p>
                                )}
                                <p className="text-sm text-muted-foreground">
                                    Use dot notation for grouping (e.g., users.create, settings.update)
                                </p>
                            </div>

                            {/* Guard Name */}
                            <div className="space-y-2">
                                <Label htmlFor="guard_name">Guard Name *</Label>
                                <select
                                    id="guard_name"
                                    value={data.guard_name}
                                    onChange={e => setData('guard_name', e.target.value)}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                    required
                                >
                                    <option value="web">Web</option>
                                    <option value="api">API</option>
                                </select>
                                {errors.guard_name && (
                                    <p className="text-sm text-destructive flex items-center gap-1">
                                        <AlertCircle className="h-4 w-4" />
                                        {errors.guard_name}
                                    </p>
                                )}
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={e => setData('description', e.target.value)}
                                    placeholder="Describe what this permission allows..."
                                    rows={4}
                                />
                                {errors.description && (
                                    <p className="text-sm text-destructive flex items-center gap-1">
                                        <AlertCircle className="h-4 w-4" />
                                        {errors.description}
                                    </p>
                                )}
                            </div>

                            {/* Submit Buttons */}
                            <div className="flex gap-3 pt-4">
                                <Button type="submit" disabled={processing} className="flex-1">
                                    {processing ? (
                                        <>
                                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                                            {isEdit ? 'Updating...' : 'Creating...'}
                                        </>
                                    ) : (
                                        <>
                                            <Shield className="mr-2 h-4 w-4" />
                                            {isEdit ? 'Update Permission' : 'Create Permission'}
                                        </>
                                    )}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.visit('/permissions')}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
                {/* Permission Tips */}
                <Card>
                    <CardHeader>
                        <CardTitle>Permission Guidelines</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                        <div className="flex items-start gap-2">
                            <Shield className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                            <span>Use dot notation for logical grouping (module.action)</span>
                        </div>
                        <div className="flex items-start gap-2">
                            <Shield className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                            <span>Common actions: view, create, edit, delete, manage</span>
                        </div>
                        <div className="flex items-start gap-2">
                            <Shield className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                            <span>Web guard for UI access, API guard for API endpoints</span>
                        </div>
                        <div className="flex items-start gap-2">
                            <Shield className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                            <span>Keep descriptions clear and concise</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Common Patterns */}
                <Card>
                    <CardHeader>
                        <CardTitle>Common Patterns</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        <div className="p-2 border rounded bg-muted/50">
                            <code className="text-xs">users.view</code>
                            <p className="text-muted-foreground mt-1">View user profiles</p>
                        </div>
                        <div className="p-2 border rounded bg-muted/50">
                            <code className="text-xs">users.manage</code>
                            <p className="text-muted-foreground mt-1">Full user management</p>
                        </div>
                        <div className="p-2 border rounded bg-muted/50">
                            <code className="text-xs">settings.update</code>
                            <p className="text-muted-foreground mt-1">Update system settings</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
