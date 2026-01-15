import { Head, Link } from '@inertiajs/react';
import { CalendarDays, Download, FileSpreadsheet, FileText, Filter, ListTodo, Plus, Search, X } from 'lucide-react';
import { useState } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, PaginatedData, Task, TaskStatus } from '@/types';

interface Props {
    tasks: PaginatedData<Task>;
    filters: {
        status?: string;
        priority?: string;
        search?: string;
        due_date_from?: string;
        due_date_to?: string;
    };
    statuses: Array<{ value: string }>;
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

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Tasks', href: '/tasks' },
];

export default function TasksIndex({ tasks, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || 'all');
    const [priority, setPriority] = useState(filters.priority || 'all');
    const [dueDateFrom, setDueDateFrom] = useState(filters.due_date_from || '');
    const [dueDateTo, setDueDateTo] = useState(filters.due_date_to || '');

    const formatDate = (dateString?: string) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString();
    };

    const handleFilter = () => {
        const params = new URLSearchParams();
        if (search) params.set('search', search);
        if (status && status !== 'all') params.set('status', status);
        if (priority && priority !== 'all') params.set('priority', priority);
        if (dueDateFrom) params.set('due_date_from', dueDateFrom);
        if (dueDateTo) params.set('due_date_to', dueDateTo);
        window.location.href = `/tasks?${params.toString()}`;
    };

    const clearDateFilter = () => {
        setDueDateFrom('');
        setDueDateTo('');
    };

    const hasDateFilter = dueDateFrom || dueDateTo;
    const hasAnyFilter = search || status !== 'all' || priority !== 'all' || hasDateFilter;

    const getExportUrl = (format: 'csv' | 'pdf') => {
        const params = new URLSearchParams();
        if (search) params.set('search', search);
        if (status && status !== 'all') params.set('status', status);
        if (priority && priority !== 'all') params.set('priority', priority);
        if (dueDateFrom) params.set('due_date_from', dueDateFrom);
        if (dueDateTo) params.set('due_date_to', dueDateTo);
        const queryString = params.toString();
        return `/tasks-export/${format}${queryString ? `?${queryString}` : ''}`;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tasks" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">All Tasks</h1>
                        <p className="text-muted-foreground">View and manage all tasks across projects</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline">
                                    <Download className="mr-2 h-4 w-4" />
                                    Export
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                    <a href={getExportUrl('csv')} download>
                                        <FileSpreadsheet className="mr-2 h-4 w-4" />
                                        Export to CSV
                                    </a>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <a href={getExportUrl('pdf')} download>
                                        <FileText className="mr-2 h-4 w-4" />
                                        Export to PDF
                                    </a>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <Button asChild>
                            <Link href="/tasks/create">
                                <Plus className="mr-2 h-4 w-4" />
                                New Task
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Filters */}
                <Card>
                    <CardContent className="p-4">
                        <div className="flex flex-wrap gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        placeholder="Search tasks..."
                                        className="pl-9"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
                                    />
                                </div>
                            </div>
                            <Select value={status} onValueChange={setStatus}>
                                <SelectTrigger className="w-[150px]">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    <SelectItem value="Unplanned">Unplanned</SelectItem>
                                    <SelectItem value="Pending">Pending</SelectItem>
                                    <SelectItem value="In-Progress">In Progress</SelectItem>
                                    <SelectItem value="Done">Done</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={priority} onValueChange={setPriority}>
                                <SelectTrigger className="w-[150px]">
                                    <SelectValue placeholder="Priority" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Priorities</SelectItem>
                                    <SelectItem value="Critical">Critical</SelectItem>
                                    <SelectItem value="High">High</SelectItem>
                                    <SelectItem value="Medium">Medium</SelectItem>
                                    <SelectItem value="Low">Low</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button onClick={handleFilter}>
                                <Filter className="mr-2 h-4 w-4" />
                                Apply
                            </Button>
                        </div>

                        {/* Date Range Filter */}
                        <div className="mt-4 flex flex-wrap items-center gap-4 border-t pt-4">
                            <div className="flex items-center gap-2">
                                <CalendarDays className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">Due Date:</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Input
                                    type="date"
                                    placeholder="From"
                                    value={dueDateFrom}
                                    onChange={(e) => setDueDateFrom(e.target.value)}
                                    className="w-[160px]"
                                />
                                <span className="text-muted-foreground">to</span>
                                <Input
                                    type="date"
                                    placeholder="To"
                                    value={dueDateTo}
                                    onChange={(e) => setDueDateTo(e.target.value)}
                                    className="w-[160px]"
                                />
                            </div>
                            {hasDateFilter && (
                                <Button variant="ghost" size="sm" onClick={clearDateFilter}>
                                    <X className="mr-1 h-3 w-3" />
                                    Clear dates
                                </Button>
                            )}
                        </div>

                        {/* Active filters summary */}
                        {hasAnyFilter && (
                            <div className="mt-4 flex flex-wrap items-center gap-2 border-t pt-4">
                                <span className="text-sm text-muted-foreground">Active filters:</span>
                                {search && (
                                    <Badge variant="secondary">Search: {search}</Badge>
                                )}
                                {status !== 'all' && (
                                    <Badge variant="secondary">Status: {status}</Badge>
                                )}
                                {priority !== 'all' && (
                                    <Badge variant="secondary">Priority: {priority}</Badge>
                                )}
                                {dueDateFrom && (
                                    <Badge variant="secondary">From: {dueDateFrom}</Badge>
                                )}
                                {dueDateTo && (
                                    <Badge variant="secondary">To: {dueDateTo}</Badge>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Tasks Table */}
                {tasks.data.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <ListTodo className="mb-4 h-12 w-12 text-muted-foreground" />
                            <h3 className="mb-2 text-lg font-semibold">No tasks found</h3>
                            <p className="mb-4 text-muted-foreground">
                                {hasAnyFilter
                                    ? 'Try adjusting your filters'
                                    : 'Create your first task to get started'}
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <Card>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Project</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Priority</TableHead>
                                        <TableHead>Assignee</TableHead>
                                        <TableHead>Due Date</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {tasks.data.map((task) => (
                                        <TableRow key={task.id}>
                                            <TableCell>
                                                <Link href={`/tasks/${task.id}`} className="font-medium hover:underline">
                                                    {task.name}
                                                </Link>
                                                {task.labels && task.labels.length > 0 && (
                                                    <div className="mt-1 flex gap-1">
                                                        {task.labels.map((label) => (
                                                            <Badge key={label.id} variant="outline" className="text-xs">
                                                                {label.name}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {task.project && (
                                                    <Link href={`/projects/${task.project.id}`} className="text-sm hover:underline">
                                                        {task.project.name}
                                                    </Link>
                                                )}
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
                                                    <span className="text-muted-foreground">-</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {task.due_date ? (
                                                    <div className="flex items-center gap-1 text-sm">
                                                        <Calendar className="h-3 w-3" />
                                                        {formatDate(task.due_date)}
                                                    </div>
                                                ) : (
                                                    '-'
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )}

                {/* Pagination */}
                {tasks.meta.last_page > 1 && (
                    <div className="flex justify-center gap-2">
                        {tasks.links.prev && (
                            <Button variant="outline" asChild>
                                <Link href={tasks.links.prev}>Previous</Link>
                            </Button>
                        )}
                        <span className="flex items-center px-4 text-sm text-muted-foreground">
                            Page {tasks.meta.current_page} of {tasks.meta.last_page}
                        </span>
                        {tasks.links.next && (
                            <Button variant="outline" asChild>
                                <Link href={tasks.links.next}>Next</Link>
                            </Button>
                        )}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
