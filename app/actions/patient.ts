'use server';

import { fetchAPI } from '@/lib/api';

export interface PatientProfile {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    mobile?: string;
    notificationPrefs?: Record<string, boolean>;
    latestAssessment?: {
        id: string;
        score: number;
        zone: string;
        createdAt: string;
    };
}

export async function getPatientProfile() {
    const response = await fetchAPI<PatientProfile>('/patient/me');
    return response;
}

export interface AssessmentResponse {
    id: string;
    score: number;
    zone: string;
    pain: number;
    functionScore: number;
    createdAt: string;
}

export async function getAssessments(before?: string, limit: number = 10) {
    let url = `/patient/assessments?limit=${limit}`;
    if (before) {
        url += `&before=${encodeURIComponent(before)}`;
    }
    const response = await fetchAPI<AssessmentResponse[]>(url);
    return response;
}

export async function updatePatientProfile(data: { firstName?: string; lastName?: string; mobile?: string }) {
    const response = await fetchAPI('/patient/me', {
        method: 'PATCH',
        body: JSON.stringify(data),
    });
    return response;
}

export async function updateNotificationPreferences(data: {
    assessmentReminders?: boolean;
    emailNotifications?: boolean;
    smsNotifications?: boolean;
}) {
    const response = await fetchAPI('/patient/notification-preferences', {
        method: 'PATCH',
        body: JSON.stringify(data),
    });
    return response;
}

