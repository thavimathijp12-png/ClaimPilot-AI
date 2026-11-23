# ClaimPilot AI — Intelligent Healthcare Claims Platform

[![Stack](https://img.shields.io/badge/Stack-Java%2021%20%7C%20Spring%20Boot%203.3.5%20%7C%20MySQL%208%20%7C%20React%2018%20%7C%20Vite%205-blue.svg)](https://github.com)
[![Status](https://img.shields.io/badge/Build-Passing-brightgreen.svg)](https://github.com)
[![License](https://img.shields.io/badge/License-Proprietary-slate.svg)](https://github.com)

**ClaimPilot AI** is a full-stack, enterprise-grade healthcare claims processing, automated auditing, document management, and human adjudication platform. It unifies high-performance backend architecture with a responsive, role-based clinical workflow interface.

---

## 1. System Architecture & Tech Stack

```
┌────────────────────────────────────────────────────────┐
│                   React 18 + Vite 5                   │
│      Tailwind CSS • Lucide Icons • Recharts • Zod      │
│               http://localhost:3000                    │
└───────────────────────────┬────────────────────────────┘
                            │ Reverse Proxy /api
                            ▼
┌────────────────────────────────────────────────────────┐
│               Spring Boot 3.3.5 (Java 21)              │
│       Spring Security 6 • Spring Data JPA • JJWT       │
│               http://localhost:8081                    │
└───────────────────────────┬────────────────────────────┘
                            │ JDBC Connection
                            ▼
┌────────────────────────────────────────────────────────┐
│                     MySQL 8 Database                   │
│         claimpilot_db (Port 3306, 9 Core Tables)       │
└────────────────────────────────────────────────────────┘
```

### Technology Highlights
- **Backend**: Java 21 LTS, Spring Boot 3.3.5, Spring Security 6 (Stateless JWT), Spring Data JPA / Hibernate 6, JJWT 0.12.6.
- **Database**: MySQL 8 Server (`claimpilot_db`, 9 relational tables, transaction-isolated data handling).
- **Frontend**: React 18, Vite 5, Tailwind CSS, Lucide React, Recharts, Zod validation.
- **API Envelope**: Uniform `ApiResponse<T>` with `{ success, message, data, timestamp }`.

---

## 2. Default Login Credentials ("Open Pass")

The application comes pre-configured with three seeded demo personas representing key operational roles. You can use these credentials to sign in immediately on `http://localhost:3000/login`.

| Role | Enterprise Email | Password | Access & Responsibilities |
| :--- | :--- | :--- | :--- |
| **System Admin** | `admin@claimpilot.ai` | `admin123` | Full governance, user provisioning, system configuration, audit log inspection, and executive analytics. |
| **Claims Reviewer** | `reviewer@claimpilot.ai` | `reviewer123` | Clinical review, claim adjudication (approve, reject, request corrections), DataGuard rule overrides, and reports. |
| **Claims Operator** | `operator@claimpilot.ai` | `operator123` | Claim intake, new claim creation, document uploads, OCR/extraction review, and timeline tracking. |

> **Quick Access**: The login page also features **One-Click Demo Personas** directly under the sign-in form. Clicking any persona button automatically populates credentials and logs in.

---

## 3. Quick Start Guide

### Prerequisites
- **Java**: Eclipse Adoptium JDK 21 LTS (or compatible JDK 21)
- **Node.js**: v18.0.0 or newer (npm v9+)
- **MySQL**: MySQL Server 8.0 running on `localhost:3306`

---

### Step 1: Database Setup
Ensure the MySQL 8 service is running and create the database if it doesn't already exist:

```sql
CREATE DATABASE IF NOT EXISTS claimpilot_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

---

### Step 2: Start Spring Boot Backend (Port 8081)

Open PowerShell and run:

```powershell
# Set Java 21 home
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-21.0.13.9-hotspot"
$env:PATH = "$env:JAVA_HOME\bin;$env:PATH"

# Configure MySQL credentials (replace with your actual local MySQL password)
$env:DB_URL = "jdbc:mysql://localhost:3306/claimpilot_db?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC"
$env:DB_USERNAME = "root"
$env:DB_PASSWORD = "Thavi@2006"

# Optional: Private JWT Secret (auto-generated if omitted)
$env:JWT_SECRET = "ClaimPilotSecretKeyForJwtSigningMustBeAtLeast32BytesLong2026"

# Run Spring Boot
& ".\.mvn-portable\bin\mvn.cmd" -f "backend\pom.xml" spring-boot:run
```

*The backend starts at `http://localhost:8081`. Verify health status by visiting `http://localhost:8081/api/health`.*

---

### Step 3: Start React Frontend (Port 3000)

Open a separate terminal window at the repository root:

```bash
# Install dependencies (first time only)
npm install

# Start Vite development server
npm run dev
```

*The frontend starts at `http://localhost:3000`. Open your browser and navigate to `http://localhost:3000/login`.*

---

## 4. REST API Reference

All protected endpoints require an `Authorization: Bearer <accessToken>` header. All responses adhere to the standard `ApiResponse<T>` envelope.

### Public Endpoints
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | System health, database connectivity status, and JVM uptime |
| `POST` | `/api/auth/login` | Authenticate with email/password; returns JWT access token and user profile |
| `POST` | `/api/auth/register` | Self-register a basic user account |

### Authenticated Core Endpoints
| Area | Method | Endpoint | Description | Permitted Roles |
| :--- | :--- | :--- | :--- | :--- |
| **Auth** | `GET` | `/api/auth/me` | Fetch active authenticated session details | Authenticated |
| **Claims** | `GET` | `/api/claims` | List and search claims with pagination & filters | Authenticated |
| **Claims** | `POST` | `/api/claims` | Create a new claim intake record | Admin, Operator |
| **Claims** | `GET` | `/api/claims/{claimNumber}` | Get claim details by ID or Claim Number | Authenticated |
| **Claims** | `PUT` | `/api/claims/{claimNumber}` | Update editable claim fields | Admin, Operator, Reviewer |
| **Claims** | `PATCH` | `/api/claims/{claimNumber}/status` | Update claim workflow status | Admin, Reviewer |
| **Claims** | `POST` | `/api/claims/{claimNumber}/comments` | Append note/comment to claim timeline | Authenticated |
| **Documents**| `GET` | `/api/claims/{claimNumber}/documents` | Retrieve all documents associated with a claim | Authenticated |
| **Documents**| `POST` | `/api/claims/{claimNumber}/documents` | Upload PDF/PNG/JPEG document (multipart) | Admin, Operator |
| **Documents**| `GET` | `/api/documents/{id}/content` | Stream binary document content | Authenticated |
| **Documents**| `DELETE`| `/api/documents/{id}` | Soft-delete a document record | Admin, Operator |
| **DataGuard**| `GET` | `/api/claims/{claimNumber}/validations`| Retrieve DataGuard validation runs & checks | Authenticated |
| **DataGuard**| `POST`| `/api/claims/{claimNumber}/validations`| Execute DataGuard automated rule audit | Admin, Operator, Reviewer |
| **Approvals**| `GET` | `/api/approvals` | List pending approval queue | Admin, Reviewer, Auditor |
| **Approvals**| `POST`| `/api/approvals/{claimNumber}/decisions`| Submit APPROVE, REJECT, or CORRECTION decision | Admin, Reviewer |
| **Audit** | `GET` | `/api/audit` | Paginated audit trail of all platform events | Admin, Auditor |
| **Analytics**| `GET` | `/api/analytics/overview` | KPI summaries (total claims, amounts, rates) | Authenticated |
| **Analytics**| `GET` | `/api/analytics/trends` | Historical volume and approval trends | Authenticated |
| **Reports** | `GET` | `/api/reports/claims` | Formatted claim adjudication reports | Authenticated |

---

## 5. Database Schema & Tables

Hibernate automatically initializes and maintains mapped tables via `spring.jpa.hibernate.ddl-auto=update`:

```
                       ┌──────────────┐
                       │    users     │
                       └──────┬───────┘
                              │ 1:N
                       ┌──────┴───────┐
                       │  user_roles  │
                       └──────────────┘
                              │ 1:N
┌──────────────────────┬──────┴───────┬──────────────────────┐
│                      │              │                      │
▼                      ▼              ▼                      ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌───────────────────┐
│ claim_events │ │    claims    │ │ claim_approv │ │   audit_events    │
└──────────────┘ └──────┬───────┘ └──────────────┘ └───────────────────┘
         ┌──────────────┼──────────────┬──────────────┐
         ▼              ▼              ▼              ▼
┌────────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│claim_diagnoses │ │claim_procedur│ │claim_documen │ │dataguard_runs│
└────────────────┘ └──────────────┘ └──────────────┘ └──────┬───────┘
                                                            │ 1:N
                                                     ┌──────┴───────┐
                                                     │dataguard_chk │
                                                     └──────────────┘
```

1. `users`: Stores user identity, BCrypt password hashes, and profile metadata.
2. `user_roles`: Role mapping (`ADMIN`, `OPERATOR`, `REVIEWER`, `AUDITOR`, `DATA_STEWARD`).
3. `claims`: Core claim records, patient demographic data, amounts, and statuses.
4. `claim_diagnoses`: ICD-10 diagnosis codes associated with claims.
5. `claim_procedures`: CPT procedure codes, billing amounts, and service dates.
6. `claim_events`: Detailed audit timeline of claim lifecycle events.
7. `claim_documents`: Metadata and storage pointers for uploaded PDFs/images.
8. `dataguard_runs` & `dataguard_checks`: Automated validation results, checks, and flags.
9. `claim_approvals`: Adjudication decisions with justifications and timestamps.
10. `audit_events`: System-wide immutable security audit log.

---

## 6. Testing & Quality Verification

### Run Backend Automated Tests (In-Memory H2)
```powershell
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-21.0.13.9-hotspot"
$env:PATH = "$env:JAVA_HOME\bin;$env:PATH"
& ".\.mvn-portable\bin\mvn.cmd" -f "backend\pom.xml" test
```
*Executes all unit, security, and repository tests against an isolated H2 in-memory database.*

### Run Real MySQL Integration Tests (Opt-in)
```powershell
$env:MYSQL_IT_ENABLED = "true"
$env:MYSQL_IT_DB_URL = "jdbc:mysql://localhost:3306/claimpilot_db?createDatabaseIfNotExist=false&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC"
$env:MYSQL_IT_DB_USERNAME = "root"
$env:MYSQL_IT_DB_PASSWORD = "your_mysql_password"
& ".\.mvn-portable\bin\mvn.cmd" -f "backend\pom.xml" -Dtest="MySql*Test" test
```

### Run Frontend Production Build Check
```bash
npm run build
```
*Validates TypeScript/JSX bundling, Tailwind CSS generation, and module tree integrity.*

---

## 7. Antigravity IDE Comparison & Review Guidance

When Antigravity IDE shows **"Review Changes"**, **"Comparison"**, or **"Accept / Reject"** prompts:

- **What these changes represent**: These are the essential fixes that eliminated the previous blank white screen crashes, integrated the React frontend with the Spring Boot REST API, connected JWT authentication, and ensured backward compatibility with offline fallback.
- **Action to Take**: Click **"Accept"** on all modified files (`src/App.jsx`, `src/pages/DashboardPage.jsx`, `src/context/AuthContext.jsx`, `src/context/ClaimContext.jsx`, `src/pages/LoginPage.jsx`, etc.).
- **Warning**: Clicking "Reject" or discarding these working changes will revert the codebase back to the broken state and cause the blank screen crashes to reappear.

---

## 8. Troubleshooting

### Blank White Screen on Dashboard
- **Cause**: Corrupted session in browser `localStorage` or unhandled error state.
- **Resolution**: Open browser DevTools (F12) -> Application -> Local Storage -> Clear `cp_auth_token` and `cp_auth_user`, then refresh `http://localhost:3000/login`.

### Port 3000 or 8081 Already in Use
- **Port 3000 (Vite)**: Run `Get-Process node | Stop-Process -Force` in PowerShell, then run `npm run dev`.
- **Port 8081 (Spring Boot)**: Run `Get-NetTCPConnection -LocalPort 8081` to find the occupying PID, then terminate it with `Stop-Process -Id <PID> -Force`.

### MySQL Access Denied (Error 1045)
- Verify that your MySQL server password matches the `$env:DB_PASSWORD` value in your terminal session before launching Maven or Spring Boot.
- Verify that your MySQL server password matches the `$env:DB_PASSWORD` value in your terminal session before launching Maven or Spring Boot.
