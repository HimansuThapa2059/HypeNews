.PHONY: env setup start db-up db-setup db-down db-reset clean

env:
	@echo "🔧 Copying .env.example to .env..."
	cp .env.example .env || true
	@echo "✅ Environment file ready"

setup:
	@echo "🚀 Starting local Docker services..."
	docker compose -f docker-compose.local.yaml up -d
	@echo "📦 Installing backend dependencies..."
	bun install
	@echo "📦 Installing frontend dependencies..."
	(cd frontend && bun install)
	@echo "✅ Local environment ready"

start:
	@echo "🚀 Starting development servers..."
	(bun dev &) && (cd frontend && bun dev)
	@echo "✅ Development servers running"

db-up:
	@echo "🐳 Starting database container..."
	docker compose -f docker-compose.local.yaml up -d
	@echo "✅ Database is up"

db-setup:
	@echo "📐 Running database migrations..."
	bun run db:migrate
	@echo "📤 Pushing schema to database..."
	bun run db:push
	@echo "✅ Database setup complete"

db-down:
	@echo "🛑 Stopping database container..."
	docker compose -f docker-compose.local.yaml down
	@echo "✅ Database stopped"

db-reset:
	@echo "⚠️ Resetting database (all data will be lost)..."
	docker compose -f docker-compose.local.yaml down -v
	@echo "✅ Database reset complete"
