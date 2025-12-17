import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import LoginCodeInput from '@/components/login-code-input';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import { Form } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Login Codes',
        href: '/login-codes',
    },
    {
        title: 'Create',
        href: '/login-codes/create',
    },
];

export default function CreateLoginCodePage() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Login Code" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
                            Create Login Code
                        </h1>
                        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                            Add new login codes for MT5 accounts
                        </p>
                    </div>
                    <Link href={'/crm/login-codes'}>
                        <Button variant="outline">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to List
                        </Button>
                    </Link>
                </div>

                {/* Form using Inertia Form component */}
                <Form action={"/crm/login-codes"} method="post">
                    {({ processing, errors }) => (
                        <Card className="max-w-2xl">
                            <CardHeader>
                                <CardTitle>Login Code Details</CardTitle>
                                <CardDescription>Enter the login code(s) you want to add</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Login Codes Input */}
                                <div className="space-y-2">
                                    <LoginCodeInput errors={errors} />
                                </div>

                                {/* Information Box */}
                                <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
                                    <h4 className="text-sm font-semibold text-blue-900 mb-2">
                                        ℹ️ Information
                                    </h4>
                                    <ul className="space-y-1 text-sm text-blue-700 list-disc list-inside">
                                        <li>Login codes can be assigned to multiple users later</li>
                                        <li>Each code must be unique across the system</li>
                                        <li>You can add multiple codes at once</li>
                                    </ul>
                                </div>

                                {/* Submit Button */}
                                <div className="flex justify-end gap-2 pt-4">
                                    <Link href={'/crm/login-codes'}>
                                        <Button type="button" variant="outline" disabled={processing}>
                                            Cancel
                                        </Button>
                                    </Link>
                                    <Button type="submit" disabled={processing}>
                                        <Save className="mr-2 h-4 w-4" />
                                        {processing ? 'Creating...' : 'Create Login Codes'}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </Form>
            </div>
        </AppLayout>
    );
}