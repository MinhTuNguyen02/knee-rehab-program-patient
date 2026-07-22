'use client';

import { useState, Fragment } from 'react';
import { useAssessmentHistory } from '@/hooks/useAssessmentHistory';
import { AlertCircle, ChevronDown, ChevronUp, Calendar, Info, Heart, ShieldAlert, ArrowLeft } from 'lucide-react';
import { ZoneBadge } from '@/components/ui/ZoneBadge';
import { formatDate } from '@/lib/utils';
import ScoreTrendChart from '@/components/charts/ScoreTrendChart';
import Link from 'next/link';

const ZONE_INFO: Record<string, { title: string; message: string; recommendations: string[] }> = {
    green: {
        title: 'Low Risk — Maintain Active Lifestyle',
        message: 'Great news! Your assessment indicates low risk. This means your knee joints are currently functioning well. Keep up your active lifestyle to maintain flexibility and strength.',
        recommendations: [
            'Engage in low-impact aerobic exercises like walking, cycling, or swimming to keep joints healthy.',
            'Incorporate regular quadriceps and hamstring stretches to support knee stability.',
            'Stay hydrated and maintain a healthy diet to nourish joint cartilage.',
            'Take this assessment monthly to stay proactive about your knee health.'
        ]
    },
    amber: {
        title: 'Moderate Risk — Care and Prevention Needed',
        message: 'Your assessment indicates a moderate level of concern. Your joint may be slightly inflamed or experiencing early-stage wear. Taking early precautions now is key to preventing long-term damage.',
        recommendations: [
            'Avoid deep squats, kneeling, and excessive stair climbing for the next few days.',
            'Focus on gentle knee-stabilizing exercises (e.g. straight leg raises, wall sits).',
            'Apply a warm compress for 15-20 minutes in the evening to relax surrounding muscles.'
        ]
    },
    red: {
        title: 'High Risk — Consult a Medical Professional',
        message: 'Your assessment suggests significant knee concern. We highly recommend consulting a physician, physiotherapist, or orthopedic specialist for a professional diagnosis and care plan.',
        recommendations: [
            'Schedule a consultation with your General Practitioner or a licensed Physiotherapist.',
            'Temporarily avoid high-impact activities (running, jumping, heavy lifting) to prevent further strain.',
            'Use cold therapy (ice packs wrapped in a towel) for 15 minutes to manage acute pain or swelling.',
            'Ask your doctor about structured, clinical knee rehabilitation programs.'
        ]
    }
};

