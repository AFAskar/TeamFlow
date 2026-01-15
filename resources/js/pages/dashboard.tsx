import { Head, Link } from '@inertiajs/react';
import { CheckCircleIcon, ClipboardListIcon, ClockIcon, FolderIcon, LayoutDashboardIcon, PlusIcon, UsersIcon } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, Task, Team, Project, TaskStats } from '@/types';

interface Props {
    stats: TaskStats;
    recentTasks: Task[];
    teams: Team[];
    projects: Project[];
    pendingInvitesCount: number;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

const statusColors: Record<string, string> = {
    Unplanned: 'bg-gray-100 text-gray-800',
    Pending: 'bg-yellow-100 text-yellow-800',
    'In-Progress': 'bg-blue-100 text-blue-800',
    Done: 'bg-green-100 text-green-800',
};

const _priorityColors: Record<string, string> = {
    Low: 'bg-gray-100 text-gray-600',
    Medium: 'bg-blue-100 text-blue-600',
    High: 'bg-orange-100 text-orange-600',
    Critical: 'bg-red-100 text-red-600',
};
void _priorityColors; // Reserved for future use

const defaultStats: TaskStats = {
    total: 0,
    completed: 0,
    in_progress: 0,
    pending: 0,
    overdue: 0,
};

export default function Dashboard({ stats = defaultStats, recentTasks = [], teams = [], projects = [], pendingInvitesCount = 0 }: Props) {
    const formatDate = (date: string | null) => {
        if (!date) return null;
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4">
                {/* Stats Grid */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
                            <ClipboardListIcon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total}</div>
                            <p className="text-xs text-muted-foreground">
                                {stats.in_progress} in progress
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Completed</CardTitle>
                            <CheckCircleIcon className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.completed}</div>
                            <p className="text-xs text-muted-foreground">
                                {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}% completion rate
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
                            <ClockIcon className="h-4 w-4 text-red-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-500">{stats.overdue}</div>
                            <p className="text-xs text-muted-foreground">
                                Needs attention
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Teams</CardTitle>
                            <UsersIcon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{teams.length}</div>
                            <p className="text-xs text-muted-foreground">
                                {pendingInvitesCount > 0 ? `${pendingInvitesCount} pending invite${pendingInvitesCount > 1 ? 's' : ''}` : 'Active teams'}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Recent Tasks */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>My Tasks</CardTitle>
                                <CardDescription>Your recently assigned tasks</CardDescription>
                            </div>
                            <Link href="/my-tasks">
                                <Button variant="outline" size="sm">View All</Button>
                            </Link>
                        </CardHeader>
                        <CardContent>
                            {recentTasks.length > 0 ? (
                                <div className="space-y-3">
                                    {recentTasks.map((task) => (
                                        <Link key={task.id} href={`/tasks/${task.id}`}>
                                            <div className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50">
                                                <div className="flex-1">
                                                    <h4 className="text-sm font-medium">{task.name}</h4>
                                                    <p className="text-xs text-muted-foreground">{task.project?.name}</p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {task.due_date && (
                                                        <span className="text-xs text-muted-foreground">
                                                            {formatDate(task.due_date)}
                                                        </span>
                                                    )}
                                                    <Badge className={statusColors[task.status]} variant="secondary">
                                                        {task.status}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-8 text-center">
                                    <ClipboardListIcon className="h-10 w-10 text-muted-foreground" />
                                    <p className="mt-2 text-sm text-muted-foreground">No tasks assigned to you</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Teams & Projects */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Teams & Projects</CardTitle>
                                <CardDescription>Your active teams and projects</CardDescription>
                            </div>
                            <Link href="/teams/create">
                                <Button size="sm">
                                    <PlusIcon className="mr-2 h-4 w-4" />
                                    New Team
                                </Button>
                            </Link>
                        </CardHeader>
                        <CardContent>
                            {teams.length > 0 ? (
                                <div className="space-y-4">
                                    {teams.slice(0, 3).map((team) => (
                                        <div key={team.id} className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <Link href={`/teams/${team.id}`}>
                                                    <div className="flex items-center gap-2 font-medium hover:underline">
                                                        <UsersIcon className="h-4 w-4" />
                                                        {team.name}
                                                    </div>
                                                </Link>
                                                <Link href={`/teams/${team.id}/dashboard`}>
                                                    <Button variant="ghost" size="icon" className="h-7 w-7">
                                                        <LayoutDashboardIcon className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                            </div>
                                            <div className="ml-6 space-y-1">
                                                {projects
                                                    .filter((p) => p.team_id === team.id)
                                                    .slice(0, 2)
                                                    .map((project) => (
                                                        <Link key={project.id} href={`/projects/${project.id}`}>
                                                            <div className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                                                                <FolderIcon className="h-3 w-3" />
                                                                {project.name}
                                                            </div>
                                                        </Link>
                                                    ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-8 text-center">
                                    <UsersIcon className="h-10 w-10 text-muted-foreground" />
                                    <p className="mt-2 text-sm text-muted-foreground">No teams yet</p>
                                    <Link href="/teams/create" className="mt-2">
                                        <Button variant="outline" size="sm">Create a Team</Button>
                                    </Link>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-3">
                            <Link href="/tasks/create">
                                <Button variant="outline">
                                    <PlusIcon className="mr-2 h-4 w-4" />
                                    New Task
                                </Button>
                            </Link>
                            <Link href="/projects/create">
                                <Button variant="outline">
                                    <FolderIcon className="mr-2 h-4 w-4" />
                                    New Project
                                </Button>
                            </Link>
                            <Link href="/teams/create">
                                <Button variant="outline">
                                    <UsersIcon className="mr-2 h-4 w-4" />
                                    New Team
                                </Button>
                            </Link>
                            {pendingInvitesCount > 0 && (
                                <Link href="/invites">
                                    <Button variant="default">
                                        View Invitations ({pendingInvitesCount})
                                    </Button>
                                </Link>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
