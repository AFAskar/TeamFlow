import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import { useMemo } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Task, TaskStatus } from '@/types';

import { SortableTaskCard } from './sortable-task-card';

interface KanbanColumnProps {
    id: TaskStatus;
    title: string;
    color: string;
    tasks: Task[];
    onTaskClick?: (task: Task) => void;
    onAddTask?: () => void;
}

export function KanbanColumn({ id, title, color, tasks, onTaskClick, onAddTask }: KanbanColumnProps) {
    const { setNodeRef, isOver } = useDroppable({
        id: id,
        data: {
            type: 'column',
            status: id,
        },
    });

    const taskIds = useMemo(() => tasks.map((task) => task.id), [tasks]);

    return (
        <div
            ref={setNodeRef}
            className={`flex min-w-[300px] flex-1 flex-col rounded-lg bg-muted/50 p-3 transition-colors ${
                isOver ? 'bg-primary/10 ring-2 ring-primary/50' : ''
            }`}
        >
            {/* Column Header */}
            <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className={`h-3 w-3 rounded-full ${color}`} />
                    <h3 className="font-semibold">{title}</h3>
                    <Badge variant="secondary" className="ml-1">
                        {tasks.length}
                    </Badge>
                </div>
                {onAddTask && (
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={onAddTask}>
                        <Plus className="h-4 w-4" />
                    </Button>
                )}
            </div>

            {/* Column Content */}
            <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
                <div className="flex flex-1 flex-col gap-2 overflow-y-auto">
                    {tasks.map((task) => (
                        <SortableTaskCard key={task.id} task={task} isDone={id === 'Done'} onClick={() => onTaskClick?.(task)} />
                    ))}

                    {/* Empty state */}
                    {tasks.length === 0 && (
                        <div className="flex flex-1 items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 p-4 text-center text-sm text-muted-foreground">
                            Drop tasks here
                        </div>
                    )}
                </div>
            </SortableContext>
        </div>
    );
}
