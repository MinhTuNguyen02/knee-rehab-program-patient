'use client';

import { useState, useEffect, useTransition } from 'react';
import { getPatientProfile, updatePatientProfile, updateNotificationPreferences, PatientProfile } from '@/app/actions/patient';
import { logout } from '@/app/actions/auth';
import Link from 'next/link';

export default function ProfilePage() {
    const [profile, setProfile] = useState<PatientProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [isPending, startTransition] = useTransition();
    const [status, setStatus] = useState<{ type: 'error' | 'success'; message: string } | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        try {
            const result = await getPatientProfile();
            if (result.error) throw new Error(result.error.message);
            if (result.data) setProfile(result.data);
        } catch (err: any) {
            setStatus({ type: 'error', message: err.message || 'Failed to load profile' });
        } finally {
            setLoading(false);
        }
    }

    async function handleProfileSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setStatus(null);

        const formData = new FormData(e.currentTarget);
        const data = {
            firstName: formData.get('firstName') as string,
            lastName: formData.get('lastName') as string,
            mobile: formData.get('mobile') as string,
        };
        
        startTransition(async () => {
            const result = await updatePatientProfile(data);
            if (result?.error) {
                setStatus({ type: 'error', message: result.error.message });
            } else {
                setStatus({ type: 'success', message: 'Profile updated successfully' });
                // Re-fetch to update UI fully
                loadData();
            }
        });
    }

    async function handleNotificationToggle(key: string, checked: boolean) {
        startTransition(async () => {
            const result = await updateNotificationPreferences({ [key]: checked });
            if (result?.error) {
                setStatus({ type: 'error', message: result.error.message });
            } else {
                // Update local state to reflect change immediately instead of full reload for speed
                setProfile(prev => prev ? {
                    ...prev,
                    notificationPrefs: {
                        ...(prev.notificationPrefs || {}),
                        [key]: checked
                    }
                } : null);
            }
        });
    }

    if (loading) {
        return <div className="p-8 text-center text-gray-500">Loading profile...</div>;
    }

    if (!profile) {
        return <div className="p-8 text-center text-red-500">Failed to load profile data.</div>;
    }

    return (
        <div className="space-y-6 max-w-2xl mx-auto pb-20 sm:pb-0">
            <div>
                <h1 className="text-2xl font-bold tracking-tight mb-2">Your Profile</h1>
                <p className="text-muted-foreground">Manage your personal information and preferences.</p>
            </div>

            {status && (
                <div className={`p-4 rounded-md text-sm border ${
                    status.type === 'success' 
                    ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800' 
                    : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800'
                }`}>
                    {status.message}
                </div>
            )}

            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Personal Information</h2>
                </div>
                
                <form onSubmit={handleProfileSubmit} className="p-6 space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">First Name</label>
                            <input 
                                name="firstName" 
                                type="text" 
                                defaultValue={profile.firstName}
                                required
                                className="w-full h-11 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                            />
                        </div>
                        
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Last Name</label>
                            <input 
                                name="lastName" 
                                type="text" 
                                defaultValue={profile.lastName}
                                required
                                className="w-full h-11 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email Address (Cannot be changed)</label>
                        <input 
                            type="email" 
                            defaultValue={profile.email}
                            disabled
                            className="w-full h-11 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-500 cursor-not-allowed"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Mobile Number</label>
                        <input 
                            name="mobile" 
                            type="tel" 
                            defaultValue={profile.mobile || ''}
                            className="w-full h-11 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                        />
                    </div>

                    <div className="pt-4">
                        <button 
                            type="submit" 
                            disabled={isPending}
                            className="w-full sm:w-auto h-11 inline-flex justify-center items-center py-2 px-6 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
                        >
                            {isPending ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>

            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Notification Preferences</h2>
                </div>
                
                <div className="p-6 space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium text-gray-900 dark:text-white">Assessment Reminders</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Receive an email when it's time to check your knee.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                                type="checkbox" 
                                className="sr-only peer"
                                checked={profile.notificationPrefs?.assessmentReminders !== false}
                                onChange={(e) => handleNotificationToggle('assessmentReminders', e.target.checked)}
                                disabled={isPending}
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </label>
                    </div>
                    
                    <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-700 pt-6">
                        <div>
                            <p className="font-medium text-gray-900 dark:text-white">Email Notifications</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Receive general updates and clinic messages via email.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                                type="checkbox" 
                                className="sr-only peer"
                                checked={profile.notificationPrefs?.emailNotifications !== false}
                                onChange={(e) => handleNotificationToggle('emailNotifications', e.target.checked)}
                                disabled={isPending}
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </label>
                    </div>
                    
                    <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-700 pt-6">
                        <div>
                            <p className="font-medium text-gray-900 dark:text-white">SMS Notifications</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Receive text messages for urgent updates.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                                type="checkbox" 
                                className="sr-only peer"
                                checked={profile.notificationPrefs?.smsNotifications !== false}
                                onChange={(e) => handleNotificationToggle('smsNotifications', e.target.checked)}
                                disabled={isPending}
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </label>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Account Management</h2>
                </div>
                <div className="p-6 flex flex-col sm:flex-row gap-4">
                    <Link 
                        href="/change-password"
                        className="inline-flex w-full sm:w-auto justify-center items-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                        Change Password
                    </Link>
                    
                    <form action={logout} className="w-full sm:w-auto">
                        <button 
                            type="submit"
                            className="inline-flex w-full sm:w-auto justify-center items-center py-2 px-4 border border-red-300 dark:border-red-800/50 rounded-md shadow-sm text-sm font-medium text-red-700 dark:text-red-400 bg-white dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                        >
                            Sign Out
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
