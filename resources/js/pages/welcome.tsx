import AppLogo from '@/components/app-logo';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Head, Link } from '@inertiajs/react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

export default function Welcome({ canRegister = true, auth }) {
    return (
        <>
            <Head title="Welcome">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
            </Head>

            <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
                {/* Navigation */}
                <nav className="fixed top-0 right-0 left-0 z-50 border-b bg-background/80 backdrop-blur-lg">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex h-16 items-center justify-between">
                            <div className="flex items-center gap-2">
                                <AppLogo />
                            </div>

                            <div className="flex items-center gap-3">
                                {auth.user ? (
                                    <Button asChild>
                                        <Link href="/dashboard">Go to Dashboard</Link>
                                    </Button>
                                ) : (
                                    <>
                                        <Button variant="ghost" asChild>
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

                {/* Hero Section */}
                <section className="relative flex min-h-screen items-center justify-center px-4 sm:px-6 lg:px-8">
                    <div className="w-full max-w-4xl text-center">
                        <Card className="border-2 shadow-2xl">
                            <CardContent className="p-12 sm:p-16">
                                <div className="mb-8 inline-flex h-20 w-20 items-center justify-center rounded-2xl shadow-lg">
                                    <img src="/favicon.png" alt="" />
                                </div>

                                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                                    Task Management System
                                </h1>

                                <p className="mt-6 text-2xl font-semibold text-muted-foreground">
                                    PT Glori Investama Berjangka
                                </p>

                                <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
                                    Manage your tasks efficiently and boost team productivity
                                </p>

                                {!auth.user && (
                                    <div className="mt-10 flex items-center justify-center gap-4">
                                        <Button size="lg" asChild className="group">
                                            <Link href="/login">
                                                Register
                                                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                                            </Link>
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </section>

                {/* Footer */}
                <footer className="fixed right-0 bottom-0 left-0 border-t bg-background/80 backdrop-blur-lg">
                    <div className="mx-auto max-w-7xl px-4 py-4 text-center text-sm text-muted-foreground">
                        &copy; {new Date().getFullYear()} PT Glori Investama Berjangka. All rights reserved.
                    </div>
                </footer>
            </div>
        </>
    );
}
