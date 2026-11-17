# ClaimPilot AI — Enterprise Healthcare Claims Processing & Data Quality Platform

> **Tagline:** *Smarter Claims. Better Healthcare.*

ClaimPilot AI is a production-grade, enterprise-tier SaaS frontend for automated healthcare claims intake, optical character recognition (OCR) verification, automated multi-rule data quality assurance (**DataGuard IQ**), and human-controlled clinical adjudication.

---

## 🚀 Key Modules & Capabilities

1. **Authentication & Role-Based Access Control (RBAC):**
   - Pre-configured demo accounts for **Admin** (Dr. Eleanor Vance), **Claims Operator** (Marcus Chen), and **Claims Reviewer** (Sarah Jenkins, RN).
   - Instant 1-click persona switching, persistent session management, remember-me support, and secure credential handling.

2. **Executive Operational Dashboard:**
   - Real-time operational metrics: Total Claims, Pending Clinical Review, Approved, Rejected, and Billed Financial Volume.
   - Recharts visual analytics: 6-month claims trajectory, approval-to-intake correlation, and DataGuard IQ score gauge.
   - Live audit activity feed and operator quick actions.

3. **Healthcare Claims Management:**
   - Comprehensive claims ledger with full text search across Claim IDs, synthetic patient names, policy references, and hospitals.
   - Multi-parameter filtering (by status, encounter type, date range) and column sorting.
   - Integrated modal for registering new claims with automated client-side validation and DataGuard seed audits.
   - CSV export functionality.

4. **Claim 360° Inspection Details:**
   - Patient demographic and insurance coverage ledger.
   - Clinical encounter summary, hospital NPI validation, ICD-10 and CPT coding lists.
   - Attached document roster with preview shortcuts.
   - Chronological audit timeline with reviewer comment appending.
   - Adjudication decision actions with mandatory reason enforcement.

5. **Document Repository & Medical Viewer:**
   - Drag-and-drop file uploader supporting PDF, PNG, and JPG medical documents up to 15MB.
   - Simulated upload progress and automated document classification (Hospital Bills, Discharge Summaries, Prescriptions, CMS-1500 Universal Claim Forms).
   - High-fidelity medical bill and ledger document preview modal with zoom controls.

6. **DataGuard IQ Automated Quality Engine:**
   - Differentiating data quality dashboard scoring claims across 24+ automated rules.
   - Categorized metric cards for Valid Fields, Missing Fields, Invalid Syntax, Inconsistencies, and Duplicate Warnings.
   - **Important Compliance Notice:** Clear distinction that duplicate warnings highlight potential billing overlap requiring human review, *not* proof of fraud.
   - Interactive re-audit trigger and quality report CSV export.

7. **AI Extraction Review (Human-in-the-Loop):**
   - Split-screen workspace: Interactive document canvas with page navigation on the left, optical bounding box overlays, and extracted fields on the right.
   - Field-level OCR confidence indicators with color-coded confidence tiers.
   - Editable inputs allowing operators to override OCR suggestions with manual verification stamping.
   - Explicit compliance notice: *AI results are suggestions and must be verified by a human operator.*

8. **Clinical Adjudication & Approval Queue:**
   - Dedicated pending review queue for authorized clinical reviewers.
   - Review checklist covering patient eligibility, ledger reconciliation, and physician attestation.
   - Human-controlled decision dialogs: **Approve**, **Reject** (with mandatory justification), and **Request Correction** (with mandatory instructions).

9. **Audit & Activity History:**
   - Chronological, tamper-evident audit trail logging every user login, claim intake, document upload, OCR edit, and adjudication decision.
   - Multi-category and severity filtering with one-click CSV export.

10. **Reports & Predictive Analytics:**
    - Executive reports analyzing claim volumes, adjudication turnaround velocities, claim type distributions, and document OCR accuracy benchmarks.

11. **System Settings & Governance:**
    - User profile configuration, alert notification toggles, RBAC capability matrix, HIPAA security notices, and factory reset to default demo data.

12. **Knowledge Base & Support:**
    - 5-stage adjudication lifecycle overview, interactive FAQ accordion, and integrated operational support ticketing.

---

## 🛠️ Technology Stack

- **Framework:** React.js 18 + Vite 5
- **Styling:** Tailwind CSS + PostCSS + Autoprefixer
- **Icons:** Lucide React
- **Data Visualization:** Recharts
- **Routing:** React Router DOM (v6)
- **Forms & Validation:** React Hook Form, Zod
- **Utilities:** clsx, tailwind-merge
- **Persistence:** LocalStorage with default mock seed fallback

