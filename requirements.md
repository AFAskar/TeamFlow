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

### Database Schema (Minimum 8 Tables)

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

#### DBML

Here is the DBML

```dbml
// Use DBML to define your database structure
// Docs: https://dbml.dbdiagram.io/docs

enum roles{
  "Admin" // can promote and demote users
  "Manager" // can create teams and remove users from the team
  "Member" // can join teams
}

enum team_roles{
  "Owner" // who created the team
  "Admin" // who can invite and remove people from the team
  "Member" // no extra permissions
}

enum project_roles{
  "Lead"
  "Technical Lead"
  "Member"
}
enum invite_status {
  "pending"
  "accepted"
  "declined"
}

enum priority_level{
  "Critical"
  "High"
  "Medium"
  "Low"
}

enum task_status{
  "Done"
  "Unplanned"
  "Pending"
  "In-Progress"


}

Table user_teams {
  id uuid [primary key]
  user_id uuid [ref: >users.id]
  team_id uuid [ref: >teams.id]
  team_role team_roles
  created_at timestamp
  updated_at timestamp
  deleted_at timestamp

  Indexes {
  (user_id, team_id) [unique]
  }
}

Table project_members{
  id uuid [primary key]
  project_id uuid [ref:> projects.id]
  user_id uuid [ref:> users.id]
  role project_roles
  created_at timestamp
  updated_at timestamp
  deleted_at timestamp
  Indexes {
    (project_id, user_id) [unique]
  }

}

Table task_attachments{
  id uuid [primary key]
  user_id uuid [ref:>users.id]
  task_id uuid [ref:>tasks.id]
  s3_uri varchar
}
Table team_invites{
  id uuid [primary key]
  team_id uuid [ref:>teams.id]
  invitee_email varchar // could be null if they used URLs instead of email
  expiry timestamp
  status invite_status
  usage_limit integer
  used_count integer
  created_at timestamp
  updated_at timestamp
  deleted_at timestamp

  created_by uuid [ref:>users.id]

}

Table tasks{
  id uuid [primary key]
  name varchar
  project_id uuid [ref:> projects.id]
  description varchar
  status task_status
  priority priority_level
  due_date timestamp
  position integer
  parent_id uuid [ref:>tasks.id]
  created_by uuid [ref: >users.id]
  assigned_to uuid [ref: >users.id]
  created_at timestamp
  updated_at timestamp
  deleted_at timestamp

}

Table task_comments{
  id uuid [primary key]
  task_id uuid [ref:>tasks.id]
  comment varchar
  reply_to uuid [ref:> task_comments.id]
  created_at timestamp
  created_by uuid [ref:>users.id]
  updated_at timestamp
  deleted_at timestamp

}

Table labels{
  id uuid [primary key]
  team_id uuid [ref:>teams.id]

  name varchar
  description varchar
  created_at timestamp
  created_by uuid [ref: >users.id]
  updated_at timestamp
  deleted_at timestamp

}

Table task_labels{
  id uuid [primary key]
  task_id uuid [ref:>tasks.id]
  label_id uuid [ref:> labels.id]
  created_at timestamp
  updated_at timestamp
  deleted_at timestamp

}

Table projects{
  id uuid [primary key]
  team_id uuid [ref:>teams.id]
  name varchar
  description varchar
  created_at timestamp
  created_by uuid [ref:> users.id]
  updated_at timestamp
  deleted_at timestamp

}

Table users {
  id uuid [primary key]
  username varchar
  role roles
  email varchar [unique]
  email_verified_at timestamp
  password varchar
  remember_token varchar
  bio varchar
  avatar_token_url varchar
  created_at timestamp
  updated_at timestamp
  deleted_at timestamp

}

Table teams{
  id uuid [primary key]
  name varchar
  description varchar
  created_at timestamp
  created_by uuid [ref:> users.id]
  updated_at timestamp
  deleted_at timestamp

}

Table audit_log{
  id uuid [primary key]
  action varchar
  entity_type varchar
  entity_id uuid
  old_values json
  new_values json
  done_by uuid [ref:> users.id]
  done_at timestamp
}
```

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

- API documentation (Swagger/OpenAPI or similar)

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

4. **API Documentation** - Postman collection or Swagger docs

5. **Demo** - Brief video walkthrough or deployed demo (optional)

## Notes for Candidates

- Focus on code quality over feature quantity

- Write meaningful commit messages

- Include a .env.example file

- Seed the database with realistic sample data

- Handle edge cases and error scenarios gracefully

- Feel free to use UI component libraries (Tailwind CSS, shadcn/ui,
  etc.)

Good luck! We're looking for clean, maintainable code that demonstrates your full-stack capabilities.
