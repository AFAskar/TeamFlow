import { Head, Link } from '@inertiajs/react';
import { Plus, Users } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, PaginatedData, Team } from '@/types';

interface Props {
    teams: PaginatedData<Team>;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Teams', href: '/teams' },
];

export default function TeamsIndex({ teams }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Teams" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">My Teams</h1>
                        <p className="text-muted-foreground">Manage your teams and collaborate with others</p>
                    </div>
                    <Button asChild>
                        <Link href="/teams/create">
                            <Plus className="mr-2 h-4 w-4" />
                            Create Team
                        </Link>
                    </Button>
                </div>

                {teams.data.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <Users className="text-muted-foreground mb-4 h-12 w-12" />
                            <h3 className="mb-2 text-lg font-semibold">No teams yet</h3>
                            <p className="text-muted-foreground mb-4">Create your first team to start collaborating</p>
                            <Button asChild>
                                <Link href="/teams/create">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Create Team
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {teams.data.map((team) => (
                            <Link key={team.id} href={`/teams/${team.id}`}>
                                <Card className="transition-shadow hover:shadow-md">
                                    <CardHeader>
                                        <CardTitle>{team.name}</CardTitle>
                                        <CardDescription>{team.description || 'No description'}</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex gap-4 text-sm text-muted-foreground">
                                            <span>{team.members_count} members</span>
                                            <span>{team.projects_count} projects</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                )}

                {teams.meta.last_page > 1 && (
                    <div className="flex justify-center gap-2">
                        {teams.links.prev && (
                            <Button variant="outline" asChild>
                                <Link href={teams.links.prev}>Previous</Link>
                            </Button>
                        )}
                        {teams.links.next && (
                            <Button variant="outline" asChild>
                                <Link href={teams.links.next}>Next</Link>
                            </Button>
                        )}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
