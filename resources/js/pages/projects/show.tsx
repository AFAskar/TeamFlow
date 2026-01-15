import { Head, Link, router } from '@inertiajs/react';
import { Calendar, Edit, Kanban, LayoutList, MoreHorizontal, Plus, Trash2, Users } from 'lucide-react';
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, Project, Task, User } from '@/types';

interface Props {
    project: Project;
    tasks: Task[];
    members: User[];
}

const statusColors: Record<string, string> = {
    'Done': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
    'In-Progress': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
    'Pending': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
    'Unplanned': 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100',
};

const priorityColors: Record<string, string> = {
    'Critical': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
    'High': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100',
    'Medium': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
    'Low': 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100',
};

export default function ShowProject({ project, tasks, labels, members }: Props) {
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Projects', href: '/projects' },
        { title: project.name, href: `/projects/${project.id}` },
    ];

    const handleDelete = () => {
        router.delete(`/projects/${project.id}`, {
            onSuccess: () => setDeleteDialogOpen(false),
        });
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString();
    };

    const tasksByStatus = {
        'Unplanned': tasks.filter((t) => t.status === 'Unplanned'),
        'Pending': tasks.filter((t) => t.status === 'Pending'),
        'In-Progress': tasks.filter((t) => t.status === 'In-Progress'),
        'Done': tasks.filter((t) => t.status === 'Done'),
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={project.name} />
            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                {/* Project Header */}
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">{project.name}</h1>
                        <p className="mt-1 text-muted-foreground">{project.description || 'No description'}</p>
                        {project.team && (
                            <p className="mt-2 text-sm text-muted-foreground">
                                Team: <Link href={`/teams/${project.team.id}`} className="hover:underline">{project.team.name}</Link>
                            </p>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" asChild>
                            <Link href={`/projects/${project.id}/kanban`}>
                                <Kanban className="mr-2 h-4 w-4" />
                                Kanban Board
                            </Link>
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                    <Link href={`/projects/${project.id}/edit`}>
                                        <Edit className="mr-2 h-4 w-4" />
                                        Edit Project
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => setDeleteDialogOpen(true)} className="text-red-600">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Archive Project
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-4">
                    {Object.entries(tasksByStatus).map(([status, statusTasks]) => (
                        <Card key={status}>
                            <CardHeader className="pb-2">
                                <CardDescription>{status}</CardDescription>
                                <CardTitle className="text-3xl">{statusTasks.length}</CardTitle>
                            </CardHeader>
                        </Card>
                    ))}
                </div>

                <div className="grid gap-6 lg:grid-cols-4">
                    {/* Tasks Section */}
                    <Card className="lg:col-span-3">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Tasks</CardTitle>
                                <CardDescription>{tasks.length} total tasks</CardDescription>
                            </div>
                            <Button asChild>
                                <Link href={`/tasks/create?project_id=${project.id}`}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Task
                                </Link>
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {tasks.length === 0 ? (
                                <div className="py-8 text-center text-muted-foreground">
                                    <LayoutList className="mx-auto mb-4 h-12 w-12" />
                                    <p>No tasks yet. Create your first task to get started.</p>
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Priority</TableHead>
                                            <TableHead>Assignee</TableHead>
                                            <TableHead>Due Date</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {tasks.map((task) => (
                                            <TableRow key={task.id} className="cursor-pointer" onClick={() => router.visit(`/tasks/${task.id}`)}>
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">{task.name}</span>
                                                        {task.labels && task.labels.length > 0 && (
                                                            <div className="mt-1 flex gap-1">
                                                                {task.labels.map((label) => (
                                                                    <Badge key={label.id} variant="outline" className="text-xs">
                                                                        {label.name}
                                                                    </Badge>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={statusColors[task.status || 'Unplanned']}>
                                                        {task.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    {task.priority && (
                                                        <Badge className={priorityColors[task.priority]}>
                                                            {task.priority}
                                                        </Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {task.assignee ? (
                                                        <div className="flex items-center gap-2">
                                                            <Avatar className="h-6 w-6">
                                                                <AvatarImage src={task.assignee.avatar_url} />
                                                                <AvatarFallback>{task.assignee.username?.[0]?.toUpperCase()}</AvatarFallback>
                                                            </Avatar>
                                                            <span className="text-sm">{task.assignee.username}</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-muted-foreground">Unassigned</span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {task.due_date && (
                                                        <div className="flex items-center gap-1 text-sm">
                                                            <Calendar className="h-3 w-3" />
                                                            {formatDate(task.due_date)}
                                                        </div>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>

                    {/* Members Section */}
                    <Card className="lg:col-span-1">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                Members
                            </CardTitle>
                            <CardDescription>{members.length} project members</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {members.map((member) => (
                                    <div key={member.id} className="flex items-center gap-3">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={member.avatar_url} />
                                            <AvatarFallback>{member.username?.[0]?.toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="text-sm font-medium">{member.username}</p>
                                            {member.pivot?.role && (
                                                <Badge variant="secondary" className="text-xs">
                                                    {member.pivot.role}
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Delete Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Archive Project</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to archive this project? You can restore it later.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDelete}>
                            Archive Project
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
