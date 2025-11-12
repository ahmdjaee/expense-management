import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { users as usersRoute } from '@/routes';
import { BreadcrumbItem } from '@/types';
import { Form, Head, router } from '@inertiajs/react';
import ReactSelect from 'react-select';

interface CreateUserProps {
    divisions: Array<{ id: number; name: string }>;
    authRole: 'superadmin' | 'admin';
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Users', href: usersRoute().url },
    { title: 'Create User', href: '' },
];

export default function CreateUser({ divisions, authRole }: CreateUserProps) {

    // Role options tergantung siapa yang login
    const roleOptions =
        authRole === 'superadmin'
            ? [
                  { value: 'superadmin', label: 'Superadmin' },
                  { value: 'admin', label: 'Admin' },
                  { value: 'user', label: 'User' },
              ]
            : [
                  { value: 'admin', label: 'Admin' },
                  { value: 'user', label: 'User' },
              ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create User" />
            <div className="p-4">
                <Card className="flex-1 p-6">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Create User</h1>
                    </div>

                    <Form action="/users" method="post" className="space-y-6">
                        {({ processing, errors }) => (
                            <>
                                {/* Name */}
                                <div className="space-y-2">
                                    <Label htmlFor="name">Full Name</Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        required
                                        placeholder="Enter full name"
                                        className="border-muted bg-muted/50"
                                    />
                                    <InputError message={errors.name} />
                                </div>

                                {/* Email */}
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        required
                                        placeholder="user@example.com"
                                        className="border-muted bg-muted/50"
                                    />
                                    <InputError message={errors.email} />
                                </div>

                                {/* Password */}
                                <div className="space-y-2">
                                    <Label htmlFor="password">Password</Label>
                                    <Input
                                        id="password"
                                        name="password"
                                        type="password"
                                        required
                                        placeholder="Enter Password"
                                        className="border-muted bg-muted/50"
                                    />
                                    <InputError message={errors.password} />
                                </div>

                                {/* 🔹 Confirm Password */}
                                {/* <div className="space-y-2">
                                    <Label htmlFor="password_confirmation">Confirm Password</Label>
                                    <Input
                                        id="password_confirmation"
                                        name="password_confirmation"
                                        type="password"
                                        required
                                        placeholder="Re-type password"
                                        className="border-muted bg-muted/50"
                                    />
                                    <InputError message={errors.password_confirmation} />
                                </div> */}

                                {/* Role */}
                                <div className="space-y-2">
                                    <Label htmlFor="role">Role</Label>
                                    <Select name="role" defaultValue={roleOptions[0].value}>
                                        <SelectTrigger id="role" className="border-muted bg-muted/50">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {roleOptions.map((r) => (
                                                <SelectItem key={r.value} value={r.value}>
                                                    {r.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.role} />
                                </div>

                                {/* Divisions */}
                                <div className="space-y-2">
                                    <Label htmlFor="divisions">Divisions</Label>
                                    <ReactSelect
                                        isMulti
                                        name="divisions[]"
                                        options={divisions.map((d) => ({
                                            value: d.id,
                                            label: d.name,
                                        }))}
                                        // value={selectedDivisions}
                                        // onChange={setSelectedDivisions}
                                        placeholder="Select divisions..."
                                        className="basic-multi-select"
                                        classNamePrefix="select"
                                    />
                                    <InputError message={errors.divisions} />
                                </div>

                                {/* Buttons */}
                                <div className="flex justify-end gap-3 pt-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => router.visit(usersRoute().url)}
                                        disabled={processing}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="bg-primary text-primary-foreground hover:bg-primary/90"
                                        disabled={processing}
                                    >
                                        {processing ? 'Creating...' : 'Create User'}
                                    </Button>
                                </div>
                            </>
                        )}
                    </Form>
                </Card>
            </div>
        </AppLayout>
    );
}
