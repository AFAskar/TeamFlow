import { InertiaLinkProps } from '@inertiajs/react';
import { LucideIcon } from 'lucide-react';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: NonNullable<InertiaLinkProps['href']>;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    auth: Auth;
    sidebarOpen: boolean;
    [key: string]: unknown;
}

export interface User {
    id: string;
    username: string;
    email: string;
    role?: string;
    bio?: string;
    avatar_url?: string;
    email_verified_at: string | null;
    two_factor_enabled?: boolean;
    created_at: string;
    updated_at: string;
    pivot?: {
        team_role?: string;
        role?: string;
    };
    [key: string]: unknown;
}

export interface Team {
    id: string;
    name: string;
    description?: string;
    creator?: User;
    members?: User[];
    labels?: Label[];
    members_count?: number;
    projects_count?: number;
    created_at: string;
    updated_at: string;
}

export interface Project {
    id: string;
    name: string;
    description?: string;
    team?: Team;
    creator?: User;
    members?: User[];
    members_count?: number;
    tasks_count?: number;
    created_at: string;
    updated_at: string;
    deleted_at?: string;
}

export interface Task {
    id: string;
    name: string;
    description?: string;
    status?: TaskStatus;
    priority?: PriorityLevel;
    due_date?: string;
    position: number;
    project?: Project;
    creator?: User;
    assignee?: User;
    parent?: Task;
    subtasks?: Task[];
    subtasks_count?: number;
    labels?: Label[];
    comments?: TaskComment[];
    comments_count?: number;
    attachments?: TaskAttachment[];
    attachments_count?: number;
    created_at: string;
    updated_at: string;
}

export interface Label {
    id: string;
    name: string;
    description?: string;
    team?: Team;
    creator?: User;
    created_at: string;
    updated_at: string;
}

export interface TaskComment {
    id: string;
    comment: string;
    task?: Task;
    creator?: User;
    reply_to?: TaskComment;
    replies?: TaskComment[];
    created_at: string;
    updated_at: string;
}

export interface TaskAttachment {
    id: string;
    task_id: string;
    filename: string;
    original_filename: string;
    mime_type: string;
    size: number;
    formatted_size: string;
    url: string;
    is_image: boolean;
    user?: User;
    created_at: string;
}

export interface TeamInvite {
    id: string;
    invitee_email?: string;
    status?: string;
    expiry?: string;
    usage_limit?: number;
    used_count?: number;
    team?: Team;
    creator?: User;
    created_at: string;
    updated_at: string;
}

export type TaskStatus = 'Done' | 'Unplanned' | 'Pending' | 'In-Progress';
export type PriorityLevel = 'Low' | 'Medium' | 'High' | 'Critical';
export type TeamRole = 'Owner' | 'Admin' | 'Member';
export type ProjectRole = 'Lead' | 'TechnicalLead' | 'Member';

export interface PaginatedData<T> {
    data: T[];
    links: {
        first: string;
        last: string;
        prev: string | null;
        next: string | null;
    };
    meta: {
        current_page: number;
        from: number;
        last_page: number;
        path: string;
        per_page: number;
        to: number;
        total: number;
    };
}

export interface TaskStats {
    total: number;
    completed: number;
    in_progress: number;
    overdue?: number;
    my_assigned?: number;
    pending?: number;
}

export interface ActivityItem {
    id: string;
    action: string;
    entity_type: string;
    entity_id: string;
    user?: {
        id: string;
        username: string;
        avatar?: string;
    };
    done_at: string;
}
