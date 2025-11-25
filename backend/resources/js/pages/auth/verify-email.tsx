/* eslint-disable react-hooks/set-state-in-effect */
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { logout } from '@/routes';
import { send } from '@/routes/verification';
import { Form, Head } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function VerifyEmail({ status }: { status?: string }) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    return (
        <AuthLayout
            title="Verify Your Email"
            description="We've sent a verification link to your email address. Please click the link to verify your account."
        >
            <Head title="Email Verification" />

            <div className={`w-full max-w-md mx-auto transform transition-all duration-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
                {/* Email Icon */}
                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#FFF0ED] to-[#FFFAF0] dark:from-[#1D0002] dark:to-[#0a0a0a] rounded-2xl flex items-center justify-center">
                        <svg className="w-8 h-8 text-[#F53003] dark:text-[#FF4433]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    </div>
                </div>

                {/* Status Message */}
                {status === 'verification-link-sent' && (
                    <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-6 text-center dark:bg-green-900/20 dark:border-green-800 transform transition-all duration-500">
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <p className="text-sm text-green-800 dark:text-green-200 font-medium">
                            A new verification link has been sent to your email address!
                        </p>
                    </div>
                )}

                {/* Verification Form */}
                <div className={`bg-white/80 backdrop-blur-sm border border-[#19140015] rounded-2xl p-8 shadow-lg dark:bg-[#161615]/80 dark:border-[#3E3E3A] transform transition-all duration-500 delay-200 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}`}>
                    <Form {...send.form()} className="space-y-6 text-center">
                        {({ processing }) => (
                            <>
                                <div className="space-y-4">
                                    <p className="text-sm text-[#706f6c] dark:text-[#A1A09A] leading-relaxed">
                                        Check your inbox for the verification email. If you don't see it, check your spam folder or request a new link.
                                    </p>

                                    <Button
                                        type="submit"
                                        className="w-full h-12 bg-gradient-to-r from-[#F53003] to-[#FF750F] hover:from-[#FF750F] hover:to-[#F53003] text-white font-semibold rounded-lg transition-all duration-300 hover:shadow-lg hover:scale-105 transform shadow-md"
                                        disabled={processing}
                                    >
                                        {processing ? (
                                            <div className="flex items-center space-x-2 justify-center">
                                                <Spinner className="w-4 h-4" />
                                                <span>Sending...</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center space-x-2 justify-center">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                </svg>
                                                <span>Resend Verification Email</span>
                                            </div>
                                        )}
                                    </Button>
                                </div>

                                <div className="pt-4 border-t border-[#19140015] dark:border-[#3E3E3A]">
                                    <TextLink
                                        href={logout()}
                                        className="text-sm text-[#706f6c] dark:text-[#A1A09A] hover:text-[#F53003] dark:hover:text-[#FF4433] transition-colors duration-300"
                                    >
                                        ← Back to login
                                    </TextLink>
                                </div>
                            </>
                        )}
                    </Form>
                </div>
            </div>
        </AuthLayout>
    );
}
