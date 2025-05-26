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
- Projects (Enterprise Project Management with AI)
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

### Projects Module - Enterprise Project Management with AI
- **Directory**: `Projects/`
- **Description**: Comprehensive, enterprise-grade project management system with AI assistance capabilities, similar to GitHub Projects but enhanced with advanced features.
- **Core Features**:
  - **Interactive Kanban Boards**: Drag-and-drop functionality with customizable columns, swimlanes, and WIP limits
  - **Multiple Project Views**: Board (Kanban), List, Timeline (Gantt), Calendar, and Table views with real-time switching
  - **Project Templates**: Pre-built templates for Software Development, Marketing Campaigns, Event Planning, Product Launch, etc.
  - **Hierarchical Structure**: Parent/child relationships, project portfolios, and cross-project dependencies
  - **Project Cloning**: Duplication capabilities for rapid project setup

- **Advanced Task & Issue Management**:
  - **Rich Task Creation**: WYSIWYG descriptions, acceptance criteria, custom fields, and metadata
  - **Issue Tracking**: Categorized bug reports, feature requests, enhancements, and technical debt
  - **Complex Dependencies**: Predecessor/successor relationships, blocking dependencies, circular dependency detection
  - **Multi-level Subtasks**: Hierarchical task breakdown with automatic progress rollup
  - **Task Templates**: Reusable templates and checklists for standardized workflows
  - **Priority Management**: Custom priority levels and urgency indicators

- **Timeline & Progress Management**:
  - **Advanced Milestones**: Deadlines, success criteria, deliverables, and milestone dependencies
  - **Interactive Timelines**: Critical path analysis, resource allocation, and schedule optimization
  - **Progress Tracking**: Real-time burndown/burnup charts, velocity tracking, and forecasting
  - **Agile Support**: Sprint planning with story points, velocity calculations, and iteration management
  - **Health Indicators**: Project health dashboards and risk assessment

- **Team Collaboration & Assignment**:
  - **Role-Based Access**: Project Owner, Admin, Contributor, Reviewer, Viewer with custom permissions
  - **Intelligent Assignment**: Workload balancing, skill matching, and availability consideration
  - **Self-Assignment**: Marketplace for team members to claim available tasks
  - **Capacity Planning**: Workload visualization and overallocation warnings
  - **Collaboration Tools**: @mention system, discussion threads, and collaboration spaces

- **Document & Asset Management**:
  - **File Attachments**: Comprehensive file system supporting projects, tasks, milestones, and comments
  - **Version Control**: Built-in document version control with diff viewing and rollback capabilities
  - **Multi-format Support**: Inline preview for images, PDFs, documents, code files, and media
  - **Collaborative Editing**: File commenting and annotation system
  - **Project Wikis**: Integrated wikis with markdown support and knowledge base functionality

- **AI-Powered Assistance** (using existing Mistral AI integration):
  - **Intelligent Task Creation**: Natural language descriptions with automatic field population
  - **Project Planning**: Timeline estimation and resource recommendations
  - **Smart Prioritization**: Based on project goals, deadlines, and team capacity
  - **Progress Insights**: Bottleneck identification with resolution suggestions
  - **Automated Reporting**: AI-generated summaries, status reports, and stakeholder communications
  - **Predictive Analytics**: Project completion dates, budget forecasts, and risk assessment
  - **Natural Language Queries**: Query interface for project data and reporting
  - **Code Review Assistance**: AI-assisted code review and technical task analysis

- **Enterprise Features**:
  - **Custom Fields**: Fully customizable field system with multiple field types
  - **Automation Engine**: Trigger-based workflows with conditional logic and custom actions
  - **Time Tracking**: Manual entry, timer functionality, and timesheet integration
  - **Advanced Analytics**: Customizable dashboards, KPI tracking, and executive reporting
  - **API Integration**: REST API and webhook support for third-party tools (Slack, GitHub, Jira)
  - **Advanced Search**: Full-text indexing, saved searches, and intelligent filtering
  - **Project Archiving**: Data retention policies and restoration capabilities
  - **Audit Logging**: Change history tracking and compliance features

- **Performance & User Experience**:
  - **Responsive Design**: Optimized for desktop, tablet, and mobile devices
  - **Real-time Collaboration**: WebSocket connections, live cursors, and instant updates
  - **Keyboard Shortcuts**: Comprehensive shortcuts and power-user features
  - **Bulk Operations**: Mass editing, assignment, and status changes
  - **Export Capabilities**: PDF reports, Excel/CSV data, JSON API, project archives
  - **Offline Support**: Offline capability with sync when connection is restored
  - **Performance Optimization**: Handles large projects (1000+ tasks) with virtual scrolling

- **Integration with TekRem ERP**:
  - **CRM Integration**: Client project tracking and billing
  - **Finance Integration**: Project budgeting, expense tracking, and invoicing
  - **User Management**: Existing role and permission system integration
  - **Consistent UI/UX**: shadcn/ui components and established design patterns
  - **Multi-language Support**: Using existing useTranslate hook
  - **Notification System**: Integration with existing notification infrastructure


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