---

## 📂 Project Structure

```
ClaimPilot AI/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── public/
│   └── favicon.svg
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── common/
│   │   │   ├── ActivityTimeline.jsx
│   │   │   ├── ChartCard.jsx
│   │   │   ├── ConfirmDialog.jsx
│   │   │   ├── DataTable.jsx
│   │   │   ├── EmptyState.jsx
│   │   │   ├── FileUploader.jsx
│   │   │   ├── FormField.jsx
│   │   │   ├── LoadingSpinner.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── PageHeader.jsx
│   │   │   ├── Pagination.jsx
│   │   │   ├── SearchInput.jsx
│   │   │   ├── StatCard.jsx
│   │   │   ├── StatusBadge.jsx
│   │   │   └── Toast.jsx
│   │   └── layout/
│   │       ├── AppLayout.jsx
│   │       ├── AppSidebar.jsx
│   │       ├── AppTopbar.jsx
│   │       ├── Breadcrumbs.jsx
│   │       ├── GlobalSearchModal.jsx
│   │       ├── NotificationDropdown.jsx
│   │       └── UserProfileDropdown.jsx
│   ├── context/
│   │   ├── AuthContext.jsx
│   │   ├── ClaimContext.jsx
│   │   └── ToastContext.jsx
│   ├── data/
│   │   ├── mockActivity.js
│   │   ├── mockAnalytics.js
│   │   ├── mockClaims.js
│   │   ├── mockDataGuard.js
│   │   ├── mockDocuments.js
│   │   ├── mockExtractions.js
│   │   └── mockUsers.js
│   ├── hooks/
│   │   ├── useAuth.js
│   │   └── useToast.js
│   ├── pages/
│   │   ├── ActivityHistoryPage.jsx
│   │   ├── ApprovalsPage.jsx
│   │   ├── ClaimDetailsPage.jsx
│   │   ├── ClaimsPage.jsx
│   │   ├── DashboardPage.jsx
│   │   ├── DataGuardPage.jsx
│   │   ├── DocumentsPage.jsx
│   │   ├── ExtractionReviewPage.jsx
│   │   ├── HelpPage.jsx
│   │   ├── LoginPage.jsx
│   │   ├── NotFoundPage.jsx
│   │   ├── ReportsPage.jsx
│   │   └── SettingsPage.jsx
│   ├── routes/
│   │   ├── AppRoutes.jsx
│   │   └── ProtectedRoute.jsx
│   ├── services/
│   │   ├── exportService.js
│   │   └── storageService.js
│   ├── styles/
│   │   └── index.css
│   ├── utils/
│   │   ├── cn.js
│   │   └── formatters.js
│   ├── App.jsx
│   └── main.jsx
```

---

## 🏃 Getting Started & Commands

### Prerequisites
- Node.js (v18+ or v20+ recommended)
- npm (v9+)

### Installation
```bash
npm install
```

### Start Development Server
```bash
npm run dev
```
Navigate to `http://localhost:3000` (or the port specified by Vite in the terminal).

### Production Build & Preview
```bash
npm run build
npm run preview
```

---

## 🔑 Pre-Configured Demo Credentials

| Role | Email | Password | Persona | Primary Responsibilities |
| :--- | :--- | :--- | :--- | :--- |
| **Admin** | `admin@claimpilot.ai` | `admin123` | Dr. Eleanor Vance | Full executive access, compliance oversight, system governance |
| **Claims Operator** | `operator@claimpilot.ai` | `operator123` | Marcus Chen | Claim intake, document uploads, OCR extraction verification |
| **Claims Reviewer** | `reviewer@claimpilot.ai` | `reviewer123` | Sarah Jenkins, RN | Clinical necessity reviews, adjudication (Approve / Reject / Correction) |

*Note: You can also use the one-click demo persona selector on the login screen for instant access.*

---

## 🛡️ Enterprise Compliance & Future Backend Readiness

- **Spring Boot Backend Ready:** All services and context methods (`storageService.js`, `ClaimContext.jsx`) mirror standard REST endpoint contracts (`GET /api/claims`, `POST /api/claims`, `POST /api/claims/{id}/adjudicate`, `POST /api/documents/upload`, `GET /api/dataguard/audit/{id}`).
- **Synthetic Data Guarantee:** All patient names, policy IDs, hospital records, and codes are completely synthetic demo representations.
- **Zero Python / Frontend-Only:** Runs self-contained within any modern browser with persistent localStorage state.

