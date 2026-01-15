import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Calendar } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import type { Task } from '@/types';

interface SortableTaskCardProps {
    task: Task;
    isDone?: boolean;
    onClick?: () => void;
}

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

export function SortableTaskCard({ task, isDone = false, onClick }: SortableTaskCardProps) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: task.id,
        data: {
            type: 'task',
            task,
        },
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const dueDate = formatDate(task.due_date);

    return (
        <Card
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={`cursor-grab touch-none transition-shadow hover:shadow-md active:cursor-grabbing ${priorityColors[task.priority || ''] || ''} ${
                isDragging ? 'z-50 opacity-80 shadow-lg ring-2 ring-primary' : ''
            }`}
            onClick={onClick}
        >
            <CardContent className="p-3">
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
                            <div
                                className={`flex items-center gap-1 text-xs ${
                                    dueDate.isOverdue && !isDone ? 'text-red-500' : 'text-muted-foreground'
                                }`}
                            >
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
                            <AvatarFallback className="text-xs">{task.assignee.username?.[0]?.toUpperCase()}</AvatarFallback>
                        </Avatar>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
