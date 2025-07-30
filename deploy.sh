#!/bin/bash

# Threat Intel Platform - Simplified Deployment Script
# This script handles the complete deployment process

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if Docker is installed and running
check_docker() {
    print_status "Checking Docker installation..."
    
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        echo "Visit: https://docs.docker.com/get-docker/"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        echo "Visit: https://docs.docker.com/compose/install/"
        exit 1
    fi
    
    if ! docker info &> /dev/null; then
        print_error "Docker is not running. Please start Docker first."
        exit 1
    fi
    
    print_success "Docker is installed and running"
}

# Function to setup environment file
setup_env() {
    print_status "Setting up environment configuration..."
    
    if [ ! -f .env ]; then
        if [ -f .env.example ]; then
            cp .env.example .env
            print_success "Created .env file from .env.example"
        else
            print_error ".env.example file not found"
            exit 1
        fi
    else
        print_warning ".env file already exists, skipping creation"
    fi
    
    # Check if SHODAN_API_KEY is set
    if grep -q "^SHODAN_API_KEY=$" .env || ! grep -q "^SHODAN_API_KEY=" .env; then
        print_warning "SHODAN_API_KEY is not set in .env file"
        echo "You can add your Shodan API key later through the web interface"
        echo "Or edit the .env file manually and restart the application"
    fi
}

# Function to build and start services
deploy_services() {
    print_status "Building and starting services..."
    
    # Stop any existing containers
    print_status "Stopping existing containers..."
    docker-compose down --remove-orphans 2>/dev/null || true
    
    # Build and start services
    print_status "Building Docker images..."
    docker-compose build --no-cache
    
    print_status "Starting services..."
    docker-compose up -d
    
    # Wait for services to be ready
    print_status "Waiting for services to be ready..."
    sleep 10
    
    # Check if services are running
    if docker-compose ps | grep -q "Up"; then
        print_success "Services are running successfully"
    else
        print_error "Some services failed to start"
        docker-compose logs
        exit 1
    fi
}

# Function to display service status
show_status() {
    print_status "Service Status:"
    docker-compose ps
    
    echo ""
    print_status "Service Logs (last 10 lines):"
    docker-compose logs --tail=10
}

# Function to display access information
show_access_info() {
    echo ""
    print_success "🎉 Threat Intel Platform deployed successfully!"
    echo ""
    echo "Access your application:"
    echo "  🌐 Web Interface: http://localhost:3000"
    echo "  🔧 API Endpoint:  http://localhost:5001"
    echo ""
    echo "Next steps:"
    echo "  1. Open http://localhost:3000 in your browser"
    echo "  2. Go to Settings → API Integrations"
    echo "  3. Add your Shodan API key"
    echo "  4. Start enriching IP addresses!"
    echo ""
    echo "Useful commands:"
    echo "  📊 View logs:     docker-compose logs -f"
    echo "  🔄 Restart:       docker-compose restart"
    echo "  🛑 Stop:          docker-compose down"
    echo "  🗑️  Clean up:      docker-compose down -v --remove-orphans"
}

# Function to handle cleanup
cleanup() {
    print_status "Cleaning up Docker resources..."
    docker-compose down -v --remove-orphans
    docker system prune -f
    print_success "Cleanup completed"
}

# Main deployment function
main() {
    echo "🚀 Threat Intel Platform - Deployment Script"
    echo "=============================================="
    echo ""
    
    case "${1:-deploy}" in
        "deploy")
            check_docker
            setup_env
            deploy_services
            show_status
            show_access_info
            ;;
        "status")
            show_status
            ;;
        "logs")
            docker-compose logs -f
            ;;
        "stop")
            print_status "Stopping services..."
            docker-compose down
            print_success "Services stopped"
            ;;
        "restart")
            print_status "Restarting services..."
            docker-compose restart
            print_success "Services restarted"
            ;;
        "cleanup")
            cleanup
            ;;
        "help"|"-h"|"--help")
            echo "Usage: $0 [command]"
            echo ""
            echo "Commands:"
            echo "  deploy    Deploy the application (default)"
            echo "  status    Show service status"
            echo "  logs      Show and follow logs"
            echo "  stop      Stop all services"
            echo "  restart   Restart all services"
            echo "  cleanup   Stop services and clean up Docker resources"
            echo "  help      Show this help message"
            ;;
        *)
            print_error "Unknown command: $1"
            echo "Use '$0 help' for usage information"
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"