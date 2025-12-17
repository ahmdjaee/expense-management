import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import InputError from '@/components/input-error';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Save, Users } from 'lucide-react';
import ReactSelect from 'react-select';
import { Form } from '@inertiajs/react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Login Codes',
        href: '/login-codes',
    },
    {
        title: 'Edit',
        href: '#',
    },
];

interface UserOption {
    value: number;
    label: string;
}

interface LoginCode {
    id: number;
    code: string;
    users: Array<{
        id: number;
        name: string;
        email: string;
    }>;
}

interface Props {
    loginCode: LoginCode;
    users: UserOption[];
    assignedUsers: UserOption[];
}

export default function EditLoginCodePage({ loginCode, users, assignedUsers }: Props) {
    const [selectedUsers, setSelectedUsers] = useState<UserOption[]>(assignedUsers);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Login Code" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
                            Edit Login Code
                        </h1>
                        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                            Update login code information and manage user assignments
                        </p>
                    </div>
                    <Link href={'/crm/login-codes'}>
                        <Button variant="outline">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to List
                        </Button>
                    </Link>
                </div>

                {/* Form with Inertia Form Component */}
                <Form action={`/crm/login-codes/${loginCode.id}`} method="put">
                    {({ processing, errors }) => (
                        <>
                            <Card className="max-w-2xl">
                                <CardHeader>
                                    <CardTitle>Login Code Details</CardTitle>
                                    <CardDescription>Update the login code information</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {/* Login Code Input */}
                                    <div className="space-y-2">
                                        <Label htmlFor="code">
                                            Login Code <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="code"
                                            name="code"
                                            type="text"
                                            defaultValue={loginCode.code}
                                            placeholder="Enter login code"
                                            className={errors.code ? 'border-red-500' : ''}
                                        />
                                        <InputError message={errors.code} />
                                        <p className="text-xs text-muted-foreground">
                                            The unique login code for MT5 account
                                        </p>
                                    </div>

                                    {/* User Selection */}
                                    <div className="space-y-2">
                                        <Label htmlFor="user_ids">
                                            <Users className="mr-2 inline h-4 w-4" />
                                            Assigned Users
                                        </Label>
                                        <ReactSelect
                                            id="user_ids"
                                            name="user_ids"
                                            value={selectedUsers}
                                            onChange={(options) => setSelectedUsers(options as UserOption[])}
                                            options={users}
                                            isMulti
                                            isClearable
                                            placeholder="Select users to assign..."
                                            className="react-select-container"
                                            classNamePrefix="react-select"
                                            styles={{
                                                control: (base) => ({
                                                    ...base,
                                                    minHeight: '38px',
                                                    borderColor: errors.user_ids ? '#ef4444' : base.borderColor,
                                                }),
                                                menu: (base) => ({
                                                    ...base,
                                                    zIndex: 9999,
                                                }),
                                            }}
                                        />
                                        {/* Hidden inputs for user IDs */}
                                        {selectedUsers.map((user, index) => (
                                            <input
                                                key={user.value}
                                                type="hidden"
                                                name={`user_ids[${index}]`}
                                                value={user.value}
                                            />
                                        ))}
                                        <InputError message={errors.user_ids} />
                                        <p className="text-xs text-muted-foreground">
                                            This code can be assigned to multiple users. Clear all to unassign.
                                        </p>
                                    </div>

                                    {/* Current Info */}
                                    <div className="rounded-lg bg-blue-50 p-4">
                                        <h4 className="text-sm font-semibold text-blue-900 mb-3">
                                            Current Information
                                        </h4>
                                        <div className="space-y-2 text-sm text-blue-700">
                                            <div>
                                                <span className="font-medium">Original Code:</span>{' '}
                                                <span className="font-mono">{loginCode.code}</span>
                                            </div>
                                            <div>
                                                <span className="font-medium">Currently Assigned Users:</span>
                                                {loginCode.users.length === 0 ? (
                                                    <Badge variant="secondary" className="ml-2 text-xs">
                                                        No users assigned
                                                    </Badge>
                                                ) : (
                                                    <div className="mt-2 flex flex-wrap gap-1">
                                                        {loginCode.users.map((user) => (
                                                            <Badge key={user.id} variant="default" className="text-xs">
                                                                {user.name}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Submit Button */}
                                    <div className="flex justify-end gap-2 pt-4">
                                        <Link href={'/crm/login-codes'}>
                                            <Button type="button" variant="outline">
                                                Cancel
                                            </Button>
                                        </Link>
                                        <Button type="submit" disabled={processing}>
                                            <Save className="mr-2 h-4 w-4" />
                                            {processing ? 'Updating...' : 'Update Login Code'}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </>
                    )}
                </Form>
            </div>
        </AppLayout>
    );
}