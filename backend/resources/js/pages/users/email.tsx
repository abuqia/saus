/* eslint-disable @typescript-eslint/no-unused-vars */
import AppLayout from '@/layouts/app-layout';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { router, Link, Head, useForm } from '@inertiajs/react';
import {
    Mail,
    ArrowLeft,
    Send,
    User,
    FileText,
    AlertCircle,
    CheckCircle2,
} from 'lucide-react';
import type { BreadcrumbItem, User as UserType, PageProps } from '@/types';
import { useState } from 'react';
import { toast } from 'sonner';

interface EmailUserProps {
    user: {
        avatar: string | undefined;
        id: number;
        name: string;
        email: string;
    };
}

export default function EmailUser({ user }: EmailUserProps) {
    const { data, setData, processing, post, errors } = useForm({
        subject: '',
        message: '',
        cc: [] as string[],
        bcc: [] as string[],
    });

    const [ccEmail, setCcEmail] = useState('');
    const [bccEmail, setBccEmail] = useState('');

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
            title: 'Send Email',
            href: `/users/${user.id}/email`,
        },
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        post(`/users/${user.id}/send-email`, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Email sent successfully!');
            },
            onError: () => {
                toast.error('Failed to send email. Please try again.');
            },
        });
    };

    const addCcEmail = () => {
        if (ccEmail && !data.cc.includes(ccEmail)) {
            setData('cc', [...data.cc, ccEmail]);
            setCcEmail('');
        }
    };

    const removeCcEmail = (email: string) => {
        setData('cc', data.cc.filter(e => e !== email));
    };

    const addBccEmail = () => {
        if (bccEmail && !data.bcc.includes(bccEmail)) {
            setData('bcc', [...data.bcc, bccEmail]);
            setBccEmail('');
        }
    };

    const removeBccEmail = (email: string) => {
        setData('bcc', data.bcc.filter(e => e !== email));
    };

    const predefinedTemplates = [
        {
            name: 'Welcome Email',
            subject: 'Welcome to Our Platform',
            message: `Hello ${user.name},\n\nWelcome to our platform! We're excited to have you on board.\n\nBest regards,\nThe Team`
        },
        {
            name: 'Account Update',
            subject: 'Important Account Update',
            message: `Dear ${user.name},\n\nThis is an important update regarding your account.\n\nPlease review the changes and contact us if you have any questions.\n\nBest regards,\nSupport Team`
        },
        {
            name: 'Security Notice',
            subject: 'Security Notice - Important',
            message: `Hello ${user.name},\n\nThis is a security notice regarding your account.\n\nIf you did not initiate this action, please contact our support team immediately.\n\nBest regards,\nSecurity Team`
        }
    ];

    const applyTemplate = (template: typeof predefinedTemplates[0]) => {
        setData({
            ...data,
            subject: template.subject,
            message: template.message,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Send Email - ${user.name}`} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <PageHeader
                    title="Send Email"
                    description="Compose and send an email to the user"
                    icon={Mail}
                    actions={
                        <Button asChild variant="outline">
                            <Link href={`/users/${user.id}`}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to User
                            </Link>
                        </Button>
                    }
                />

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Main Form */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Compose Email</CardTitle>
                                <CardDescription>
                                    Write your message to {user.name}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* Recipient Info */}
                                    <div className="flex items-center gap-4 p-4 border rounded-lg bg-muted/50">
                                        <Avatar className="h-10 w-10">
                                            <AvatarImage src={user.avatar} alt={user.name} />
                                            <AvatarFallback>
                                                <User className="h-5 w-5" />
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <p className="font-medium">{user.name}</p>
                                            <p className="text-sm text-muted-foreground">{user.email}</p>
                                        </div>
                                        <Badge variant="secondary">Primary Recipient</Badge>
                                    </div>

                                    {/* Subject */}
                                    <div className="space-y-2">
                                        <Label htmlFor="subject">Subject *</Label>
                                        <Input
                                            id="subject"
                                            value={data.subject}
                                            onChange={e => setData('subject', e.target.value)}
                                            placeholder="Enter email subject"
                                            required
                                        />
                                        {errors.subject && (
                                            <p className="text-sm text-destructive flex items-center gap-1">
                                                <AlertCircle className="h-4 w-4" />
                                                {errors.subject}
                                            </p>
                                        )}
                                    </div>

                                    {/* Message */}
                                    <div className="space-y-2">
                                        <Label htmlFor="message">Message *</Label>
                                        <Textarea
                                            id="message"
                                            value={data.message}
                                            onChange={e => setData('message', e.target.value)}
                                            placeholder="Write your message here..."
                                            rows={12}
                                            required
                                        />
                                        {errors.message && (
                                            <p className="text-sm text-destructive flex items-center gap-1">
                                                <AlertCircle className="h-4 w-4" />
                                                {errors.message}
                                            </p>
                                        )}
                                    </div>

                                    {/* CC */}
                                    <div className="space-y-3">
                                        <Label htmlFor="cc">CC (Carbon Copy)</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                id="cc"
                                                type="email"
                                                value={ccEmail}
                                                onChange={e => setCcEmail(e.target.value)}
                                                placeholder="Add CC email address"
                                                onKeyPress={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        addCcEmail();
                                                    }
                                                }}
                                            />
                                            <Button type="button" variant="outline" onClick={addCcEmail}>
                                                Add
                                            </Button>
                                        </div>
                                        {data.cc.length > 0 && (
                                            <div className="flex flex-wrap gap-2">
                                                {data.cc.map(email => (
                                                    <Badge key={email} variant="secondary" className="flex items-center gap-1">
                                                        {email}
                                                        <button
                                                            type="button"
                                                            onClick={() => removeCcEmail(email)}
                                                            className="hover:text-destructive"
                                                        >
                                                            ×
                                                        </button>
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* BCC */}
                                    <div className="space-y-3">
                                        <Label htmlFor="bcc">BCC (Blind Carbon Copy)</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                id="bcc"
                                                type="email"
                                                value={bccEmail}
                                                onChange={e => setBccEmail(e.target.value)}
                                                placeholder="Add BCC email address"
                                                onKeyPress={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        addBccEmail();
                                                    }
                                                }}
                                            />
                                            <Button type="button" variant="outline" onClick={addBccEmail}>
                                                Add
                                            </Button>
                                        </div>
                                        {data.bcc.length > 0 && (
                                            <div className="flex flex-wrap gap-2">
                                                {data.bcc.map(email => (
                                                    <Badge key={email} variant="secondary" className="flex items-center gap-1">
                                                        {email}
                                                        <button
                                                            type="button"
                                                            onClick={() => removeBccEmail(email)}
                                                            className="hover:text-destructive"
                                                        >
                                                            ×
                                                        </button>
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Submit Button */}
                                    <div className="flex gap-3">
                                        <Button type="submit" disabled={processing} className="flex-1">
                                            {processing ? (
                                                <>
                                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                                                    Sending...
                                                </>
                                            ) : (
                                                <>
                                                    <Send className="mr-2 h-4 w-4" />
                                                    Send Email
                                                </>
                                            )}
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => router.visit(`/users/${user.id}`)}
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
                        {/* Email Templates */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Quick Templates</CardTitle>
                                <CardDescription>
                                    Pre-written email templates
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {predefinedTemplates.map((template, index) => (
                                    <Button
                                        key={index}
                                        variant="outline"
                                        className="w-full justify-start h-auto py-3"
                                        onClick={() => applyTemplate(template)}
                                    >
                                        <FileText className="mr-2 h-4 w-4 flex-shrink-0" />
                                        <div className="text-left">
                                            <div className="font-medium text-sm">{template.name}</div>
                                            <div className="text-xs text-muted-foreground truncate">
                                                {template.subject}
                                            </div>
                                        </div>
                                    </Button>
                                ))}
                            </CardContent>
                        </Card>

                        {/* Sending Tips */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Sending Tips</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                <div className="flex items-start gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                    <span>Keep subject lines clear and concise</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                    <span>Use CC for additional recipients who should see the email</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                    <span>Use BCC for recipients who should not be visible to others</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                    <span>Double-check email addresses before sending</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* User Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Recipient Info</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-12 w-12">
                                        <AvatarImage src={user.avatar} alt={user.name} />
                                        <AvatarFallback className="text-sm">
                                            {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-medium">{user.name}</p>
                                        <p className="text-sm text-muted-foreground">{user.email}</p>
                                    </div>
                                </div>
                                <div className="text-sm space-y-1">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">User ID:</span>
                                        <span className="font-mono">{user.id}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
