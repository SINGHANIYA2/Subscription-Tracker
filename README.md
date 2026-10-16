# Subscription Tracker

**A Full-Stack Subscription Management and Expense Tracking Application**

Subscription Tracekr is a web application designed to help users manage their recurring subscriptions in one place. It allows users to manually record subscriptions, track recurring expenses, monitor upcoming renewals, and analyze their subscription spending through a centralized dashboard.

The project is being developed as a Software Engineering project by a team of three members.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Problem Statement](#2-problem-statement)
3. [Objectives](#3-objectives)
4. [Features](#4-features)
5. [Technology Stack](#5-technology-stack)
6. [System Architecture](#6-system-architecture)
7. [Project Structure](#7-project-structure)
8. [Prerequisites](#8-prerequisites)
9. [Installation and Setup](#9-installation-and-setup)
10. [Environment Configuration](#10-environment-configuration)
11. [Database Setup](#11-database-setup)
12. [Running the Application](#12-running-the-application)
13. [API Documentation](#13-api-documentation)
14. [Database Design](#14-database-design)
15. [Team Responsibilities](#15-team-responsibilities)
16. [Testing](#16-testing)
17. [Security Considerations](#17-security-considerations)
18. [Limitations](#18-limitations)
19. [Future Enhancements](#19-future-enhancements)
20. [Contribution Guidelines](#20-contribution-guidelines)
21. [AI Usage Disclosure](#21-ai-usage-disclosure)
22. [License](#22-license)

---

## 1. Project Overview

Subscription Tracekr provides a centralized platform for managing recurring subscriptions such as:

- Netflix
- Spotify
- Amazon Prime
- Canva Pro
- GitHub Copilot
- Adobe Creative Cloud
- Cloud hosting services
- Educational platforms and other recurring services

Users manually enter their subscription information and use the application to monitor renewal dates, review expenses, and understand their overall subscription costs.

**Project type:** Full-stack web application  
**Frontend:** React.js  
**Backend:** Node.js and Express.js  
**Database:** PostgreSQL  
**ORM:** Prisma  
**Development approach:** Modular development with Git-based collaboration

## 2. Problem Statement

Users frequently subscribe to multiple digital services with different billing cycles and renewal dates. Managing these subscriptions separately makes it difficult to track total expenses, remember upcoming payments, and identify unnecessary recurring costs.

Subscription Tracekr addresses this problem by providing a centralized subscription management system with expense summaries, renewal tracking, reminders, and spending analytics.

## 3. Objectives

The main objectives are to:

- Provide a centralized place to manage subscriptions.
- Allow users to add, view, update, and delete subscription records.
- Calculate estimated monthly and yearly subscription expenses.
- Track upcoming subscription renewal dates.
- Provide visual spending analytics.
- Support searching and filtering of subscription records.
- Help users make informed decisions about recurring expenses.
- Apply software engineering practices, including modular design, version control, testing, and documentation.

## 4. Features

### 4.1 User Authentication

- User registration and login.
- Secure password hashing.
- Authenticated access to personal subscription data.
- Logout and session/token management.

### 4.2 Dashboard

Displays an overview of the user's subscription activity, including:

- Total active subscriptions.
- Estimated monthly spending.
- Estimated yearly spending.
- Upcoming renewals.
- Recent subscription activity, where implemented.

### 4.3 Subscription Management

Users can manually manage subscription records.

Each subscription may contain:

| Field | Description |
|---|---|
| Service name | Name of the subscribed service |
| Category | Entertainment, Development, Productivity, Cloud, etc. |
| Price | Subscription cost per billing period |
| Currency | Currency in which the price is recorded |
| Billing cycle | Monthly, quarterly, half-yearly, or yearly |
| Start date | Date the subscription began |
| Next renewal date | Expected next billing date |
| Payment method | UPI, card, PayPal, or another supported method |
| Auto-renew | Whether the subscription is set to renew automatically |
| Status | Active, cancelled, or trial |
| Notes | Optional additional information |

Users can add, view, edit, and delete records.

### 4.4 Renewal Calendar

- Display upcoming renewal dates.
- View subscriptions associated with a selected date.
- Help users plan for upcoming recurring payments.

### 4.5 Renewal Reminders

The planned reminder system supports notifications before renewal dates, such as:

- Seven days before renewal.
- Three days before renewal.
- One day before renewal.
- On the renewal date.

The actual notification channels and scheduling implementation depend on the current development status.

### 4.6 Spending Analytics

Visualizations may include:

- Monthly spending trends.
- Category-wise spending.
- Billing-cycle distribution.
- Most expensive subscriptions.
- Estimated yearly subscription expenses.

Recharts is the proposed charting library.

### 4.7 Search and Filtering

Users can search and filter subscriptions by:

- Service name.
- Category.
- Billing cycle.
- Subscription status.
- Price range.

### 4.8 Profile and Settings

Planned account settings include:

- Name and email.
- Password management.
- Preferred currency.
- Notification preferences.

### 4.9 Additional Planned Features

- Subscription templates with predefined service information.
- Monthly spending budgets.
- Renewal forecasts for the next 30, 60, or 90 days.
- Savings suggestions.
- Exportable spending reports.
- Dark mode and enhanced responsive layouts.

## 5. Technology Stack

| Technology | Purpose |
|---|---|
| React.js | Frontend user interface |
| TypeScript | Type safety and maintainability |
| Tailwind CSS | Utility-based styling |
| shadcn/ui | Reusable interface components |
| React Router | Frontend navigation |
| Node.js | JavaScript runtime for the backend |
| Express.js | REST API and server-side routing |
| PostgreSQL | Relational database |
| Prisma ORM | Database access and schema management |
| JWT | Token-based authentication |
| bcrypt | Password hashing |
| React Hook Form | Form state management |
| Zod | Input validation |
| Recharts | Data visualization |
| date-fns | Date calculations and formatting |
| node-cron | Scheduled jobs, if used |
| Git and GitHub | Version control and collaboration |

### Deployment Plan

The proposed deployment options are:

- **Frontend:** Vercel
- **Backend:** Render
- **Database:** Neon PostgreSQL

Deployment providers can be changed depending on project requirements and availability.

## 6. System Architecture

The application follows a client-server architecture.

```text
                  USER
                    |
                    v
        +------------------------+
        |    React Frontend      |
        |  TypeScript / Tailwind |
        +------------------------+
                    |
             HTTP REST API
                    |
                    v
        +------------------------+
        |     Express Server     |
        | Routes and Controllers |
        +------------------------+
                    |
                    v
        +------------------------+
        |    Business Logic      |
        | Authentication         |
        | Subscription Services  |
        | Analytics and Reminders|
        +------------------------+
                    |
                    v
        +------------------------+
        |       Prisma ORM       |
        +------------------------+
                    |
                    v
        +------------------------+
        |      PostgreSQL        |
        +------------------------+
```

### Main Modules

- **Authentication module:** Handles registration, login, and authorization.
- **Subscription module:** Performs subscription CRUD operations.
- **Dashboard module:** Supplies summary statistics.
- **Analytics module:** Aggregates spending data.
- **Calendar module:** Organizes upcoming renewal dates.
- **Notification module:** Handles scheduled renewal reminders when configured.
- **Profile module:** Manages account settings.

## 7. Project Structure

The following is a recommended monorepo structure. Adjust it to match the actual repository.

```text
subscription-tracekr/
|
|-- client/
|   |-- public/
|   |-- src/
|   |   |-- assets/
|   |   |-- components/
|   |   |-- pages/
|   |   |-- layouts/
|   |   |-- hooks/
|   |   |-- services/
|   |   |-- context/
|   |   |-- utils/
|   |   |-- types/
|   |   |-- App.tsx
|   |   `-- main.tsx
|   |-- package.json
|   `-- vite.config.ts
|
|-- server/
|   |-- src/
|   |   |-- config/
|   |   |-- routes/
|   |   |-- controllers/
|   |   |-- services/
|   |   |-- middleware/
|   |   |-- validators/
|   |   |-- utils/
|   |   `-- app.ts
|   |-- prisma/
|   |   |-- schema.prisma
|   |   `-- seed.ts
|   |-- tests/
|   |-- package.json
|   `-- .env.example
|
|-- docs/
|   |-- SRS.md
|   |-- architecture.md
|   |-- database-design.md
|   `-- test-cases.md
|
|-- .gitignore
|-- README.md
`-- package.json
```

## 8. Prerequisites

Install the following software before setting up the application:

- Node.js (an active LTS version compatible with the project's dependencies).
- npm, included with Node.js.
- Git.
- PostgreSQL locally or access to a PostgreSQL database provider.
- A code editor such as Visual Studio Code.

Verify the installations:

```bash
node --version
npm --version
git --version
```

## 9. Installation and Setup

### Step 1: Clone the repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd subscription-tracekr
```

Replace the repository placeholder with the actual repository URL.

### Step 2: Install dependencies

If the frontend and backend have separate package files:

```bash
cd server
npm install
cd ../client
npm install
```

If a root workspace is configured, follow the root `package.json` scripts instead.

### Step 3: Configure environment variables

Create a `.env` file inside the backend directory using `.env.example` as a reference.

```bash
cd ../server
```

Add the appropriate database URL, authentication secret, and server port. See [Environment Configuration](#10-environment-configuration).

### Step 4: Configure the database

Create a PostgreSQL database and update the connection string in the backend environment file.

For a Prisma project, apply migrations:

```bash
npx prisma migrate dev
npx prisma generate
```

Run these commands from the directory containing the Prisma project configuration. If the project uses a different migration workflow, follow its documented instructions.

### Step 5: Start the backend

Use the development script defined in the backend `package.json`. For example, if `dev` is configured:

```bash
npm run dev
```

### Step 6: Start the frontend

Open another terminal:

```bash
cd client
npm run dev
```

Open the local URL printed by the frontend development server, commonly `http://localhost:5173` for Vite.

**Note:** The exact commands depend on the scripts defined in the repository. Update this section once the implementation is finalized.

## 10. Environment Configuration

Create `server/.env.example` containing placeholders such as:

```dotenv
PORT=5000
NODE_ENV=development

DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?schema=public"

JWT_SECRET="replace-with-a-long-random-secret"

CLIENT_URL="http://localhost:5173"
```

The actual `.env` file must not be committed to Git.

Use a strong, randomly generated JWT secret and appropriate database credentials. Additional environment variables may be required depending on the implemented features.

## 11. Database Setup

Subscription Tracekr uses PostgreSQL with Prisma ORM.

### Main Data Entities

**Users**
- Unique user ID.
- Name.
- Unique email address.
- Password hash.
- Creation and update timestamps, where applicable.

**Subscriptions**
- Subscription ID.
- Owner's user ID.
- Service name.
- Category.
- Price and currency.
- Billing cycle.
- Start date and next renewal date.
- Payment method.
- Auto-renew setting.
- Status and notes.
- Creation and update timestamps.

**Notifications** (if implemented)
- Notification ID.
- Related subscription ID.
- Reminder date/time.
- Notification type.
- Delivery status and timestamps.

### Relationships

- One user can own multiple subscriptions.
- Each subscription belongs to one user.
- A subscription may have multiple notification records.

Use foreign keys to preserve relationships. Enforce authorization so users can only access their own subscription data.

## 12. Running the Application

A typical local development setup uses two terminals.

**Terminal 1 — Backend**

```bash
cd server
npm run dev
```

**Terminal 2 — Frontend**

```bash
cd client
npm run dev
```

Ensure the database is available, environment variables are configured, and Prisma migrations have been applied before starting the server.

If the backend and frontend use different local ports, configure the API base URL and CORS settings accordingly.

## 13. API Documentation

The following is a proposed REST API contract. Implemented routes may differ and should be documented from the actual code.

### Authentication

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/register` | Register a user |
| POST | `/api/auth/login` | Authenticate a user |
| POST | `/api/auth/logout` | Log out or invalidate a session, if supported |
| GET | `/api/auth/me` | Retrieve the authenticated user's profile |

### Subscriptions

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/subscriptions` | List the authenticated user's subscriptions |
| GET | `/api/subscriptions/:id` | Retrieve one subscription |
| POST | `/api/subscriptions` | Create a subscription |
| PUT | `/api/subscriptions/:id` | Update a subscription |
| DELETE | `/api/subscriptions/:id` | Delete a subscription |

### Dashboard and Analytics

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/dashboard/summary` | Retrieve subscription summary statistics |
| GET | `/api/analytics/spending` | Retrieve spending data |
| GET | `/api/analytics/categories` | Retrieve category totals |
| GET | `/api/calendar/renewals` | Retrieve renewals within a date range |

### Profile

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/profile` | Retrieve profile settings |
| PUT | `/api/profile` | Update supported profile fields |

All endpoints are proposed examples, not a claim that they already exist. Use the actual endpoint names and response formats in the final API documentation.

## 14. Database Design

The primary entities are Users and Subscriptions, with Notifications as an optional related entity.

```text
USERS
-----
id (Primary Key)
name
email (Unique)
passwordHash
createdAt
updatedAt

       1
       |
       | owns
       |
       N

SUBSCRIPTIONS
-------------
id (Primary Key)
userId (Foreign Key)
serviceName
category
price
currency
billingCycle
startDate
nextRenewal
paymentMethod
autoRenew
status
notes
createdAt
updatedAt

       1
       |
       | may have
       |
       N

NOTIFICATIONS
-------------
id (Primary Key)
subscriptionId (Foreign Key)
remindAt
type
sentAt
status
```

The final schema should match `schema.prisma`. Additional fields and constraints should be documented if implemented.

## 15. Team Responsibilities

The project is developed by three members.

| Member | Primary Responsibilities |
|---|---|
| Member 1 | React frontend, UI components, dashboard, forms, responsive design, and frontend integration |
| Member 2 | Express APIs, authentication, Prisma schema, PostgreSQL, validation, and authorization |
| Member 3 | Analytics, spending calculations, renewal calendar, reminders, testing, integration, and deployment |

These assignments should be updated to reflect the team's actual allocation and individual contributions.

## 16. Testing

Testing should cover:

- User registration and login.
- Invalid form inputs.
- Creating, viewing, updating, and deleting subscriptions.
- Preventing access to another user's subscriptions.
- Monthly and yearly spending calculations.
- Search and filtering.
- Renewal date calculations.
- Analytics data accuracy.
- Error handling for unavailable database connections and invalid requests.

### Example Test Cases

| Test | Expected Result |
|---|---|
| Register with valid details | Account is created successfully |
| Login with incorrect password | Authentication fails safely |
| Add a valid subscription | Subscription is saved and displayed |
| Submit an invalid price | Validation error is returned |
| Edit a subscription | Updated information is displayed |
| Delete an owned subscription | Subscription is removed |
| Access another user's subscription | Access is denied |
| Calculate monthly spending | Correct normalized total is returned |

Record actual outputs and pass/fail status only after running each test. Store detailed test cases and screenshots in the `docs/` or `tests/` directories.

## 17. Security Considerations

- Hash passwords using bcrypt or an appropriate password-hashing configuration.
- Validate and sanitize incoming request data.
- Use authentication and authorization middleware.
- Restrict subscription queries to the authenticated user.
- Protect secrets through environment variables.
- Configure CORS for trusted origins.
- Avoid logging passwords, tokens, or sensitive personal data.
- Use HTTPS in production.
- Apply database constraints and handle errors safely.
- Keep dependencies updated.

JWT storage, expiration, refresh-token handling, and logout behavior must follow the implementation's actual authentication design.

## 18. Limitations

The initial version relies on manual subscription entry. It does not automatically discover purchases or retrieve account details from external subscription providers.

Other limitations may include:

- Reminder delivery depends on the notification implementation and whether the application is running.
- Subscription amounts depend on accurate user input.
- Currency conversion requires a separate exchange-rate source and is not implied by recording multiple currencies.
- Analytics accuracy depends on correctly handling billing cycles, dates, and currencies.
- External integrations are outside the initial scope.

Update this section as the application evolves.

## 19. Future Enhancements

Potential future improvements include:

- Gmail integration to detect subscription-related emails.
- Receipt and invoice extraction using OCR.
- AI-powered spending insights.
- Bank transaction integration through supported providers.
- Subscription price history.
- Shared subscription expense splitting.
- Multi-currency conversion using exchange-rate data.
- Budget alerts and savings simulations.
- CSV/PDF report exports.
- Mobile application or browser extension.

These features are not part of the initial implementation unless explicitly completed.

## 20. Contribution Guidelines

Team members should:

1. Create a feature branch for each task.
2. Use meaningful commit messages.
3. Keep changes focused and documented.
4. Test changes before opening a pull request.
5. Review and merge changes into the main branch.
6. Update documentation when APIs, database models, or setup instructions change.
7. Avoid committing secrets or local environment files.

Example Git workflow:

```bash
git checkout -b feature/subscription-crud
git add .
git commit -m "Implement subscription CRUD"
git push origin feature/subscription-crud
```

Replace the branch name and commit message to match the work performed.

## 21. AI Usage Disclosure

If generative AI tools are used, document their use according to the course's academic integrity requirements.

Suggested template:

- **Tool used:** Claude AI
- **Purpose:** [Documentation, code assistance, debugging, diagram generation, or test-case preparation]
- **Content generated:** [Specific sections or artifacts]
- **Student verification:** [How the team reviewed, tested, corrected, and modified the output]

Students remain responsible for verifying all generated content and ensuring they understand the submitted implementation.

## 22. License

The project license has not yet been specified. Add an appropriate license file if the team decides to distribute the source code publicly.

---

**Project:** Subscription Tracekr  
**Category:** Software Engineering / Full-Stack Web Development  
**Development Status:** Update to reflect the current implementation  
**Team Size:** 3 members

For setup issues, consult the project team and verify the installed dependencies, environment configuration, database connection, and documented run commands.
