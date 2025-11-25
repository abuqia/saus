/* eslint-disable react-hooks/set-state-in-effect */
import { dashboard, login, register } from '@/routes';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

export default function Welcome({
    canRegister = true,
}: {
    canRegister?: boolean;
}) {
    const { auth } = usePage<SharedData>().props;
    const [isVisible, setIsVisible] = useState(false);
    const featuresRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    const features = [
        {
            icon: "🤖",
            title: "AI-Powered Optimization",
            description: "Smart link optimization, predictive analytics, dan AI content generator untuk maximize engagement.",
            gradient: "from-[#FFF0ED] to-[#FFFAF0]",
            border: "border-[#FFD1C8]",
            darkGradient: "dark:from-[#1D0002] dark:to-[#0a0a0a]",
            darkBorder: "dark:border-[#4B0600]",
            bgColor: "bg-[#F53003]"
        },
        {
            icon: "🔗",
            title: "Smart Link Management",
            description: "Conditional links dengan geo-targeting, time-based routing, dan device detection.",
            gradient: "from-[#FFF5F0] to-[#FFF0F5]",
            border: "border-[#FFD1C8]",
            darkGradient: "dark:from-[#1A000A] dark:to-[#1D0002]",
            darkBorder: "dark:border-[#4B0600]",
            bgColor: "bg-[#FF750F]"
        },
        {
            icon: "📊",
            title: "Advanced Analytics",
            description: "Real-time analytics dengan heatmap, UTM tracking, dan competitor analysis.",
            gradient: "from-[#F0F5FF] to-[#F0FAF0]",
            border: "border-[#D1E0FF]",
            darkGradient: "dark:from-[#001A33] dark:to-[#001A0A]",
            darkBorder: "dark:border-[#004080]",
            bgColor: "bg-[#0066FF]"
        },
        {
            icon: "👥",
            title: "Multi-Brand Management",
            description: "Kelola unlimited brands dengan team collaboration dan white-label solution.",
            gradient: "from-[#F5F0FF] to-[#F0F5FF]",
            border: "border-[#E0D1FF]",
            darkGradient: "dark:from-[#1A0033] dark:to-[#001A33]",
            darkBorder: "dark:border-[#4B0080]",
            bgColor: "bg-[#8B5CF6]"
        },
        {
            icon: "💰",
            title: "E-Commerce Integration",
            description: "Integrasi dengan Shopify, Tokopedia, Shopee, dan payment gateway Indonesia.",
            gradient: "from-[#F0FAF0] to-[#F0F5FF]",
            border: "border-[#D1F0D1]",
            darkGradient: "dark:from-[#001A0A] dark:to-[#001A33]",
            darkBorder: "dark:border-[#008040]",
            bgColor: "bg-[#00A86B]"
        },
        {
            icon: "⚡",
            title: "Marketing Automation",
            description: "Email marketing, SMS automation, push notifications, dan lead magnet tools.",
            gradient: "from-[#FFF0F5] to-[#FFF5F0]",
            border: "border-[#FFD1E0]",
            darkGradient: "dark:from-[#1D000A] dark:to-[#1A0000]",
            darkBorder: "dark:border-[#4B0020]",
            bgColor: "bg-[#FF4473]"
        }
    ];

    const stats = [
        { number: "50+", label: "Templates" },
        { number: "AI", label: "Powered" },
        { number: "99.9%", label: "Uptime" },
        { number: "24/7", label: "Support" }
    ];

    return (
        <>
            <Head title="SAUS - Advanced Link-in-Bio Platform">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600"
                    rel="stylesheet"
                />
                <meta name="description" content="SAUS - Platform Link-in-Bio canggih dengan AI-powered features, analytics mendalam, dan e-commerce integration untuk meningkatkan engagement dan conversion." />
            </Head>

            <div className="min-h-screen bg-gradient-to-br from-[#FDFDFC] via-white to-[#FFF5F5] text-[#1b1b18] dark:from-[#0a0a0a] dark:via-[#111111] dark:to-[#1D0002]">
                {/* Navigation */}
                <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-[#19140015] z-50 dark:bg-[#0a0a0a]/80 dark:border-[#3E3E3A]">
                    <div className="container mx-auto px-6 py-4">
                        <nav className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <div className="w-8 h-8 bg-gradient-to-br from-[#F53003] to-[#FF750F] rounded-lg flex items-center justify-center">
                                    <span className="text-white font-bold text-sm">S</span>
                                </div>
                                <span className="font-bold text-xl bg-gradient-to-r from-[#1b1b18] to-[#F53003] bg-clip-text text-transparent dark:from-[#EDEDEC] dark:to-[#FF4433]">
                                    SAUS
                                </span>
                            </div>

                            <div className="flex items-center gap-4">
                                {auth.user ? (
                                    <Link
                                        href={dashboard()}
                                        className="inline-block rounded-lg bg-[#1b1b18] px-6 py-2.5 text-sm font-medium text-white hover:bg-black transition-all duration-300 hover:scale-105 dark:bg-[#EDEDEC] dark:text-[#1C1C1A] dark:hover:bg-white"
                                    >
                                        Dashboard
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href={login()}
                                            className="hidden sm:inline-block rounded-lg border border-transparent px-6 py-2.5 text-sm font-medium text-[#1b1b18] hover:border-[#19140035] transition-all duration-300 dark:text-[#EDEDEC] dark:hover:border-[#3E3E3A]"
                                        >
                                            Login
                                        </Link>
                                        {canRegister && (
                                            <Link
                                                href={register()}
                                                className="inline-block rounded-lg bg-gradient-to-r from-[#F53003] to-[#FF750F] px-6 py-2.5 text-sm font-medium text-white hover:shadow-lg transition-all duration-300 hover:scale-105 shadow-md"
                                            >
                                                Start Free Trial
                                            </Link>
                                        )}
                                    </>
                                )}
                            </div>
                        </nav>
                    </div>
                </header>

                {/* Hero Section */}
                <section className="pt-32 pb-20 lg:pt-40 lg:pb-28">
                    <div className="container mx-auto px-6 text-center">
                        {/* Animated Badge */}
                        <div className={`inline-flex items-center gap-2 bg-[#FFF0ED] border border-[#FFD1C8] rounded-full px-4 py-2 mb-8 dark:bg-[#1D0002] dark:border-[#4B0600] transform transition-all duration-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
                            <span className="w-2 h-2 bg-[#F53003] rounded-full animate-pulse"></span>
                            <span className="text-sm font-medium text-[#F53003] dark:text-[#FF4433]">
                                🚀 Beyond Ordinary Link-in-Bio
                            </span>
                        </div>

                        {/* Main Heading with Animation */}
                        <div className={`transform transition-all duration-700 delay-200 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
                            <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
                                Transform Your Links Into
                                <span className="block bg-gradient-to-r from-[#F53003] to-[#FF750F] bg-clip-text text-transparent animate-gradient">
                                    Powerful Experiences
                                </span>
                            </h1>

                            <p className="text-xl lg:text-2xl text-[#706f6c] mb-8 max-w-3xl mx-auto leading-relaxed dark:text-[#A1A09A]">
                                AI-powered link management platform dengan analytics mendalam,
                                smart routing, dan e-commerce integration untuk maximize engagement & conversion.
                            </p>
                        </div>

                        {/* CTA Buttons with Animation */}
                        <div className={`flex flex-col sm:flex-row gap-4 justify-center items-center mb-12 transform transition-all duration-700 delay-400 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
                            <Link
                                href={canRegister ? register() : login()}
                                className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-[#F53003] to-[#FF750F] px-8 py-4 text-lg font-semibold text-white hover:shadow-xl transition-all duration-300 hover:scale-105 shadow-lg group"
                            >
                                <span className="group-hover:scale-110 transition-transform duration-300">🚀</span>
                                <span className="ml-2">Start Free Trial</span>
                                <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </Link>
                            <button className="inline-flex items-center justify-center rounded-lg border border-[#19140035] px-8 py-4 text-lg font-semibold text-[#1b1b18] hover:border-[#1915014a] transition-all duration-300 hover:scale-105 dark:border-[#3E3E3A] dark:text-[#EDEDEC] dark:hover:border-[#62605b] group">
                                <span className="group-hover:scale-110 transition-transform duration-300">📺</span>
                                <span className="ml-2">Watch Demo</span>
                            </button>
                        </div>

                        {/* Stats Grid with Animation */}
                        <div className={`grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-2xl mx-auto transform transition-all duration-700 delay-600 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
                            {stats.map((stat, index) => (
                                <div
                                    key={index}
                                    className="text-center group hover:transform hover:scale-105 transition-all duration-300"
                                >
                                    <div className="text-2xl lg:text-3xl font-bold text-[#1b1b18] dark:text-[#EDEDEC] group-hover:text-[#F53003] dark:group-hover:text-[#FF4433] transition-colors duration-300">
                                        {stat.number}
                                    </div>
                                    <div className="text-sm text-[#706f6c] dark:text-[#A1A09A] group-hover:text-[#1b1b18] dark:group-hover:text-[#EDEDEC] transition-colors duration-300">
                                        {stat.label}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="py-20 bg-white dark:bg-[#161615]" ref={featuresRef}>
                    <div className="container mx-auto px-6">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl lg:text-4xl font-bold mb-4 transform transition-all duration-500">
                                Why <span className="text-[#F53003] dark:text-[#FF4433]">SAUS</span> is Different
                            </h2>
                            <p className="text-xl text-[#706f6c] max-w-2xl mx-auto dark:text-[#A1A09A] transform transition-all duration-500 delay-200">
                                Fitur-fitur canggih yang tidak dimiliki platform lain
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {features.map((feature, index) => (
                                <div
                                    key={index}
                                    className={`bg-gradient-to-br ${feature.gradient} ${feature.border} rounded-2xl p-6 hover:shadow-xl transition-all duration-500 hover:transform hover:scale-105 group cursor-pointer ${feature.darkGradient} ${feature.darkBorder} animate-fade-in`}
                                    style={{ animationDelay: `${index * 100}ms` }}
                                >
                                    <div className={`w-12 h-12 ${feature.bgColor} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                                        <span className="text-white text-xl">{feature.icon}</span>
                                    </div>
                                    <h3 className="text-xl font-bold mb-3 text-[#1b1b18] dark:text-[#EDEDEC] group-hover:text-[#F53003] dark:group-hover:text-[#FF4433] transition-colors duration-300">
                                        {feature.title}
                                    </h3>
                                    <p className="text-[#706f6c] dark:text-[#A1A09A] leading-relaxed">
                                        {feature.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-20 bg-gradient-to-r from-[#F53003] to-[#FF750F] text-white relative overflow-hidden">
                    {/* Animated Background Elements */}
                    <div className="absolute inset-0 overflow-hidden">
                        <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/10 rounded-full animate-pulse"></div>
                        <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-white/5 rounded-full animate-pulse delay-1000"></div>
                        <div className="absolute top-1/2 left-1/4 w-20 h-20 bg-white/10 rounded-full animate-bounce"></div>
                    </div>

                    <div className="container mx-auto px-6 text-center relative z-10">
                        <h2 className="text-3xl lg:text-4xl font-bold mb-6 transform transition-all duration-500">
                            Ready to Transform Your Links?
                        </h2>
                        <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90 transform transition-all duration-500 delay-200">
                            Bergabung dengan ratusan creator dan bisnis yang sudah meningkatkan engagement dengan SAUS.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center transform transition-all duration-500 delay-400">
                            <Link
                                href={canRegister ? register() : login()}
                                className="inline-flex items-center justify-center rounded-lg bg-white text-[#F53003] px-8 py-4 text-lg font-semibold hover:bg-gray-100 transition-all duration-300 hover:scale-105 shadow-lg group"
                            >
                                <span className="group-hover:scale-110 transition-transform duration-300">🚀</span>
                                <span className="ml-2 font-bold">Start Free Trial</span>
                            </Link>
                            <button className="inline-flex items-center justify-center rounded-lg border border-white/30 bg-transparent px-8 py-4 text-lg font-semibold hover:bg-white/10 transition-all duration-300 hover:scale-105 group">
                                <span className="group-hover:scale-110 transition-transform duration-300">📞</span>
                                <span className="ml-2">Contact Sales</span>
                            </button>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="bg-[#1b1b18] text-white py-12 dark:bg-[#000000]">
                    <div className="container mx-auto px-6">
                        <div className="flex flex-col lg:flex-row justify-between items-center">
                            <div className="flex items-center space-x-2 mb-6 lg:mb-0">
                                <div className="w-8 h-8 bg-gradient-to-br from-[#F53003] to-[#FF750F] rounded-lg flex items-center justify-center">
                                    <span className="text-white font-bold text-sm">S</span>
                                </div>
                                <span className="font-bold text-xl text-white">SAUS</span>
                            </div>

                            <div className="text-center lg:text-right">
                                <p className="text-gray-400">
                                    &copy; 2024 SAUS. All rights reserved.
                                    <span className="block lg:inline lg:ml-2 mt-1 lg:mt-0">
                                        Built with ❤️ for creators and businesses.
                                    </span>
                                </p>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>

            <style>{`
                @keyframes gradient {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                .animate-gradient {
                    background-size: 200% 200%;
                    animation: gradient 3s ease infinite;
                }
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-fade-in {
                    animation: fadeIn 0.6s ease-out forwards;
                }
            `}</style>
        </>
    );
}
