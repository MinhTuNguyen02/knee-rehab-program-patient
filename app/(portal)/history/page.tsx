'use client';

import { useState, useEffect } from 'react';
import { getAssessments, AssessmentResponse } from '@/app/actions/patient';
import { AlertCircle } from 'lucide-react';

export default function HistoryPage() {
    const [assessments, setAssessments] = useState<AssessmentResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(false);
    const [nextCursor, setNextCursor] = useState<string | null>(null);
    const [loadingMore, setLoadingMore] = useState(false);

    useEffect(() => {
        loadInitialData();
    }, []);

    async function loadInitialData() {
        setLoading(true);
        setError(null);
        try {
            const result = await getAssessments();
            if (result.error) throw new Error(result.error.message);

            setAssessments(result.data?.data || []);
            setHasMore(result.data?.hasMore || false);
            setNextCursor(result.data?.nextCursor || null);
        } catch (err: any) {
            setError(err.message || 'Failed to load history');
        } finally {
            setLoading(false);
        }
    }

    async function loadMore() {
        if (!nextCursor || loadingMore) return;

        setLoadingMore(true);
        try {
            const result = await getAssessments(nextCursor);
            if (result.error) throw new Error(result.error.message);

            setAssessments((prev) => [...prev, ...(result.data?.data || [])]);
            setHasMore(result.data?.hasMore || false);
            setNextCursor(result.data?.nextCursor || null);
        } catch (err: any) {
            console.error('Failed to load more:', err);
        } finally {
            setLoadingMore(false);
        }
    }

    const getZoneColor = (zone: string) => {
        switch (zone) {
            case 'Green': return 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 border-green-200 dark:border-green-800';
            case 'Amber': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800';
            case 'Red': return 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 border-red-200 dark:border-red-800';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
        }
    };

    return (
        <div className="space-y-6 pb-20 sm:pb-0">
            <div>
                <h1 className="text-2xl font-bold tracking-tight mb-2">Score History</h1>
                <p className="text-muted-foreground">View your past knee assessments and track your progress over time.</p>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900 rounded-lg p-4 flex gap-3 text-blue-800 dark:text-blue-300 text-sm">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p>The KRPS Score is an educational assessment tool and does not replace medical assessment by a healthcare professional.</p>
            </div>

            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 uppercase text-xs">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Date</th>
                                <th className="px-6 py-4 font-semibold">Score</th>
                                <th className="px-6 py-4 font-semibold">Zone</th>
                                <th className="px-6 py-4 font-semibold hidden sm:table-cell">Pain</th>
                                <th className="px-6 py-4 font-semibold hidden sm:table-cell">Function</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {loading && assessments.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">Loading history...</td>
                                </tr>
                            ) : assessments.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center">
                                        <p className="text-gray-500 mb-4">You have not completed any assessments yet.</p>
                                    </td>
                                </tr>
                            ) : (
                                assessments.map((assessment) => (
                                    <tr key={assessment.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100">
                                            {new Date(assessment.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap font-bold text-gray-900 dark:text-gray-100">
                                            {assessment.score.toFixed(1)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getZoneColor(assessment.zone)}`}>
                                                {assessment.zone}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400 hidden sm:table-cell">
                                            {assessment.painScore}/40
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400 hidden sm:table-cell">
                                            {assessment.functionScore}/60
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {hasMore && (
                    <div className="p-4 border-t border-gray-200 dark:border-gray-700 text-center bg-gray-50 dark:bg-gray-900/20">
                        <button
                            onClick={loadMore}
                            disabled={loadingMore}
                            className="inline-flex justify-center items-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
                        >
                            {loadingMore ? 'Loading...' : 'Load Older Assessments'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
