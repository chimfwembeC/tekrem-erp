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

- **CMS** (Content Management System)
- Website (Public pages)
- Admin Panel
- Customer Portal
- CRM (Client Management)
- Finance (Billing, Invoices)
- HR (Team Management)
- Projects (Enterprise Project Management with AI)
- Support (Ticketing with AI)
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

### Content Management System (CMS)
- **Directory**: `CMS/`
- **Description**: Enterprise-grade content management system for creating, managing, and publishing website content with advanced features and AI-powered optimization.

- **Core Content Management**:
  - **Advanced Page Editor**: Rich WYSIWYG editor with real-time preview, markdown support, and custom content blocks
  - **Content Versioning**: Complete revision history with diff viewing, rollback capabilities, and approval workflows
  - **Multi-language Support**: Full internationalization with translation management and language-specific content
  - **Publishing Workflows**: Draft, scheduled, and approval-based publishing with role-based permissions
  - **Content Hierarchy**: Parent/child page relationships with automatic breadcrumb generation
  - **Custom Fields**: Flexible field system for different content types and templates

- **SEO & Optimization**:
  - **Real-time SEO Analysis**: Built-in SEO analyzer with scoring and recommendations
  - **Meta Tag Management**: Comprehensive meta tags, Open Graph, and Twitter Card support
  - **URL Management**: SEO-friendly URLs, custom slugs, and automatic redirect management
  - **Sitemap Generation**: Automatic XML sitemap creation and submission
  - **Schema Markup**: Structured data support for better search engine understanding
  - **Performance Optimization**: Image optimization, lazy loading, and CDN integration

- **Media Management**:
  - **Advanced Media Library**: Comprehensive file management with folder organization
  - **Image Processing**: Automatic resizing, optimization, and multiple format support
  - **CDN Integration**: Cloud storage support with automatic URL generation
  - **Media Variants**: Multiple image sizes and formats for responsive design
  - **Bulk Operations**: Mass upload, tagging, and organization capabilities
  - **Usage Tracking**: Media usage analytics and cleanup tools

- **Template System**:
  - **Flexible Templates**: Custom template engine with Blade integration
  - **Page Builder**: Drag-and-drop interface for creating custom layouts
  - **Component Library**: Reusable content blocks and widgets
  - **Template Inheritance**: Master layouts with customizable sections
  - **Mobile Responsive**: Automatic responsive design with mobile preview
  - **Theme Management**: Multiple themes with easy switching capabilities

- **Navigation & Menus**:
  - **Dynamic Menus**: Hierarchical menu system with drag-and-drop ordering
  - **Menu Locations**: Multiple menu positions (header, footer, sidebar)
  - **Conditional Display**: Role-based and permission-based menu visibility
  - **Breadcrumb System**: Automatic breadcrumb generation for all pages
  - **Custom Links**: External links and custom navigation items
  - **Mobile Navigation**: Responsive menu design for mobile devices

- **AI-Powered Features** (using Mistral AI):
  - **Content Suggestions**: AI-generated content recommendations and improvements
  - **SEO Optimization**: Automated SEO suggestions and meta tag generation
  - **Content Analysis**: Readability analysis and content quality scoring
  - **Auto-tagging**: Intelligent content categorization and tagging
  - **Translation Assistance**: AI-powered translation suggestions for multi-language content
  - **Content Planning**: AI-driven content calendar and publishing recommendations

- **Advanced Features**:
  - **Custom Post Types**: Flexible content types beyond standard pages
  - **Taxonomy Management**: Categories, tags, and custom taxonomies
  - **Content Scheduling**: Advanced scheduling with timezone support
  - **Redirect Management**: 301/302 redirects with hit tracking and analytics
  - **Form Builder**: Custom forms with validation and submission handling
  - **Comment System**: Built-in commenting with moderation capabilities
  - **Search Functionality**: Full-text search with filtering and faceted search

- **Analytics & Insights**:
  - **Content Analytics**: Page views, engagement metrics, and performance tracking
  - **SEO Monitoring**: Search engine ranking and optimization tracking
  - **User Behavior**: Content interaction and user journey analysis
  - **Performance Metrics**: Page load times and optimization recommendations
  - **Content Audit**: Content quality assessment and improvement suggestions
  - **Conversion Tracking**: Goal tracking and conversion optimization

- **Integration & API**:
  - **REST API**: Full API access for headless CMS functionality
  - **Webhook Support**: Real-time notifications for content changes
  - **Third-party Integration**: Social media, email marketing, and analytics tools
  - **Import/Export**: Content migration tools and backup capabilities
  - **Plugin System**: Extensible architecture for custom functionality
  - **Developer Tools**: CLI commands and development utilities

- **Security & Performance**:
  - **Role-based Access**: Granular permissions for content management
  - **Content Approval**: Multi-level approval workflows for publishing
  - **Backup System**: Automated content backups with restoration capabilities
  - **Cache Management**: Intelligent caching for optimal performance
  - **Security Scanning**: Content security analysis and threat detection
  - **Performance Monitoring**: Real-time performance tracking and optimization

- **User Experience**:
  - **Intuitive Interface**: Modern, responsive admin interface using shadcn/ui
  - **Real-time Collaboration**: Multi-user editing with conflict resolution
  - **Keyboard Shortcuts**: Power-user features and productivity enhancements
  - **Bulk Operations**: Mass content management and editing capabilities
  - **Preview System**: Live preview with device simulation
  - **Accessibility**: WCAG compliance and accessibility features

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
