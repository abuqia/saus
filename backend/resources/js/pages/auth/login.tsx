/* eslint-disable react-hooks/set-state-in-effect */
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';
import { Form, Head } from '@inertiajs/react';
import { useState, useEffect } from 'react';

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
    canRegister: boolean;
}

export default function Login({
    status,
    canResetPassword,
    canRegister,
}: LoginProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    return (
        <AuthLayout
            title="Welcome back to SAUS"
            description="Enter your credentials to access your powerful link management dashboard"
        >
            <Head title="Log in to SAUS" />

            <div className={`w-full max-w-md mx-auto transform transition-all duration-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>

                {/* Login Form */}
                <div className={`bg-white/80 backdrop-blur-sm border border-[#19140015] rounded-2xl p-8 shadow-lg dark:bg-[#161615]/80 dark:border-[#3E3E3A] transform transition-all duration-500 delay-200 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}`}>
                    <Form
                        {...store.form()}
                        resetOnSuccess={['password']}
                        className="flex flex-col gap-6"
                    >
                        {({ processing, errors }) => (
                            <>
                                {status && (
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300">
                                        {status}
                                    </div>
                                )}

                                <div className="space-y-6">
                                    {/* Email Field */}
                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]">
                                            Email address
                                        </Label>
                                        <div className="relative">
                                            <Input
                                                id="email"
                                                type="email"
                                                name="email"
                                                required
                                                autoFocus
                                                tabIndex={1}
                                                autoComplete="email"
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

                                    {/* Password Field */}
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="password" className="text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]">
                                                Password
                                            </Label>
                                            {canResetPassword && (
                                                <TextLink
                                                    href={request()}
                                                    className="text-sm text-[#F53003] hover:text-[#FF750F] dark:text-[#FF4433] dark:hover:text-[#FF8866] transition-colors duration-300"
                                                    tabIndex={5}
                                                >
                                                    Forgot password?
                                                </TextLink>
                                            )}
                                        </div>
                                        <div className="relative">
                                            <Input
                                                id="password"
                                                type="password"
                                                name="password"
                                                required
                                                tabIndex={2}
                                                autoComplete="current-password"
                                                placeholder="Enter your password"
                                                className="h-12 px-4 border-[#19140035] dark:border-[#3E3E3A] bg-white dark:bg-[#0a0a0a] focus:border-[#F53003] focus:ring-1 focus:ring-[#F53003] transition-colors duration-300"
                                            />
                                            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                                <svg className="w-5 h-5 text-[#706f6c] dark:text-[#A1A09A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                </svg>
                                            </div>
                                        </div>
                                        <InputError message={errors.password} />
                                    </div>

                                    {/* Remember Me */}
                                    <div className="flex items-center space-x-3">
                                        <Checkbox
                                            id="remember"
                                            name="remember"
                                            tabIndex={3}
                                            className="data-[state=checked]:bg-[#F53003] data-[state=checked]:border-[#F53003] border-[#19140035] dark:border-[#3E3E3A]"
                                        />
                                        <Label htmlFor="remember" className="text-sm text-[#706f6c] dark:text-[#A1A09A]">
                                            Remember me for 30 days
                                        </Label>
                                    </div>

                                    {/* Submit Button */}
                                    <Button
                                        type="submit"
                                        className="w-full h-12 bg-gradient-to-r from-[#F53003] to-[#FF750F] hover:from-[#FF750F] hover:to-[#F53003] text-white font-semibold rounded-lg transition-all duration-300 hover:shadow-lg hover:scale-105 transform shadow-md"
                                        tabIndex={4}
                                        disabled={processing}
                                        data-test="login-button"
                                    >
                                        {processing ? (
                                            <div className="flex items-center space-x-2">
                                                <Spinner className="w-4 h-4" />
                                                <span>Signing in...</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center space-x-2">
                                                <span>Sign in</span>
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                                </svg>
                                            </div>
                                        )}
                                    </Button>
                                </div>

                                {/* Sign Up Link */}
                                {canRegister && (
                                    <div className="text-center pt-4 border-t border-[#19140015] dark:border-[#3E3E3A]">
                                        <p className="text-sm text-[#706f6c] dark:text-[#A1A09A]">
                                            Don't have an account?{' '}
                                            <TextLink
                                                href={register()}
                                                tabIndex={5}
                                                className="text-[#F53003] hover:text-[#FF750F] dark:text-[#FF4433] dark:hover:text-[#FF8866] font-semibold transition-colors duration-300"
                                            >
                                                Sign up now
                                            </TextLink>
                                        </p>
                                    </div>
                                )}
                            </>
                        )}
                    </Form>
                </div>

                {/* Features Preview */}
                <div className={`mt-8 grid grid-cols-3 gap-4 text-center transform transition-all duration-500 delay-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}`}>
                    <div className="text-xs text-[#706f6c] dark:text-[#A1A09A]">
                        <div className="w-8 h-8 bg-gradient-to-br from-[#FFF0ED] to-[#FFFAF0] dark:from-[#1D0002] dark:to-[#0a0a0a] rounded-lg flex items-center justify-center mx-auto mb-2">
                            <span className="text-[#F53003] text-sm">🤖</span>
                        </div>
                        AI Powered
                    </div>
                    <div className="text-xs text-[#706f6c] dark:text-[#A1A09A]">
                        <div className="w-8 h-8 bg-gradient-to-br from-[#F0F5FF] to-[#F0FAF0] dark:from-[#001A33] dark:to-[#001A0A] rounded-lg flex items-center justify-center mx-auto mb-2">
                            <span className="text-[#0066FF] text-sm">📊</span>
                        </div>
                        Analytics
                    </div>
                    <div className="text-xs text-[#706f6c] dark:text-[#A1A09A]">
                        <div className="w-8 h-8 bg-gradient-to-br from-[#F0FAF0] to-[#F0F5FF] dark:from-[#001A0A] dark:to-[#001A33] rounded-lg flex items-center justify-center mx-auto mb-2">
                            <span className="text-[#00A86B] text-sm">💰</span>
                        </div>
                        E-commerce
                    </div>
                </div>
            </div>
        </AuthLayout>
    );
}
