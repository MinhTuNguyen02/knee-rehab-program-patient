import { useState, useEffect } from 'react';
import { getPatientProfile, PatientProfile } from '@/app/actions/patient';

let cachedProfile: PatientProfile | null = null;
let cachedError: string | null = null;
let isFetchingProfile = false;
const listeners = new Set<() => void>();

export function usePatientProfile() {
    const [profile, setProfile] = useState<PatientProfile | null>(cachedProfile);
    const [loading, setLoading] = useState<boolean>(!cachedProfile && isFetchingProfile);
    const [error, setError] = useState<string | null>(cachedError);

    useEffect(() => {
        const handleChange = () => {
            setProfile(cachedProfile);
            setError(cachedError);
            setLoading(!cachedProfile && isFetchingProfile);
        };
        listeners.add(handleChange);

        if (!cachedProfile && !isFetchingProfile && !cachedError) {
            isFetchingProfile = true;
            setLoading(true);
            getPatientProfile().then(res => {
                isFetchingProfile = false;
                if (res.error) {
                    cachedError = res.error.message;
                } else if (res.data) {
                    cachedProfile = res.data;
                }
                listeners.forEach(l => l());
            }).catch(err => {
                isFetchingProfile = false;
                cachedError = err.message || 'Failed to fetch profile';
                listeners.forEach(l => l());
            });
        }

        return () => {
            listeners.delete(handleChange);
        };
    }, []);

    const mutate = async (newData?: Partial<PatientProfile>) => {
        if (newData) {
            cachedProfile = { ...cachedProfile, ...newData } as PatientProfile;
        } else {
            cachedProfile = null;
            cachedError = null;
        }
        listeners.forEach(l => l());
    };

    return { profile, loading, error, mutate };
}
