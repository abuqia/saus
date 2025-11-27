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
            description: "Smart link optimization, predictive analytics, auto A/B testing, dan AI content generator untuk maximize engagement.",
            details: ["AI Content Analyzer", "Predictive Analytics", "Smart CTR Boost", "Auto-generate SEO"],
            gradient: "from-[#FFF0ED] to-[#FFFAF0]",
            border: "border-[#FFD1C8]",
            darkGradient: "dark:from-[#1D0002] dark:to-[#0a0a0a]",
            darkBorder: "dark:border-[#4B0600]",
            bgColor: "bg-[#F53003]"
        },
        {
            icon: "🔗",
            title: "Smart Link Management",
            description: "Conditional links dengan geo-targeting, time-based routing, device detection, dan QR codes dengan branding custom.",
            details: ["Geo-targeting", "Time-based Links", "QR Code Generator", "Link Expiration"],
            gradient: "from-[#FFF5F0] to-[#FFF0F5]",
            border: "border-[#FFD1C8]",
            darkGradient: "dark:from-[#1A000A] dark:to-[#1D0002]",
            darkBorder: "dark:border-[#4B0600]",
            bgColor: "bg-[#FF750F]"
        },
        {
            icon: "📊",
            title: "Advanced Analytics",
            description: "Real-time analytics dengan heatmap, UTM tracking, user journey mapping, dan competitor analysis premium.",
            details: ["Live Visitor Tracking", "UTM Parameters", "Custom Reports", "Engagement Score"],
            gradient: "from-[#F0F5FF] to-[#F0FAF0]",
            border: "border-[#D1E0FF]",
            darkGradient: "dark:from-[#001A33] dark:to-[#001A0A]",
            darkBorder: "dark:border-[#004080]",
            bgColor: "bg-[#0066FF]"
        },
        {
            icon: "🎨",
            title: "Advanced Page Builder",
            description: "Drag & drop builder dengan 50+ templates, custom blocks, animations, dan dark mode support.",
            details: ["Visual Builder", "50+ Templates", "Custom CSS", "Mobile-First"],
            gradient: "from-[#F5F0FF] to-[#F0F5FF]",
            border: "border-[#E0D1FF]",
            darkGradient: "dark:from-[#1A0033] dark:to-[#001A33]",
            darkBorder: "dark:border-[#4B0080]",
            bgColor: "bg-[#8B5CF6]"
        },
        {
            icon: "💰",
            title: "E-Commerce Integration",
            description: "Integrasi lengkap dengan Shopify, Tokopedia, Shopee, payment gateway Indonesia, dan upsell automation.",
            details: ["Multi-Platform", "Order Management", "Inventory Sync", "Abandoned Cart"],
            gradient: "from-[#F0FAF0] to-[#F0F5FF]",
            border: "border-[#D1F0D1]",
            darkGradient: "dark:from-[#001A0A] dark:to-[#001A33]",
            darkBorder: "dark:border-[#008040]",
            bgColor: "bg-[#00A86B]"
        },
        {
            icon: "⚡",
            title: "Marketing Automation",
            description: "Email campaigns, SMS automation, WhatsApp Business API, push notifications, dan quiz funnels.",
            details: ["Email Marketing", "SMS Campaigns", "Push Notifications", "Lead Magnets"],
            gradient: "from-[#FFF0F5] to-[#FFF5F0]",
            border: "border-[#FFD1E0]",
            darkGradient: "dark:from-[#1D000A] dark:to-[#1A0000]",
            darkBorder: "dark:border-[#4B0020]",
            bgColor: "bg-[#FF4473]"
        },
        {
            icon: "👥",
            title: "Multi-Brand & Team",
            description: "Kelola unlimited brands dengan granular permissions, team collaboration, dan white-label solution.",
            details: ["Multi-Brand Dashboard", "Role-Based Access", "Activity Log", "White-Label"],
            gradient: "from-[#FFF5F0] to-[#FFFAF0]",
            border: "border-[#FFE0B2]",
            darkGradient: "dark:from-[#1A0A00] dark:to-[#1D0002]",
            darkBorder: "dark:border-[#4B2000]",
            bgColor: "bg-[#FF8C00]"
        },
        {
            icon: "🔒",
            title: "Security & Privacy",
            description: "2FA, IP whitelist, GDPR compliance, automated backups, dan data export tools untuk keamanan maksimal.",
            details: ["Two-Factor Auth", "GDPR Compliant", "Auto Backup", "Privacy Tools"],
            gradient: "from-[#F0F0F0] to-[#F5F5F5]",
            border: "border-[#D1D1D1]",
            darkGradient: "dark:from-[#0A0A0A] dark:to-[#111111]",
            darkBorder: "dark:border-[#404040]",
            bgColor: "bg-[#4A5568]"
        },
        {
            icon: "🌐",
            title: "SEO & Performance",
            description: "Meta tag optimizer, schema markup, CDN integration, image optimization, dan unlimited custom domains.",
            details: ["SEO Tools", "CDN Integration", "Image Optimization", "Custom Domains"],
            gradient: "from-[#F0FAF5] to-[#F0F5FA]",
            border: "border-[#B2D1D1]",
            darkGradient: "dark:from-[#001A1A] dark:to-[#001A33]",
            darkBorder: "dark:border-[#004040]",
            bgColor: "bg-[#00796B]"
        }
    ];

    const stats = [
        { number: "50+", label: "Premium Templates", icon: "🎨" },
        { number: "AI", label: "Smart Features", icon: "🤖" },
        { number: "99.9%", label: "Uptime SLA", icon: "⚡" },
        { number: "24/7", label: "Support", icon: "💬" }
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
                        <div className={`grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-3xl mx-auto transform transition-all duration-700 delay-600 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
                            {stats.map((stat, index) => (
                                <div
                                    key={index}
                                    className="text-center group hover:transform hover:scale-105 transition-all duration-300 bg-white dark:bg-[#161615] rounded-xl p-4 shadow-sm hover:shadow-lg border border-[#19140015] dark:border-[#3E3E3A]"
                                >
                                    <div className="text-3xl mb-2 group-hover:scale-110 transition-transform duration-300">
                                        {stat.icon}
                                    </div>
                                    <div className="text-2xl lg:text-3xl font-bold text-[#1b1b18] dark:text-[#EDEDEC] group-hover:text-[#F53003] dark:group-hover:text-[#FF4433] transition-colors duration-300 mb-1">
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
                                    className={`bg-gradient-to-br ${feature.gradient} ${feature.border} rounded-2xl p-6 hover:shadow-xl transition-all duration-500 hover:transform hover:scale-105 group cursor-pointer ${feature.darkGradient} ${feature.darkBorder} animate-fade-in border`}
                                    style={{ animationDelay: `${index * 100}ms` }}
                                >
                                    <div className={`w-12 h-12 ${feature.bgColor} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                                        <span className="text-2xl">{feature.icon}</span>
                                    </div>
                                    <h3 className="text-xl font-bold mb-3 text-[#1b1b18] dark:text-[#EDEDEC] group-hover:text-[#F53003] dark:group-hover:text-[#FF4433] transition-colors duration-300">
                                        {feature.title}
                                    </h3>
                                    <p className="text-[#706f6c] dark:text-[#A1A09A] leading-relaxed mb-4">
                                        {feature.description}
                                    </p>
                                    <ul className="space-y-2">
                                        {feature.details.map((detail, idx) => (
                                            <li key={idx} className="flex items-center text-sm text-[#706f6c] dark:text-[#A1A09A]">
                                                <svg className="w-4 h-4 mr-2 text-[#F53003] dark:text-[#FF4433] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                                <span>{detail}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Comparison Section */}
                <section className="py-20 bg-gradient-to-br from-[#FDFDFC] via-white to-[#FFF5F5] dark:from-[#0a0a0a] dark:via-[#111111] dark:to-[#1D0002]">
                    <div className="container mx-auto px-6">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                                <span className="text-[#F53003] dark:text-[#FF4433]">SAUS</span> vs Competitors
                            </h2>
                            <p className="text-xl text-[#706f6c] max-w-2xl mx-auto dark:text-[#A1A09A]">
                                Lihat perbedaan signifikan yang membuat SAUS unggul
                            </p>
                        </div>

                        <div className="max-w-5xl mx-auto bg-white dark:bg-[#161615] rounded-2xl shadow-xl overflow-hidden border border-[#19140015] dark:border-[#3E3E3A]">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gradient-to-r from-[#F53003] to-[#FF750F] text-white">
                                        <tr>
                                            <th className="px-6 py-4 text-left font-semibold">Fitur</th>
                                            <th className="px-6 py-4 text-center font-semibold">Others</th>
                                            <th className="px-6 py-4 text-center font-semibold">SAUS</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#19140015] dark:divide-[#3E3E3A]">
                                        {[
                                            { feature: "AI Optimization", others: false, saus: true },
                                            { feature: "Advanced Analytics", others: false, saus: true },
                                            { feature: "Multi-Brand Management", others: false, saus: true },
                                            { feature: "Marketing Automation", others: false, saus: true },
                                            { feature: "Smart Conditional Links", others: false, saus: true },
                                            { feature: "White-Label Solution", others: false, saus: true },
                                            { feature: "Public API", others: false, saus: true },
                                            { feature: "Team Collaboration", others: "Limited", saus: true },
                                            { feature: "A/B Testing", others: false, saus: true },
                                            { feature: "Advanced SEO Tools", others: false, saus: true },
                                        ].map((row, index) => (
                                            <tr key={index} className="hover:bg-[#FFF5F5] dark:hover:bg-[#1D0002] transition-colors duration-200">
                                                <td className="px-6 py-4 font-medium text-[#1b1b18] dark:text-[#EDEDEC]">{row.feature}</td>
                                                <td className="px-6 py-4 text-center">
                                                    {row.others === true ? (
                                                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-100 dark:bg-green-900">
                                                            <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                            </svg>
                                                        </span>
                                                    ) : row.others === false ? (
                                                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-100 dark:bg-red-900">
                                                            <svg className="w-4 h-4 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                                            </svg>
                                                        </span>
                                                    ) : (
                                                        <span className="text-sm text-[#706f6c] dark:text-[#A1A09A]">{row.others}</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#F53003] shadow-lg">
                                                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                        </svg>
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Use Cases Section */}
                <section className="py-20 bg-white dark:bg-[#161615]">
                    <div className="container mx-auto px-6">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                                Perfect For Every Creator
                            </h2>
                            <p className="text-xl text-[#706f6c] max-w-2xl mx-auto dark:text-[#A1A09A]">
                                Dari content creator hingga enterprise, SAUS cocok untuk semua
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                {
                                    emoji: "📱",
                                    title: "Content Creators",
                                    description: "Instagram, TikTok, YouTube creators yang ingin maksimalkan engagement",
                                    color: "from-pink-50 to-purple-50 dark:from-pink-950 dark:to-purple-950"
                                },
                                {
                                    emoji: "🛍️",
                                    title: "E-Commerce",
                                    description: "Online shop owners yang butuh integrasi marketplace dan payment",
                                    color: "from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950"
                                },
                                {
                                    emoji: "🎯",
                                    title: "Agencies",
                                    description: "Marketing agencies yang manage multiple brands dengan white-label",
                                    color: "from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950"
                                },
                                {
                                    emoji: "🏢",
                                    title: "Enterprise",
                                    description: "Large teams yang butuh advanced analytics dan team collaboration",
                                    color: "from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950"
                                }
                            ].map((useCase, index) => (
                                <div
                                    key={index}
                                    className={`bg-gradient-to-br ${useCase.color} rounded-2xl p-6 hover:shadow-xl transition-all duration-500 hover:transform hover:scale-105 group cursor-pointer border border-[#19140015] dark:border-[#3E3E3A]`}
                                >
                                    <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                                        {useCase.emoji}
                                    </div>
                                    <h3 className="text-xl font-bold mb-3 text-[#1b1b18] dark:text-[#EDEDEC]">
                                        {useCase.title}
                                    </h3>
                                    <p className="text-[#706f6c] dark:text-[#A1A09A] leading-relaxed">
                                        {useCase.description}
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

                        {/* Pricing Teaser */}
                        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
                            {[
                                {
                                    name: "Starter",
                                    price: "Free",
                                    features: ["1 Brand", "Basic Analytics", "5 Links", "Community Support"]
                                },
                                {
                                    name: "Pro",
                                    price: "$19",
                                    period: "/month",
                                    features: ["5 Brands", "Advanced Analytics", "Unlimited Links", "AI Features", "Priority Support"],
                                    popular: true
                                },
                                {
                                    name: "Enterprise",
                                    price: "Custom",
                                    features: ["Unlimited Brands", "White-Label", "API Access", "Dedicated Support", "Custom Integration"]
                                }
                            ].map((plan, index) => (
                                <div
                                    key={index}
                                    className={`bg-white/10 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/20 transition-all duration-300 hover:scale-105 ${
                                        plan.popular ? 'ring-2 ring-white shadow-2xl' : ''
                                    }`}
                                >
                                    {plan.popular && (
                                        <div className="bg-white text-[#F53003] text-xs font-bold px-3 py-1 rounded-full inline-block mb-3">
                                            MOST POPULAR
                                        </div>
                                    )}
                                    <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                                    <div className="mb-4">
                                        <span className="text-3xl font-bold">{plan.price}</span>
                                        {plan.period && <span className="text-sm opacity-75">{plan.period}</span>}
                                    </div>
                                    <ul className="space-y-2 text-sm text-left">
                                        {plan.features.map((feature, idx) => (
                                            <li key={idx} className="flex items-center">
                                                <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>

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

                        <p className="mt-8 text-sm opacity-75">
                            No credit card required • 14-day free trial • Cancel anytime
                        </p>
                    </div>
                </section>

                {/* Testimonials Section */}
                <section className="py-20 bg-white dark:bg-[#161615]">
                    <div className="container mx-auto px-6">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                                Loved by Creators & Businesses
                            </h2>
                            <p className="text-xl text-[#706f6c] max-w-2xl mx-auto dark:text-[#A1A09A]">
                                Dengar dari mereka yang sudah merasakan manfaat SAUS
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            {[
                                {
                                    name: "Sarah Johnson",
                                    role: "Content Creator",
                                    avatar: "👩‍💼",
                                    quote: "SAUS mengubah cara saya manage links. AI optimization benar-benar meningkatkan CTR saya 45%!",
                                    rating: 5
                                },
                                {
                                    name: "Michael Chen",
                                    role: "E-Commerce Owner",
                                    avatar: "👨‍💻",
                                    quote: "Integration dengan Shopee dan Tokopedia sangat seamless. Sales naik 60% dalam 2 bulan!",
                                    rating: 5
                                },
                                {
                                    name: "Amanda Lee",
                                    role: "Marketing Agency",
                                    avatar: "👩‍🎨",
                                    quote: "White-label feature perfect untuk agency. Clients sangat puas dengan analytics yang detail.",
                                    rating: 5
                                }
                            ].map((testimonial, index) => (
                                <div
                                    key={index}
                                    className="bg-gradient-to-br from-[#FFF5F5] to-white dark:from-[#1D0002] dark:to-[#161615] rounded-2xl p-6 hover:shadow-xl transition-all duration-500 hover:transform hover:scale-105 border border-[#19140015] dark:border-[#3E3E3A]"
                                >
                                    <div className="flex items-center mb-4">
                                        <div className="w-12 h-12 bg-gradient-to-br from-[#F53003] to-[#FF750F] rounded-full flex items-center justify-center text-2xl mr-4">
                                            {testimonial.avatar}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-[#1b1b18] dark:text-[#EDEDEC]">{testimonial.name}</h4>
                                            <p className="text-sm text-[#706f6c] dark:text-[#A1A09A]">{testimonial.role}</p>
                                        </div>
                                    </div>
                                    <div className="flex mb-3">
                                        {[...Array(testimonial.rating)].map((_, i) => (
                                            <svg key={i} className="w-5 h-5 text-[#FF750F]" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                        ))}
                                    </div>
                                    <p className="text-[#706f6c] dark:text-[#A1A09A] italic leading-relaxed">
                                        "{testimonial.quote}"
                                    </p>
                                </div>
                            ))}
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
