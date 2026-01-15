import { Head, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';

import { RichTextEditor } from '@/components/rich-text-editor';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, Task, Project, Label as LabelType, User } from '@/types';

interface Props {
    task: Task & {
        project: Project & {
            members: User[];
            team: {
                labels: LabelType[];
            };
        };
    };
}

export default function EditTask({ task }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Tasks', href: '/tasks' },
        { title: task.name, href: `/tasks/${task.id}` },
        { title: 'Edit', href: `/tasks/${task.id}/edit` },
    ];

    const { data, setData, put, processing, errors, delete: destroy } = useForm({
        name: task.name,
        description: task.description || '',
        status: task.status,
        priority: task.priority || '',
        due_date: task.due_date ? task.due_date.split('T')[0] : '',
        assigned_to: task.assignee?.id || '',
        labels: task.labels?.map((l) => l.id) || [],
    });

    const availableLabels = task.project?.team?.labels || [];
    const availableMembers = task.project?.members || [];

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        put(`/tasks/${task.id}`);
    };

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this task?')) {
            destroy(`/tasks/${task.id}`);
        }
    };

    const handleLabelToggle = (labelId: string) => {
        const newLabels = data.labels.includes(labelId)
            ? data.labels.filter((id) => id !== labelId)
            : [...data.labels, labelId];
        setData('labels', newLabels);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${task.name}`} />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="mx-auto w-full max-w-2xl">
                    <Card>
                        <CardHeader>
                            <CardTitle>Edit Task</CardTitle>
                            <CardDescription>Update task details and settings</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Task Name</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="Enter task name"
                                        required
                                    />
                                    {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">Description</Label>
                                    <RichTextEditor
                                        content={data.description}
                                        onChange={(html) => setData('description', html)}
                                        placeholder="Describe the task in detail..."
                                    />
                                    {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="status">Status</Label>
                                        <Select value={data.status} onValueChange={(value) => setData('status', value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Unplanned">Unplanned</SelectItem>
                                                <SelectItem value="Pending">Pending</SelectItem>
                                                <SelectItem value="In-Progress">In Progress</SelectItem>
                                                <SelectItem value="Done">Done</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="priority">Priority</Label>
                                        <Select value={data.priority} onValueChange={(value) => setData('priority', value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select priority" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Low">Low</SelectItem>
                                                <SelectItem value="Medium">Medium</SelectItem>
                                                <SelectItem value="High">High</SelectItem>
                                                <SelectItem value="Critical">Critical</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="due_date">Due Date</Label>
                                        <Input
                                            id="due_date"
                                            type="date"
                                            value={data.due_date}
                                            onChange={(e) => setData('due_date', e.target.value)}
                                        />
                                        {errors.due_date && <p className="text-sm text-red-500">{errors.due_date}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="assigned_to">Assignee</Label>
                                        <Select
                                            value={data.assigned_to || 'unassigned'}
                                            onValueChange={(value) => setData('assigned_to', value === 'unassigned' ? '' : value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select assignee" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="unassigned">Unassigned</SelectItem>
                                                {availableMembers.map((member) => (
                                                    <SelectItem key={member.id} value={member.id}>
                                                        {member.username}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {availableLabels.length > 0 && (
                                    <div className="space-y-2">
                                        <Label>Labels</Label>
                                        <div className="flex flex-wrap gap-4">
                                            {availableLabels.map((label: LabelType) => (
                                                <div key={label.id} className="flex items-center gap-2">
                                                    <Checkbox
                                                        id={`label-${label.id}`}
                                                        checked={data.labels.includes(label.id)}
                                                        onCheckedChange={() => handleLabelToggle(label.id)}
                                                    />
                                                    <label htmlFor={`label-${label.id}`} className="text-sm">
                                                        {label.name}
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="flex justify-between">
                                    <div className="flex gap-4">
                                        <Button type="submit" disabled={processing}>
                                            {processing ? 'Saving...' : 'Save Changes'}
                                        </Button>
                                        <Button type="button" variant="outline" onClick={() => window.history.back()}>
                                            Cancel
                                        </Button>
                                    </div>
                                    <Button type="button" variant="destructive" onClick={handleDelete}>
                                        Delete Task
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
