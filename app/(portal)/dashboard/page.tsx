import { getPatientProfile } from '@/app/actions/patient';
import Link from 'next/link';
import { ArrowRight, MessageCircle, UserCircle, Activity } from 'lucide-react';

export default async function DashboardPage() {
    const response = await getPatientProfile();
    const patient = response.data;
    const latest = patient?.latestAssessment;

    let zoneConfig = {
        bg: 'bg-white dark:bg-gray-800',
        border: 'border-gray-200 dark:border-gray-700',
        text: 'text-gray-900 dark:text-gray-100',
        badge: 'bg-gray-100 text-gray-800',
        cssVars: {} as React.CSSProperties,
    };

    if (latest?.zone === 'Green') {
        zoneConfig = {
            ...zoneConfig,
            bg: 'bg-[#E8F5E9] dark:bg-green-950/30',
            border: 'border-green-200 dark:border-green-800',
            text: 'text-green-900 dark:text-green-100',
            badge: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
            cssVars: { '--zone-bg': '#E8F5E9' } as React.CSSProperties,
        };
    } else if (latest?.zone === 'Amber') {
        zoneConfig = {
            ...zoneConfig,
            bg: 'bg-[#FFF8E1] dark:bg-yellow-950/30',
            border: 'border-yellow-200 dark:border-yellow-800',
            text: 'text-yellow-900 dark:text-yellow-100',
            badge: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
            cssVars: { '--zone-bg': '#FFF8E1' } as React.CSSProperties,
        };
    } else if (latest?.zone === 'Red') {
        zoneConfig = {
            ...zoneConfig,
            bg: 'bg-[#FFEBEE] dark:bg-red-950/30',
            border: 'border-red-200 dark:border-red-800',
            text: 'text-red-900 dark:text-red-100',
            badge: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
            cssVars: { '--zone-bg': '#FFEBEE' } as React.CSSProperties,
        };
    }

    return (
        <div className="space-y-6 pb-20 sm:pb-0" style={zoneConfig.cssVars}>
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-bold tracking-tight">Hi, {patient?.firstName || 'there'}</h1>
                <p className="text-muted-foreground">Here is your latest knee assessment summary.</p>
            </div>

            <div className={`rounded-xl border ${zoneConfig.border} ${zoneConfig.bg} p-6 shadow-sm transition-colors duration-500`}>
                <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                    <div>
                        <h2 className="text-lg font-medium text-gray-500 dark:text-gray-400 mb-1">Your KRPS Score</h2>
                        {latest ? (
                            <div className="flex items-baseline gap-3">
                                <span className={`text-5xl font-extrabold tracking-tighter ${zoneConfig.text}`}>
                                    {latest.score.toFixed(1)}
                                </span>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${zoneConfig.badge}`}>
                                    {latest.zone} Zone
                                </span>
                            </div>
                        ) : (
                            <p className="text-xl font-medium">No assessment yet</p>
                        )}

                        {latest && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                                Last assessed: {new Date(latest.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </p>
                        )}
                    </div>

                    <div className="w-full md:w-auto">
                        <a
                            href={process.env.NEXT_PUBLIC_ASSESS_URL || 'http://localhost:3001'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex w-full md:w-auto justify-center items-center py-3 px-6 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                        >
                            {latest ? 'Retake Assessment' : 'Take First Assessment'}
                        </a>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link href="/history" className="group flex flex-col justify-between p-5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-primary hover:shadow-md transition-all">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                            <Activity className="w-6 h-6" />
                        </div>
                        <h3 className="font-semibold">Score History</h3>
                    </div>
                    <div className="flex items-center text-sm font-medium text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform">
                        View full trend <ArrowRight className="w-4 h-4 ml-1" />
                    </div>
                </Link>

                <Link href="/chat" className="group flex flex-col justify-between p-5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-primary hover:shadow-md transition-all">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-purple-50 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400">
                            <MessageCircle className="w-6 h-6" />
                        </div>
                        <h3 className="font-semibold">Chat with Clinic</h3>
                    </div>
                    <div className="flex items-center text-sm font-medium text-purple-600 dark:text-purple-400 group-hover:translate-x-1 transition-transform">
                        Send a message <ArrowRight className="w-4 h-4 ml-1" />
                    </div>
                </Link>

                <Link href="/profile" className="group flex flex-col justify-between p-5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-primary hover:shadow-md transition-all">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-400">
                            <UserCircle className="w-6 h-6" />
                        </div>
                        <h3 className="font-semibold">Edit Profile</h3>
                    </div>
                    <div className="flex items-center text-sm font-medium text-emerald-600 dark:text-emerald-400 group-hover:translate-x-1 transition-transform">
                        Manage account <ArrowRight className="w-4 h-4 ml-1" />
                    </div>
                </Link>
            </div>
        </div>
    );
}
