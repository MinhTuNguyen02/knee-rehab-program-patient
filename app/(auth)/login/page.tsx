'use client';

import { useEffect, useState, useTransition, Suspense } from 'react';
import { login } from '@/app/actions/auth';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';

function LoginForm() {
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        if (searchParams.get('reason') === 'expired') {
            setError('Your session has expired. Please sign in again.');
        }
    }, [searchParams]);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);

        const formData = new FormData(e.currentTarget);

        startTransition(async () => {
            const result = await login(formData);
            if (result?.error) {
                setError(result.error);
            }
        });
    }

    return (
        <div className="flex min-h-[100dvh] items-center justify-center p-4 bg-background">
            <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
                <div className="text-center">
                    <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
                        KRPS Patient Portal
                    </h1>
                    <p className="mt-2 text-sm text-slate-655 dark:text-slate-400">
                        Sign in to view your knee assessment results
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="p-3 text-sm text-red-655 bg-red-50 dark:bg-red-950/30 dark:text-red-400 rounded-xl border border-red-200 dark:border-red-900/50">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="email">
                                Email Address
                            </label>
                            <div className="relative">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                                    <Mail className="w-4.5 h-4.5" />
                                </div>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    className="block w-full rounded-lg border-0 py-2.5 pl-10 pr-3 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary dark:bg-slate-800 dark:text-white dark:ring-slate-700 sm:text-sm sm:leading-6"
                                    placeholder="you@example.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="password">
                                    Password
                                </label>
                            </div>
                            <div className="relative">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                                    <Lock className="w-4.5 h-4.5" />
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    className="block w-full rounded-lg border-0 py-2.5 pl-10 pr-10 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary dark:bg-slate-800 dark:text-white dark:ring-slate-700 sm:text-sm sm:leading-6"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-655 dark:hover:text-slate-300"
                                    tabIndex={-1}
                                >
                                    {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                                </button>
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <Link href="/forgot-password" className="text-sm font-medium text-primary hover:text-primary-hover dark:text-primary dark:hover:text-primary-hover">
                                Forgot password?
                            </Link>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isPending}
                        className="flex w-full justify-center rounded-lg bg-primary px-3 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-70 disabled:cursor-not-allowed transition-colors active:scale-[0.98]"
                    >
                        {isPending ? 'Logging in...' : 'Login'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="flex min-h-[100dvh] items-center justify-center p-4 bg-background">
                <div className="text-slate-500">Loading login...</div>
            </div>
        }>
            <LoginForm />
        </Suspense>
    );
}
