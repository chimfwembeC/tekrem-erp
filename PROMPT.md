Perfect — here is your **cleaned, corrected, and fully professional architecture plan** for **TekRem ERP using Laravel 12 + Jetstream React** in a **modular frontend **. All typos are fixed, Laravel version updated, and setup commands are refined to be valid for Laravel 12.

---

# 🧠 TekRem ERP – Architecture Plan

**Technology Remedies Innovations** | 🇿🇲 Zambia | 2025

---

## ✅ Base Stack

The TekRem ERP is a **modular frontend ** built with:

* ✅ **Laravel 12** (Jetstream + Inertia + React)
* ✅ React (TypeScript + TailwindCSS + shadcn/ui)
* ✅ Role-Based Access Control (Spatie)
* ✅ Frontend modularity (domain-based folders)
* ✅ Dynamic theme & settings stored in DB
* ✅ Full internationalization (English + Bemba)

> 📌 All frontend pages and components are grouped by **role/domain** (e.g., `Pages/CRM`, `Pages/HR`, `Pages/Admin`) for clean modular organization.

---

## 🧱 Feature Domains (Frontend-Only Modules)

Frontend pages are grouped under:

```
resources/js/Pages/
├── Website/      // Public site (Landing, About, Services)
├── Admin/        // Admin panel
├── Customer/     // Customer dashboard, requests
├── CRM/          // Client management, leads, comms
├── Finance/      // Billing, invoices, payments
├── HR/           // Team, leave, roles
├── Projects/     // Tasks, timelines, PM
├── Support/      // Tickets, knowledge base
├── Analytics/    // Graphs, KPIs, reports
```

---

## ⚙️ Technology Stack

| Layer            | Tech                                         |
| ---------------- | -------------------------------------------- |
| **Backend**      | Laravel 12 + Jetstream (Inertia + React)     |
| **Frontend**     | React (TypeScript) + TailwindCSS + shadcn/ui |
| **UI Kit**       | `shadcn/ui` with custom themes               |
| **Database**     | MySQL (XAMPP or managed DB)                  |
| **RBAC**         | `spatie/laravel-permission`                  |
| **Localization** | `mcamara/laravel-localization`               |
| **Logging**      | `spatie/laravel-activitylog`                 |
| **Realtime**     | Optional: Laravel WebSockets or Pusher       |

---

## 🌍 Localization (i18n)

* 🔤 Languages: **English (`en`)** & **Bemba (`bem`)**
* 📂 Language files: `resources/js/i18n/en.json`, `bem.json`
* 🌐 URL Prefixing: `/en/`, `/bem/`
* 🧭 Language switcher in top navbar
* 🌍 Admin UI is fully translatable

---

## 🎨 Dynamic UI Settings (Admin-Controlled)

Editable from the Admin Panel:

| Setting         | Description                       |
| --------------- | --------------------------------- |
| `primary_color` | Base theme color                  |
| `font_family`   | UI font                           |
| `dark_mode`     | System-wide toggle                |
| `site_logo`     | Company logo                      |
| `favicon`       | Browser icon                      |
| `layout`        | Grid/column variations (optional) |

> Stored in the database and loaded into `config/settings.php`.

---

## 🔐 Role-Based Access Control (RBAC)

RBAC powered by **Spatie**:

| Role     | Access Scope                         |
| -------- | ------------------------------------ |
| Admin    | Full control of all modules/settings |
| Staff    | Limited access to assigned modules   |
| Customer | Portal + Service Requests only       |

* ✅ Middleware: `role`, `permission`
* ✅ UI conditionals via `usePermissions` (React)
* ✅ Route-level + Policy-level guards

---

## 🧠 Admin Panel Capabilities

* 🔧 User, Role, and Permission Manager
* 🎨 Theme + UI Settings
* 📊 Dashboard with Recharts widgets
* 📂 Data export/import (JSON)
* 📜 View Audit Log (Spatie)
* 🧩 Toggle module visibility

---

## 🌐 Public Website (Landing Pages)

### `/` – Landing Page

* Hero with CTA
* Services section
* Testimonials
* Call-to-Action (Get a Quote)

### `/about`

* Mission, Vision, Values
* Why TekRem? Team Overview

### `/services`

* Web / Mobile / Desktop Development
* AI + Cloud Consulting
* Networking / DevOps
* Design & Branding

### `/portfolio`

* Projects with:

  * Title, Industry, Tools Used, Outcome

### `/contact`

* Form: Name, Email, Phone, Message
* Google Map integration
* CAPTCHA + Mail trigger

---

## 🔔 Notifications & Communication

| Trigger                | Action                     |
| ---------------------- | -------------------------- |
| Task assignment/update | Email + toast via `sonner` |
| Ticket reply           | Email to customer          |
| Registration complete  | Welcome email              |
| System alerts          | Admin/staff toast + email  |

> Development via **Mailtrap**, production via **SMTP**.

---

## 📊 Dashboards & Analytics

Each role has a personalized dashboard:

* **Admin**: User counts, logs, revenue
* **Staff**: Assigned tasks, clients, KPIs
* **Customer**: Request statuses, recent activity

> Powered by **Recharts** and conditional widgets.

---

## 📁 Project Setup Guide

```bash
composer create-project laravel/laravel .

# Jetstream (React + Inertia)
composer require laravel/jetstream
php artisan jetstream:install inertia
npm install && npm run dev

# shadcn/ui setup
npx shadcn@latest init

# Required Packages
composer require spatie/laravel-permission
composer require spatie/laravel-activitylog
composer require mcamara/laravel-localization

# Publish configs
php artisan vendor:publish --provider="Spatie\Permission\PermissionServiceProvider"
php artisan vendor:publish --tag=laravel-localization

# DB Migrations & Seeding
php artisan migrate --seed
```

---

## 🧪 Default Test Users

| Role     | Email                                             | Password | Permissions                 |
| -------- | ------------------------------------------------- | -------- | --------------------------- |
| Admin    | [admin@tekrem.com](mailto:admin@tekrem.com)       | password | All access                  |
| Staff    | [staff@tekrem.com](mailto:staff@tekrem.com)       | password | Access to CRM, HR, Projects |
| Customer | [customer@tekrem.com](mailto:customer@tekrem.com) | password | Service request portal      |

---

## 🧩 Developer Guidelines

* ✅ Use **TypeScript** for all React components
* ✅ Structure all UI under `resources/js/Pages/{Module}`
* ✅ Use `shadcn/ui` for all inputs, tables, modals
* ✅ Use `sonner` for toast notifications
* ✅ Store all strings in `i18n` translation files
* ✅ Separate admin/customer/staff views cleanly

---

## 🪄 Optional Features (Future Scope)

* 🔁 Live Chat (Laravel Echo / Pusher)
* 📆 Calendar & Scheduling module
* 🧾 Quotation & Invoice templates
* 🔄 n8n workflow automation
* ☁️ S3 or Google Drive backups
* 🧠 AI-based assistant integration

---

## 📫 Contact

* **Email:** [tekremsolutions@gmail.com](mailto:tekremsolutions@gmail.com)
* **Website:** [www.tekrem.site](http://www.tekrem.site)
* **Phone:** +260 976607840
* **Location:** Lusaka, Zambia

---
