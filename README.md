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
  <a href="#docker">Docker</a> •
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

- **Global Search** - Search across teams, projects, and tasks from anywhere
- **Date Range Filtering** - Filter tasks by due date with intuitive date picker
- **Task Export** - Export tasks to CSV or PDF formats
- **Audit Logging** - Track all user actions for accountability
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Dark Mode** - Toggle between light and dark themes
- **SPA Experience** - Seamless navigation with Inertia.js
- **API Documentation** - Auto-generated API docs with Scribe

### Developer Experience

- **Docker Support** - Containerized development environment
- **Type-Safe Routes** - Laravel Wayfinder for TypeScript route generation
- **Comprehensive Testing** - 100+ Pest tests with full coverage
- **Code Quality** - Laravel Pint and ESLint for consistent code style

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
| Scribe       | API Documentation Generator   |
| pnpm         | Package Manager               |
| Docker       | Containerized Development     |

---

## 🐳 Docker

TeamFlow includes a complete Docker development environment for consistent setup across machines.

### Quick Start with Docker

```bash
# Clone and enter the project
git clone https://github.com/AFAskar/TeamFlow.git
cd TeamFlow

# Build and start containers
make setup

# Or manually:
docker compose up -d
docker compose exec app php artisan migrate --seed
```

Visit `http://localhost:8000` in your browser.

### Available Services

| Service   | Port | Description                    |
| --------- | ---- | ------------------------------ |
| app       | 8000 | Laravel + Nginx + PHP-FPM      |
| mysql     | 3306 | MySQL 8.0 database             |
| redis     | 6379 | Redis for cache/queue/sessions |
| node      | 5173 | Vite dev server with HMR       |
| mailpit   | 8025 | Email testing UI               |
| queue     | -    | Laravel queue worker           |
| scheduler | -    | Laravel task scheduler         |

### Docker Commands (Makefile)

```bash
# Basic commands
make build      # Build Docker images
make up         # Start all containers
make down       # Stop all containers
make logs       # View container logs

# Development
make dev        # Start with Vite dev server
make shell      # Open shell in app container
make artisan cmd='migrate'  # Run artisan command

# Database
make mysql      # Open MySQL shell
make fresh      # Fresh migration with seeders

# Testing
make test       # Run all tests

# Services (profiles)
make queue      # Start queue worker
make scheduler  # Start scheduler
make mail       # Start Mailpit for email testing
```

### Docker Environment

Update your `.env` file for Docker:

```env
DB_CONNECTION=mysql
DB_HOST=mysql
DB_DATABASE=teamflow
DB_USERNAME=teamflow
DB_PASSWORD=secret

REDIS_HOST=redis
CACHE_STORE=redis
QUEUE_CONNECTION=redis
SESSION_DRIVER=redis

MAIL_MAILER=smtp
MAIL_HOST=mailpit
MAIL_PORT=1025
```

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
| GET    | `/tasks-export/csv`  | Export tasks to CSV        |
| GET    | `/tasks-export/pdf`  | Export tasks to PDF        |

### Search

| Method | Endpoint  | Description                               |
| ------ | --------- | ----------------------------------------- |
| GET    | `/search` | Global search across teams/projects/tasks |

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

### API Documentation

Full interactive API documentation is available at `/docs` when running the application. The documentation is auto-generated using [Scribe](https://scribe.knuckles.wtf/) and includes:

- Request/response examples
- Authentication requirements
- Parameter descriptions
- Try-it-out functionality

To regenerate the API documentation:

```bash
php artisan scribe:generate
```

---

## 🧪 Testing

TeamFlow has comprehensive test coverage with 100+ tests using Pest PHP.

### Running Tests

```bash
# Run all tests
php artisan test

# Run with compact output
php artisan test --compact

# Run with coverage
php artisan test --coverage

# Run specific test file
php artisan test tests/Feature/TeamControllerTest.php

# Run tests matching a filter
php artisan test --filter=registration
```

### Test Categories

| Category | Tests | Description                        |
| -------- | ----- | ---------------------------------- |
| Auth     | 15+   | Registration, login, 2FA, password |
| Teams    | 20+   | Team CRUD, members, invitations    |
| Projects | 11+   | Project CRUD, members, restoration |
| Tasks    | 15+   | Task CRUD, status, comments        |
| Search   | 7+    | Global search functionality        |
| Export   | 8+    | CSV and PDF export                 |

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

| Variable           | Description                    | Default  |
| ------------------ | ------------------------------ | -------- |
| `APP_NAME`         | Application name               | TeamFlow |
| `APP_ENV`          | Environment (local/production) | local    |
| `APP_DEBUG`        | Debug mode                     | true     |
| `DB_CONNECTION`    | Database driver                | sqlite   |
| `CACHE_STORE`      | Cache driver                   | database |
| `QUEUE_CONNECTION` | Queue driver                   | database |
| `MAIL_MAILER`      | Mail driver                    | log      |

### Database Options

**SQLite (Default)**

```env
DB_CONNECTION=sqlite
```

**MySQL**

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=teamflow
DB_USERNAME=root
DB_PASSWORD=
```

### Cache & Queue Options

**Redis (Recommended for production)**

```env
REDIS_HOST=127.0.0.1
CACHE_STORE=redis
QUEUE_CONNECTION=redis
SESSION_DRIVER=redis
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
- [Scribe](https://scribe.knuckles.wtf/) - API Documentation
- [DomPDF](https://github.com/dompdf/dompdf) - PDF Generation

---

<p align="center">
  Built with ❤️ using Laravel and React
</p>
