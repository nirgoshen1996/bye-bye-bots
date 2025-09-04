.PHONY: help dev dev-server build test lint format lint-server format-server docker-up docker-down docker-logs install-all clean

# Default target
help:
	@echo "Available commands:"
	@echo "  dev          - Start Next.js development server"
	@echo "  dev-server    - Start FastAPI development server"
	@echo "  build        - Build Next.js application"
	@echo "  test         - Run web tests"
	@echo "  lint         - Lint web code"
	@echo "  format       - Format web code"
	@echo "  lint-server  - Lint server code with Ruff"
	@echo "  format-server - Format server code with Black"
	@echo "  docker-up    - Start all services with Docker Compose"
	@echo "  docker-down  - Stop all Docker services"
	@echo "  docker-logs  - Show Docker logs"
	@echo "  install-all  - Install all dependencies"
	@echo "  clean        - Clean build artifacts"

# Development commands
dev:
	@echo "Starting Next.js development server..."
	@cd apps/web && npm run dev

dev-server:
	@echo "Starting FastAPI development server..."
	@cd apps/server && python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Build commands
build:
	@echo "Building Next.js application..."
	@cd apps/web && npm run build

# Testing commands
test:
	@echo "Running web tests..."
	@cd apps/web && npm run test

# Linting and formatting
lint:
	@echo "Linting web code..."
	@cd apps/web && npm run lint

format:
	@echo "Formatting web code..."
	@cd apps/web && npm run format

lint-server:
	@echo "Linting server code with Ruff..."
	@cd apps/server && ruff check .

format-server:
	@echo "Formatting server code with Black..."
	@cd apps/server && black .

# Docker commands
docker-up:
	@echo "Starting all services with Docker Compose..."
	docker compose up --build

docker-down:
	@echo "Stopping all Docker services..."
	docker compose down

docker-logs:
	@echo "Showing Docker logs..."
	docker compose logs -f

# Installation
install-all:
	@echo "Installing all dependencies..."
	npm install
	@cd apps/server && pip install -r requirements.txt

# Cleanup
clean:
	@echo "Cleaning build artifacts..."
	@cd apps/web && rm -rf .next out
	@cd apps/server && find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true
	@cd apps/server && find . -name "*.pyc" -delete 2>/dev/null || true

