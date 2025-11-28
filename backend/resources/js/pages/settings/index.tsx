import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Spinner } from '@/components/ui/spinner';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import {
    Settings2,
    Save,
    RotateCcw,
    Search,
    Trash2,
    CheckCircle2,
    Mail,
    Shield,
    Palette,
    Users,
    Code,
    Zap,
    Database,
    Globe,
    Lock,
    RefreshCw,
    Filter
} from 'lucide-react';

interface SettingsPageProps {
    settings: {
        [key: string]: Array<{
            id: number;
            key: string;
            value: unknown;
            type: string;
            group: string;
            description: string;
            options?: unknown;
            is_encrypted: boolean;
            is_editable?: boolean;
            is_deletable?: boolean;
        }>;
    };
    groups: {
        [key: string]: string;
    };
}

type SettingsPrimitive = string | number | boolean | null;
type SettingsMap = Record<string, SettingsPrimitive>;
type SettingsFormData = { settings: SettingsMap };
type SettingItem = SettingsPageProps['settings'][string][number];

export default function SettingsIndex({ settings, groups }: SettingsPageProps) {
    const [activeTab, setActiveTab] = useState('general');
    const [uploading, setUploading] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [showChangedOnly, setShowChangedOnly] = useState(false);

    const [testingMail, setTestingMail] = useState(false);
    const [testEmail, setTestEmail] = useState('');

    const initialValues: SettingsMap = useMemo(() => (
        Object.values(settings).flat().reduce<SettingsMap>((acc, setting) => {
            acc[setting.key] = setting.value as SettingsPrimitive;
            return acc;
        }, {})
    ), [settings]);

    const { data, setData, put, processing, errors } = useForm<SettingsFormData>({
        settings: initialValues,
    });



    const isDirty = useMemo(() => {
        try {
            return JSON.stringify(data.settings) !== JSON.stringify(initialValues);
        } catch {
            return true;
        }
    }, [data.settings, initialValues]);

    const changedKeys = useMemo(() => {
        const keys: string[] = [];
        for (const k of Object.keys(data.settings)) {
            const a = data.settings[k];
            const b = initialValues[k];
            if (JSON.stringify(a) !== JSON.stringify(b)) keys.push(k);
        }
        return new Set(keys);
    }, [data.settings, initialValues]);

    const submitAll = useCallback(() => {
        put('/settings', {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Settings updated successfully!');
            },
            onError: () => {
                toast.error('Failed to update settings. Please try again.');
            },
        });
    }, [put]);

    useEffect(() => {
        const onBeforeUnload = (e: BeforeUnloadEvent) => {
            if (isDirty) {
                e.preventDefault();
                e.returnValue = '';
            }
        };
        const onKey = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
                e.preventDefault();
                submitAll();
            }
        };
        window.addEventListener('beforeunload', onBeforeUnload);
        window.addEventListener('keydown', onKey);
        return () => {
            window.removeEventListener('beforeunload', onBeforeUnload);
            window.removeEventListener('keydown', onKey);
        };
    }, [isDirty, submitAll]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        submitAll();
    };

    const handleDiscardAll = () => {
        setData({ settings: initialValues } as SettingsFormData);
    };

    const handleGroupSubmit = (group: string) => {
        const groupSettings: SettingsMap = Object.keys(data.settings)
            .filter(key => settings[group]?.some(s => s.key === key))
            .reduce<SettingsMap>((acc, key) => {
                acc[key] = data.settings[key];
                return acc;
            }, {});

        router.put(`/settings/${group}`, { settings: groupSettings }, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(`${groups[group]} settings updated successfully!`);
            },
        });
    };

    const handleGroupReset = (group: string) => {
        const groupSettings: SettingsMap = Object.keys(initialValues)
            .filter(key => settings[group]?.some(s => s.key === key))
            .reduce<SettingsMap>((acc, key) => {
                acc[key] = initialValues[key];
                return acc;
            }, {});
        setData((prev: SettingsFormData) => ({ settings: { ...prev.settings, ...groupSettings } }));
    };

    const handleFileUpload = async (file: File, type: 'logo' | 'favicon') => {
        setUploading(type);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', type);

        try {
            const response = await fetch('/settings/upload', {
                method: 'POST',
                body: formData,
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            const result = await response.json();

            if (result.success) {
                setData((prev: SettingsFormData) => ({ settings: { ...prev.settings, [type]: result.path } }));
                toast.success(`${type === 'logo' ? 'Logo' : 'Favicon'} uploaded successfully!`);
            }
        } catch {
            toast.error('Failed to upload file. Please try again.');
        } finally {
            setUploading(null);
        }
    };



    const handleDeleteSetting = (key: string) => {
        if (confirm('Are you sure you want to delete this setting?')) {
            router.delete(`/settings/${key}`, {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Setting deleted successfully!');
                    router.reload();
                },
            });
        }
    };

    const handleTestMail = async () => {
        if (!testEmail) {
            toast.error('Please enter an email address to test');
            return;
        }

        setTestingMail(true);

        try {
            const response = await fetch('/settings/test-mail', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({ email: testEmail }),
            });

            const result = await response.json();

            if (result.success) {
                toast.success('Test email sent successfully!');
            } else {
                toast.error(`Failed to send test email: ${result.message}`);
            }
        } catch {
            toast.error('Failed to send test email. Please check your configuration.');
        } finally {
            setTestingMail(false);
        }
    };

    const handleApplyConfig = () => {
        router.post('/settings/apply-config', {}, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Configuration applied successfully!');
            },
        });
    };

    const getGroupIcon = (key: string) => {
        const iconClass = "h-4 w-4";
        switch(key) {
            case 'general': return <Settings2 className={iconClass} />;
            case 'mail': return <Mail className={iconClass} />;
            case 'security': return <Shield className={iconClass} />;
            case 'appearance': return <Palette className={iconClass} />;
            case 'users': return <Users className={iconClass} />;
            case 'api': return <Code className={iconClass} />;
            case 'advanced': return <Zap className={iconClass} />;
            case 'database': return <Database className={iconClass} />;
            default: return <Globe className={iconClass} />;
        }
    };

    const renderField = (setting: SettingItem) => {
        const value = data.settings[setting.key] ?? '';

        // Handle select fields with options
        if (setting.options && Array.isArray(setting.options)) {
            return (
                <Select
                    value={String(value ?? '')}
                    onValueChange={(newValue) => setData((prev: SettingsFormData) => ({ settings: { ...prev.settings, [setting.key]: newValue } }))}
                >
                    <SelectTrigger>
                        <SelectValue placeholder={`Select ${setting.key}`} />
                    </SelectTrigger>
                    <SelectContent>
                        {setting.options.map((option: string) => (
                            <SelectItem key={option} value={option}>
                                {option || 'None'}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            );
        }

        switch (setting.type) {
            case 'boolean':
                return (
                    <Switch
                        checked={Boolean(value)}
                        onCheckedChange={(checked) => setData((prev: SettingsFormData) => ({ settings: { ...prev.settings, [setting.key]: checked } }))}
                    />
                );

            case 'text':
                return (
                    <Textarea
                        value={String(value ?? '')}
                        onChange={(e) => setData((prev: SettingsFormData) => ({ settings: { ...prev.settings, [setting.key]: e.target.value } }))}
                        placeholder={setting.description}
                        rows={4}
                    />
                );

            case 'integer':
                return (
                    <Input
                        type="number"
                        value={Number(value ?? 0)}
                        onChange={(e) => setData((prev: SettingsFormData) => ({ settings: { ...prev.settings, [setting.key]: parseInt(e.target.value) || 0 } }))}
                        placeholder={setting.description}
                    />
                );

            default:
                return (
                    <Input
                        type={setting.is_encrypted ? 'password' : 'text'}
                        value={String(value ?? '')}
                        onChange={(e) => setData((prev: SettingsFormData) => ({ settings: { ...prev.settings, [setting.key]: e.target.value } }))}
                        placeholder={setting.description}
                    />
                );
        }
    };

    const renderSettingsContent = (groupKey: string, groupLabel: string) => {

        return (
            <Card className="border-2 shadow-lg">
                {/* <CardHeader className="border-b bg-gradient-to-r from-muted/50 to-transparent">
                    <div className="flex items-center justify-between">
                        <div className="flex items-start gap-4">
                            <div className="p-3 rounded-xl bg-primary/10 text-primary">
                                <Icon className="h-6 w-6" />
                            </div>
                            <div>
                                <CardTitle className="text-2xl flex items-center gap-2">
                                    {groupLabel}
                                    {(settings[groupKey] || []).filter((s) => changedKeys.has(s.key)).length > 0 && (
                                        <Badge variant="outline" className="text-xs">
                                            {(settings[groupKey] || []).filter((s) => changedKeys.has(s.key)).length} modified
                                        </Badge>
                                    )}
                                </CardTitle>
                                <CardDescription className="mt-1.5">
                                    Configure {groupLabel.toLowerCase()} settings for your application
                                </CardDescription>
                            </div>
                        </div>
                        {groupKey === 'custom' && (
                            <Dialog open={showAddSetting} onOpenChange={setShowAddSetting}>
                                <DialogTrigger asChild>
                                    <Button variant="outline" size="sm" className="shadow-sm">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Setting
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Add Custom Setting</DialogTitle>
                                        <DialogDescription>
                                            Create a new custom setting for your application.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="key">Key</Label>
                                            <Input
                                                id="key"
                                                value={addSettingForm.data.key}
                                                onChange={(e) => addSettingForm.setData('key', e.target.value)}
                                                placeholder="setting_key"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="value">Value</Label>
                                            <Input
                                                id="value"
                                                value={addSettingForm.data.value}
                                                onChange={(e) => addSettingForm.setData('value', e.target.value)}
                                                placeholder="Setting value"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="type">Type</Label>
                                            <Select
                                                value={addSettingForm.data.type}
                                                onValueChange={(value) => addSettingForm.setData('type', value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {Object.entries({
                                                        string: 'Text',
                                                        text: 'Text Area',
                                                        boolean: 'Yes/No',
                                                        integer: 'Number',
                                                        json: 'JSON',
                                                    }).map(([key, label]) => (
                                                        <SelectItem key={key} value={key}>
                                                            {label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="group">Group</Label>
                                            <Select
                                                value={addSettingForm.data.group}
                                                onValueChange={(value) => addSettingForm.setData('group', value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {Object.entries(groups).map(([key, label]) => (
                                                        <SelectItem key={key} value={key}>
                                                            {label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="description">Description</Label>
                                            <Textarea
                                                id="description"
                                                value={addSettingForm.data.description}
                                                onChange={(e) => addSettingForm.setData('description', e.target.value)}
                                                placeholder="Setting description"
                                                rows={3}
                                            />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button
                                            onClick={handleAddSetting}
                                            disabled={addSettingForm.processing}
                                        >
                                            {addSettingForm.processing && <Spinner className="w-4 h-4 mr-2" />}
                                            Create Setting
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        )}
                    </div>
                </CardHeader> */}
                <CardContent className="space-y-6">
                    {settings[groupKey]
                        ?.filter((s) => {
                            if (!search) return true;
                            const hay = `${s.key} ${s.description || ''}`.toLowerCase();
                            return hay.includes(search.toLowerCase());
                        })
                        ?.filter((s) => {
                            if (!showChangedOnly) return true;
                            return changedKeys.has(s.key);
                        })
                        .map((setting) => (
                            <div
                                key={setting.key}
                                className={`grid grid-cols-1 md:grid-cols-3 gap-6 items-start p-4 rounded-lg border transition-all hover:shadow-md ${
                                    changedKeys.has(setting.key)
                                        ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900'
                                        : 'bg-card hover:bg-muted/30'
                                }`}
                            >
                                <div className="space-y-2.5">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="space-y-1">
                                            <Label htmlFor={setting.key} className="text-sm font-semibold flex items-center gap-2">
                                                {setting.key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                {changedKeys.has(setting.key) && (
                                                    <Badge variant="outline" className="text-xs bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-800">
                                                        <div className="h-1.5 w-1.5 rounded-full bg-amber-500 mr-1.5 animate-pulse" />
                                                        Modified
                                                    </Badge>
                                                )}
                                            </Label>
                                        </div>
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            {setting.is_encrypted && (
                                                <Badge variant="secondary" className="text-xs gap-1">
                                                    <Lock className="h-3 w-3" />
                                                    Encrypted
                                                </Badge>
                                            )}
                                            {setting.is_deletable && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDeleteSetting(setting.key)}
                                                    className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/50"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                    {setting.description && (
                                        <p className="text-sm text-muted-foreground leading-relaxed">{setting.description}</p>
                                    )}
                                    {errors && (errors as Record<string, string>)[`settings.${setting.key}`] && (
                                        <p className="text-xs text-destructive flex items-center gap-1.5 p-2 bg-destructive/10 rounded">
                                            <span className="h-1.5 w-1.5 rounded-full bg-destructive" />
                                            {(errors as Record<string, string>)[`settings.${setting.key}`]}
                                        </p>
                                    )}
                                </div>
                                <div className="md:col-span-2">
                                    {(setting.key === 'logo' || setting.key === 'favicon') ? (
                                        <div className="space-y-4">
                                            {Boolean(data.settings[setting.key]) && (
                                                <div className="flex items-center space-x-4">
                                                    <img
                                                        src={(typeof data.settings[setting.key] === 'string' && String(data.settings[setting.key]).startsWith('http')) ? String(data.settings[setting.key]) : `/storage/${data.settings[setting.key]}`}
                                                        alt={setting.key}
                                                        className="h-16 w-16 object-contain border rounded"
                                                    />
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => setData((prev: SettingsFormData) => ({ settings: { ...prev.settings, [setting.key]: '' } }))}
                                                    >
                                                        Remove
                                                    </Button>
                                                </div>
                                            )}
                                            <Input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        handleFileUpload(file, setting.key as 'logo' | 'favicon');
                                                    }
                                                }}
                                                disabled={uploading === setting.key}
                                            />
                                            {uploading === setting.key && (
                                                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                                    <Spinner className="w-4 h-4" />
                                                    <span>Uploading...</span>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-3">
                                            <div className="flex-1">
                                                {renderField(setting)}
                                            </div>
                                            {changedKeys.has(setting.key) && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setData((prev: SettingsFormData) => ({ settings: { ...prev.settings, [setting.key]: initialValues[setting.key] } }))}
                                                    className="flex-shrink-0 shadow-sm"
                                                >
                                                    <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                                                    Reset
                                                </Button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                    {/* Enhanced Mail Test Section */}
                    {groupKey === 'mail' && (
                        <div className="mt-6 p-6 rounded-lg border-2 border-dashed bg-gradient-to-br from-blue-50/50 to-transparent dark:from-blue-950/20">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400">
                                        <Mail className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-semibold">Test Mail Configuration</h4>
                                        <p className="text-sm text-muted-foreground">Send a test email to verify your configuration</p>
                                    </div>
                                </div>
                                <div className="flex items-end gap-3">
                                    <div className="flex-1 space-y-2">
                                        <Label htmlFor="test-email" className="text-sm font-medium">Test Email Address</Label>
                                        <Input
                                            id="test-email"
                                            type="email"
                                            value={testEmail}
                                            onChange={(e) => setTestEmail(e.target.value)}
                                            placeholder="Enter email to test configuration"
                                            className="shadow-sm"
                                        />
                                    </div>
                                    <Button
                                        onClick={handleTestMail}
                                        disabled={testingMail || !testEmail}
                                        className="shadow-sm"
                                    >
                                        {testingMail ? <Spinner className="w-4 h-4 mr-2" /> : <Mail className="h-4 w-4 mr-2" />}
                                        Send Test Email
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-between items-center pt-6 mt-6 border-t bg-muted/30 -mx-6 px-6 py-4 rounded-b-lg">
                        <div className="text-sm text-muted-foreground">
                            {(settings[groupKey] || []).filter((s) => changedKeys.has(s.key)).length > 0 ? (
                                <span className="flex items-center gap-2 text-amber-600 dark:text-amber-500 font-medium">
                                    <CheckCircle2 className="h-4 w-4" />
                                    {(settings[groupKey] || []).filter((s) => changedKeys.has(s.key)).length} unsaved change{(settings[groupKey] || []).filter((s) => changedKeys.has(s.key)).length !== 1 ? 's' : ''} in this group
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                                    All settings saved
                                </span>
                            )}
                        </div>
                        <div className="flex gap-2">
                            <Button
                                onClick={() => handleGroupReset(groupKey)}
                                disabled={processing}
                                variant="ghost"
                                size="sm"
                                className="shadow-sm"
                            >
                                <RotateCcw className="h-4 w-4 mr-2" />
                                Reset {groupLabel}
                            </Button>
                            <Button
                                onClick={() => handleGroupSubmit(groupKey)}
                                disabled={processing}
                                className="shadow-sm bg-gradient-to-r from-primary to-primary/90"
                            >
                                <Save className="h-4 w-4 mr-2" />
                                Save {groupLabel}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    };

    return (
        <AppLayout>
            <Head title="Settings" />

            <div className="flex h-full">
                {/* Sidebar Navigation */}
                <aside className="w-64 border-r bg-muted/30 p-4 space-y-2 overflow-y-auto flex-shrink-0">
                    <div className="mb-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                <Settings2 className="h-5 w-5" />
                            </div>
                            <div>
                                <h2 className="font-bold text-lg">Settings</h2>
                                {isDirty && (
                                    <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-500">
                                        <div className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                                        <span>{changedKeys.size} unsaved</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-1">
                        {Object.entries(groups).map(([key, label]) => {
                            const count = (settings[key] || []).filter((s) => changedKeys.has(s.key)).length;
                            const isActive = activeTab === key;

                            return (
                                <button
                                    key={key}
                                    onClick={() => setActiveTab(key)}
                                    className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                                        isActive
                                            ? 'bg-primary text-primary-foreground shadow-sm'
                                            : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    <div className="flex items-center gap-2.5">
                                        {getGroupIcon(key)}
                                        <span>{label}</span>
                                    </div>
                                    {count > 0 && (
                                        <Badge
                                            variant={isActive ? "secondary" : "destructive"}
                                            className="h-5 min-w-5 px-1.5 text-xs font-semibold"
                                        >
                                            {count}
                                        </Badge>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </aside>

                {/* Main Content */}
                <div className="flex-1 overflow-y-auto">
                    <div className="p-6 space-y-6">
                        {/* Enhanced Header */}
                        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 border shadow-sm">
                            <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                <div>
                                    <h1 className="text-3xl font-bold tracking-tight">
                                        {groups[activeTab]}
                                    </h1>
                                    <p className="text-muted-foreground mt-1">
                                        Configure {groups[activeTab].toLowerCase()} settings for your application
                                    </p>
                                </div>

                                {/* Action Buttons Group */}
                                <div className="flex flex-wrap items-center gap-3">
                                    {/* Search and Filter Group */}
                                    <div className="flex items-center gap-2 bg-background/50 backdrop-blur-sm rounded-lg p-1 border">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                value={search}
                                                onChange={(e) => setSearch(e.target.value)}
                                                placeholder="Search settings..."
                                                className="pl-9 w-52 border-0 shadow-none focus-visible:ring-0"
                                            />
                                        </div>
                                        <div className="h-6 w-px bg-border" />
                                        <div className="flex items-center gap-2 px-2">
                                            <Checkbox
                                                id="changed-only"
                                                checked={showChangedOnly}
                                                onCheckedChange={(v) => setShowChangedOnly(Boolean(v))}
                                            />
                                            <Label htmlFor="changed-only" className="text-sm font-medium cursor-pointer flex items-center gap-1.5">
                                                <Filter className="h-3.5 w-3.5" />
                                                Changed
                                            </Label>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-2">
                                        <Button
                                            onClick={handleApplyConfig}
                                            variant="outline"
                                            size="sm"
                                            className="shadow-sm"
                                        >
                                            <RefreshCw className="h-4 w-4 mr-2" />
                                            Apply Config
                                        </Button>
                                        <Button
                                            onClick={handleDiscardAll}
                                            variant="outline"
                                            size="sm"
                                            disabled={!isDirty || processing}
                                            className="shadow-sm"
                                        >
                                            <RotateCcw className="h-4 w-4 mr-2" />
                                            Discard
                                        </Button>
                                        <Button
                                            onClick={handleSubmit}
                                            disabled={!isDirty || processing}
                                            size="sm"
                                            className="shadow-sm bg-gradient-to-r from-primary to-primary/90"
                                        >
                                            {processing ? <Spinner className="w-4 h-4 mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                                            Save All
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Settings Content */}
                        <div className="animate-in fade-in-50 duration-300">
                            {renderSettingsContent(activeTab, groups[activeTab])}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
