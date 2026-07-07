'use client';

import { useState, useTransition, use } from 'react';
import { resetPassword } from '@/app/actions/auth';
import Link from 'next/link';

export default function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
    const params = use(searchParams);
    const token = params.token;
    
    const [status, setStatus] = useState<{ type: 'error' | 'success'; message: string } | null>(null);
    const [isPending, startTransition] = useTransition();

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setStatus(null);

        if (!token) {
            setStatus({ type: 'error', message: 'Missing reset token' });
            return;
        }

        const formData = new FormData(e.currentTarget);
        formData.append('token', token);
        
        startTransition(async () => {
            const result = await resetPassword(formData);
            if (result?.error) {
                setStatus({ type: 'error', message: result.error });
            } else if (result?.success) {
                setStatus({ type: 'success', message: result.success });
            }
        });
    }

    if (!token) {
        return (
            <div className="flex min-h-screen items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
                <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-8 text-center">
                    <h1 className="text-xl font-bold text-red-600 mb-2">Invalid Link</h1>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">Your password reset link is missing or invalid.</p>
                    <Link href="/forgot-password" className="text-blue-600 hover:underline">
                        Request a new link
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
            <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="p-8">
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Create New Password</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Please enter your new password below.
                        </p>
                    </div>

                    {status?.type === 'success' ? (
                        <div className="text-center space-y-6">
                            <div className="p-4 text-sm text-green-700 bg-green-50 dark:bg-green-900/30 dark:text-green-400 rounded-md border border-green-200 dark:border-green-800">
                                {status.message}
                            </div>
                            <Link 
                                href="/login" 
                                className="inline-block w-full h-11 flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Sign In Now
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {status?.type === 'error' && (
                                <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/30 dark:text-red-400 rounded-md border border-red-200 dark:border-red-800">
                                    {status.message}
                                </div>
                            )}

                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">New Password</label>
                                <input 
                                    name="newPassword" 
                                    type="password" 
                                    required 
                                    minLength={8}
                                    className="w-full h-11 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                                    placeholder="••••••••"
                                />
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    Minimum 8 characters, at least 1 uppercase letter and 1 number.
                                </p>
                            </div>

                            <button 
                                type="submit" 
                                disabled={isPending}
                                className="w-full h-11 flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {isPending ? 'Resetting...' : 'Reset Password'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
