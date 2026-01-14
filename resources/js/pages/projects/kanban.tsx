import { Head, Link, router } from '@inertiajs/react';
import { Calendar, GripVertical, Plus } from 'lucide-react';
import { useState } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, Label, Project, Task, TaskStatus, User } from '@/types';

interface Props {
    project: Project;
    tasks: Task[];
    labels: Label[];
    members: User[];
}

const columns: { id: TaskStatus; title: string; color: string }[] = [
    { id: 'Unplanned', title: 'Unplanned', color: 'bg-gray-500' },
    { id: 'Pending', title: 'Pending', color: 'bg-yellow-500' },
    { id: 'In-Progress', title: 'In Progress', color: 'bg-blue-500' },
    { id: 'Done', title: 'Done', color: 'bg-green-500' },
];

const priorityColors: Record<string, string> = {
    'Critical': 'border-l-4 border-l-red-500',
    'High': 'border-l-4 border-l-orange-500',
    'Medium': 'border-l-4 border-l-yellow-500',
    'Low': 'border-l-4 border-l-gray-300',
};

export default function KanbanBoard({ project, tasks, labels, members }: Props) {
    const [draggedTask, setDraggedTask] = useState<Task | null>(null);
    const [tasksByColumn, setTasksByColumn] = useState<Record<TaskStatus, Task[]>>(() => {
        const grouped: Record<TaskStatus, Task[]> = {
            'Unplanned': [],
            'Pending': [],
            'In-Progress': [],
            'Done': [],
        };
        tasks.forEach((task) => {
            const status = task.status || 'Unplanned';
            if (grouped[status]) {
                grouped[status].push(task);
            }
        });
        // Sort by position
        Object.keys(grouped).forEach((key) => {
            grouped[key as TaskStatus].sort((a, b) => a.position - b.position);
        });
        return grouped;
    });

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Projects', href: '/projects' },
        { title: project.name, href: `/projects/${project.id}` },
        { title: 'Kanban', href: `/projects/${project.id}/kanban` },
    ];

    const handleDragStart = (e: React.DragEvent, task: Task) => {
        setDraggedTask(task);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = async (e: React.DragEvent, targetStatus: TaskStatus, targetIndex?: number) => {
        e.preventDefault();
        if (!draggedTask) return;

        const sourceStatus = draggedTask.status || 'Unplanned';
        if (sourceStatus === targetStatus && targetIndex === undefined) {
            setDraggedTask(null);
            return;
        }

        // Update local state
        const newTasksByColumn = { ...tasksByColumn };
        
        // Remove from source
        newTasksByColumn[sourceStatus] = newTasksByColumn[sourceStatus].filter((t) => t.id !== draggedTask.id);
        
        // Add to target
        const updatedTask = { ...draggedTask, status: targetStatus };
        if (targetIndex !== undefined) {
            newTasksByColumn[targetStatus].splice(targetIndex, 0, updatedTask);
        } else {
            newTasksByColumn[targetStatus].push(updatedTask);
        }

        // Update positions
        newTasksByColumn[targetStatus] = newTasksByColumn[targetStatus].map((task, index) => ({
            ...task,
            position: index,
        }));

        setTasksByColumn(newTasksByColumn);
        setDraggedTask(null);

        // Send update to server
        try {
            await fetch('/tasks/' + draggedTask.id + '/status', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    status: targetStatus,
                    position: targetIndex ?? newTasksByColumn[targetStatus].length - 1,
                }),
            });
        } catch (error) {
            console.error('Failed to update task status:', error);
            // Revert on error
            router.reload();
        }
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return null;
        const date = new Date(dateString);
        const now = new Date();
        const isOverdue = date < now;
        return {
            text: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            isOverdue,
        };
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${project.name} - Kanban`} />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">{project.name}</h1>
                        <p className="text-muted-foreground">Kanban Board</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" asChild>
                            <Link href={`/projects/${project.id}`}>List View</Link>
                        </Button>
                        <Button asChild>
                            <Link href={`/tasks/create?project_id=${project.id}`}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Task
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Kanban Columns */}
                <div className="flex flex-1 gap-4 overflow-x-auto pb-4">
                    {columns.map((column) => (
                        <div
                            key={column.id}
                            className="flex min-w-[300px] flex-1 flex-col rounded-lg bg-muted/50 p-3"
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, column.id)}
                        >
                            {/* Column Header */}
                            <div className="mb-3 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className={`h-3 w-3 rounded-full ${column.color}`} />
                                    <h3 className="font-semibold">{column.title}</h3>
                                    <Badge variant="secondary" className="ml-1">
                                        {tasksByColumn[column.id].length}
                                    </Badge>
                                </div>
                            </div>

                            {/* Column Content */}
                            <div className="flex flex-1 flex-col gap-2 overflow-y-auto">
                                {tasksByColumn[column.id].map((task, index) => {
                                    const dueDate = formatDate(task.due_date);
                                    return (
                                        <Card
                                            key={task.id}
                                            className={`cursor-grab transition-shadow hover:shadow-md active:cursor-grabbing ${
                                                priorityColors[task.priority || ''] || ''
                                            } ${draggedTask?.id === task.id ? 'opacity-50' : ''}`}
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, task)}
                                            onDragOver={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                            }}
                                            onDrop={(e) => {
                                                e.stopPropagation();
                                                handleDrop(e, column.id, index);
                                            }}
                                            onClick={() => router.visit(`/tasks/${task.id}`)}
                                        >
                                            <CardContent className="p-3">
                                                <div className="flex items-start gap-2">
                                                    <GripVertical className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                                                    <div className="min-w-0 flex-1">
                                                        <h4 className="truncate font-medium">{task.name}</h4>
                                                        
                                                        {/* Labels */}
                                                        {task.labels && task.labels.length > 0 && (
                                                            <div className="mt-2 flex flex-wrap gap-1">
                                                                {task.labels.map((label) => (
                                                                    <Badge key={label.id} variant="outline" className="text-xs">
                                                                        {label.name}
                                                                    </Badge>
                                                                ))}
                                                            </div>
                                                        )}

                                                        {/* Footer */}
                                                        <div className="mt-2 flex items-center justify-between">
                                                            <div className="flex items-center gap-2">
                                                                {dueDate && (
                                                                    <div className={`flex items-center gap-1 text-xs ${
                                                                        dueDate.isOverdue && column.id !== 'Done' 
                                                                            ? 'text-red-500' 
                                                                            : 'text-muted-foreground'
                                                                    }`}>
                                                                        <Calendar className="h-3 w-3" />
                                                                        {dueDate.text}
                                                                    </div>
                                                                )}
                                                                {task.subtasks_count !== undefined && task.subtasks_count > 0 && (
                                                                    <Badge variant="secondary" className="text-xs">
                                                                        {task.subtasks_count} subtasks
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            {task.assignee && (
                                                                <Avatar className="h-6 w-6">
                                                                    <AvatarImage src={task.assignee.avatar_url} />
                                                                    <AvatarFallback className="text-xs">
                                                                        {task.assignee.username?.[0]?.toUpperCase()}
                                                                    </AvatarFallback>
                                                                </Avatar>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })}

                                {/* Empty state */}
                                {tasksByColumn[column.id].length === 0 && (
                                    <div className="flex flex-1 items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 p-4 text-center text-sm text-muted-foreground">
                                        Drop tasks here
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}
