import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { users as usersRoute } from '@/routes';
import { BreadcrumbItem } from '@/types';
import { Form, Head, router, usePage } from '@inertiajs/react';
import ReactSelect from 'react-select';
import { useState } from 'react';

interface LoginCodeOption {
    value: number;
    label: string;
}

interface CreateUserProps {
    divisions: Array<{ id: number; name: string }>;
    loginCodes: LoginCodeOption[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Users', href: usersRoute().url },
    { title: 'Create User', href: '' },
];

export default function CreateUser({ divisions, loginCodes }: CreateUserProps) {
    // Ambil data auth user
    const { auth } = usePage<{ auth: { user: { role: string; location?: string } } }>().props;
    const authRole = auth.user.role;
    const authLocation = auth.user.location;

    // State for selected login codes
    const [selectedLoginCodes, setSelectedLoginCodes] = useState<LoginCodeOption[]>([]);

    // Role options tergantung siapa yang login
    const roleOptions =
        authRole === 'superadmin'
            ? [
                  { value: 'superadmin', label: 'Superadmin' },
                  { value: 'admin', label: 'Admin' },
                  { value: 'user', label: 'User' },
                  { value: 'marketing', label: 'Marketing' },
              ]
            : [
                  { value: 'admin', label: 'Admin' },
                  { value: 'user', label: 'User' },
                  { value: 'marketing', label: 'Marketing' },
              ];

    // Position options
    const positionOptions = [
        { value: 'karyawan', label: 'Karyawan' },
        { value: 'head', label: 'Head' },
        { value: 'direktur', label: 'Direktur' },
        { value: 'finance', label: 'Finance' },
    ];

    // Location options
    const locationOptions = [
        { value: 'jkt', label: 'Jakarta' },
        { value: 'jkt1', label: 'Jakarta 1' },
        { value: 'sby', label: 'Surabaya' },
        { value: 'all', label: 'All Locations' },
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

                                {/* Role */}
                                <div className="space-y-2">
                                    <Label htmlFor="role">Role</Label>
                                    <Select required name="role" defaultValue={roleOptions[0].value}>
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
                                        <Select name="position" defaultValue="karyawan">
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
                                    </div>
                                )}

                                {/* Location - Hanya untuk superadmin */}
                                {authLocation === 'all' && (
                                    <div className="space-y-2">
                                        <Label htmlFor="location">Location</Label>
                                        <Select name="location" defaultValue={locationOptions[0].value}>
                                            <SelectTrigger id="location" className="border-muted bg-muted/50">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {locationOptions.map((p) => (
                                                    <SelectItem key={p.value} value={p.value}>
                                                        {p.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <InputError message={errors.location} />
                                    </div>
                                )}

                                {/* Phone */}
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone Number</Label>
                                    <Input
                                        id="phone"
                                        name="phone"
                                        type="tel"
                                        placeholder="Enter phone number"
                                        className="border-muted bg-muted/50"
                                    />
                                    <InputError message={errors.phone} />
                                </div>

                                {/* Address */}
                                <div className="space-y-2">
                                    <Label htmlFor="address">Address</Label>
                                    <Input
                                        id="address"
                                        name="address"
                                        placeholder="Enter address"
                                        className="border-muted bg-muted/50"
                                    />
                                    <InputError message={errors.address} />
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
                                        required
                                        placeholder="Select divisions..."
                                        className="basic-multi-select"
                                        classNamePrefix="select"
                                    />
                                    <InputError message={errors.divisions} />
                                </div>

                                {/* Login Codes - Using React Select */}
                                <div className="space-y-2">
                                    <Label htmlFor="login_codes">Login Codes MT5</Label>
                                    <ReactSelect
                                        isMulti
                                        id="login_codes"
                                        value={selectedLoginCodes}
                                        onChange={(options) => setSelectedLoginCodes(options as LoginCodeOption[])}
                                        options={loginCodes}
                                        placeholder="Select login codes..."
                                        className="react-select-container"
                                        classNamePrefix="react-select"
                                        isClearable
                                        styles={{
                                            control: (base) => ({
                                                ...base,
                                                minHeight: '38px',
                                                backgroundColor: 'hsl(var(--muted) / 0.5)',
                                                borderColor: errors.login_code_ids
                                                    ? '#ef4444'
                                                    : 'hsl(var(--muted))',
                                            }),
                                            menu: (base) => ({
                                                ...base,
                                                color: 'black',
                                                zIndex: 9999,
                                            }),
                                        }}
                                    />
                                    {/* Hidden inputs for selected login code IDs */}
                                    {selectedLoginCodes.map((loginCode, index) => (
                                        <input
                                            key={loginCode.value}
                                            type="hidden"
                                            name={`login_code_ids[${index}]`}
                                            value={loginCode.value}
                                        />
                                    ))}
                                    <InputError message={errors.login_code_ids} />
                                    <p className="text-xs text-muted-foreground">
                                        Select login codes from existing codes in the system. Multiple codes can be
                                        assigned to this user.
                                    </p>
                                </div>

                                {/* Bank Information Section */}
                                <div className="space-y-4 rounded-lg border border-muted bg-muted/20 p-4">
                                    <h3 className="text-sm font-semibold text-foreground">Bank Information</h3>

                                    {/* Bank Name */}
                                    <div className="space-y-2">
                                        <Label htmlFor="bank">Bank Name</Label>
                                        <Input
                                            id="bank"
                                            name="bank"
                                            placeholder="e.g., BCA, Mandiri, BNI"
                                            className="border-muted bg-muted/50"
                                        />
                                        <InputError message={errors.bank} />
                                    </div>

                                    {/* Account Number */}
                                    <div className="space-y-2">
                                        <Label htmlFor="rekening">Account Number</Label>
                                        <Input
                                            id="rekening"
                                            name="rekening"
                                            placeholder="Enter account number"
                                            className="border-muted bg-muted/50"
                                        />
                                        <InputError message={errors.rekening} />
                                    </div>

                                    {/* Account Holder Name */}
                                    <div className="space-y-2">
                                        <Label htmlFor="rekening_name">Account Holder Name</Label>
                                        <Input
                                            id="rekening_name"
                                            name="rekening_name"
                                            placeholder="Name as per bank account"
                                            className="border-muted bg-muted/50"
                                        />
                                        <InputError message={errors.rekening_name} />
                                    </div>
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