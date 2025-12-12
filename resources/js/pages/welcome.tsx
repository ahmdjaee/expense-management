import AppLogo from '@/components/app-logo';
import { Button } from '@/components/ui/button';
import { Head, Link } from '@inertiajs/react';
import { CheckCircle, DollarSign, MoreHorizontal, Wallet } from 'lucide-react';

export default function Welcome({ canRegister = true, auth }) {
    return (
        <>
            <Head title="GIB Super App">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
            </Head>

            <div className="relative flex min-h-screen flex-col bg-zinc-900 text-zinc-100">
                {/* Subtle Background Pattern */}
                <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-zinc-800 via-zinc-900 to-zinc-900"></div>
                <div className="absolute inset-0 -z-10 bg-[url('/path/to/your/pattern.svg')] opacity-5"></div>{' '}
                {/* Ganti dengan URL pola Anda jika ada */}
                {/* Navigation */}
                <nav className="border-b border-zinc-800/50 bg-zinc-900/80 backdrop-blur-xl">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex h-16 items-center justify-between">
                            <div className="flex items-center gap-2">
                                <AppLogo />
                            </div>

                            <div className="flex items-center gap-3">
                                {auth.user ? (
                                    <span className="text-sm text-zinc-400">Halo, {auth.user.name}!</span>
                                ) : (
                                    <>
                                        <Button variant="ghost" asChild className="text-zinc-400 hover:text-white">
                                            <Link href="/login">Log in</Link>
                                        </Button>
                                        {canRegister && (
                                            <Button asChild>
                                                <Link href="/register">Register</Link>
                                            </Button>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </nav>
                {/* Main Content */}
                <main className="flex-1 p-4 sm:p-6 lg:p-8">
                    <div className="mx-auto w-full max-w-4xl">
                        <div>
                            {/* Welcome Card */}
                            <div className="mb-8 rounded-2xl bg-zinc-800/50 p-6 text-center shadow-xl backdrop-blur-sm">
                                <h1 className="text-2xl font-semibold text-zinc-100">
                                    Selamat Datang di GIB Super App!
                                </h1>
                                <p className="mt-2 text-zinc-400">
                                    Semua yang Anda butuhkan untuk produktivitas ada di sini.
                                </p>
                            </div>

                            {/* App Grid */}
                            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                                {/* Menu Task Management */}
                                <Link href="/tasks">
                                    <div className="group flex flex-col items-center gap-3 rounded-2xl bg-zinc-800/30 p-6 transition-all hover:scale-105 hover:bg-zinc-800/50 hover:shadow-xl">
                                        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-pink-500 shadow-lg group-hover:shadow-pink-500/50">
                                            <CheckCircle className="h-8 w-8 text-white" />
                                        </div>
                                        <span className="text-sm font-medium text-zinc-300">Task Management</span>
                                    </div>
                                </Link>

                                {/* Menu Expense Tracker */}
                                <Link href="/expenses/dashboard">
                                    <div className="group flex flex-col items-center gap-3 rounded-2xl bg-zinc-800/30 p-6 transition-all hover:scale-105 hover:bg-zinc-800/50 hover:shadow-xl">
                                        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-500 shadow-lg group-hover:shadow-blue-500/50">
                                            <Wallet className="h-8 w-8 text-white" />
                                        </div>
                                        <span className="text-sm font-medium text-zinc-300">Expense Tracker</span>
                                    </div>
                                </Link>

                                {/* Menu Commision */}
                                <Link href="/commissions/deals">
                                    <div className="group flex flex-col items-center gap-3 rounded-2xl bg-zinc-800/30 p-6 transition-all hover:scale-105 hover:bg-zinc-800/50 hover:shadow-xl">
                                        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-green-500 shadow-lg group-hover:shadow-green-500/50">
                                            <DollarSign className="h-8 w-8 text-white" />
                                        </div>
                                        <span className="text-sm font-medium text-zinc-300">Commission</span>
                                    </div>
                                </Link>

                                {/* Placeholder for future apps */}
                                <div className="flex flex-col items-center gap-3 rounded-2xl p-6 opacity-50">
                                    <div className="flex h-14 w-14 items-center justify-center rounded-xl border-2 border-dashed border-zinc-600">
                                        <MoreHorizontal className="h-8 w-8 text-zinc-600" />
                                    </div>
                                    <span className="text-sm font-medium text-zinc-600">Coming Soon</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
                {/* Footer */}
                <footer className="border-t border-zinc-800/50 bg-zinc-900/80 backdrop-blur-xl">
                    <div className="mx-auto max-w-7xl px-4 py-4 text-center text-sm text-zinc-500">
                        &copy; {new Date().getFullYear()} PT Glori Investama Berjangka. All rights reserved.
                    </div>
                </footer>
            </div>
        </>
    );
}
