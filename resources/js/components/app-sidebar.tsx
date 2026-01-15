import { Link, usePage } from '@inertiajs/react';
import { BookOpen, ChevronRight, Folder, FolderOpen, LayoutDashboard, LayoutGrid, Users } from 'lucide-react';

import { NavFooter } from '@/components/nav-footer';
import { NavUser } from '@/components/nav-user';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { useActiveUrl } from '@/hooks/use-active-url';
import { dashboard } from '@/routes';
import { type NavItem, type SharedData } from '@/types';

import AppLogo from './app-logo';

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: Folder,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    const { sidebarTeams, sidebarProjects } = usePage<SharedData>().props;
    const { urlIsActive } = useActiveUrl();

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                {/* Main Dashboard */}
                <SidebarGroup className="px-2 py-0">
                    <SidebarGroupLabel>Platform</SidebarGroupLabel>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton
                                asChild
                                isActive={urlIsActive('/dashboard')}
                                tooltip={{ children: 'My Dashboard' }}
                            >
                                <Link href="/dashboard" prefetch>
                                    <LayoutGrid />
                                    <span>My Dashboard</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarGroup>

                {/* Team Dashboards */}
                {sidebarTeams && sidebarTeams.length > 0 && (
                    <SidebarGroup className="px-2 py-0">
                        <SidebarGroupLabel>Teams</SidebarGroupLabel>
                        <SidebarMenu>
                            {sidebarTeams.map((team) => (
                                <Collapsible key={team.id} asChild defaultOpen={false} className="group/collapsible">
                                    <SidebarMenuItem>
                                        <CollapsibleTrigger asChild>
                                            <SidebarMenuButton tooltip={{ children: team.name }}>
                                                <Users className="shrink-0" />
                                                <span className="truncate">{team.name}</span>
                                                <ChevronRight className="ml-auto shrink-0 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                            </SidebarMenuButton>
                                        </CollapsibleTrigger>
                                        <CollapsibleContent>
                                            <SidebarMenuSub>
                                                <SidebarMenuSubItem>
                                                    <SidebarMenuSubButton
                                                        asChild
                                                        isActive={urlIsActive(`/teams/${team.id}/dashboard`)}
                                                    >
                                                        <Link href={`/teams/${team.id}/dashboard`} prefetch>
                                                            <LayoutDashboard className="h-4 w-4" />
                                                            <span>Dashboard</span>
                                                        </Link>
                                                    </SidebarMenuSubButton>
                                                </SidebarMenuSubItem>
                                                <SidebarMenuSubItem>
                                                    <SidebarMenuSubButton
                                                        asChild
                                                        isActive={urlIsActive(`/teams/${team.id}`)}
                                                    >
                                                        <Link href={`/teams/${team.id}`} prefetch>
                                                            <Users className="h-4 w-4" />
                                                            <span>Team View</span>
                                                        </Link>
                                                    </SidebarMenuSubButton>
                                                </SidebarMenuSubItem>
                                            </SidebarMenuSub>
                                        </CollapsibleContent>
                                    </SidebarMenuItem>
                                </Collapsible>
                            ))}
                        </SidebarMenu>
                    </SidebarGroup>
                )}

                {/* Project Dashboards */}
                {sidebarProjects && sidebarProjects.length > 0 && (
                    <SidebarGroup className="px-2 py-0">
                        <SidebarGroupLabel>Projects</SidebarGroupLabel>
                        <SidebarMenu>
                            {sidebarProjects.map((project) => (
                                <Collapsible key={project.id} asChild defaultOpen={false} className="group/collapsible">
                                    <SidebarMenuItem>
                                        <CollapsibleTrigger asChild>
                                            <SidebarMenuButton tooltip={{ children: project.name }}>
                                                <FolderOpen className="shrink-0" />
                                                <span className="truncate">{project.name}</span>
                                                <ChevronRight className="ml-auto shrink-0 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                            </SidebarMenuButton>
                                        </CollapsibleTrigger>
                                        <CollapsibleContent>
                                            <SidebarMenuSub>
                                                <SidebarMenuSubItem>
                                                    <SidebarMenuSubButton
                                                        asChild
                                                        isActive={urlIsActive(`/projects/${project.id}/dashboard`)}
                                                    >
                                                        <Link href={`/projects/${project.id}/dashboard`} prefetch>
                                                            <LayoutDashboard className="h-4 w-4" />
                                                            <span>Dashboard</span>
                                                        </Link>
                                                    </SidebarMenuSubButton>
                                                </SidebarMenuSubItem>
                                                <SidebarMenuSubItem>
                                                    <SidebarMenuSubButton
                                                        asChild
                                                        isActive={urlIsActive(`/projects/${project.id}`)}
                                                    >
                                                        <Link href={`/projects/${project.id}`} prefetch>
                                                            <FolderOpen className="h-4 w-4" />
                                                            <span>Project View</span>
                                                        </Link>
                                                    </SidebarMenuSubButton>
                                                </SidebarMenuSubItem>
                                                <SidebarMenuSubItem>
                                                    <SidebarMenuSubButton
                                                        asChild
                                                        isActive={urlIsActive(`/projects/${project.id}/kanban`)}
                                                    >
                                                        <Link href={`/projects/${project.id}/kanban`} prefetch>
                                                            <LayoutGrid className="h-4 w-4" />
                                                            <span>Kanban Board</span>
                                                        </Link>
                                                    </SidebarMenuSubButton>
                                                </SidebarMenuSubItem>
                                            </SidebarMenuSub>
                                        </CollapsibleContent>
                                    </SidebarMenuItem>
                                </Collapsible>
                            ))}
                        </SidebarMenu>
                    </SidebarGroup>
                )}
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
