'use client';
import Link from 'next/link';
import { Bell } from 'lucide-react';
import UserMenu from '@/components/layout/UserMenu';
import { usePatientProfile } from '@/hooks/usePatientProfile';

export default function Header({ initialPatient }: { initialPatient: any }) {

    const { profile } = usePatientProfile();

    const activePatient = profile || initialPatient;

    return (
        <header className="sticky top-0 z-40 w-full border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Link href="/dashboard" className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold shadow-sm active:scale-95 transition-transform">
                            K
                        </div>
                        <span className="font-bold text-lg tracking-tight hidden sm:inline-block text-primary">KRPS</span>
                    </Link>
                    {activePatient && (
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 animate-fade-in">
                            Hi, {activePatient.firstName}
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-4">
                    <Link href="/chat" className="relative p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
                        <span className="sr-only">Notifications</span>
                        <Bell className="w-5.5 h-5.5" />
                        {/* Unread badge placeholder */}
                        <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm">
                            99
                        </span>
                    </Link>

                    <div className="flex items-center gap-3 pl-4 border-l border-gray-200 dark:border-gray-800">
                        {activePatient ? (
                            <UserMenu firstName={activePatient.firstName} lastName={activePatient.lastName} email={activePatient.email} />
                        ) : (
                            <div className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}