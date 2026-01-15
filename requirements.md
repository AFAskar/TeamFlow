# Full-Stack Developer Assessment Task

TeamFlow - Team Project Management System

## Overview

Build a comprehensive team collaboration and project management platform
where users can create teams, manage projects, assign tasks, and track
progress. This assessment evaluates full-stack development skills
including database design, API development, authentication, real-time
features, and modern frontend implementation.

**Important Note:** Preferred Backend: Laravel (PHP 8.2+) Preferred
Frontend: React.js, Vue.js, or Svelte.js (candidate's choice) Timeline:
Up to 2 weeks

Technical Requirements
Backend : Laravel (PHP 8.2+)

Frontend:React.js, Vue.js, or Svelte.js

Database:MySQL, sqlite or PostgreSQL

Authentication:Laravel Sanctum or Passport

Additional: Redis (optional for caching/queues)

### Database Schema

users: User accounts with roles (admin, manager, member)
teams: Team/organization information
team_members: Pivot table for user-team relationships with roles
projects: Projects belonging to teams
tasks: Tasks within projects with status, priority, due dates
task_comments: Comments/discussions on tasks
task_attachments: File attachments for tasks
activity_logs: Audit trail of all actions
invitations: Team invitations (pending/accepted/declined)
labels Custom: labels for task categorization
task_labels: Pivot table for task-label relationships

[dbml](./schema.sql)

## Core Features

1. Authentication & User Management

- User registration and login

- Password reset functionality

- Profile management (avatar upload, bio, settings)

- Email verification

2. Team Management

- Create, edit, and delete teams

- Invite members via email

- Role-based permissions within teams (Owner, Admin, Member)

- Leave team functionality

- Transfer ownership

3. Project Management

- Create projects within teams

- Project dashboard with statistics

- Archive/restore projects

- Project-level member assignments

4. Task Management

- Full CRUD for tasks

- Task properties: title, description, status, priority, due date,
  assignee

- Drag-and-drop Kanban board view

- List view with filtering and sorting

- Task status workflow: Todo → In Progress → Review → Done

- Subtasks support

- Labels/tags system

- File attachments (images, documents)

- Comment threads on tasks

- Task history/activity timeline

5. Dashboard & Analytics

- Personal dashboard showing assigned tasks

- Team dashboard with project overview

- Charts showing task completion rates, overdue tasks, team productivity

- Recent activity feed

6. Search & Filtering

- Global search across projects and tasks

- Advanced filtering (by status, priority, assignee, date range, labels)

- Sorting options

## API Requirements

Build a RESTful API with the following standards:

- Consistent response format with proper HTTP status codes

- Request validation with meaningful error messages

- API resource transformers (Laravel Resources)

- Pagination for list endpoints

- Rate limiting

- API documentation (OpenAPI)

## Frontend Requirements

### UI/UX

- Responsive design (mobile, tablet, desktop)

- Clean, modern interface

- Loading states and skeleton screens

- Toast notifications for actions

- Confirmation modals for destructive actions

- Form validation with inline error messages

### State Management

- Proper state management solution (Pinia/Vuex, Redux/Zustand, Svelte
  stores)

- Optimistic updates where appropriate

- Error handling and retry mechanisms

### Components

- Reusable component architecture

- Kanban board with drag-and-drop

- Data tables with sorting/filtering/pagination

- Modal dialogs

- Dropdown menus

- Date pickers

- File upload with preview

- Rich text editor for task descriptions

## Evaluation Criteria

| Category                | Weight | Assessment Points                                              |
| ----------------------- | ------ | -------------------------------------------------------------- |
| Database Design         | 15%    | Proper normalization, relationships, indexes, migrations       |
| Backend Architecture    | 20%    | Clean code, SOLID principles, proper Laravel patterns          |
| API Design              | 15%    | RESTful conventions, validation, error handling, documentation |
| Frontend Implementation | 20%    | Component structure, state management, responsiveness          |
| Code Quality            | 15%    | Readability, comments, consistent style, type safety           |
| Testing                 | 10%    | Unit tests, feature tests, test coverage                       |
| Documentation           | 5%     | README, setup instructions, API docs                           |

### Bonus Features (Optional)

- Real-time updates using Laravel WebSockets/Pusher

- Email notifications for task assignments and mentions

- Dark mode toggle

- Export tasks to CSV/PDF

- Recurring tasks

- Time tracking on tasks

- Integration with external services (Slack notifications)

- Docker setup for development environment

## Deliverables

1. **Source Code** - Git repository with clear commit history

2. **Database** - Migrations and seeders with sample data

3. **Documentation** - README with setup instructions

4. **API Documentation** - Scalar

5. **Demo** - Brief video walkthrough or deployed demo (optional)

## Notes for Candidates

- Focus on code quality over feature quantity

- Write meaningful commit messages

- Include a .env.example file

- Seed the database with realistic sample data

- Handle edge cases and error scenarios gracefully

- use UI component libraries (Tailwind CSS, shadcn/ui,etc.)

Good luck! We're looking for clean, maintainable code that demonstrates your full-stack capabilities.

Complete the Missing Requirements

```md
## Missing/Incomplete Items

- Rich Text Editor - Task descriptions are plain text
- Rate Limiting - Not configured in routes
- Feature Tests - Only auth tests, no controller tests
- Global Search - Only page-level search
- Date Range Filtering - Not implemented
```
