import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Loader2, Save, ArrowLeft, Shield, AlertCircle } from 'lucide-react';
import { Link, usePage } from '@inertiajs/react';
import type { Role, PageProps } from '@/types';

interface RoleFormProps {
    role?: Role;
    guards: string[];
    isEdit?: boolean;
}

export function RoleForm({ role, guards, isEdit = false }: RoleFormProps) {
    const { props } = usePage<PageProps>();
    const { data, setData, errors, processing, post, put } = useForm({
        name: role?.name || '',
        label: role?.label || '',
        guard_name: role?.guard_name || 'web',
        description: role?.description || '',
    });

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEdit) {
            put(`/roles/${role?.id}`, {
                preserveScroll: true,
            });
        } else {
            post('/roles', {
                preserveScroll: true,
            });
        }
    };

    const isSuperAdmin = role?.name === 'super_admin';

    // Get validation errors from page props
    const formErrors = props.errors || {};

    return (
        <form onSubmit={onSubmit} className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-3">
                {/* Main Form */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Basic Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Role Information</CardTitle>
                            <CardDescription>
                                Define the role's basic properties and identification
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Name Field */}
                            <div className="space-y-2">
                                <Label htmlFor="name">Internal Name *</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value.toLowerCase().replace(/\s+/g, '_'))}
                                    placeholder="e.g., admin, content_manager"
                                    required
                                    disabled={isSuperAdmin || processing}
                                    className="font-mono"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Internal identifier using snake_case (lowercase letters and underscores only).
                                </p>
                                {(errors.name || formErrors.name) && (
                                    <p className="text-sm text-destructive flex items-center gap-1">
                                        <AlertCircle className="h-4 w-4" />
                                        {errors.name || formErrors.name}
                                    </p>
                                )}
                            </div>

                            {/* Display Name Field */}
                            <div className="space-y-2">
                                <Label htmlFor="label">Display Name *</Label>
                                <Input
                                    id="label"
                                    value={data.label}
                                    onChange={e => setData('label', e.target.value)}
                                    placeholder="e.g., Administrator, Content Manager"
                                    required
                                    disabled={processing}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Human-readable name for display purposes.
                                </p>
                                {(errors.label || formErrors.label) && (
                                    <p className="text-sm text-destructive flex items-center gap-1">
                                        <AlertCircle className="h-4 w-4" />
                                        {errors.label || formErrors.label}
                                    </p>
                                )}
                            </div>

                            {/* Guard Name */}
                            <div className="space-y-2">
                                <Label htmlFor="guard_name">Guard *</Label>
                                <Select
                                    value={data.guard_name}
                                    onValueChange={value => setData('guard_name', value)}
                                    disabled={isSuperAdmin || processing}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select guard" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {guards.map(guard => (
                                            <SelectItem key={guard} value={guard}>
                                                {guard.toUpperCase()} Guard
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground">
                                    The authentication guard this role applies to.
                                </p>
                                {(errors.guard_name || formErrors.guard_name) && (
                                    <p className="text-sm text-destructive flex items-center gap-1">
                                        <AlertCircle className="h-4 w-4" />
                                        {errors.guard_name || formErrors.guard_name}
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
                                    placeholder="Describe the purpose and permissions of this role..."
                                    rows={4}
                                    disabled={processing}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Optional description to explain the role's purpose.
                                </p>
                                {(errors.description || formErrors.description) && (
                                    <p className="text-sm text-destructive flex items-center gap-1">
                                        <AlertCircle className="h-4 w-4" />
                                        {errors.description || formErrors.description}
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* System Notice for Super Admin */}
                    {isSuperAdmin && (
                        <Card className="border-amber-200 bg-amber-50">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-amber-800">
                                    <Shield className="h-5 w-5" />
                                    System Protected Role
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="text-sm text-amber-700">
                                <p>
                                    This is a system-protected role. The name and guard cannot be modified
                                    to ensure system integrity. You can only update the display name and description.
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Form Actions */}
                    <Card>
                        <CardContent className="pt-6">
                            <div className="space-y-3">
                                <Button
                                    type="submit"
                                    className="w-full"
                                    disabled={processing || (isSuperAdmin && isEdit)}
                                >
                                    {processing ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            {isEdit ? 'Updating...' : 'Creating...'}
                                        </>
                                    ) : (
                                        <>
                                            <Save className="mr-2 h-4 w-4" />
                                            {isEdit ? 'Update Role' : 'Create Role'}
                                        </>
                                    )}
                                </Button>
                                <Button asChild variant="outline" className="w-full">
                                    <Link href="/roles">
                                        <ArrowLeft className="mr-2 h-4 w-4" />
                                        Back to Roles
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Role Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>About Roles</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm text-muted-foreground">
                            <p>
                                Roles group together permissions and can be assigned to users.
                                This allows for flexible access control throughout the application.
                            </p>
                            <ul className="space-y-2 list-disc list-inside">
                                <li>Use descriptive names for clarity</li>
                                <li>Assign relevant permissions after creation</li>
                                <li>Consider the guard when creating roles</li>
                                <li>System roles cannot be modified</li>
                            </ul>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </form>
    );
}
