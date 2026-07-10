import { useState, useEffect, useCallback } from 'react';
import { getAssessments, AssessmentResponse } from '@/app/actions/patient';

export function useAssessmentHistory() {
    const [assessments, setAssessments] = useState<AssessmentResponse[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [loadingMore, setLoadingMore] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState<boolean>(false);
    const [nextCursor, setNextCursor] = useState<string | null>(null);

    const loadInitial = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await getAssessments();
            if (result.error) {
                setError(result.error.message);
            } else {
                setAssessments(result.data || []);
                setHasMore(result.meta?.hasMore || false);
                setNextCursor(result.meta?.nextCursor || null);
            }
        } catch (err: any) {
            setError(err.message || 'Failed to load assessments');
        } finally {
            setLoading(false);
        }
    }, []);

    const loadMore = useCallback(async () => {
        if (!nextCursor || loadingMore) return;
        setLoadingMore(true);
        try {
            const result = await getAssessments(nextCursor);
            if (result.error) {
                setError(result.error.message);
            } else {
                setAssessments((prev) => [...prev, ...(result.data || [])]);
                setHasMore(result.meta?.hasMore || false);
                setNextCursor(result.meta?.nextCursor || null);
            }
        } catch (err: any) {
            console.error('Failed to load more assessments:', err);
        } finally {
            setLoadingMore(false);
        }
    }, [nextCursor, loadingMore]);

    useEffect(() => {
        loadInitial();
    }, [loadInitial]);

    return {
        assessments,
        loading,
        loadingMore,
        error,
        hasMore,
        loadMore,
        refetch: loadInitial
    };
}
