#!/bin/bash

# TekRem ERP Cypress Test Runner
# This script sets up the environment and runs Cypress tests

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
LARAVEL_PORT=8000
LARAVEL_HOST="localhost"
CYPRESS_TIMEOUT=120
TEST_ENV="testing"

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

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if Laravel is running
check_laravel() {
    print_status "Checking if Laravel application is running..."
    
    if curl -s "http://${LARAVEL_HOST}:${LARAVEL_PORT}" >/dev/null; then
        print_success "Laravel application is running on http://${LARAVEL_HOST}:${LARAVEL_PORT}"
        return 0
    else
        print_warning "Laravel application is not running"
        return 1
    fi
}

# Function to start Laravel development server
start_laravel() {
    print_status "Starting Laravel development server..."
    
    # Check if .env file exists
    if [ ! -f ".env" ]; then
        print_error ".env file not found. Please copy .env.example to .env and configure it."
        exit 1
    fi
    
    # Start Laravel server in background
    php artisan serve --host=0.0.0.0 --port=${LARAVEL_PORT} --env=${TEST_ENV} &
    LARAVEL_PID=$!
    
    # Wait for server to start
    print_status "Waiting for Laravel server to start..."
    sleep 5
    
    # Check if server started successfully
    if check_laravel; then
        print_success "Laravel server started successfully (PID: $LARAVEL_PID)"
        echo $LARAVEL_PID > .laravel_test_server.pid
    else
        print_error "Failed to start Laravel server"
        exit 1
    fi
}

# Function to stop Laravel server
stop_laravel() {
    if [ -f ".laravel_test_server.pid" ]; then
        LARAVEL_PID=$(cat .laravel_test_server.pid)
        print_status "Stopping Laravel server (PID: $LARAVEL_PID)..."
        kill $LARAVEL_PID 2>/dev/null || true
        rm -f .laravel_test_server.pid
        print_success "Laravel server stopped"
    fi
}

# Function to setup test database
setup_database() {
    print_status "Setting up test database..."
    
    # Run migrations
    php artisan migrate:fresh --env=${TEST_ENV} --force
    
    # Seed database with test data
    php artisan db:seed --env=${TEST_ENV} --force
    
    print_success "Test database setup completed"
}

# Function to install dependencies
install_dependencies() {
    print_status "Checking dependencies..."
    
    # Check if node_modules exists
    if [ ! -d "node_modules" ]; then
        print_status "Installing Node.js dependencies..."
        npm install
    fi
    
    # Check if Cypress is installed
    if [ ! -d "node_modules/cypress" ]; then
        print_status "Installing Cypress..."
        npm install cypress --save-dev
    fi
    
    # Install Cypress binary if needed
    if ! npx cypress verify >/dev/null 2>&1; then
        print_status "Installing Cypress binary..."
        npx cypress install
    fi
    
    print_success "Dependencies are ready"
}

# Function to run Cypress tests
run_cypress() {
    local mode=$1
    local spec=$2
    local browser=${3:-"electron"}
    
    print_status "Running Cypress tests in $mode mode..."
    
    # Set environment variables for Cypress
    export CYPRESS_baseUrl="http://${LARAVEL_HOST}:${LARAVEL_PORT}"
    
    case $mode in
        "headless")
            if [ -n "$spec" ]; then
                npx cypress run --spec "$spec" --browser "$browser"
            else
                npx cypress run --browser "$browser"
            fi
            ;;
        "headed")
            if [ -n "$spec" ]; then
                npx cypress run --headed --spec "$spec" --browser "$browser"
            else
                npx cypress run --headed --browser "$browser"
            fi
            ;;
        "interactive")
            npx cypress open
            ;;
        *)
            print_error "Invalid mode: $mode. Use 'headless', 'headed', or 'interactive'"
            exit 1
            ;;
    esac
}

# Function to generate test report
generate_report() {
    print_status "Generating test report..."
    
    # Check if mochawesome reports exist
    if [ -d "cypress/reports" ]; then
        # Merge mochawesome reports if multiple exist
        if command_exists mochawesome-merge; then
            npx mochawesome-merge cypress/reports/*.json > cypress/reports/merged-report.json
            npx marge cypress/reports/merged-report.json --reportDir cypress/reports --inline
            print_success "Test report generated: cypress/reports/merged-report.html"
        fi
    fi
}

# Function to cleanup
cleanup() {
    print_status "Cleaning up..."
    stop_laravel
    
    # Remove temporary files
    rm -f .laravel_test_server.pid
    
    print_success "Cleanup completed"
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [OPTIONS] [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  run                 Run all tests in headless mode"
    echo "  run-headed          Run all tests in headed mode"
    echo "  open                Open Cypress Test Runner"
    echo "  setup               Setup environment only"
    echo "  cleanup             Stop servers and cleanup"
    echo ""
    echo "Options:"
    echo "  --spec <file>       Run specific test file"
    echo "  --browser <name>    Use specific browser (chrome, firefox, edge, electron)"
    echo "  --no-setup          Skip environment setup"
    echo "  --keep-server       Keep Laravel server running after tests"
    echo "  --help              Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 run                                    # Run all tests"
    echo "  $0 run --spec 'cypress/e2e/ai/*.cy.ts'  # Run AI module tests"
    echo "  $0 run-headed --browser chrome           # Run with Chrome browser"
    echo "  $0 open                                  # Open Test Runner"
}

# Main execution
main() {
    local command="run"
    local spec=""
    local browser="electron"
    local setup=true
    local keep_server=false
    
    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            run|run-headed|open|setup|cleanup)
                command=$1
                shift
                ;;
            --spec)
                spec="$2"
                shift 2
                ;;
            --browser)
                browser="$2"
                shift 2
                ;;
            --no-setup)
                setup=false
                shift
                ;;
            --keep-server)
                keep_server=true
                shift
                ;;
            --help)
                show_usage
                exit 0
                ;;
            *)
                print_error "Unknown option: $1"
                show_usage
                exit 1
                ;;
        esac
    done
    
    # Set trap for cleanup on exit
    if [ "$keep_server" = false ]; then
        trap cleanup EXIT
    fi
    
    print_status "Starting TekRem ERP Cypress Test Runner"
    print_status "Command: $command"
    
    # Check required commands
    if ! command_exists php; then
        print_error "PHP is not installed or not in PATH"
        exit 1
    fi
    
    if ! command_exists npm; then
        print_error "Node.js/npm is not installed or not in PATH"
        exit 1
    fi
    
    # Execute based on command
    case $command in
        "setup")
            if [ "$setup" = true ]; then
                install_dependencies
                if ! check_laravel; then
                    start_laravel
                fi
                setup_database
            fi
            ;;
        "cleanup")
            cleanup
            ;;
        "run")
            if [ "$setup" = true ]; then
                install_dependencies
                if ! check_laravel; then
                    start_laravel
                fi
                setup_database
            fi
            run_cypress "headless" "$spec" "$browser"
            generate_report
            ;;
        "run-headed")
            if [ "$setup" = true ]; then
                install_dependencies
                if ! check_laravel; then
                    start_laravel
                fi
                setup_database
            fi
            run_cypress "headed" "$spec" "$browser"
            generate_report
            ;;
        "open")
            if [ "$setup" = true ]; then
                install_dependencies
                if ! check_laravel; then
                    start_laravel
                fi
                setup_database
            fi
            run_cypress "interactive" "$spec" "$browser"
            ;;
    esac
    
    print_success "Test runner completed successfully"
}

# Run main function with all arguments
main "$@"
