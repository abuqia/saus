/* eslint-disable react-hooks/set-state-in-effect */
import { login } from '@/routes';
import { store } from '@/routes/register';
import { Form, Head } from '@inertiajs/react';
import { useState, useEffect } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import GoogleLoginButton from '@/components/auth/google-login-button';

export default function Register() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    return (
        <AuthLayout
            title="Join SAUS today"
            description="Create your account and start transforming your links"
        >
            <Head title="Register for SAUS" />

            <div className={`w-full max-w-md mx-auto transform transition-all duration-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
                {/* Register Form */}
                <div className={`bg-white/80 backdrop-blur-sm border border-[#19140015] rounded-2xl p-8 shadow-lg dark:bg-[#161615]/80 dark:border-[#3E3E3A] transform transition-all duration-500 delay-200 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}`}>

                    {/* Social Register Section */}
                    <div className="mb-6">
                        <GoogleLoginButton text="Sign up with Google" />

                        {/* Divider */}
                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-[#19140015] dark:border-[#3E3E3A]"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white/80 dark:bg-[#161615]/80 text-[#706f6c] dark:text-[#A1A09A]">
                                    Or sign up with email
                                </span>
                            </div>
                        </div>
                    </div>

                    <Form
                        {...store.form()}
                        resetOnSuccess={['password', 'password_confirmation']}
                        disableWhileProcessing
                        className="flex flex-col gap-6"
                    >
                        {({ processing, errors }) => (
                            <>
                                <div className="space-y-6">
                                    {/* Name Field */}
                                    <div className="space-y-2">
                                        <Label htmlFor="name" className="text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]">
                                            Full name
                                        </Label>
                                        <div className="relative">
                                            <Input
                                                id="name"
                                                type="text"
                                                required
                                                autoFocus
                                                tabIndex={1}
                                                autoComplete="name"
                                                name="name"
                                                placeholder="Enter your full name"
                                                className="h-12 px-4 border-[#19140035] dark:border-[#3E3E3A] bg-white dark:bg-[#0a0a0a] focus:border-[#F53003] focus:ring-1 focus:ring-[#F53003] transition-colors duration-300"
                                            />
                                            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                                <svg className="w-5 h-5 text-[#706f6c] dark:text-[#A1A09A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                            </div>
                                        </div>
                                        <InputError
                                            message={errors.name}
                                            className="mt-2"
                                        />
                                    </div>

                                    {/* Email Field */}
                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]">
                                            Email address
                                        </Label>
                                        <div className="relative">
                                            <Input
                                                id="email"
                                                type="email"
                                                required
                                                tabIndex={2}
                                                autoComplete="email"
                                                name="email"
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
                                        <Label htmlFor="password" className="text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]">
                                            Password
                                        </Label>
                                        <div className="relative">
                                            <Input
                                                id="password"
                                                type="password"
                                                required
                                                tabIndex={3}
                                                autoComplete="new-password"
                                                name="password"
                                                placeholder="Create a strong password"
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

                                    {/* Confirm Password Field */}
                                    <div className="space-y-2">
                                        <Label htmlFor="password_confirmation" className="text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]">
                                            Confirm password
                                        </Label>
                                        <div className="relative">
                                            <Input
                                                id="password_confirmation"
                                                type="password"
                                                required
                                                tabIndex={4}
                                                autoComplete="new-password"
                                                name="password_confirmation"
                                                placeholder="Confirm your password"
                                                className="h-12 px-4 border-[#19140035] dark:border-[#3E3E3A] bg-white dark:bg-[#0a0a0a] focus:border-[#F53003] focus:ring-1 focus:ring-[#F53003] transition-colors duration-300"
                                            />
                                            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                                <svg className="w-5 h-5 text-[#706f6c] dark:text-[#A1A09A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                                </svg>
                                            </div>
                                        </div>
                                        <InputError
                                            message={errors.password_confirmation}
                                        />
                                    </div>

                                    {/* Terms Agreement */}
                                    <div className="text-xs text-[#706f6c] dark:text-[#A1A09A] text-center">
                                        By signing up, you agree to our{' '}
                                        <TextLink
                                            href="/terms"
                                            className="text-[#F53003] hover:text-[#FF750F] dark:text-[#FF4433] dark:hover:text-[#FF8866]"
                                        >
                                            Terms of Service
                                        </TextLink>{' '}
                                        and{' '}
                                        <TextLink
                                            href="/privacy"
                                            className="text-[#F53003] hover:text-[#FF750F] dark:text-[#FF4433] dark:hover:text-[#FF8866]"
                                        >
                                            Privacy Policy
                                        </TextLink>
                                    </div>

                                    {/* Submit Button */}
                                    <Button
                                        type="submit"
                                        className="w-full h-12 bg-gradient-to-r from-[#F53003] to-[#FF750F] hover:from-[#FF750F] hover:to-[#F53003] text-white font-semibold rounded-lg transition-all duration-300 hover:shadow-lg hover:scale-105 transform shadow-md mt-4"
                                        tabIndex={5}
                                        data-test="register-user-button"
                                    >
                                        {processing ? (
                                            <div className="flex items-center space-x-2">
                                                <Spinner className="w-4 h-4" />
                                                <span>Creating account...</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center space-x-2">
                                                <span>Create account</span>
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                                </svg>
                                            </div>
                                        )}
                                    </Button>
                                </div>

                                {/* Login Link */}
                                <div className="text-center pt-4 border-t border-[#19140015] dark:border-[#3E3E3A]">
                                    <p className="text-sm text-[#706f6c] dark:text-[#A1A09A]">
                                        Already have an account?{' '}
                                        <TextLink
                                            href={login()}
                                            tabIndex={6}
                                            className="text-[#F53003] hover:text-[#FF750F] dark:text-[#FF4433] dark:hover:text-[#FF8866] font-semibold transition-colors duration-300"
                                        >
                                            Log in
                                        </TextLink>
                                    </p>
                                </div>
                            </>
                        )}
                    </Form>
                </div>

                {/* Benefits Section */}
                <div className={`mt-8 transform transition-all duration-500 delay-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}`}>
                    <div className="bg-gradient-to-r from-[#FFF0ED] to-[#FFFAF0] dark:from-[#1D0002] dark:to-[#0a0a0a] border border-[#FFD1C8] dark:border-[#4B0600] rounded-2xl p-6 text-center">
                        <h3 className="font-semibold text-[#1b1b18] dark:text-[#EDEDEC] mb-3">
                            🎉 Start with SAUS today!
                        </h3>
                        <div className="grid grid-cols-2 gap-4 text-xs text-[#706f6c] dark:text-[#A1A09A]">
                            <div className="flex items-center justify-center space-x-1">
                                <span>🤖</span>
                                <span>AI Powered</span>
                            </div>
                            <div className="flex items-center justify-center space-x-1">
                                <span>📊</span>
                                <span>Advanced Analytics</span>
                            </div>
                            <div className="flex items-center justify-center space-x-1">
                                <span>🔗</span>
                                <span>Smart Links</span>
                            </div>
                            <div className="flex items-center justify-center space-x-1">
                                <span>💰</span>
                                <span>E-commerce Ready</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthLayout>
    );
}
