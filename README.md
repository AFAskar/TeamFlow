# TeamFlow - Team Project Management System

<p align="center">
  <img src="public/favicon.svg" alt="TeamFlow Logo" width="80" height="80">
</p>

<p align="center">
  A modern, full-featured team collaboration and project management platform built with Laravel 12 and React.
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#installation">Installation</a> •
  <a href="#usage">Usage</a> •
  <a href="#api-reference">API</a> •
  <a href="#testing">Testing</a>
</p>

---

## 🚀 Features

### Authentication & Security

- **User Registration & Login** - Secure authentication with Laravel Fortify
- **Two-Factor Authentication (2FA)** - Optional TOTP-based 2FA for enhanced security
- **Password Reset** - Email-based password recovery
- **Email Verification** - Verify user email addresses
- **Role-Based Access Control** - Admin, Manager, and Member roles

### Team Management

- **Create & Manage Teams** - Organize users into collaborative teams
- **Team Roles** - Owner, Admin, and Member roles with different permissions
- **Team Invitations** - Invite users via email with expiring invitation links
- **Member Management** - Add, remove, and update member roles
- **Team Dashboard** - Overview of team activity and statistics

### Project Management

- **Project CRUD** - Create, read, update, and delete projects
- **Project Members** - Assign team members to specific projects
- **Project Roles** - Lead, Technical Lead, and Member roles
- **Soft Deletes** - Recover accidentally deleted projects
- **Kanban Board** - Visual task management with drag-and-drop

### Task Management

- **Task CRUD** - Full task lifecycle management
- **Task Status Workflow** - Unplanned → Pending → In-Progress → Done
- **Priority Levels** - Low, Medium, High, and Critical priorities
- **Task Assignment** - Assign tasks to project members
- **Due Dates** - Set and track task deadlines
- **Labels** - Categorize tasks with colored labels
- **Comments** - Threaded discussions on tasks
- **Subtasks** - Break down tasks into smaller items
- **My Tasks View** - Personal task dashboard

### Dashboard & Analytics

- **Personal Dashboard** - Overview of assigned tasks and team activity
- **Team Dashboard** - Team-wide statistics and recent activity
- **Task Statistics** - Track completion rates, overdue tasks, and progress
- **Activity Feed** - Recent actions across teams and projects

### Additional Features

- **Audit Logging** - Track all user actions for accountability
- **Search & Filtering** - Find tasks by status, priority, assignee, or text
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Dark Mode** - Toggle between light and dark themes
- **Real-time Updates** - Inertia.js powered SPA experience

---

## 🛠 Tech Stack

### Backend

| Technology        | Version | Purpose                     |
| ----------------- | ------- | --------------------------- |
| PHP               | 8.4     | Server-side language        |
| Laravel           | 12.x    | PHP Framework               |
| Laravel Fortify   | 1.x     | Authentication backend      |
| Laravel Wayfinder | 0.x     | TypeScript route generation |
| SQLite            | 3.x     | Database (configurable)     |

### Frontend

| Technology   | Version | Purpose              |
| ------------ | ------- | -------------------- |
| React        | 19.x    | UI Library           |
| TypeScript   | 5.x     | Type-safe JavaScript |
| Inertia.js   | 2.x     | SPA without API      |
| Tailwind CSS | 4.x     | Utility-first CSS    |
| shadcn/ui    | Latest  | UI Component Library |
| Lucide React | Latest  | Icon Library         |

### Development Tools

| Tool         | Purpose                       |
| ------------ | ----------------------------- |
| Vite         | Frontend build tool           |
| Pest         | PHP Testing Framework         |
| Laravel Pint | PHP Code Style Fixer          |
| ESLint       | JavaScript/TypeScript Linting |
| pnpm         | Package Manager               |

---

## 📦 Installation

### Prerequisites

- PHP 8.4 or higher
- Composer 2.x
- Node.js 20.x or higher
- pnpm (recommended) or npm

### Step 1: Clone the Repository

```bash
git clone https://github.com/AFAskar/TeamFlow.git
cd TeamFlow
```

### Step 2: Install PHP Dependencies

```bash
composer install
```

### Step 3: Install JavaScript Dependencies

```bash
pnpm install
```

### Step 4: Environment Setup

```bash
cp .env.example .env
php artisan key:generate
```

### Step 5: Database Setup

The application uses SQLite by default. Create the database file:

```bash
touch database/database.sqlite
```

Run migrations and seed the database:

```bash
php artisan migrate --seed
```

### Step 6: Build Frontend Assets

For development:

```bash
pnpm dev
```

For production:

```bash
pnpm build
```

### Step 7: Start the Development Server

```bash
php artisan serve
```

Visit `http://localhost:8000` in your browser.

---

## 🔐 Default Credentials

After seeding the database, you can log in with these accounts:

| Role    | Email               | Password |
| ------- | ------------------- | -------- |
| Admin   | admin@example.com   | password |
| Manager | manager@example.com | password |

---

## 📖 Usage

### Creating a Team

1. Log in to your account
2. Navigate to **Teams** from the sidebar
3. Click **Create Team**
4. Enter a team name and description
5. Click **Create Team**

### Inviting Team Members

1. Go to your team's page
2. Click **Invite Member**
3. Enter the email address and select a role
4. The invited user will receive an invitation

### Creating a Project

1. Navigate to **Projects**
2. Click **Create Project**
3. Select the team for the project
4. Enter project details
5. Add project members

### Managing Tasks

1. Open a project
2. Click **Create Task** or use the Kanban board
3. Fill in task details (name, description, status, priority, due date)
4. Assign to a team member
5. Add labels for categorization

