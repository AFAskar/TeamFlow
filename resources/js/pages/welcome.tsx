import { Head, Link, usePage } from '@inertiajs/react';
import { CheckCircleIcon, ClipboardListIcon, FolderKanbanIcon, UsersIcon, ZapIcon, ShieldCheckIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { type SharedData } from '@/types';

export default function Welcome({ canRegister = true }: { canRegister?: boolean }) {
    const { auth } = usePage<SharedData>().props;

    const features = [
        {
            icon: UsersIcon,
            title: 'Team Collaboration',
            description: 'Create teams, invite members, and assign roles. Keep everyone aligned and working together efficiently.',
        },
        {
            icon: FolderKanbanIcon,
            title: 'Kanban Boards',
            description: 'Visualize your workflow with drag-and-drop Kanban boards. Move tasks through stages effortlessly.',
        },
        {
            icon: ClipboardListIcon,
            title: 'Task Management',
            description: 'Create, assign, and track tasks with priorities, due dates, labels, and comments.',
        },
        {
            icon: ZapIcon,
            title: 'Real-time Updates',
            description: 'Stay in sync with your team. See changes as they happen across all your projects.',
        },
        {
            icon: ShieldCheckIcon,
            title: 'Role-based Access',
            description: 'Control who can do what with granular permissions for teams and projects.',
        },
        {
            icon: CheckCircleIcon,
            title: 'Progress Tracking',
            description: 'Monitor task completion, view analytics, and track your team\'s productivity over time.',
        },
    ];

    return (
        <>
            <Head title="TeamFlow - Team Project Management">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=inter:400,500,600,700" rel="stylesheet" />
            </Head>

            <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
                {/* Navigation */}
                <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-950/80">
                    <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
                        <div className="flex items-center gap-2">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
                                <ClipboardListIcon className="h-5 w-5 text-white" />
                            </div>
                            <span className="text-xl font-bold text-slate-900 dark:text-white">TeamFlow</span>
                        </div>
                        <nav className="flex items-center gap-3">
                            {auth.user ? (
                                <Link href="/dashboard">
                                    <Button>Go to Dashboard</Button>
                                </Link>
                            ) : (
                                <>
                                    <Link href="/login">
                                        <Button variant="ghost">Log in</Button>
                                    </Link>
                                    {canRegister && (
                                        <Link href="/register">
                                            <Button>Get Started</Button>
                                        </Link>
                                    )}
                                </>
                            )}
                        </nav>
                    </div>
                </header>

                {/* Hero Section */}
                <section className="relative overflow-hidden px-4 py-20 sm:px-6 lg:px-8 lg:py-32">
                    <div className="absolute inset-0 -z-10">
                        <div className="absolute left-1/2 top-0 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-gradient-to-br from-indigo-400/30 to-purple-400/30 blur-3xl" />
                    </div>
                    <div className="mx-auto max-w-4xl text-center">
                        <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl dark:text-white">
                            Manage projects with your team,{' '}
                            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                effortlessly
                            </span>
                        </h1>
                        <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600 dark:text-slate-400">
                            TeamFlow brings your team together with powerful project management tools. 
                            Create teams, organize projects, track tasks, and ship faster than ever.
                        </p>
                        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                            {auth.user ? (
                                <Link href="/dashboard">
                                    <Button size="lg" className="px-8">
                                        Go to Dashboard
                                    </Button>
                                </Link>
                            ) : (
                                <>
                                    <Link href="/register">
                                        <Button size="lg" className="px-8">
                                            Start for Free
                                        </Button>
                                    </Link>
                                    <Link href="/login">
                                        <Button variant="outline" size="lg" className="px-8">
                                            Sign In
                                        </Button>
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </section>

                {/* Features Grid */}
                <section className="px-4 py-20 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-7xl">
                        <div className="text-center">
                            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
                                Everything you need to manage projects
                            </h2>
                            <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600 dark:text-slate-400">
                                Built for teams who want to ship quality work, on time, every time.
                            </p>
                        </div>
                        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                            {features.map((feature, index) => (
                                <div
                                    key={index}
                                    className="group relative rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition-all hover:border-indigo-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-700"
                                >
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg transition-transform group-hover:scale-110">
                                        <feature.icon className="h-6 w-6 text-white" />
                                    </div>
                                    <h3 className="mt-6 text-lg font-semibold text-slate-900 dark:text-white">
                                        {feature.title}
                                    </h3>
                                    <p className="mt-2 text-slate-600 dark:text-slate-400">
                                        {feature.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="px-4 py-20 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-4xl">
                        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 to-purple-700 px-8 py-16 text-center shadow-2xl sm:px-16">
                            <div className="absolute inset-0 -z-10">
                                <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                                <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                            </div>
                            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                                Ready to boost your team's productivity?
                            </h2>
                            <p className="mx-auto mt-4 max-w-xl text-lg text-indigo-100">
                                Join thousands of teams already using TeamFlow to manage their projects and deliver results.
                            </p>
                            <div className="mt-8">
                                {auth.user ? (
                                    <Link href="/dashboard">
                                        <Button size="lg" variant="secondary" className="px-8">
                                            Go to Dashboard
                                        </Button>
                                    </Link>
                                ) : (
                                    <Link href="/register">
                                        <Button size="lg" variant="secondary" className="px-8">
                                            Get Started — It's Free
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="border-t border-slate-200 bg-white px-4 py-12 dark:border-slate-800 dark:bg-slate-950">
                    <div className="mx-auto max-w-7xl">
                        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
                            <div className="flex items-center gap-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
                                    <ClipboardListIcon className="h-4 w-4 text-white" />
                                </div>
                                <span className="font-semibold text-slate-900 dark:text-white">TeamFlow</span>
                            </div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                © {new Date().getFullYear()} TeamFlow. Built with Laravel & React.
                            </p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
