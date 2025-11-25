/* eslint-disable react-hooks/set-state-in-effect */
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from '@/components/ui/input-otp';
import { OTP_MAX_LENGTH } from '@/hooks/use-two-factor-auth';
import AuthLayout from '@/layouts/auth-layout';
import { store } from '@/routes/two-factor/login';
import { Form, Head } from '@inertiajs/react';
import { REGEXP_ONLY_DIGITS } from 'input-otp';
import { useMemo, useState, useEffect } from 'react';

export default function TwoFactorChallenge() {
    const [showRecoveryInput, setShowRecoveryInput] = useState<boolean>(false);
    const [code, setCode] = useState<string>('');
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    const authConfigContent = useMemo<{
        title: string;
        description: string;
        toggleText: string;
    }>(() => {
        if (showRecoveryInput) {
            return {
                title: 'Recovery Code',
                description: 'Please confirm access to your account by entering one of your emergency recovery codes.',
                toggleText: 'Use authentication code instead',
            };
        }

        return {
            title: 'Two-Factor Authentication',
            description: 'Enter the authentication code provided by your authenticator application.',
            toggleText: 'Use recovery code instead',
        };
    }, [showRecoveryInput]);

    const toggleRecoveryMode = (clearErrors: () => void): void => {
        setShowRecoveryInput(!showRecoveryInput);
        clearErrors();
        setCode('');
    };

    return (
        <AuthLayout
            title={authConfigContent.title}
            description={authConfigContent.description}
        >
            <Head title="Two-Factor Authentication" />

            <div className={`w-full max-w-md mx-auto transform transition-all duration-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
                {/* Security Badge */}
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6 text-center dark:bg-blue-900/20 dark:border-blue-800">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <p className="text-sm text-blue-800 dark:text-blue-200 font-medium">
                        Extra Security Layer
                    </p>
                </div>

                {/* Two Factor Form */}
                <div className={`bg-white/80 backdrop-blur-sm border border-[#19140015] rounded-2xl p-8 shadow-lg dark:bg-[#161615]/80 dark:border-[#3E3E3A] transform transition-all duration-500 delay-200 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}`}>
                    <Form
                        {...store.form()}
                        className="space-y-6"
                        resetOnError
                        resetOnSuccess={!showRecoveryInput}
                    >
                        {({ errors, processing, clearErrors }) => (
                            <>
                                {showRecoveryInput ? (
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]">
                                            Recovery Code
                                        </label>
                                        <Input
                                            name="recovery_code"
                                            type="text"
                                            placeholder="Enter your recovery code"
                                            autoFocus={showRecoveryInput}
                                            required
                                            className="h-12 px-4 border-[#19140035] dark:border-[#3E3E3A] bg-white dark:bg-[#0a0a0a] focus:border-[#F53003] focus:ring-1 focus:ring-[#F53003] transition-colors duration-300"
                                        />
                                        <InputError
                                            message={errors.recovery_code}
                                        />
                                    </div>
                                ) : (
                                    <div className="space-y-4 text-center">
                                        <label className="text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC] block">
                                            Authentication Code
                                        </label>
                                        <div className="flex w-full items-center justify-center">
                                            <InputOTP
                                                name="code"
                                                maxLength={OTP_MAX_LENGTH}
                                                value={code}
                                                onChange={(value) => setCode(value)}
                                                disabled={processing}
                                                pattern={REGEXP_ONLY_DIGITS}
                                            >
                                                <InputOTPGroup>
                                                    {Array.from(
                                                        { length: OTP_MAX_LENGTH },
                                                        (_, index) => (
                                                            <InputOTPSlot
                                                                key={index}
                                                                index={index}
                                                                className="h-12 w-12 text-lg border-[#19140035] dark:border-[#3E3E3A] focus:border-[#F53003] focus:ring-1 focus:ring-[#F53003]"
                                                            />
                                                        ),
                                                    )}
                                                </InputOTPGroup>
                                            </InputOTP>
                                        </div>
                                        <InputError message={errors.code} />
                                    </div>
                                )}

                                <Button
                                    type="submit"
                                    className="w-full h-12 bg-gradient-to-r from-[#F53003] to-[#FF750F] hover:from-[#FF750F] hover:to-[#F53003] text-white font-semibold rounded-lg transition-all duration-300 hover:shadow-lg hover:scale-105 transform shadow-md"
                                    disabled={processing}
                                >
                                    {processing ? (
                                        <div className="flex items-center space-x-2">
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            <span>Verifying...</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center space-x-2">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                            </svg>
                                            <span>Verify & Continue</span>
                                        </div>
                                    )}
                                </Button>

                                <div className="text-center pt-4 border-t border-[#19140015] dark:border-[#3E3E3A]">
                                    <p className="text-sm text-[#706f6c] dark:text-[#A1A09A]">
                                        <button
                                            type="button"
                                            className="text-[#F53003] hover:text-[#FF750F] dark:text-[#FF4433] dark:hover:text-[#FF8866] font-semibold transition-colors duration-300 underline underline-offset-4"
                                            onClick={() => toggleRecoveryMode(clearErrors)}
                                        >
                                            {authConfigContent.toggleText}
                                        </button>
                                    </p>
                                </div>
                            </>
                        )}
                    </Form>
                </div>
            </div>
        </AuthLayout>
    );
}
