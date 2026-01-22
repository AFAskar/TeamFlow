# TeamFlow - Makefile for Docker Operations
# Usage: make [command]

.PHONY: help build up down restart logs shell mysql redis fresh test

# Default target
help:
	@echo "TeamFlow Docker Commands"
	@echo "========================"
	@echo ""
	@echo "Basic Commands:"
	@echo "  make build      - Build Docker images"
	@echo "  make up         - Start all containers"
	@echo "  make down       - Stop all containers"
	@echo "  make restart    - Restart all containers"
	@echo "  make logs       - View container logs"
	@echo ""
	@echo "Development:"
	@echo "  make dev        - Start with Vite dev server"
	@echo "  make shell      - Open shell in app container"
	@echo "  make artisan    - Run artisan command (make artisan cmd='migrate')"
	@echo "  make composer   - Run composer command (make composer cmd='install')"
	@echo "  make pnpm       - Run pnpm command (make pnpm cmd='install')"
	@echo ""
	@echo "Database:"
	@echo "  make mysql      - Open MySQL shell"
	@echo "  make redis      - Open Redis CLI"
	@echo "  make migrate    - Run database migrations"
	@echo "  make fresh      - Fresh migration with seeders"
	@echo ""
	@echo "Testing:"
	@echo "  make test       - Run all tests"
	@echo "  make test-filter- Run filtered tests (make test-filter f='TestName')"
	@echo ""
	@echo "Services:"
	@echo "  make queue      - Start queue worker"
	@echo "  make scheduler  - Start scheduler"
	@echo "  make mail       - Start Mailpit"
	@echo ""
	@echo "Cleanup:"
	@echo "  make clean      - Remove containers and volumes"
	@echo "  make prune      - Prune unused Docker resources"

# Build Docker images
build:
	docker compose build

# Start all containers
up:
	docker compose up -d

# Start with Vite dev server
dev:
	docker compose --profile dev up -d

# Stop all containers
down:
	docker compose down

# Restart containers
restart:
	docker compose restart

# View logs
logs:
	docker compose logs -f

# Open shell in app container
shell:
	docker compose exec app sh

# Run artisan command
artisan:
	docker compose exec app php artisan $(cmd)

# Run composer command
composer:
	docker compose exec app composer $(cmd)

# Run pnpm command
pnpm:
	docker compose exec app pnpm $(cmd)

# MySQL shell
mysql:
	docker compose exec mysql mysql -u teamflow -psecret teamflow

# Redis CLI
redis:
	docker compose exec redis redis-cli

# Run migrations
migrate:
	docker compose exec app php artisan migrate

# Fresh migration with seeders
fresh:
	docker compose exec app php artisan migrate:fresh --seed

# Run all tests
test:
	docker compose exec app php artisan test --compact

# Run filtered tests
test-filter:
	docker compose exec app php artisan test --compact --filter=$(f)

# Start queue worker
queue:
	docker compose --profile queue up -d queue

# Start scheduler
scheduler:
	docker compose --profile scheduler up -d scheduler

# Start Mailpit
mail:
	docker compose --profile mail up -d mailpit

# Start all services (queue, scheduler, mail)
all-services:
	docker compose --profile queue --profile scheduler --profile mail up -d

# Remove containers and volumes
clean:
	docker compose down -v --remove-orphans

# Prune unused Docker resources
prune:
	docker system prune -f
	docker volume prune -f

# Install dependencies
install:
	docker compose exec app composer install
	docker compose exec app pnpm install

# Build frontend assets
build-assets:
	docker compose exec app pnpm run build

# Setup fresh environment
setup: build up install migrate build-assets
	@echo "TeamFlow is ready! Visit http://localhost:8000"
setup-dev: 
	pnpm i && composer install && cp .env.example .env && php artisan key:generate && touch database/database.sqlite && php artisan migrate --seed && pnpm build
	@echo "TeamFlow development environment is ready! run php artisan serve to start the server."
	
