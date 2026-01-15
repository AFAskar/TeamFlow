import { Head, Link, useForm, router } from '@inertiajs/react';
import { CalendarIcon, MessageSquareIcon, PaperclipIcon, UserIcon } from 'lucide-react';
import { FormEvent, useState } from 'react';

import { FileUpload } from '@/components/file-upload';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, Task, TaskComment as TaskCommentType } from '@/types';

interface Props {
    task: Task;
}

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

export default function ShowTask({ task }: Props) {
    const [selectedStatus, setSelectedStatus] = useState(task.status);
    const commentForm = useForm({
        content: '',
    });

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Tasks', href: '/tasks' },
        { title: task.name, href: `/tasks/${task.id}` },
    ];

    const handleStatusChange = (status: string) => {
        setSelectedStatus(status as any);
        router.put(`/tasks/${task.id}/status`, { status }, { preserveScroll: true });
    };

    const handleCommentSubmit = (e: FormEvent) => {
        e.preventDefault();
        commentForm.post(`/tasks/${task.id}/comments`, {
            preserveScroll: true,
            onSuccess: () => commentForm.reset(),
        });
    };

    const formatDate = (date: string | null) => {
        if (!date) return 'Not set';
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const formatDateTime = (date: string) => {
        return new Date(date).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={task.name} />
            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">{task.name}</h1>
                        <p className="text-muted-foreground">
                            in{' '}
                            <Link href={`/projects/${task.project?.id}`} className="text-primary hover:underline">
                                {task.project?.name}
                            </Link>
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Link href={`/tasks/${task.id}/edit`}>
                            <Button variant="outline">Edit Task</Button>
                        </Link>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Main Content */}
                    <div className="space-y-6 lg:col-span-2">
                        {/* Description */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Description</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="whitespace-pre-wrap text-muted-foreground">
                                    {task.description || 'No description provided.'}
                                </p>
                            </CardContent>
                        </Card>

                        {/* Comments */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <MessageSquareIcon className="h-5 w-5" />
                                    Comments ({task.comments?.length || 0})
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Add Comment Form */}
                                <form onSubmit={handleCommentSubmit} className="space-y-2">
                                    <Textarea
                                        value={commentForm.data.content}
                                        onChange={(e) => commentForm.setData('content', e.target.value)}
                                        placeholder="Add a comment..."
                                        rows={3}
                                    />
                                    <Button type="submit" size="sm" disabled={commentForm.processing || !commentForm.data.content.trim()}>
                                        {commentForm.processing ? 'Posting...' : 'Post Comment'}
                                    </Button>
                                </form>

                                {/* Comments List */}
                                <div className="space-y-4 pt-4">
                                    {task.comments && task.comments.length > 0 ? (
                                        task.comments.map((comment: TaskCommentType) => (
                                            <div key={comment.id} className="flex gap-3">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarFallback>{comment.user?.username?.charAt(0).toUpperCase()}</AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium">{comment.user?.username}</span>
                                                        <span className="text-xs text-muted-foreground">
                                                            {formatDateTime(comment.created_at)}
                                                        </span>
                                                    </div>
                                                    <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">{comment.content}</p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-center text-sm text-muted-foreground">No comments yet.</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Attachments */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <PaperclipIcon className="h-5 w-5" />
                                    Attachments ({task.attachments?.length || 0})
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <FileUpload
                                    taskId={task.id}
                                    attachments={task.attachments}
                                />
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-4">
                        {/* Status & Priority */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Status</label>
                                    <Select value={selectedStatus} onValueChange={handleStatusChange}>
                                        <SelectTrigger className="mt-1">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Unplanned">Unplanned</SelectItem>
                                            <SelectItem value="Pending">Pending</SelectItem>
                                            <SelectItem value="In-Progress">In Progress</SelectItem>
                                            <SelectItem value="Done">Done</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Priority</label>
                                    <div className="mt-1">
                                        <Badge className={priorityColors[task.priority || 'Medium']}>{task.priority || 'Not set'}</Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* People */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <UserIcon className="h-5 w-5" />
                                    People
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Assignee</label>
                                    <div className="mt-1 flex items-center gap-2">
                                        {task.assignee ? (
                                            <>
                                                <Avatar className="h-6 w-6">
                                                    <AvatarFallback>{task.assignee.username?.charAt(0).toUpperCase()}</AvatarFallback>
                                                </Avatar>
                                                <span className="text-sm">{task.assignee.username}</span>
                                            </>
                                        ) : (
                                            <span className="text-sm text-muted-foreground">Unassigned</span>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Created by</label>
                                    <div className="mt-1 flex items-center gap-2">
                                        {task.creator ? (
                                            <>
                                                <Avatar className="h-6 w-6">
                                                    <AvatarFallback>{task.creator.username?.charAt(0).toUpperCase()}</AvatarFallback>
                                                </Avatar>
                                                <span className="text-sm">{task.creator.username}</span>
                                            </>
                                        ) : (
                                            <span className="text-sm text-muted-foreground">Unknown</span>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Dates */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <CalendarIcon className="h-5 w-5" />
                                    Dates
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Due Date</label>
                                    <p className="text-sm">{formatDate(task.due_date)}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Created</label>
                                    <p className="text-sm">{formatDateTime(task.created_at)}</p>
                                </div>
                                {task.completed_at && (
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Completed</label>
                                        <p className="text-sm">{formatDateTime(task.completed_at)}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Labels */}
                        {task.labels && task.labels.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Labels</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-wrap gap-2">
                                        {task.labels.map((label) => (
                                            <Badge key={label.id} variant="secondary" style={{ backgroundColor: label.color + '20', color: label.color }}>
                                                {label.name}
                                            </Badge>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
