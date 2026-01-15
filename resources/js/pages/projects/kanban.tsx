import { Head, Link, router } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { useCallback } from 'react';

import { KanbanBoard } from '@/components/kanban';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, Label, Project, Task, TaskStatus, User } from '@/types';

interface Props {
    project: Project;
    tasks: Task[];
    labels: Label[];
    members: User[];
}

export default function KanbanPage({ project, tasks }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Projects', href: '/projects' },
        { title: project.name, href: `/projects/${project.id}` },
        { title: 'Kanban', href: `/projects/${project.id}/kanban` },
    ];

    const handleTaskMove = useCallback(
        async (taskId: string, newStatus: TaskStatus, newPosition: number) => {
            try {
                await fetch('/tasks/' + taskId + '/status', {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                        Accept: 'application/json',
                    },
                    body: JSON.stringify({
                        status: newStatus,
                        position: newPosition,
                    }),
                });
            } catch (error) {
                console.error('Failed to update task status:', error);
                router.reload();
            }
        },
        [],
    );

    const handleTaskClick = useCallback((task: Task) => {
        router.visit(`/tasks/${task.id}`);
    }, []);

    const handleAddTask = useCallback(
        (status: TaskStatus) => {
            router.visit(`/tasks/create?project_id=${project.id}&status=${status}`);
        },
        [project.id],
    );

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

                {/* Kanban Board with Drag and Drop */}
                <KanbanBoard tasks={tasks} onTaskMove={handleTaskMove} onTaskClick={handleTaskClick} onAddTask={handleAddTask} />
            </div>
        </AppLayout>
    );
}
