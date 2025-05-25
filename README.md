# TekRem ERP System

**Technology Remedies Innovations** | 🇿🇲 Zambia | 2025

## Overview

TekRem ERP is a comprehensive enterprise resource planning system built with Laravel 12, Jetstream, and React. It features a modular frontend architecture organized by business domains.

## Technology Stack

- **Backend**: Laravel 12 + Jetstream (Inertia + React)
- **Frontend**: React (TypeScript) + TailwindCSS + shadcn/ui
- **Database**: MySQL
- **RBAC**: spatie/laravel-permission
- **Localization**: mcamara/laravel-localization
- **Logging**: spatie/laravel-activitylog
- **Realtime**: Laravel WebSockets or Pusher (optional)

## Features

- Role-Based Access Control (Admin, Staff, Customer)
- Multi-language support (English, Bemba)
- Dynamic UI settings (theme, colors, layout)
- Modular frontend organized by business domains
- Comprehensive dashboards for different user roles
- Notification system (email + toast)

## Modules

- Website (Public pages)
- Admin Panel
- Customer Portal
- CRM (Client Management)
- Finance (Billing, Invoices)
- HR (Team Management)
- Projects (Task Management)
- Support (Ticketing)
- Analytics (Reports, KPIs)

## Setup Instructions

### Prerequisites

- PHP 8.2+
- Composer
- Node.js & npm
- MySQL

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/tekrem-erp.git
cd tekrem-erp

# Install PHP dependencies
composer install

# Install JavaScript dependencies
npm install

# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate

# Configure your database in .env file
# Then run migrations and seeders
php artisan migrate --seed

# Start the development server
php artisan serve

# In a separate terminal, start the frontend
npm run dev
```

## Default Users

| Role     | Email               | Password | Permissions                 |
| -------- | ------------------- | -------- | --------------------------- |
| Admin    | admin@tekrem.com    | password | All access                  |
| Staff    | staff@tekrem.com    | password | Access to CRM, HR, Projects |
| Customer | customer@tekrem.com | password | Service request portal      |

## Contact

- **Email:** tekremsolutions@gmail.com
- **Website:** www.tekrem.site
- **Phone:** +260 976607840
- **Location:** Lusaka, Zambia

## Real-time Communication

The system uses Laravel Echo and Pusher for real-time communication:
- Live chat functionality in the CRM service
- Real-time notifications
- WebSocket connections for instant updates

## n8n Workflow Automation

The system uses n8n for workflow automation, including:
- Task notifications
- Weekly reports
- CRM-to-Billing sync
- Lead to onboarding automation
- Support ticket escalation
- Timesheet reporting
- Automated invoicing
- Daily backups

### CRM / Client Management
- **Directory**: `CRM/`
- **Description**: Manages clients, leads, and communications.
- **Features**:
  - Client CRUD operations (Create, Read, Update, Delete)
  - Client database migrations and model
  - Client listing with pagination
  - Client details view with tabs for communications and tasks
  - Lead management functionality (Create, Read, Update, Delete)
  - Lead database migrations and model
  - Lead listing with pagination
  - Lead details view with communications tab
  - Lead to client conversion functionality
  - Communication tracking for clients and leads
  - Communication database migrations and model
  - Communication creation and editing
  - Communication listing in client and lead details
  - Live chat functionality with WebSockets
  - Chat database migrations and model
  - Real-time messaging with Pusher
  - Chat UI for clients and leads
  - Proper error handling for WebSocket connections
  - Graceful fallback when WebSocket services are unavailable
  - Modern landing page with ShadCN UI components
  - Toast notifications using sonner
  - ShadCN UI integration with 40+ components
  - Dark/light mode toggle implementation
  - Multilingual support with i18next (English, Bemba, Nyanja, Tonga)
  - Breadcrumbs for improved navigation
  - Role-based conditional navigation
  - Mailtrap email configuration

### Project Management Service
- **Directory**: `Projects/`
- **Description**: Manages projects, tasks, and time tracking.
- **Features**:
  - Project CRUD operations
  - Task management with status tracking
  - Time logging and reporting
  - Project dashboard with progress visualization
  - Team member assignment
  - Project templates
  - Gantt chart view
  - Kanban board view
  - File attachments
  - Task comments and discussions
  - Deadline notifications
  - Project reporting


### Finance Service
- **Directory**: `Finance/`
- **Description**: Handles all financial aspects including billing, invoices, quotations, and payments.
- **Features**:
  - Account management (checking, savings, business)
  - Transaction tracking and categorization
  - Invoice generation and management
  - Payment processing and tracking
  - Expense tracking and categorization
  - Budget creation and monitoring
  - Financial reporting (income statements, cash flow)
  - Financial dashboard with key metrics
  - Multi-currency support
  - Tax calculation and management
  - Client financial history
  - Role-based access control
  - Multilingual support with i18next
  - ShadCN UI components for all forms and interfaces
  - Dark/light mode toggle
  - Breadcrumbs for improved navigation
  - Toast notifications using sonner

### Support Service
- **Directory**: `Support/`
- **Description**: Manages support tickets, helpdesk operations, and knowledge base.
- **Features**:
  - Ticket creation and management
  - Helpdesk operations
  - Knowledge base articles
  - Customer communication
  - SLA tracking
  - Support agent assignment
  - Ticket categorization and prioritization
  - Support dashboard
  - Customer satisfaction tracking
  - Escalation management
  - FAQ management
  - Self-service portal

<!-- ### Services Management Service
- **Directory**: `services-service/`
- **Description**: Manages customer services, provisioning, and resource allocation.
- **Features**:
  - Service catalog management
  - Service provisioning workflows
  - Usage monitoring and metrics
  - Service renewals
  - Service configuration
  - Resource allocation
  - Service health monitoring
  - Resource utilization tracking
  - Service level agreements
  - Service dashboard -->

<!-- ### Order Management Service
- **Directory**: `order-service/`
- **Description**: Handles customer orders, product catalog, and purchasing workflow.
- **Features**:
  - Product/service catalog
  - Order processing
  - Order fulfillment tracking
  - Order history
  - Product recommendations
  - Inventory management
  - Order dashboard
  - Product categories and attributes
  - Pricing management
  - Discount management
  - Bundle creation -->


### HR Service
- **Directory**: `HR/`
- **Description**: Manages human resources, team collaboration, and employee information.
- **Features**:
  - Employee profiles
  - Leave management
  - Performance reviews
  - Onboarding workflows
  - Team directory
  - Organizational chart
  - Document management
  - Training and development
  - Attendance tracking
  - Payroll integration


### Developer Resource Hub
- **Directory**: `DevResourceHub/`
- **Description**: Centralized repository for developer resources, documentation, and tools.
- **Features**:
  - Code snippets library
  - API documentation
  - Development guidelines
  - Technical documentation
  - Tool recommendations
  - Learning resources
  - Project templates
  - Development environment setup guides
  - Best practices documentation


### Analytics Service
- **Directory**: `Analytics/`
- **Description**: Provides analytics, reporting, and business intelligence across all services.
- **Features**:
  - Cross-service dashboards
  - Custom report builder
  - Data visualization
  - KPI tracking
  - Business intelligence
  - Export functionality
  - Scheduled reports
  - Data integration from all services
  - Trend analysis
  - Predictive analytics
