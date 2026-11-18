# ClaimPilot AI

ClaimPilot AI is a React demo for healthcare claims intake, document review, data-quality checks, and human adjudication. It uses synthetic sample records and browser storage; it is not a production claims system.

## Features

- Operational dashboard with claim counts, status summaries, and date-window analytics.
- Claims search, status/type filters, sorting, pagination, CSV export, and validated claim intake.
- Document repository with PDF/PNG/JPG validation, simulated upload progress, and a sample document preview.
- DataGuard quality summaries and seeded validation findings.
- Human review of stored extraction samples, editable fields, confidence indicators, and verification history.
- Approval, rejection, and correction-request workflows with confirmation and required justification.
- Searchable, filterable activity history with relative and exact timestamps.
- Responsive navigation, role-based demo personas, and configurable table density.

## Technology

- React 18 and Vite 5
- Tailwind CSS
- React Router
- Zod validation
- Recharts and Lucide React
- Browser `localStorage` for demo state

## Requirements

- Node.js 18 or newer
- npm 9 or newer

## Setup

From the project directory, install dependencies and start the development server:

```bash
npm install
npm run dev
```

Vite serves the app at `http://localhost:3000`.

Create and preview a production build:

```bash
npm run build
npm run preview
```

## Demo accounts

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@claimpilot.ai` | `admin123` |
| Claims Operator | `operator@claimpilot.ai` | `operator123` |
| Claims Reviewer | `reviewer@claimpilot.ai` | `reviewer123` |

The login screen also provides one-click demo persona selection.

## Demo limitations and data handling

- There is no backend, live AI/OCR service, or external claims integration. Extraction examples are seeded mock data; re-running an extraction only refreshes the demo sample.
- Document upload progress and classification are simulated. The selected file is not sent to a server.
- Claims, document metadata, activity, and preferences are stored in the browser. Clearing site data removes this demo state.
- All included patient, policy, provider, and claim details are synthetic. Do not enter real protected health information.
- Demo credentials and browser storage are not production authentication or secure data storage. This application is not HIPAA-compliant and must not be used to process real claims.

## Project layout

- `src/pages/` - routed application screens
- `src/components/common/` - reusable tables, dialogs, upload controls, and status UI
- `src/components/layout/` - application shell, navigation, and global search
- `src/context/` - authentication, claim state, and notifications
- `src/data/` - synthetic demo records and extraction samples
- `src/services/` - browser storage and CSV export helpers
- `src/utils/` - validation, formatting, and styling utilities
