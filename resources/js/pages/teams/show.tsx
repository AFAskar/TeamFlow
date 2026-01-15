import { Head, Link, router, usePage } from '@inertiajs/react';
import { Edit, FolderOpen, LayoutDashboard, MoreHorizontal, Plus, Trash2, UserMinus, Users } from 'lucide-react';
import { useState } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, SharedData, Team, User } from '@/types';

interface Props {
    team: Team;
}

export default function ShowTeam({ team }: Props) {
    const { auth } = usePage<SharedData>().props;
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
    const [removeMemberDialogOpen, setRemoveMemberDialogOpen] = useState(false);
    const [selectedMember, setSelectedMember] = useState<User | null>(null);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Teams', href: '/teams' },
        { title: team.name, href: `/teams/${team.id}` },
    ];

    const currentUser = team.members?.find((m) => m.id === auth.user.id);
    const currentUserRole = currentUser?.pivot?.team_role;
    const isOwner = currentUserRole === 'Owner';
    const isAdmin = currentUserRole === 'Admin' || isOwner;

    const handleDelete = () => {
        router.delete(`/teams/${team.id}`, {
            onSuccess: () => setDeleteDialogOpen(false),
        });
    };

    const handleLeave = () => {
        router.post(`/teams/${team.id}/leave`, {}, {
            onSuccess: () => setLeaveDialogOpen(false),
        });
    };

    const handleRemoveMember = () => {
        if (!selectedMember) return;
        router.delete(`/teams/${team.id}/members`, {
            data: { user_id: selectedMember.id },
            onSuccess: () => {
                setRemoveMemberDialogOpen(false);
                setSelectedMember(null);
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={team.name} />
            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                {/* Team Header */}
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">{team.name}</h1>
                        <p className="mt-1 text-muted-foreground">{team.description || 'No description'}</p>
                        <div className="mt-2 flex gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                {team.members_count} members
                            </span>
                            <span className="flex items-center gap-1">
                                <FolderOpen className="h-4 w-4" />
                                {team.projects_count} projects
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" asChild>
                            <Link href={`/teams/${team.id}/dashboard`}>
                                <LayoutDashboard className="mr-2 h-4 w-4" />
                                Team Dashboard
                            </Link>
                        </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {isAdmin && (
                                <>
                                    <DropdownMenuItem asChild>
                                        <Link href={`/teams/${team.id}/edit`}>
                                            <Edit className="mr-2 h-4 w-4" />
                                            Edit Team
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link href={`/teams/${team.id}/invites`}>
                                            <Users className="mr-2 h-4 w-4" />
                                            Manage Invites
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                </>
                            )}
                            {!isOwner && (
                                <DropdownMenuItem onClick={() => setLeaveDialogOpen(true)} className="text-red-600">
                                    <UserMinus className="mr-2 h-4 w-4" />
                                    Leave Team
                                </DropdownMenuItem>
                            )}
                            {isOwner && (
                                <DropdownMenuItem onClick={() => setDeleteDialogOpen(true)} className="text-red-600">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete Team
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Members Section */}
                    <Card className="lg:col-span-1">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Members</CardTitle>
                                <CardDescription>{team.members?.length || 0} team members</CardDescription>
                            </div>
                            {isAdmin && (
                                <Button size="sm" asChild>
                                    <Link href={`/teams/${team.id}/invites`}>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Invite
                                    </Link>
                                </Button>
                            )}
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {team.members?.map((member) => (
                                    <div key={member.id} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={member.avatar_url} />
                                                <AvatarFallback>{member.username?.[0]?.toUpperCase()}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="text-sm font-medium">{member.username}</p>
                                                <Badge variant="secondary" className="text-xs">
                                                    {member.pivot?.team_role}
                                                </Badge>
                                            </div>
                                        </div>
                                        {isAdmin && member.pivot?.team_role !== 'Owner' && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => {
                                                    setSelectedMember(member);
                                                    setRemoveMemberDialogOpen(true);
                                                }}
                                            >
                                                <UserMinus className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Projects Section */}
                    <Card className="lg:col-span-2">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Projects</CardTitle>
                                <CardDescription>Team projects</CardDescription>
                            </div>
                            <Button asChild>
                                <Link href={`/projects/create?team_id=${team.id}`}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    New Project
                                </Link>
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {team.projects && team.projects.length > 0 ? (
                                <div className="space-y-3">
                                    {team.projects.map((project) => (
                                        <Link key={project.id} href={`/projects/${project.id}`}>
                                            <div className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50">
                                                <div className="flex items-center gap-3">
                                                    <FolderOpen className="h-5 w-5 shrink-0 text-muted-foreground" />
                                                    <div>
                                                        <p className="font-medium">{project.name}</p>
                                                        {project.description && (
                                                            <p className="text-sm text-muted-foreground line-clamp-1">
                                                                {project.description}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-8 text-center">
                                    <FolderOpen className="h-10 w-10 text-muted-foreground" />
                                    <p className="mt-2 text-sm text-muted-foreground">No projects yet</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Delete Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Team</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this team? This action cannot be undone and will remove all projects and tasks.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDelete}>
                            Delete Team
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Leave Dialog */}
            <Dialog open={leaveDialogOpen} onOpenChange={setLeaveDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Leave Team</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to leave this team? You will lose access to all team projects.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setLeaveDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleLeave}>
                            Leave Team
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Remove Member Dialog */}
            <Dialog open={removeMemberDialogOpen} onOpenChange={setRemoveMemberDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Remove Member</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to remove {selectedMember?.username} from this team?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setRemoveMemberDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleRemoveMember}>
                            Remove Member
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
