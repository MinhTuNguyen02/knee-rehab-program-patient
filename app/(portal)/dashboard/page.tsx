'use client';

import { useState, useEffect } from 'react';
import { usePatientProfile } from '@/hooks/usePatientProfile';
import { useAssessmentHistory } from '@/hooks/useAssessmentHistory';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import { ArrowRight, MessageCircle, UserCircle, Activity, ChevronRight, Calendar, AlertCircle } from 'lucide-react';
import MiniTrendChart from '@/components/charts/MiniTrendChart';

export default function DashboardPage() {
    const { profile: patient, loading: profileLoading, error: profileError } = usePatientProfile();
    const { assessments, loading: historyLoading, error: historyError } = useAssessmentHistory();

    const [displayScore, setDisplayScore] = useState(0);
    const [isScoreDone, setIsScoreDone] = useState(false);

    // check reduced motion
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

    const latest = patient?.latestAssessment;

    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        setPrefersReducedMotion(mediaQuery.matches);

        const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
        mediaQuery.addEventListener('change', listener);
        return () => mediaQuery.removeEventListener('change', listener);
    }, []);

    useEffect(() => {
        if (!latest) return;

        if (prefersReducedMotion) {
            setDisplayScore(latest.score);
            setIsScoreDone(true);
            return;
        }

        let startTimestamp: number | null = null;
        const duration = 800; // ~800ms
        const targetScore = latest.score;

        const step = (timestamp: number) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);

            // ease-out cubic
            const easeOutProgress = 1 - Math.pow(1 - progress, 3);
            setDisplayScore(easeOutProgress * targetScore);

            if (progress < 1) {
                window.requestAnimationFrame(step);
            } else {
                setDisplayScore(targetScore);
                setIsScoreDone(true);
            }
        };

        window.requestAnimationFrame(step);
    }, [latest?.score, prefersReducedMotion]);

    // Take the 5 most recent assessments to show the trend
    const recentAssessments = assessments.slice(0, 5);
    const trendData = [...recentAssessments].reverse();

    // Determine zone color styling
    let zoneStyles = {
        color: 'text-gray-500',
        bg: 'bg-gray-50 border-gray-200 dark:bg-gray-900/20 dark:border-gray-800',
        badgeBg: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
        badgeText: '',
        hex: '#6B7280'
    };

    const zoneLower = latest?.zone?.toLowerCase();

    if (zoneLower === 'green') {
        zoneStyles = {
            color: 'text-[#10B981]',
            bg: 'bg-emerald-50/50 border-emerald-200 dark:bg-emerald-950/10 dark:border-emerald-900/30',
            badgeBg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
            badgeText: 'Green',
            hex: '#10B981'
        };
    } else if (zoneLower === 'amber') {
        zoneStyles = {
            color: 'text-[#F59E0B]',
            bg: 'bg-amber-50/50 border-amber-200 dark:bg-amber-950/10 dark:border-amber-900/30',
            badgeBg: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
            badgeText: 'Amber',
            hex: '#F59E0B'
        };
    } else if (zoneLower === 'red') {
        zoneStyles = {
            color: 'text-[#EF4444]',
            bg: 'bg-red-50/50 border-red-200 dark:bg-red-950/10 dark:border-red-900/30',
            badgeBg: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300',
            badgeText: 'Red',
            hex: '#EF4444'
        };
    }

    if (profileLoading || (historyLoading && assessments.length === 0)) {
        return (
            <div className="pb-12 max-w-6xl mx-auto flex flex-col items-center justify-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                <p className="mt-4 text-gray-500 text-sm">Loading your rehab summary...</p>
            </div>
        );
    }

    if (profileError || historyError) {
        return (
            <div className="pb-12 max-w-6xl mx-auto space-y-4">
                <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <p>{profileError || historyError || 'Failed to load dashboard data.'}</p>
                </div>
            </div>
        );
    }



    return (
        <div className="pb-12 max-w-6xl mx-auto">
            {/* Header Greeting */}
            <div className="flex flex-col gap-1.5 mb-8">
                <p className="text-gray-500 dark:text-gray-400 text-sm md:text-base">
                    Welcome back! Here is a summary of your knee rehabilitation progress.
                </p>
            </div>

            {/* Main Content Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

                {/* Left Column (Summary Card & Mini Chart) */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Summary Card */}
                    <div className={`rounded-3xl border ${zoneStyles.bg} p-6 md:p-8 shadow-sm transition-all duration-300 relative overflow-hidden bg-white dark:bg-gray-900`}>
                        <div className="relative z-10 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                            <div className="space-y-4">
                                <div>
                                    <span className="text-xs font-semibold tracking-wider text-gray-400 dark:text-gray-500 uppercase">
                                        Latest Assessment Result
                                    </span>
                                    {latest ? (
                                        <div className="flex items-baseline gap-4 mt-2">
                                            <span className={`text-6xl font-black tracking-tighter ${zoneStyles.color}`}>
                                                {displayScore.toFixed(1)}
                                            </span>
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${zoneStyles.badgeBg} ${prefersReducedMotion
                                                ? 'opacity-100 scale-100 translate-y-0'
                                                : `transition-all duration-500 ease-out transform ${isScoreDone ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-90 translate-y-2'
                                                }`
                                                }`}>
                                                <span className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: zoneStyles.hex }} />
                                                {zoneStyles.badgeText} Zone
                                            </span>
                                        </div>
                                    ) : (
                                        <div className="mt-2 text-xl font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                            <AlertCircle className="w-5 h-5 text-gray-400" />
                                            No assessment recorded yet
                                        </div>
                                    )}
                                </div>

                                {latest && (
                                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                        <Calendar className="w-4 h-4 text-gray-400" />
                                        <span>Last assessed: {formatDate(latest.createdAt)}</span>
                                    </div>
                                )}
                            </div>

                            <div className="w-full md:w-auto pt-2 md:pt-0">
                                <a
                                    href={process.env.NEXT_PUBLIC_ASSESS_URL}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex w-full md:w-auto justify-center items-center py-3.5 px-6 border border-transparent rounded-2xl shadow-sm text-sm font-bold text-white bg-primary hover:bg-primary-hover active:bg-primary-active transition-all transform active:scale-[0.98] duration-150"
                                >
                                    {latest ? 'Retake Assessment' : 'Take First Assessment'}
                                </a>
                            </div>
                        </div>

                        {/* Subtle decorative background accent based on zone */}
                        {latest && (
                            <div className="absolute right-0 top-0 bottom-0 w-24 opacity-[0.03] pointer-events-none" style={{ background: `linear-gradient(90deg, transparent, ${zoneStyles.hex})` }} />
                        )}
                    </div>

                    {/* Score Trend Mini-chart Card */}
                    <div className="rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-base font-bold text-gray-800 dark:text-gray-100">Score Trend</h3>
                                <p className="text-xs text-gray-400 dark:text-gray-500">Track your last 5 assessment scores</p>
                            </div>
                            {trendData.length > 1 && (
                                <Link href="/history" className="text-sm md:text-base font-semibold text-primary hover:text-primary-hover flex items-center gap-1">
                                    Full history <ChevronRight className="w-4.5 h-4.5" />
                                </Link>
                            )}
                        </div>

                        {trendData.length > 1 ? (
                            <Link href="/history" className="block group">
                                <MiniTrendChart assessments={recentAssessments} />
                            </Link>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-8 text-center bg-gray-50/50 dark:bg-gray-900/50 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800">
                                <Activity className="w-8 h-8 text-gray-300 mb-2" />
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                    {trendData.length === 1
                                        ? "Take another assessment to see your trend"
                                        : "Complete your first assessment to start tracking your progress."}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column (Quick Links & Actions) */}
                <div className="space-y-4">
                    <h3 className="text-xs font-bold tracking-wider text-gray-400 dark:text-gray-500 uppercase px-1">
                        Quick Links & Support
                    </h3>

                    <div className="grid grid-cols-1 gap-3">
                        <Link
                            href="/history"
                            className="group flex items-center justify-between p-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-primary/20 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 hover:shadow-sm transition-all duration-200"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                                    <Activity className="w-5 h-5" />
                                </div>
                                <div>
                                    <span className="font-semibold text-sm text-gray-800 dark:text-gray-100 block">
                                        View Full History
                                    </span>
                                    <span className="text-xs text-gray-400 dark:text-gray-500">
                                        Check all past KRPS reports
                                    </span>
                                </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
                        </Link>

                        <Link
                            href="/chat"
                            className="group flex items-center justify-between p-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-primary/20 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 hover:shadow-sm transition-all duration-200"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                                    <MessageCircle className="w-5 h-5" />
                                </div>
                                <div>
                                    <span className="font-semibold text-sm text-gray-800 dark:text-gray-100 block">
                                        Chat with Clinic
                                    </span>
                                    <span className="text-xs text-gray-400 dark:text-gray-500">
                                        Direct line to your physiotherapist
                                    </span>
                                </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
                        </Link>

                        <Link
                            href="/profile"
                            className="group flex items-center justify-between p-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-primary/20 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 hover:shadow-sm transition-all duration-200"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                                    <UserCircle className="w-5 h-5" />
                                </div>
                                <div>
                                    <span className="font-semibold text-sm text-gray-800 dark:text-gray-100 block">
                                        Edit Profile
                                    </span>
                                    <span className="text-xs text-gray-400 dark:text-gray-500">
                                        Update details & notification settings
                                    </span>
                                </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                    </div>
                </div>

            </div>
        </div>
    );
}