export default function HistoryPage() {
    const {
        assessments,
        loading,
        loadingMore,
        error,
        hasMore,
        loadMore
    } = useAssessmentHistory();

    const [expandedId, setExpandedId] = useState<string | null>(null);

    const toggleRow = (id: string) => {
        if (expandedId === id) {
            setExpandedId(null);
        } else {
            setExpandedId(id);
        }
    };

    const getZoneColorClass = (zone: string) => {
        switch (zone?.toLowerCase()) {
            case 'green': return 'text-emerald-600 dark:text-emerald-450';
            case 'amber': return 'text-amber-500 dark:text-amber-450';
            case 'red': return 'text-red-500 dark:text-red-450';
            default: return 'text-gray-500';
        }
    };

    const getZoneBgClass = (zone: string) => {
        switch (zone?.toLowerCase()) {
            case 'green': return 'bg-emerald-50/50 border-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-900/30';
            case 'amber': return 'bg-amber-50/50 border-amber-100 dark:bg-amber-950/20 dark:border-amber-900/30';
            case 'red': return 'bg-red-50/50 border-red-100 dark:bg-red-950/20 dark:border-red-900/30';
            default: return 'bg-gray-50/50 border-gray-100 dark:bg-gray-900/20 dark:border-gray-800';
        }
    };

    return (
        <div className="space-y-8 pb-20 sm:pb-8 max-w-6xl mx-auto">
            <div className="space-y-4">
                <Link
                    href="/dashboard"
                    className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to dashboard
                </Link>
                <h1 className="text-2xl font-bold tracking-tight mb-2">Score History</h1>
                <p className="text-muted-foreground text-base">View your past knee assessments, track progress trend, and read health recommendations.</p>
            </div>

            {error && (
                <div className="p-4 bg-red-50 border border-red-200 text-red-850 rounded-xl font-bold" role="alert">
                    ⚠️ {error}
                </div>
            )}

            {/* Reusable ScoreTrendChart */}
            {!loading && assessments.length > 0 && (
                <ScoreTrendChart assessments={assessments} />
            )}

            {/* Assessment History Table */}
            <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl overflow-hidden shadow-sm">
                <div className="p-6 border-b border-gray-150 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-900/25">
                    <h3 className="text-sm font-bold text-gray-850 dark:text-gray-200 uppercase tracking-wider">Assessment Log</h3>
                    <p className="text-sm text-gray-400 dark:text-gray-500 block sm:hidden">Tap on the row to view detailed results</p>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-700 dark:text-gray-300 border-b border-gray-150 dark:border-gray-800 uppercase text-xs">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Date</th>
                                <th className="px-6 py-4 font-semibold">Score</th>
                                <th className="px-6 py-4 font-semibold">Zone</th>
                                <th className="px-6 py-4 font-semibold hidden sm:table-cell">Pain</th>
                                <th className="px-6 py-4 font-semibold hidden sm:table-cell">Function</th>
                                <th className="px-6 py-4 font-semibold hidden sm:table-cell text-right">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {loading && assessments.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">Loading history...</td>
                                </tr>
                            ) : assessments.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-16 text-center">
                                        <p className="text-gray-500 mb-4 font-medium">You have not completed any assessments yet.</p>
                                        <a
                                            href={process.env.NEXT_PUBLIC_ASSESS_URL}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex justify-center items-center py-2 px-4 rounded-xl text-xs font-bold text-white bg-primary hover:bg-primary-hover active:scale-[0.98] transition-transform shadow-sm"
                                        >
                                            Take First Assessment
                                        </a>
                                    </td>
                                </tr>
                            ) : (
                                assessments.map((assessment) => {
                                    const isExpanded = expandedId === assessment.id;
                                    const zoneKey = assessment.zone?.toLowerCase() || 'green';
                                    const details = ZONE_INFO[zoneKey] || ZONE_INFO.green;
                                    const colorScoreBar = (score: number) => {
                                        if (score <= 2) return 'bg-emerald-500';
                                        if (score <= 4) return 'bg-amber-500';
                                        return 'bg-red-500';
                                    }

                                    return (
                                        <Fragment key={assessment.id}>
                                            {/* Normal Row */}
                                            <tr
                                                onClick={() => toggleRow(assessment.id)}
                                                className="hover:bg-gray-50/50 dark:hover:bg-gray-850/50 transition-colors cursor-pointer select-none"
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900 dark:text-gray-100">
                                                    {formatDate(assessment.createdAt)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap font-bold text-gray-900 dark:text-gray-100">
                                                    {assessment.score.toFixed(1)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <ZoneBadge zone={assessment.zone} />
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400 hidden sm:table-cell">
                                                    {assessment.pain}/10
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400 hidden sm:table-cell">
                                                    {assessment.functionScore}/10
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-gray-400 dark:text-gray-500 hidden sm:table-cell">
                                                    {isExpanded ? (
                                                        <ChevronUp className="w-5 h-5 inline-block text-primary" />
                                                    ) : (
                                                        <ChevronDown className="w-5 h-5 inline-block" />
                                                    )}
                                                </td>
                                            </tr>

                                            {/* Expandable Details Row */}
                                            {isExpanded && (
                                                <tr className="bg-gray-50/20 dark:bg-gray-950/20">
                                                    <td colSpan={6} className="px-6 py-6 border-t border-gray-100 dark:border-gray-800">
                                                        <div className="space-y-6 animate-fade-in max-w-4xl">

                                                            {/* Title details block */}
                                                            <div className={`p-5 rounded-2xl border ${getZoneBgClass(assessment.zone)} flex flex-col md:flex-row gap-5 items-start md:items-center justify-between`}>
                                                                <div className="space-y-1">
                                                                    <span className="text-sm font-bold uppercase tracking-wider text-gray-400">KRPS Score</span>
                                                                    <div className="flex items-baseline gap-2">
                                                                        <h4 className={`text-4xl font-black ${getZoneColorClass(assessment.zone)}`}>
                                                                            {assessment.score.toFixed(1)}
                                                                        </h4>
                                                                        <span className="text-sm font-semibold text-gray-400">/ 10.0</span>
                                                                    </div>
                                                                </div>

                                                                <div className="space-y-1 md:max-w-md flex-1">
                                                                    <h5 className="text-base font-bold text-gray-850 dark:text-gray-100">
                                                                        {details.title}
                                                                    </h5>
                                                                    <p className="text-sm text-gray-550 dark:text-gray-400 leading-relaxed">
                                                                        {details.message}
                                                                    </p>
                                                                </div>
                                                            </div>

                                                            {/* Pain & Function Breakdown */}
                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                                <div className="bg-white dark:bg-gray-800 border border-gray-150 dark:border-gray-800 p-4 rounded-2xl shadow-sm space-y-2">
                                                                    <div className="flex justify-between items-center text-sm text-gray-450">
                                                                        <span className="font-semibold uppercase">Pain Indicator</span>
                                                                        <span className="font-bold text-gray-800 dark:text-gray-200">{assessment.pain} / 10</span>
                                                                    </div>
                                                                    <div className="w-full bg-gray-100 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                                                                        <div
                                                                            className={`${colorScoreBar(assessment.pain)} h-full transition-all duration-300`}
                                                                            style={{ width: `${(assessment.pain / 10) * 100}%` }}
                                                                        />
                                                                    </div>
                                                                </div>

                                                                <div className="bg-white dark:bg-gray-800 border border-gray-150 dark:border-gray-800 p-4 rounded-2xl shadow-sm space-y-2">
                                                                    <div className="flex justify-between items-center text-sm text-gray-450">
                                                                        <span className="font-semibold uppercase">Function Difficulty</span>
                                                                        <span className="font-bold text-gray-800 dark:text-gray-200">{assessment.functionScore} / 10</span>
                                                                    </div>
                                                                    <div className="w-full bg-gray-100 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                                                                        <div
                                                                            className={`${colorScoreBar(assessment.functionScore)} h-full transition-all duration-300`}
                                                                            style={{ width: `${(assessment.functionScore / 10) * 100}%` }}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Educational recommendations */}
                                                            <div className="space-y-3">
                                                                <h4 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                                                                    <Heart className="w-4 h-4 text-primary shrink-0" />
                                                                    Personalized Recommendations
                                                                </h4>

                                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                                    {details.recommendations.map((item, index) => (
                                                                        <div
                                                                            key={index}
                                                                            className="p-4 rounded-2xl bg-white dark:bg-gray-850 border border-gray-150 dark:border-gray-800/80 flex items-start gap-3 shadow-sm hover:shadow-md transition-shadow"
                                                                        >
                                                                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${assessment.zone?.toLowerCase() === 'green' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400' :
                                                                                assessment.zone?.toLowerCase() === 'amber' ? 'bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400' :
                                                                                    'bg-red-50 text-red-655 dark:bg-red-950 dark:text-red-400'
                                                                                }`}>
                                                                                {index + 1}
                                                                            </span>
                                                                            <p className="text-sm text-gray-655 dark:text-gray-300 leading-relaxed font-semibold pt-0.5">
                                                                                {item}
                                                                            </p>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>

                                                            {/* Medical Disclaimer */}
                                                            {/* <div className="p-4 bg-gray-50 dark:bg-gray-900/60 rounded-xl border border-gray-100 dark:border-gray-800 flex gap-2.5 items-start">
                                                                <ShieldAlert className="w-4.5 h-4.5 text-gray-400 shrink-0 mt-0.5" />
                                                                <p className="text-xs text-gray-500 dark:text-gray-450 leading-relaxed">
                                                                    <strong>Disclaimer:</strong> The KRPS Score is an educational assessment tool based on self-reported metrics and does not replace medical diagnostics or assessment by a healthcare professional. Always consult a physician for individual health decisions.
                                                                </p>
                                                            </div> */}
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </Fragment>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {hasMore && (
                    <div className="p-4 border-t border-gray-150 dark:border-gray-850 text-center bg-gray-50/20 dark:bg-gray-900/20">
                        <button
                            onClick={loadMore}
                            disabled={loadingMore}
                            className="inline-flex justify-center items-center py-2 px-5 border border-gray-300 dark:border-gray-700 rounded-xl shadow-sm text-xs font-bold text-gray-705 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 transition-colors"
                        >
                            {loadingMore ? 'Loading more...' : 'Load More'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
