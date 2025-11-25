import { home } from '@/routes';
import { Link } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';

interface AuthLayoutProps {
    name?: string;
    title?: string;
    description?: string;
}

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: PropsWithChildren<AuthLayoutProps>) {
    return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
            <div className="w-full max-w-sm">
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col items-center gap-2">
                        {/* Header Logo */}
                        <Link
                            href={home()}
                            className="flex flex-col items-center gap-2 font-medium"
                        >
                            <div className="flex justify-center">
                                <div className="flex items-center space-x-3">
                                    <div className="w-12 h-12 bg-gradient-to-br from-[#F53003] to-[#FF750F] rounded-xl flex items-center justify-center">
                                        <span className="text-white font-bold text-xl">S</span>
                                    </div>
                                    <span className="font-bold text-3xl bg-gradient-to-r from-[#1b1b18] to-[#F53003] bg-clip-text text-transparent dark:from-[#EDEDEC] dark:to-[#FF4433]">
                                        SAUS
                                    </span>
                                </div>
                            </div>
                        </Link>

                        <div className="space-y-2 text-center">
                            <h1 className="text-lg font-medium">{title}</h1>
                            <p className="text-center text-sm text-muted-foreground">
                                {description}
                            </p>
                        </div>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}
