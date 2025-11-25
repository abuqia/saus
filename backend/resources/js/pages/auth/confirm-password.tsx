/* eslint-disable react-hooks/set-state-in-effect */
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { store } from '@/routes/password/confirm';
import { Form, Head } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function ConfirmPassword() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    return (
        <AuthLayout
            title="Secure Area Access"
            description="Please confirm your password to continue to this secure area of the application."
        >
            <Head title="Confirm Password" />

            <div className={`w-full max-w-md mx-auto transform transition-all duration-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
                {/* Security Notice */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 mb-6 text-center dark:bg-yellow-900/20 dark:border-yellow-800">
                    <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-2">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium">
                        Secure Area Access Required
                    </p>
                </div>

                {/* Confirm Password Form */}
                <div className={`bg-white/80 backdrop-blur-sm border border-[#19140015] rounded-2xl p-8 shadow-lg dark:bg-[#161615]/80 dark:border-[#3E3E3A] transform transition-all duration-500 delay-200 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}`}>
                    <Form {...store.form()} resetOnSuccess={['password']}>
                        {({ processing, errors }) => (
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="password" className="text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]">
                                        Confirm Your Password
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="password"
                                            type="password"
                                            name="password"
                                            placeholder="Enter your current password"
                                            autoComplete="current-password"
                                            autoFocus
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

                                <Button
                                    type="submit"
                                    className="w-full h-12 bg-gradient-to-r from-[#F53003] to-[#FF750F] hover:from-[#FF750F] hover:to-[#F53003] text-white font-semibold rounded-lg transition-all duration-300 hover:shadow-lg hover:scale-105 transform shadow-md"
                                    disabled={processing}
                                    data-test="confirm-password-button"
                                >
                                    {processing ? (
                                        <div className="flex items-center space-x-2">
                                            <Spinner className="w-4 h-4" />
                                            <span>Verifying...</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center space-x-2">
                                            <span>Confirm & Continue</span>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                            </svg>
                                        </div>
                                    )}
                                </Button>
                            </div>
                        )}
                    </Form>
                </div>
            </div>
        </AuthLayout>
    );
}
