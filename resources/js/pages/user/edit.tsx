import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, Division, User } from '@/types';
import { Form, Head, router, usePage } from '@inertiajs/react';
import ReactSelect from 'react-select';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Users', href: '/users' },
    { title: 'Edit User', href: '#' },
];

interface EditUserProps {
    user: User & {
        divisions: Division[];
        position?: string;
        phone?: string;
        address?: string;
        rekening?: string;
        bank?: string;
        rekening_name?: string;
    };
    divisions: Division[];
}

export default function EditUserPage({ user, divisions }: EditUserProps) {
    // Ambil data auth user
    const { auth } = usePage<{ auth: { user: { role: string } } }>().props;
    const authRole = auth.user.role;

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

    // Position options
    const positionOptions = [
        { value: 'karyawan', label: 'Karyawan' },
        { value: 'head', label: 'Head' },
        { value: 'direktur', label: 'Direktur' },
        { value: 'finance', label: 'Finance' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit User" />
            <div className="p-4">
                <Card className="flex-1 p-6">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Edit User</h1>
                    </div>

                    <Form action={`/users/${user.id}`} method="put" className="space-y-6">
                        {({ processing, errors }) => (
                            <>
                                {/* Name */}
                                <div className="space-y-2">
                                    <Label htmlFor="name">Full Name</Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        defaultValue={user.name}
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
                                        defaultValue={user.email}
                                        required
                                        placeholder="user@example.com"
                                        className="border-muted bg-muted/50"
                                    />
                                    <InputError message={errors.email} />
                                </div>

                                {/* Password */}
                                <div className="space-y-2">
                                    <Label htmlFor="password">
                                        Password{' '}
                                        <span className="text-sm text-muted-foreground">
                                            (Leave blank to keep current password)
                                        </span>
                                    </Label>
                                    <Input
                                        id="password"
                                        name="password"
                                        type="password"
                                        placeholder="Enter new password"
                                        className="border-muted bg-muted/50"
                                    />
                                    <InputError message={errors.password} />
                                </div>

                                {/* Role */}
                                <div className="space-y-2">
                                    <Label htmlFor="role">Role</Label>
                                    <Select name="role" defaultValue={user.role} required>
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

                                {/* Position - Hanya untuk superadmin */}
                                {authRole === 'superadmin' && (
                                    <div className="space-y-2">
                                        <Label htmlFor="position">Position</Label>
                                        <Select name="position" defaultValue={user.position || 'karyawan'}>
                                            <SelectTrigger id="position" className="border-muted bg-muted/50">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {positionOptions.map((p) => (
                                                    <SelectItem key={p.value} value={p.value}>
                                                        {p.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <InputError message={errors.position} />
                                        <p className="text-xs text-muted-foreground">
                                            Only superadmin can change user position
                                        </p>
                                    </div>
                                )}

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
                                        defaultValue={user.divisions.map((d) => ({
                                            value: d.id,
                                            label: d.name,
                                        }))}
                                        required
                                        placeholder="Select divisions..."
                                        className="basic-multi-select"
                                        classNamePrefix="select"
                                        styles={{
                                            control: (base) => ({
                                                ...base,
                                                backgroundColor: 'hsl(var(--muted) / 0.5)',
                                                borderColor: 'hsl(var(--muted))',
                                            }),
                                        }}
                                    />
                                    <InputError message={errors.divisions} />
                                </div>

                                {/* Buttons */}
                                <div className="flex justify-end gap-3 pt-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => router.visit('/users')}
                                        disabled={processing}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="bg-primary text-primary-foreground hover:bg-primary/90"
                                        disabled={processing}
                                    >
                                        {processing ? 'Updating...' : 'Update User'}
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
