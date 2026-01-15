import {
    closestCorners,
    DndContext,
    DragEndEvent,
    DragOverEvent,
    DragOverlay,
    DragStartEvent,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { Calendar, GripVertical } from 'lucide-react';
import { useCallback, useState } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import type { Task, TaskStatus } from '@/types';

import { KanbanColumn } from './kanban-column';

interface KanbanBoardProps {
    tasks: Task[];
    onTaskMove: (taskId: string, newStatus: TaskStatus, newPosition: number) => void;
    onTaskClick?: (task: Task) => void;
    onAddTask?: (status: TaskStatus) => void;
}

const columns: { id: TaskStatus; title: string; color: string }[] = [
    { id: 'Unplanned', title: 'Unplanned', color: 'bg-gray-500' },
    { id: 'Pending', title: 'Pending', color: 'bg-yellow-500' },
    { id: 'In-Progress', title: 'In Progress', color: 'bg-blue-500' },
    { id: 'Done', title: 'Done', color: 'bg-green-500' },
];

const priorityColors: Record<string, string> = {
    Critical: 'border-l-4 border-l-red-500',
    High: 'border-l-4 border-l-orange-500',
    Medium: 'border-l-4 border-l-yellow-500',
    Low: 'border-l-4 border-l-gray-300',
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

function groupTasksByStatus(tasks: Task[]): Record<TaskStatus, Task[]> {
    const grouped: Record<TaskStatus, Task[]> = {
        Unplanned: [],
        Pending: [],
        'In-Progress': [],
        Done: [],
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
}

export function KanbanBoard({ tasks, onTaskMove, onTaskClick, onAddTask }: KanbanBoardProps) {
    const [tasksByColumn, setTasksByColumn] = useState<Record<TaskStatus, Task[]>>(() => groupTasksByStatus(tasks));
    const [activeTask, setActiveTask] = useState<Task | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
    );

    const findContainer = useCallback(
        (id: string): TaskStatus | null => {
            // Check if it's a column id
            if (columns.some((col) => col.id === id)) {
                return id as TaskStatus;
            }

            // Otherwise, find which column contains this task
            for (const [status, columnTasks] of Object.entries(tasksByColumn)) {
                if (columnTasks.some((task) => task.id === id)) {
                    return status as TaskStatus;
                }
            }

            return null;
        },
        [tasksByColumn],
    );

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        const task = Object.values(tasksByColumn)
            .flat()
            .find((t) => t.id === active.id);
        setActiveTask(task || null);
    };

    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id as string;
        const overId = over.id as string;

        const activeContainer = findContainer(activeId);
        const overContainer = findContainer(overId);

        if (!activeContainer || !overContainer || activeContainer === overContainer) {
            return;
        }

        setTasksByColumn((prev) => {
            const activeItems = [...prev[activeContainer]];
            const overItems = [...prev[overContainer]];

            const activeIndex = activeItems.findIndex((t) => t.id === activeId);
            const overIndex = overItems.findIndex((t) => t.id === overId);

            const [movedTask] = activeItems.splice(activeIndex, 1);
            const updatedTask = { ...movedTask, status: overContainer };

            // Insert at the correct position
            const insertIndex = overId === overContainer ? overItems.length : overIndex;
            overItems.splice(insertIndex, 0, updatedTask);

            return {
                ...prev,
                [activeContainer]: activeItems,
                [overContainer]: overItems,
            };
        });
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveTask(null);

        if (!over) return;

        const activeId = active.id as string;
        const overId = over.id as string;

        const activeContainer = findContainer(activeId);
        let overContainer = findContainer(overId);

        // If dropping on a column directly, use that column
        if (columns.some((col) => col.id === overId)) {
            overContainer = overId as TaskStatus;
        }

        if (!activeContainer || !overContainer) return;

        if (activeContainer === overContainer) {
            // Reordering within the same column
            setTasksByColumn((prev) => {
                const items = [...prev[activeContainer]];
                const activeIndex = items.findIndex((t) => t.id === activeId);
                const overIndex = items.findIndex((t) => t.id === overId);

                if (activeIndex !== overIndex && overIndex !== -1) {
                    const newItems = arrayMove(items, activeIndex, overIndex);
                    const updatedItems = newItems.map((task, index) => ({ ...task, position: index }));

                    // Notify parent of the position change
                    onTaskMove(activeId, overContainer, overIndex);

                    return { ...prev, [activeContainer]: updatedItems };
                }

                return prev;
            });
        } else {
            // Moving to a different column
            setTasksByColumn((prev) => {
                const overItems = [...prev[overContainer]];
                const newPosition = overItems.findIndex((t) => t.id === overId);
                const finalPosition = newPosition === -1 ? overItems.length - 1 : newPosition;

                // Update positions
                const updatedItems = overItems.map((task, index) => ({ ...task, position: index }));

                onTaskMove(activeId, overContainer, Math.max(0, finalPosition));

                return { ...prev, [overContainer]: updatedItems };
            });
        }
    };

    const dueDate = activeTask ? formatDate(activeTask.due_date) : null;

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
        >
            <div className="flex flex-1 gap-4 overflow-x-auto pb-4">
                {columns.map((column) => (
                    <KanbanColumn
                        key={column.id}
                        id={column.id}
                        title={column.title}
                        color={column.color}
                        tasks={tasksByColumn[column.id]}
                        onTaskClick={onTaskClick}
                        onAddTask={onAddTask ? () => onAddTask(column.id) : undefined}
                    />
                ))}
            </div>

            <DragOverlay>
                {activeTask ? (
                    <Card className={`w-[280px] cursor-grabbing shadow-lg ${priorityColors[activeTask.priority || ''] || ''}`}>
                        <CardContent className="p-3">
                            <div className="flex items-start gap-2">
                                <GripVertical className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                                <div className="min-w-0 flex-1">
                                    <h4 className="truncate font-medium">{activeTask.name}</h4>

                                    {activeTask.labels && activeTask.labels.length > 0 && (
                                        <div className="mt-2 flex flex-wrap gap-1">
                                            {activeTask.labels.map((label) => (
                                                <Badge key={label.id} variant="outline" className="text-xs">
                                                    {label.name}
                                                </Badge>
                                            ))}
                                        </div>
                                    )}

                                    <div className="mt-2 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            {dueDate && (
                                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                    <Calendar className="h-3 w-3" />
                                                    {dueDate.text}
                                                </div>
                                            )}
                                        </div>
                                        {activeTask.assignee && (
                                            <Avatar className="h-6 w-6">
                                                <AvatarImage src={activeTask.assignee.avatar_url} />
                                                <AvatarFallback className="text-xs">
                                                    {activeTask.assignee.username?.[0]?.toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}
