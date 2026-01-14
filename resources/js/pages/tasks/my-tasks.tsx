import { Head, Link } from '@inertiajs/react';
import { ClipboardListIcon, PlusIcon } from 'lucide-react';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, Task, PaginatedData } from '@/types';

interface Props {
    tasks: PaginatedData<Task>;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'My Tasks', href: '/my-tasks' },
];

const statusColors: Record<string, string> = {
    Unplanned: 'bg-gray-100 text-gray-800',
    Pending: 'bg-yellow-100 text-yellow-800',
    'In-Progress': 'bg-blue-100 text-blue-800',
    Done: 'bg-green-100 text-green-800',
};

const priorityColors: Record<string, string> = {
    Low: 'bg-gray-100 text-gray-600',
    Medium: 'bg-blue-100 text-blue-600',
    High: 'bg-orange-100 text-orange-600',
    Critical: 'bg-red-100 text-red-600',
};

export default function MyTasks({ tasks }: Props) {
    const formatDate = (date: string | null) => {
        if (!date) return null;
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
        });
    };

    const isOverdue = (dueDate: string | null, status: string) => {
        if (!dueDate || status === 'Done') return false;
        return new Date(dueDate) < new Date();
    };

    // Group tasks by status
    const tasksByStatus = {
        'In-Progress': tasks.data.filter((t) => t.status === 'In-Progress'),
        Pending: tasks.data.filter((t) => t.status === 'Pending'),
        Unplanned: tasks.data.filter((t) => t.status === 'Unplanned'),
        Done: tasks.data.filter((t) => t.status === 'Done'),
    };

    const renderTaskCard = (task: Task) => (
        <Link key={task.id} href={`/tasks/${task.id}`}>
            <div className="rounded-lg border p-4 transition-colors hover:bg-muted/50">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-1">
                        <h4 className="font-medium">{task.name}</h4>
                        <p className="text-sm text-muted-foreground">
                            {task.project?.name} • {task.project?.team?.name}
                        </p>
                    </div>
                    <Badge className={statusColors[task.status]}>{task.status}</Badge>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                    {task.priority && <Badge className={priorityColors[task.priority]}>{task.priority}</Badge>}
                    {task.due_date && (
                        <span
                            className={`text-xs ${isOverdue(task.due_date, task.status) ? 'font-medium text-red-500' : 'text-muted-foreground'}`}
                        >
                            Due {formatDate(task.due_date)}
                        </span>
                    )}
                    {task.labels?.map((label) => (
                        <Badge key={label.id} variant="outline" style={{ borderColor: label.color, color: label.color }}>
                            {label.name}
                        </Badge>
                    ))}
                </div>
            </div>
        </Link>
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="My Tasks" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">My Tasks</h1>
                        <p className="text-muted-foreground">Tasks assigned to you across all projects</p>
                    </div>
                    <Link href="/tasks/create">
                        <Button>
                            <PlusIcon className="mr-2 h-4 w-4" />
                            New Task
                        </Button>
                    </Link>
                </div>

                {tasks.data.length === 0 ? (
                    <Card className="flex flex-col items-center justify-center p-12">
                        <ClipboardListIcon className="h-12 w-12 text-muted-foreground" />
                        <h3 className="mt-4 text-lg font-semibold">No tasks assigned</h3>
                        <p className="mt-2 text-center text-muted-foreground">
                            You don't have any tasks assigned to you yet.
                        </p>
                    </Card>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* In Progress */}
                        {tasksByStatus['In-Progress'].length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <div className="h-3 w-3 rounded-full bg-blue-500" />
                                        In Progress ({tasksByStatus['In-Progress'].length})
                                    </CardTitle>
                                    <CardDescription>Tasks you're currently working on</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {tasksByStatus['In-Progress'].map(renderTaskCard)}
                                </CardContent>
                            </Card>
                        )}

                        {/* Pending */}
                        {tasksByStatus.Pending.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <div className="h-3 w-3 rounded-full bg-yellow-500" />
                                        Pending ({tasksByStatus.Pending.length})
                                    </CardTitle>
                                    <CardDescription>Tasks waiting to be started</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3">{tasksByStatus.Pending.map(renderTaskCard)}</CardContent>
                            </Card>
                        )}

                        {/* Unplanned */}
                        {tasksByStatus.Unplanned.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <div className="h-3 w-3 rounded-full bg-gray-500" />
                                        Unplanned ({tasksByStatus.Unplanned.length})
                                    </CardTitle>
                                    <CardDescription>Tasks not yet scheduled</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3">{tasksByStatus.Unplanned.map(renderTaskCard)}</CardContent>
                            </Card>
                        )}

                        {/* Done */}
                        {tasksByStatus.Done.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <div className="h-3 w-3 rounded-full bg-green-500" />
                                        Done ({tasksByStatus.Done.length})
                                    </CardTitle>
                                    <CardDescription>Recently completed tasks</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3">{tasksByStatus.Done.map(renderTaskCard)}</CardContent>
                            </Card>
                        )}
                    </div>
                )}

                {/* Pagination */}
                {tasks.last_page > 1 && (
                    <div className="flex items-center justify-center gap-2 pt-4">
                        {tasks.links.map((link, index) => (
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
