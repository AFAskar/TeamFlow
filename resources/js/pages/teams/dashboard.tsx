import { Head, Link } from '@inertiajs/react';
import { CheckCircleIcon, ClipboardListIcon, ClockIcon, FolderIcon, PlusIcon, UsersIcon, SettingsIcon } from 'lucide-react';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, Task, Team, Project, TaskStats, User } from '@/types';

interface Props {
    team: Team & {
        members: User[];
    };
    stats: TaskStats;
    recentTasks: Task[];
    projects: Project[];
    memberStats: {
        user: User;
        task_count: number;
    }[];
}

export default function TeamDashboard({ team, stats, recentTasks, projects, memberStats }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Teams', href: '/teams' },
        { title: team.name, href: `/teams/${team.id}` },
        { title: 'Dashboard', href: `/teams/${team.id}/dashboard` },
    ];

    const statusColors: Record<string, string> = {
        Unplanned: 'bg-gray-100 text-gray-800',
        Pending: 'bg-yellow-100 text-yellow-800',
        'In-Progress': 'bg-blue-100 text-blue-800',
        Done: 'bg-green-100 text-green-800',
    };

    const formatDate = (date: string | null) => {
        if (!date) return null;
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${team.name} Dashboard`} />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">{team.name}</h1>
                        <p className="text-muted-foreground">{team.description || 'Team dashboard'}</p>
                    </div>
                    <div className="flex gap-2">
                        <Link href={`/teams/${team.id}`}>
                            <Button variant="outline">
                                <SettingsIcon className="mr-2 h-4 w-4" />
                                Manage Team
                            </Button>
                        </Link>
                    </div>
                </div>

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
                            <CardTitle className="text-sm font-medium">Projects</CardTitle>
                            <FolderIcon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{projects.length}</div>
                            <p className="text-xs text-muted-foreground">
                                Active projects
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Recent Tasks */}
                    <Card className="lg:col-span-2">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Recent Tasks</CardTitle>
                                <CardDescription>Latest tasks across all projects</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {recentTasks.length > 0 ? (
                                <div className="space-y-3">
                                    {recentTasks.map((task) => (
                                        <Link key={task.id} href={`/tasks/${task.id}`}>
                                            <div className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50">
                                                <div className="flex-1">
                                                    <h4 className="text-sm font-medium">{task.name}</h4>
                                                    <p className="text-xs text-muted-foreground">
                                                        {task.project?.name}
                                                        {task.assignee && ` • ${task.assignee.username}`}
                                                    </p>
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
                                    <p className="mt-2 text-sm text-muted-foreground">No tasks yet</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Team Members */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Team Members</CardTitle>
                                <CardDescription>{team.members?.length || 0} members</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {memberStats.map(({ user, task_count }) => (
                                    <div key={user.id} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Avatar className="h-8 w-8">
                                                <AvatarFallback>{user.username?.charAt(0).toUpperCase()}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="text-sm font-medium">{user.username}</p>
                                            </div>
                                        </div>
                                        <Badge variant="secondary">{task_count} tasks</Badge>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Projects */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Projects</CardTitle>
                            <CardDescription>All projects in this team</CardDescription>
                        </div>
                        <Link href={`/projects/create?team_id=${team.id}`}>
                            <Button size="sm">
                                <PlusIcon className="mr-2 h-4 w-4" />
                                New Project
                            </Button>
                        </Link>
                    </CardHeader>
                    <CardContent>
                        {projects.length > 0 ? (
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {projects.map((project) => (
                                    <Link key={project.id} href={`/projects/${project.id}`}>
                                        <div className="rounded-lg border p-4 transition-colors hover:bg-muted/50">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <h4 className="font-medium">{project.name}</h4>
                                                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                                                        {project.description || 'No description'}
                                                    </p>
                                                </div>
                                                <FolderIcon className="h-5 w-5 text-muted-foreground" />
                                            </div>
                                            <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                                                <span>{project.tasks_count || 0} tasks</span>
                                                <span>{project.members_count || 0} members</span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-8 text-center">
                                <FolderIcon className="h-10 w-10 text-muted-foreground" />
                                <p className="mt-2 text-sm text-muted-foreground">No projects yet</p>
                                <Link href={`/projects/create?team_id=${team.id}`} className="mt-2">
                                    <Button variant="outline" size="sm">Create a Project</Button>
                                </Link>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
