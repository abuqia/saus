/* eslint-disable react-hooks/set-state-in-effect */
import { login } from '@/routes';
import { email } from '@/routes/password';
import { Form, Head } from '@inertiajs/react';
import { useState, useEffect } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';

export default function ForgotPassword({ status }: { status?: string }) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    return (
        <AuthLayout
            title="Reset Your Password"
            description="Enter your email address and we'll send you a password reset link"
        >
            <Head title="Forgot Password" />

            <div className={`w-full max-w-md mx-auto transform transition-all duration-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
                {/* Status Message */}
                {status && (
                    <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-6 text-center dark:bg-green-900/20 dark:border-green-800 transform transition-all duration-500">
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <p className="text-sm text-green-800 dark:text-green-200 font-medium">
                            {status}
                        </p>
                    </div>
                )}

                {/* Forgot Password Form */}
                <div className={`bg-white/80 backdrop-blur-sm border border-[#19140015] rounded-2xl p-8 shadow-lg dark:bg-[#161615]/80 dark:border-[#3E3E3A] transform transition-all duration-500 delay-200 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}`}>
                    <Form {...email.form()}>
                        {({ processing, errors }) => (
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]">
                                        Email address
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="email"
                                            type="email"
                                            name="email"
                                            autoComplete="off"
                                            autoFocus
                                            placeholder="email@example.com"
                                            className="h-12 px-4 border-[#19140035] dark:border-[#3E3E3A] bg-white dark:bg-[#0a0a0a] focus:border-[#F53003] focus:ring-1 focus:ring-[#F53003] transition-colors duration-300"
                                        />
                                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                            <svg className="w-5 h-5 text-[#706f6c] dark:text-[#A1A09A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                            </svg>
                                        </div>
                                    </div>
                                    <InputError message={errors.email} />
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full h-12 bg-gradient-to-r from-[#F53003] to-[#FF750F] hover:from-[#FF750F] hover:to-[#F53003] text-white font-semibold rounded-lg transition-all duration-300 hover:shadow-lg hover:scale-105 transform shadow-md"
                                    disabled={processing}
                                    data-test="email-password-reset-link-button"
                                >
                                    {processing ? (
                                        <div className="flex items-center space-x-2">
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            <span>Sending reset link...</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center space-x-2">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                            </svg>
                                            <span>Send Reset Link</span>
                                        </div>
                                    )}
                                </Button>
                            </div>
                        )}
                    </Form>

                    <div className="text-center pt-4 border-t border-[#19140015] dark:border-[#3E3E3A]">
                        <p className="text-sm text-[#706f6c] dark:text-[#A1A09A]">
                            Remember your password?{' '}
                            <TextLink
                                href={login()}
                                className="text-[#F53003] hover:text-[#FF750F] dark:text-[#FF4433] dark:hover:text-[#FF8866] font-semibold transition-colors duration-300"
                            >
                                Back to login
                            </TextLink>
                        </p>
                    </div>
                </div>
            </div>
        </AuthLayout>
    );
}
