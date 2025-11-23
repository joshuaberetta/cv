# CV Generator Makefile

# Variables
NODE = node
NPM = npm
DIST_DIR = dist
DATA_DIR = public/data

# Default target
all: install build

# Install dependencies
install:
	@echo "Installing dependencies..."
	$(NPM) install

# Start development server
dev:
	@echo "Starting development server..."
	$(NPM) run dev

# Build static HTML
build:
	@echo "Building static HTML..."
	$(NPM) run start

# Build production version with Vite
build-prod:
	@echo "Building production version..."
	$(NPM) run build

# Clean build artifacts
clean:
	@echo "Cleaning build artifacts..."
	rm -rf $(DIST_DIR)

# Initialize project from template
init:
	@echo "Initializing CV project..."
	@if [ ! -d "$(DATA_DIR)" ]; then \
		mkdir -p $(DATA_DIR); \
		echo "Created $(DATA_DIR) directory"; \
	fi
	@if [ ! -f "$(DATA_DIR)/cv-data.yaml" ]; then \
		cp templates/cv-data.yaml $(DATA_DIR)/cv-data.yaml; \
		echo "Created sample CV data file"; \
	fi

# Help
help:
	@echo "CV Generator Makefile"
	@echo "---------------------"
	@echo "make              : Install dependencies and build static HTML"
	@echo "make install      : Install dependencies"
	@echo "make dev          : Start development server"
	@echo "make build        : Build static HTML"
	@echo "make build-prod   : Build production version with Vite"
	@echo "make clean        : Clean build artifacts"
	@echo "make init         : Initialize project with template files"
	@echo "make help         : Show this help message"

.PHONY: all install dev build build-prod clean init help
