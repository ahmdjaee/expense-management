import TeamPerformance from '@/components/team-performance';
import { Button } from '@/components/ui/button';
import { UpcomingDeadlines } from '@/components/upcoming-deadlines';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Plus } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

export default function Dashboard() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex-1 overflow-auto">
                    <div className="mx-auto max-w-7xl p-4 md:p-8">
                        {/* Header Section */}
                        <div className="mb-8">
                            <div className="mb-6 flex items-center justify-between">
                                <div>
                                    <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
                                    <p className="mt-1 text-muted-foreground">
                                        Overview of your task management system
                                    </p>
                                </div>
                                <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                                    <Plus className="h-4 w-4" />
                                    New Task
                                </Button>
                            </div>
                        </div>

                        {/* Main Analytics Grid */}
                        <div className="space-y-6">
                            {/* Analytics Overview */}
                            {/* <AnalyticsOverview /> */}

                            {/* Bottom Section - Team Performance & Deadlines */}
                            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                                <div className="lg:col-span-2">
                                    <TeamPerformance />
                                </div>
                                <div>
                                    <UpcomingDeadlines />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
