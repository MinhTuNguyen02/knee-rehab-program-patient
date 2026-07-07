import { getPatientProfile } from '@/app/actions/patient';
import Link from 'next/link';
import { logout } from '@/app/actions/auth';
import { Bell, UserCircle } from 'lucide-react';

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
    const response = await getPatientProfile();
    const patient = response.data;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-400 ease-in-out var-zone-bg">
            <header className="sticky top-0 z-40 w-full border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Link href="/dashboard" className="flex items-center gap-2">
                            {/* Placeholder Logo */}
                            <div className="w-8 h-8 rounded bg-primary text-primary-foreground flex items-center justify-center font-bold">
                                K
                            </div>
                            <span className="font-bold text-lg tracking-tight hidden sm:inline-block">KRPS</span>
                        </Link>
                    </div>

                    <div className="flex items-center gap-4">
                        <Link href="/chat" className="relative p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
                            <span className="sr-only">Notifications</span>
                            <Bell className="w-6 h-6" />
                            {/* Unread badge placeholder */}
                            <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                            </span>
                        </Link>

                        <div className="flex items-center gap-3 pl-4 border-l border-gray-200 dark:border-gray-800">
                            <div className="hidden sm:flex flex-col items-end">
                                <span className="text-sm font-medium leading-none">
                                    {patient ? `${patient.firstName} ${patient.lastName}` : 'Loading...'}
                                </span>
                            </div>

                            {/* Simple Profile Link for now */}
                            <Link href="/profile" className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                                <UserCircle className="w-8 h-8" />
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8">
                {children}
            </main>

            {/* Simple Mobile Bottom Nav */}
            <div className="sm:hidden fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 flex justify-around items-center z-40 pb-safe">
                <Link href="/dashboard" className="p-2 text-sm font-medium flex flex-col items-center gap-1 text-gray-600 hover:text-primary">
                    Dashboard
                </Link>
                <Link href="/history" className="p-2 text-sm font-medium flex flex-col items-center gap-1 text-gray-600 hover:text-primary">
                    History
                </Link>
                <Link href="/chat" className="p-2 text-sm font-medium flex flex-col items-center gap-1 text-gray-600 hover:text-primary">
                    Chat
                </Link>
                <Link href="/profile" className="p-2 text-sm font-medium flex flex-col items-center gap-1 text-gray-600 hover:text-primary">
                    Profile
                </Link>
            </div>
        </div>
    );
}
