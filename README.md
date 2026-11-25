# Real Estate Platform - Enterprise Admin Panel

A production-grade, secure, modern Admin Dashboard frontend application for the Real Estate Listing Platform, inspired by 99acres and NoBroker.

The Admin Panel operates as a completely separate Next.js frontend application connecting to the existing Express.js backend API and PostgreSQL database.

---

## 🚀 Key Features

- **Admin Authentication & RBAC**:
  - Secure credential authentication with JWT access tokens and HttpOnly refresh cookies.
  - Strict backend role enforcement: Only `ADMIN` and `SUPER_ADMIN` accounts are granted dashboard access. Normal users and agents are strictly rejected with 403 Forbidden.
  - Silent token renewal with automatic Axios queue retry and session timeout handling.
- **Platform Overview & Dashboard**:
  - 13 live database-aggregated metric cards (Total Users, Active/Inactive Users, Properties, Approvals, Inquiries, Today's Listings, and Registrations).
  - Visual charts powered by Recharts (Property Types, Listing Types, City distribution, User growth).
  - Real-time recent activity feeds (recent user registrations, property submissions, inquiries, pending approvals, and admin audit logs).
- **User Management**:
  - Full server-side paginated and searchable table with role, status, and date filters.
  - Detailed user view with contact info, listed properties, and lead inquiries.
  - Account moderation: Activate, Suspend, Deactivate with confirmation dialogs.
- **Property Management & Moderation**:
  - Searchable property table with filtering by City, Locality, Property Type, Listing Type, Price range, and Status.
  - Dedicated **Pending Approvals Queue** (`/properties/pending`) for moderation.
  - Approval and Rejection flow with mandatory rejection reasons recorded in audit history.
  - Comprehensive Property Details (`/properties/[id]`) with image gallery, specs, amenities, owner contact, and moderation history.
- **Inquiry & Lead Management**:
  - Table of all buyer inquiries across all listings.
  - Status management: `NEW`, `CONTACTED`, `IN_PROGRESS`, `CLOSED`, `SPAM`.
- **Reports & Analytics**:
  - Monthly growth curves for registrations and property listings.
  - Geographic market share by city.
  - Sale vs. Rental ratio and moderation status distribution.
- **Immutable Audit Trail**:
  - Full record of administrative actions, actor IDs, IP addresses, target entities, and JSON metadata.
- **Settings & Profile**:
  - Admin personal details management.
  - Secure password changes with complexity validation and session invalidation.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 14 (App Router) |
| **Language** | TypeScript (Strict mode) |
| **Styling** | Tailwind CSS |
| **HTTP Client** | Axios (with credentials & interceptors) |
| **Forms & Validation** | React Hook Form & Zod |
| **Icons** | Lucide React |
| **Visual Charts** | Recharts |
| **Backend & Database** | Node.js / Express.js / Prisma ORM / PostgreSQL |

---

## 📁 Project Structure

```text
admin-panel/
├── src/
│   ├── app/
│   │   ├── (admin)/
│   │   │   ├── audit-logs/page.tsx
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── inquiries/
│   │   │   │   ├── [id]/page.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── properties/
│   │   │   │   ├── [id]/page.tsx
│   │   │   │   ├── pending/page.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── reports/page.tsx
│   │   │   ├── settings/page.tsx
│   │   │   ├── users/
│   │   │   │   ├── [id]/page.tsx
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   ├── login/page.tsx
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── not-found.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── dialogs/ConfirmationModal.tsx
│   │   ├── layout/
│   │   │   ├── Breadcrumbs.tsx
│   │   │   ├── Header.tsx
│   │   │   └── Sidebar.tsx
│   │   ├── tables/Pagination.tsx
│   │   └── ui/
│   │       ├── Badge.tsx
│   │       ├── EmptyState.tsx
│   │       ├── LoadingSkeleton.tsx
│   │       └── ToastContext.tsx
│   ├── features/
│   │   └── auth/AuthContext.tsx
│   ├── lib/
│   │   └── utils.ts
│   ├── services/
│   │   ├── adminAuditLogService.ts
│   │   ├── adminAuthService.ts
│   │   ├── adminInquiryService.ts
│   │   ├── adminPropertyService.ts
│   │   ├── adminReportService.ts
│   │   ├── adminSettingsService.ts
│   │   ├── adminUserService.ts
│   │   ├── api.ts
│   │   └── dashboardService.ts
│   └── types/index.ts
├── .env.example
├── .env.local
├── package.json
├── tailwind.config.js
└── tsconfig.json
```

---

## ⚡ Getting Started

### Prerequisites

- Node.js 18+ or 20+ installed.
- PostgreSQL database running (database: `Realestate` on port 5432).
- Backend running at `http://localhost:5000/api/v1`.

### 1. Environment Configuration

Create or verify `.env.local` inside `admin-panel/`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

### 2. Install Dependencies

```bash
cd "D:\Tech Project\admin-panel"
npm install
```

### 3. Bootstrap Initial Admin User

If not already seeded, create the initial platform administrator in the backend:

```bash
cd "D:\Tech Project\real-estate-Server"
npm run bootstrap:admin
```

Default credentials configured in `.env`:
- **Email**: `admin@realestateplatform.com`
- **Password**: `AdminSecurePass@2026`

### 4. Running the Development Server

```bash
npm run dev
```

The Admin Panel will be available at: **http://localhost:3001**

### 5. Production Build

```bash
npm run build
npm start
```

---

## 🛡️ Authentication & Security Flow

1. Admin submits login credentials via `/login`.
2. Backend endpoint `POST /api/v1/admin/auth/login` checks credentials and enforces that `user.role` is either `ADMIN` or `SUPER_ADMIN`.
3. If a standard user attempts login, backend rejects the request with HTTP `403 Forbidden`.
4. On success, an HttpOnly cookie containing the rotating refresh token is issued and an access token is returned in memory.
5. All administrative API calls include `Authorization: Bearer <token>` and `withCredentials: true`.
6. On access token expiry, Axios interceptor transparently issues `POST /api/v1/admin/auth/refresh` without losing state.
7. On session invalidation, the user is redirected safely to `/login?session_expired=true`.

---

## 📡 Backend Admin API Endpoints

| Group | Method | Endpoint | Description |
|---|---|---|---|
| **Auth** | POST | `/api/v1/admin/auth/login` | Secure admin login (rate-limited) |
| | POST | `/api/v1/admin/auth/refresh` | Refresh access token via cookie |
| | POST | `/api/v1/admin/auth/logout` | Revoke refresh token & clear cookies |
| | GET | `/api/v1/admin/auth/me` | Current authenticated admin profile |
| **Profile** | GET | `/api/v1/admin/profile` | Retrieve admin profile |
| | PATCH | `/api/v1/admin/profile` | Update admin name and phone |
| | PATCH | `/api/v1/admin/change-password` | Update password & revoke sessions |
| **Dashboard**| GET | `/api/v1/admin/dashboard/stats` | 13 live system metric aggregations |
| | GET | `/api/v1/admin/dashboard/recent-activity` | 5 latest events across users/props/inquiries/logs |
| | GET | `/api/v1/admin/analytics` | High-level analytics summary |
| **Users** | GET | `/api/v1/admin/users` | List users with pagination, search, role & status filters |
| | GET | `/api/v1/admin/users/:id` | Full user details with listings & inquiries |
| | PATCH | `/api/v1/admin/users/:id/status` | Update account status (`ACTIVE`, `SUSPENDED`, `DEACTIVATED`) |
| | PATCH | `/api/v1/admin/users/:id/role` | SuperAdmin update of role (`ADMIN`, `AGENT`, etc.) |
| **Properties**| GET | `/api/v1/admin/properties` | List properties with comprehensive filters |
| | GET | `/api/v1/admin/properties/pending` | Dedicated pending approval queue |
| | GET | `/api/v1/admin/properties/:id` | Detailed property review with full relations |
| | PATCH | `/api/v1/admin/properties/:id/approve` | Approve listing, set verifiedAt, notify owner |
| | PATCH | `/api/v1/admin/properties/:id/reject` | Reject listing with required reason |
| | PATCH | `/api/v1/admin/properties/:id/status` | Update status (`APPROVED`, `ARCHIVED`, `DRAFT`, etc.) |
| | DELETE | `/api/v1/admin/properties/:id` | Soft delete property |
| | GET | `/api/v1/admin/properties/:id/moderation-history` | View moderation audit trail |
| **Inquiries** | GET | `/api/v1/admin/inquiries` | List all buyer inquiries with search & status filters |
| | GET | `/api/v1/admin/inquiries/:id` | Inquiry details with buyer & owner contacts |
| | PATCH | `/api/v1/admin/inquiries/:id/status` | Update status (`NEW`, `CONTACTED`, `SPAM`, etc.) |
| **Reports** | GET | `/api/v1/admin/reports/users` | User growth and role distributions |
| | GET | `/api/v1/admin/reports/properties` | Property listings growth and type splits |
| | GET | `/api/v1/admin/reports/inquiries` | Inquiry volume trends |
| **Audit** | GET | `/api/v1/admin/audit-logs` | Immutable audit trail with pagination & filters |
| | GET | `/api/v1/admin/audit-logs/:id` | Audit entry with complete metadata |

---

## 🔧 Common Troubleshooting

1. **CORS Error**: Ensure `real-estate-Server/.env` has `CORS_ORIGINS=http://localhost:3000,http://localhost:3001`.
2. **Access Denied (403)**: Ensure your account has role `ADMIN` or `SUPER_ADMIN`. Regular `USER` accounts cannot access the admin endpoints.
3. **Database Connection**: Verify PostgreSQL is running on port 5432 and the `Realestate` database is available.

