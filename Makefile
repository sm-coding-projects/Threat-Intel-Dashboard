# Threat Intel Platform - Makefile
# Provides convenient shortcuts for common operations

.PHONY: help deploy dev stop restart logs clean status health test

# Default target
help: ## Show this help message
	@echo "Threat Intel Platform - Available Commands:"
	@echo "==========================================="
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-15s\033[0m %s\n", $$1, $$2}'

# Production deployment
deploy: ## Deploy the application in production mode
	@echo "🚀 Deploying Threat Intel Platform..."
	./deploy.sh

dev: ## Start development environment
	@echo "🛠️  Starting development environment..."
	docker-compose -f docker-compose.dev.yml up -d --build
	@echo "✅ Development environment started!"
	@echo "   Frontend: http://localhost:3000"
	@echo "   Backend:  http://localhost:5001"

stop: ## Stop all services
	@echo "🛑 Stopping services..."
	docker-compose down
	docker-compose -f docker-compose.dev.yml down 2>/dev/null || true
	@echo "✅ Services stopped"

restart: ## Restart all services
	@echo "🔄 Restarting services..."
	docker-compose restart
	@echo "✅ Services restarted"

logs: ## Show and follow logs
	@echo "📋 Showing logs (Ctrl+C to exit)..."
	docker-compose logs -f

status: ## Show service status
	@echo "📊 Service Status:"
	@echo "=================="
	docker-compose ps
	@echo ""
	@echo "🏥 Health Checks:"
	@echo "=================="
	@curl -s http://localhost:5001/api/health | jq . 2>/dev/null || echo "Backend: Not responding"
	@curl -s http://localhost:3000/health 2>/dev/null && echo "Frontend: Healthy" || echo "Frontend: Not responding"

health: ## Check application health
	@echo "🏥 Health Check Results:"
	@echo "======================="
	@echo -n "Backend API: "
	@curl -s -o /dev/null -w "%{http_code}" http://localhost:5001/api/health && echo " ✅" || echo " ❌"
	@echo -n "Frontend:    "
	@curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/health && echo " ✅" || echo " ❌"
	@echo -n "Database:    "
	@docker-compose exec -T db pg_isready -U threat_intel_user >/dev/null 2>&1 && echo "✅" || echo "❌"

clean: ## Clean up Docker resources
	@echo "🧹 Cleaning up Docker resources..."
	./deploy.sh cleanup
	@echo "✅ Cleanup completed"

test: ## Run tests (placeholder)
	@echo "🧪 Running tests..."
	@echo "⚠️  Test suite not implemented yet"

# Environment setup
setup: ## Initial setup (copy env file)
	@echo "⚙️  Setting up environment..."
	@if [ ! -f .env ]; then \
		cp .env.example .env; \
		echo "✅ Created .env file from .env.example"; \
		echo "📝 Please edit .env file and add your API keys"; \
	else \
		echo "⚠️  .env file already exists"; \
	fi

# Database operations
db-reset: ## Reset database (WARNING: destroys all data)
	@echo "⚠️  WARNING: This will destroy all data!"
	@read -p "Are you sure? (y/N): " confirm && [ "$$confirm" = "y" ] || exit 1
	@echo "🗑️  Resetting database..."
	docker-compose down -v
	docker-compose up -d
	@echo "✅ Database reset completed"

# Backup operations
backup: ## Create database backup
	@echo "💾 Creating database backup..."
	@mkdir -p backups
	@docker-compose exec -T db pg_dump -U threat_intel_user threat_intel_db > backups/backup_$(shell date +%Y%m%d_%H%M%S).sql
	@echo "✅ Backup created in backups/ directory"

# Update operations
update: ## Update and rebuild services
	@echo "🔄 Updating services..."
	git pull
	docker-compose down
	docker-compose up -d --build
	@echo "✅ Services updated and restarted"

# Development helpers
shell-backend: ## Open shell in backend container
	docker-compose exec backend /bin/bash

shell-frontend: ## Open shell in frontend container
	docker-compose exec frontend /bin/sh

shell-db: ## Open PostgreSQL shell
	docker-compose exec db psql -U threat_intel_user -d threat_intel_db

# Monitoring
monitor: ## Show real-time resource usage
	@echo "📊 Resource Usage (Ctrl+C to exit):"
	@echo "===================================="
	docker stats