'use server';

import { cookies } from 'next/headers';
import { fetchAPI } from '@/lib/api';
import { redirect } from 'next/navigation';

export async function login(formData: FormData) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!email || !password) {
        return { error: 'Email and password are required' };
    }

    const response = await fetchAPI<{ accessToken: string; forcePasswordChange: boolean }>('/patient-auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
    });

    if (response.error) {
        return { error: response.error.message };
    }

    if (response.data?.accessToken) {
        const cookieStore = await cookies();
        cookieStore.set('jwt', response.data.accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60, // 7 days
            path: '/',
        });

        if (response.data.forcePasswordChange) {
            redirect('/change-password');
        } else {
            redirect('/dashboard');
        }
    }

    return { error: 'Failed to authenticate' };
}

export async function forgotPassword(formData: FormData) {
    const email = formData.get('email') as string;

    if (!email) {
        return { error: 'Email is required' };
    }

    const response = await fetchAPI<{ message: string }>('/patient-auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
    });

    if (response.error) {
        return { error: response.error.message };
    }

    return { success: response.data?.message || 'Check your email for a reset link' };
}

export async function resetPassword(formData: FormData) {
    const token = formData.get('token') as string;
    const newPassword = formData.get('newPassword') as string;

    if (!token || !newPassword) {
        return { error: 'Token and new password are required' };
    }

    const response = await fetchAPI<{ message: string }>('/patient-auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, newPassword }),
    });

    if (response.error) {
        return { error: response.error.message };
    }

    return { success: response.data?.message || 'Password reset successfully' };
}

export async function changePassword(formData: FormData) {
    const currentPassword = formData.get('currentPassword') as string | null;
    const newPassword = formData.get('newPassword') as string;

    if (!newPassword) {
        return { error: 'New password is required' };
    }

    const body: Record<string, string> = { newPassword };
    if (currentPassword) {
        body.currentPassword = currentPassword;
    }

    const response = await fetchAPI<{ message: string }>('/patient-auth/change-password', {
        method: 'POST',
        body: JSON.stringify(body),
    });

    if (response.error) {
        return { error: response.error.message };
    }

    // Usually after change password we want to redirect to dashboard
    redirect('/dashboard');
}

export async function logout() {
    const cookieStore = await cookies();
    cookieStore.delete('jwt');
    redirect('/login');
}

