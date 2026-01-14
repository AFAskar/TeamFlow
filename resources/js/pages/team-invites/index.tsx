import { Head, Link, router } from '@inertiajs/react';
import { CheckIcon, MailIcon, XIcon } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, TeamInvite, PaginatedData } from '@/types';

interface Props {
    invites: PaginatedData<TeamInvite>;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Invitations', href: '/invites' },
];

const statusColors: Record<string, string> = {
    Pending: 'bg-yellow-100 text-yellow-800',
    Accepted: 'bg-green-100 text-green-800',
    Rejected: 'bg-red-100 text-red-800',
    Cancelled: 'bg-gray-100 text-gray-800',
};

export default function TeamInvitesIndex({ invites }: Props) {
    const handleAccept = (inviteId: string) => {
        router.post(`/invites/${inviteId}/accept`);
    };

    const handleReject = (inviteId: string) => {
        router.post(`/invites/${inviteId}/reject`);
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const pendingInvites = invites.data.filter((i) => i.status === 'Pending');
    const otherInvites = invites.data.filter((i) => i.status !== 'Pending');

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Team Invitations" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <div>
                    <h1 className="text-2xl font-bold">Team Invitations</h1>
                    <p className="text-muted-foreground">Manage your team invitations</p>
                </div>

                {invites.data.length === 0 ? (
                    <Card className="flex flex-col items-center justify-center p-12">
                        <MailIcon className="h-12 w-12 text-muted-foreground" />
                        <h3 className="mt-4 text-lg font-semibold">No invitations</h3>
                        <p className="mt-2 text-center text-muted-foreground">
                            You don't have any team invitations at the moment.
                        </p>
                    </Card>
                ) : (
                    <div className="space-y-6">
                        {/* Pending Invites */}
                        {pendingInvites.length > 0 && (
                            <div className="space-y-4">
                                <h2 className="text-lg font-semibold">Pending Invitations</h2>
                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                    {pendingInvites.map((invite) => (
                                        <Card key={invite.id}>
                                            <CardHeader>
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <CardTitle className="text-lg">{invite.team?.name}</CardTitle>
                                                        <CardDescription>
                                                            Invited by {invite.inviter?.username}
                                                        </CardDescription>
                                                    </div>
                                                    <Badge className={statusColors[invite.status]}>{invite.status}</Badge>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                <div className="text-sm text-muted-foreground">
                                                    <p>
                                                        Role:{' '}
                                                        <span className="font-medium text-foreground">{invite.role}</span>
                                                    </p>
                                                    <p>Invited on {formatDate(invite.created_at)}</p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        className="flex-1"
                                                        onClick={() => handleAccept(invite.id)}
                                                    >
                                                        <CheckIcon className="mr-2 h-4 w-4" />
                                                        Accept
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="flex-1"
                                                        onClick={() => handleReject(invite.id)}
                                                    >
                                                        <XIcon className="mr-2 h-4 w-4" />
                                                        Decline
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Other Invites */}
                        {otherInvites.length > 0 && (
                            <div className="space-y-4">
                                <h2 className="text-lg font-semibold">Past Invitations</h2>
                                <Card>
                                    <CardContent className="p-0">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b">
                                                    <th className="px-4 py-3 text-left text-sm font-medium">Team</th>
                                                    <th className="px-4 py-3 text-left text-sm font-medium">Invited By</th>
                                                    <th className="px-4 py-3 text-left text-sm font-medium">Role</th>
                                                    <th className="px-4 py-3 text-left text-sm font-medium">Date</th>
                                                    <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {otherInvites.map((invite) => (
                                                    <tr key={invite.id} className="border-b last:border-0">
                                                        <td className="px-4 py-3 text-sm">{invite.team?.name}</td>
                                                        <td className="px-4 py-3 text-sm">{invite.inviter?.username}</td>
                                                        <td className="px-4 py-3 text-sm">{invite.role}</td>
                                                        <td className="px-4 py-3 text-sm">{formatDate(invite.created_at)}</td>
                                                        <td className="px-4 py-3">
                                                            <Badge className={statusColors[invite.status]}>{invite.status}</Badge>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </CardContent>
                                </Card>
                            </div>
                        )}
                    </div>
                )}

                {/* Pagination */}
                {invites.last_page > 1 && (
                    <div className="flex items-center justify-center gap-2 pt-4">
                        {invites.links.map((link, index) => (
                            <Link
                                key={index}
                                href={link.url || '#'}
                                className={`rounded px-3 py-1 text-sm ${
                                    link.active ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'
                                } ${!link.url ? 'pointer-events-none opacity-50' : ''}`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