### Using the Kanban Board

1. Open a project and click **Kanban**
2. Drag tasks between columns to update status
3. Click on a task to view details or edit

---

## 🗂 Project Structure

```
TeamFlow/
├── app/
│   ├── Actions/Fortify/       # Fortify authentication actions
│   ├── Concerns/              # Shared traits
│   ├── Enums/                 # PHP Enums (Role, Status, Priority)
│   ├── Http/
│   │   ├── Controllers/       # Application controllers
│   │   ├── Middleware/        # HTTP middleware
│   │   └── Requests/          # Form request validation
│   ├── Models/                # Eloquent models
│   └── Providers/             # Service providers
├── database/
│   ├── factories/             # Model factories for testing
│   ├── migrations/            # Database migrations
│   └── seeders/               # Database seeders
├── resources/
│   └── js/
│       ├── components/        # React components
│       │   └── ui/            # shadcn/ui components
│       ├── layouts/           # Page layouts
│       ├── pages/             # Inertia pages
│       │   ├── auth/          # Authentication pages
│       │   ├── dashboard.tsx  # Main dashboard
│       │   ├── projects/      # Project management
│       │   ├── tasks/         # Task management
│       │   ├── teams/         # Team management
│       │   └── settings/      # User settings
│       └── types/             # TypeScript definitions
├── routes/
│   ├── web.php                # Web routes
│   └── settings.php           # Settings routes
└── tests/
    ├── Feature/               # Feature tests
    └── Unit/                  # Unit tests
```

---

## 🔌 API Reference

### Teams

| Method | Endpoint                         | Description        |
| ------ | -------------------------------- | ------------------ |
| GET    | `/teams`                         | List all teams     |
| POST   | `/teams`                         | Create a new team  |
| GET    | `/teams/{id}`                    | Get team details   |
| PUT    | `/teams/{id}`                    | Update team        |
| DELETE | `/teams/{id}`                    | Delete team        |
| POST   | `/teams/{id}/leave`              | Leave team         |
| POST   | `/teams/{id}/transfer-ownership` | Transfer ownership |

### Projects

| Method | Endpoint                 | Description          |
| ------ | ------------------------ | -------------------- |
| GET    | `/projects`              | List all projects    |
| POST   | `/projects`              | Create a new project |
| GET    | `/projects/{id}`         | Get project details  |
| PUT    | `/projects/{id}`         | Update project       |
| DELETE | `/projects/{id}`         | Soft delete project  |
| POST   | `/projects/{id}/restore` | Restore project      |
| GET    | `/projects/{id}/kanban`  | Kanban board view    |

### Tasks

| Method | Endpoint             | Description                |
| ------ | -------------------- | -------------------------- |
| GET    | `/tasks`             | List tasks with filters    |
| GET    | `/my-tasks`          | List user's assigned tasks |
| POST   | `/tasks`             | Create a new task          |
| GET    | `/tasks/{id}`        | Get task details           |
| PUT    | `/tasks/{id}`        | Update task                |
| PATCH  | `/tasks/{id}/status` | Update task status         |
| DELETE | `/tasks/{id}`        | Delete task                |
| POST   | `/tasks/reorder`     | Reorder tasks (Kanban)     |

### Task Comments

| Method | Endpoint               | Description         |
| ------ | ---------------------- | ------------------- |
| POST   | `/tasks/{id}/comments` | Add comment to task |
| PATCH  | `/task-comments/{id}`  | Update comment      |
| DELETE | `/task-comments/{id}`  | Delete comment      |

### Team Invites

| Method | Endpoint               | Description             |
| ------ | ---------------------- | ----------------------- |
| GET    | `/invites`             | List user's invitations |
| POST   | `/team-invites`        | Create invitation       |
| POST   | `/invites/{id}/accept` | Accept invitation       |
| POST   | `/invites/{id}/reject` | Decline invitation      |

---

## 🧪 Testing

### Running Tests

```bash
# Run all tests
php artisan test

# Run with coverage
php artisan test --coverage

# Run specific test file
php artisan test tests/Feature/Auth/RegistrationTest.php

# Run tests matching a filter
php artisan test --filter=registration
```

### Code Style

```bash
# Fix PHP code style
vendor/bin/pint

# Check for issues without fixing
vendor/bin/pint --test
```

---

## 🔧 Configuration

### Environment Variables

| Variable        | Description                    | Default  |
| --------------- | ------------------------------ | -------- |
| `APP_NAME`      | Application name               | TeamFlow |
| `APP_ENV`       | Environment (local/production) | local    |
| `APP_DEBUG`     | Debug mode                     | true     |
| `DB_CONNECTION` | Database driver                | sqlite   |
| `MAIL_MAILER`   | Mail driver                    | log      |

### Database Options

To use MySQL instead of SQLite:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=teamflow
DB_USERNAME=root
DB_PASSWORD=
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow PSR-12 coding standards for PHP
- Use TypeScript for all frontend code
- Write tests for new features
- Run `vendor/bin/pint` before committing PHP changes
- Run `pnpm lint` before committing frontend changes

---

## 📄 License

This project is open-sourced software licensed under the [MIT license](LICENSE).

---

## 🙏 Acknowledgments

- [Laravel](https://laravel.com) - The PHP Framework
- [React](https://react.dev) - UI Library
- [Inertia.js](https://inertiajs.com) - Modern Monolith
- [Tailwind CSS](https://tailwindcss.com) - Utility-first CSS
- [shadcn/ui](https://ui.shadcn.com) - Beautiful Components
- [Lucide](https://lucide.dev) - Icon Library

---

<p align="center">
  Built with ❤️ using Laravel and React
</p>
