import { Head, Link } from '@inertiajs/react';
import { FolderOpen, Plus, Users } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, PaginatedData, Project } from '@/types';

interface Props {
    projects: PaginatedData<Project>;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Projects', href: '/projects' },
];

export default function ProjectsIndex({ projects }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Projects" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">My Projects</h1>
                        <p className="text-muted-foreground">Manage your projects and tasks</p>
                    </div>
                    <Button asChild>
                        <Link href="/projects/create">
                            <Plus className="mr-2 h-4 w-4" />
                            New Project
                        </Link>
                    </Button>
                </div>

                {projects.data.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <FolderOpen className="mb-4 h-12 w-12 text-muted-foreground" />
                            <h3 className="mb-2 text-lg font-semibold">No projects yet</h3>
                            <p className="mb-4 text-muted-foreground">Create your first project to start tracking tasks</p>
                            <Button asChild>
                                <Link href="/projects/create">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Create Project
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {projects.data.map((project) => (
                            <Link key={project.id} href={`/projects/${project.id}`}>
                                <Card className="h-full transition-shadow hover:shadow-md">
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <CardTitle className="text-lg">{project.name}</CardTitle>
                                                <CardDescription className="line-clamp-2">
                                                    {project.description || 'No description'}
                                                </CardDescription>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex flex-wrap gap-2">
                                            <Badge variant="secondary">
                                                <FolderOpen className="mr-1 h-3 w-3" />
                                                {project.tasks_count || 0} tasks
                                            </Badge>
                                            <Badge variant="outline">
                                                <Users className="mr-1 h-3 w-3" />
                                                {project.members_count || 0} members
                                            </Badge>
                                        </div>
                                        {project.team && (
                                            <p className="mt-2 text-sm text-muted-foreground">
                                                Team: {project.team.name}
                                            </p>
                                        )}
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                )}

                {projects.meta.last_page > 1 && (
                    <div className="flex justify-center gap-2">
                        {projects.links.prev && (
                            <Button variant="outline" asChild>
                                <Link href={projects.links.prev}>Previous</Link>
                            </Button>
                        )}
                        {projects.links.next && (
                            <Button variant="outline" asChild>
                                <Link href={projects.links.next}>Next</Link>
                            </Button>
                        )}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
