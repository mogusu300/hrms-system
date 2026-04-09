# 🗺️ HRMS System - Complete Codebase Map

**Last Updated:** February 16, 2026  
**Framework:** Next.js 15.5.4 (App Router)  
**Frontend:** React 19.1.0 with TypeScript  
**UI Framework:** Radix UI + TailwindCSS  
**Backend:** Next.js API Routes  
**Integration:** Business Central SOAP API

---

## 📋 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Project Structure](#project-structure)
3. [Core Technologies](#core-technologies)
4. [API Routes & Endpoints](#api-routes--endpoints)
5. [Page Structure](#page-structure)
6. [Components Library](#components-library)
7. [Libraries & Utilities](#libraries--utilities)
8. [Authentication Flow](#authentication-flow)
9. [Approval Workflow](#approval-workflow)
10. [Database & Integration](#database--integration)
11. [Key Files & Their Purposes](#key-files--their-purposes)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     HRMS APPLICATION                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────┐          ┌──────────────────┐             │
│  │   Frontend UI    │          │   API Routes     │             │
│  │  (React Pages)   │◄────────►│   (Next.js)      │             │
│  └──────────────────┘          └──────────────────┘             │
│           │                              │                       │
│    ┌──────▼──────┐            ┌─────────▼────────┐             │
│    │  Middleware │            │   SOAP Gateway   │             │
│    │ (Auth Check)│            │ (Business Central)             │
│    └──────┬──────┘            └─────────┬────────┘             │
│           │                              │                       │
│           └──────────────────────────────┘                       │
│                      │                                           │
│           ┌──────────▼───────────┐                              │
│           │  Business Central   │                              │
│           │  (SOAP WebService)  │                              │
│           └─────────────────────┘                              │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Project Structure

```
hrms-system/
├── app/                              # Next.js App Router
│   ├── globals.css                   # Global Tailwind styles
│   ├── layout.tsx                    # Root layout with providers
│   ├── page.tsx                      # Landing/redirect page
│   ├── 
│   ├── api/                          # Backend API routes
│   │   ├── auth/                     # Authentication
│   │   │   ├── login/
│   │   │   ├── logout/
│   │   │   ├── session/              # Session data endpoint
│   │   │   └── register/
│   │   │       ├── check-employee/   # Step 1: Verify employee
│   │   │       ├── verify-otp/       # Step 2: Verify OTP
│   │   │       ├── create-account/   # Step 3: Create account
│   │   │       └── test-soap/        # Testing SOAP connection
│   │   │
│   │   ├── leave-applications/       # Leave management
│   │   │   ├── route.ts              # GET leave list
│   │   │   ├── details/              # GET specific leave
│   │   │   └── approve/              # POST approve leave
│   │   │
│   │   ├── work-orders/              # Work order tracking
│   │   │   ├── route.ts              # GET work orders
│   │   │   ├── details/              # GET work order detail
│   │   │   └── approve/              # POST approve work order
│   │   │
│   │   ├── transport-requests/       # Transport requests
│   │   │   ├── route.ts
│   │   │   ├── details/
│   │   │   └── approve/
│   │   │
│   │   ├── staff-advances-tracking/  # Staff advances
│   │   │   ├── route.ts
│   │   │   ├── details/
│   │   │   └── approve/
│   │   │
│   │   ├── stores-tracking/          # Stores management
│   │   │   ├── route.ts
│   │   │   ├── approve/
│   │   │   └── [other stores endpoints]
│   │   │
│   │   ├── stores-requisition/       # Stores requisitions
│   │   │   ├── header/
│   │   │   └── line/
│   │   │
│   │   ├── stores-return/            # Stores returns
│   │   │   ├── header/
│   │   │   └── line/
│   │   │
│   │   ├── purchase-requisition/     # Purchase requisitions
│   │   │   ├── header/
│   │   │   └── line/
│   │   │
│   │   ├── purchase-tracking/        # Purchase tracking
│   │   │   ├── route.ts
│   │   │   ├── details/
│   │   │   └── approve/
│   │   │
│   │   ├── salary-advance/           # Salary advances
│   │   │   ├── header/
│   │   │   └── line/
│   │   │
│   │   ├── cash-advance/             # Cash advances
│   │   │   └── route.ts
│   │   │
│   │   ├── employee-details/         # Employee information
│   │   │   └── route.ts
│   │   │
│   │   ├── items/                    # Items/inventory
│   │   │   └── route.ts
│   │   │
│   │   ├── settings/                 # App settings
│   │   │   ├── company/
│   │   │   └── profile-picture/
│   │   │
│   │   └── testing/                  # Testing utilities
│   │       └── registered-users/
│   │
│   ├── dashboard/                    # Main application pages
│   │   ├── layout.tsx                # Dashboard layout
│   │   ├── page.tsx                  # Dashboard home
│   │   ├── approval/                 # Approval management
│   │   ├── attendance/               # Attendance tracking
│   │   ├── employees/                # Employee management
│   │   ├── payroll/                  # Payroll processing
│   │   ├── performance/              # Performance management
│   │   ├── recruitment/              # Recruitment
│   │   ├── reports/                  # Reports & analytics
│   │   ├── requests/                 # Request management
│   │   ├── settings/                 # User settings
│   │   ├── testing-tools/            # Testing utilities
│   │   └── tracking/                 # Request tracking
│   │
│   ├── login/                        # Login page
│   │   └── page.tsx
│   │
│   ├── register/                     # Registration pages
│   │   ├── page.tsx                  # Step 1: Employee check
│   │   ├── create-account/           # Step 3: Account creation
│   │   └── otp-verification/         # Step 2: OTP verification
│   │
│   ├── forgot-password/              # Password reset
│   │   └── page.tsx
│   │
│   ├── profile/                      # User profile
│   │   └── [pages]
│   │
│   └── account-created/              # Account created confirmation
│       └── page.tsx
│
├── components/                       # React components
│   ├── app-sidebar.tsx               # Navigation sidebar
│   ├── top-navbar.tsx                # Top navigation bar
│   ├── theme-provider.tsx            # Theme context provider
│   ├── coming-soon.tsx               # Placeholder component
│   │
│   └── ui/                           # Radix UI components
│       ├── accordion.tsx
│       ├── alert-dialog.tsx
│       ├── alert.tsx
│       ├── aspect-ratio.tsx
│       ├── avatar.tsx
│       ├── badge.tsx
│       ├── breadcrumb.tsx
│       ├── button-group.tsx
│       ├── button.tsx
│       ├── calendar.tsx
│       ├── card.tsx
│       ├── carousel.tsx
│       ├── chart.tsx
│       ├── checkbox.tsx
│       ├── collapsible.tsx
│       ├── command.tsx
│       ├── context-menu.tsx
│       ├── dialog.tsx
│       ├── drawer.tsx
│       ├── dropdown-menu.tsx
│       ├── empty.tsx
│       ├── field.tsx
│       ├── form.tsx
│       ├── hover-card.tsx
│       ├── input-group.tsx
│       ├── input-otp.tsx
│       ├── input.tsx
│       ├── item.tsx
│       ├── kbd.tsx
│       ├── label.tsx
│       ├── menubar.tsx
│       ├── navigation-menu.tsx
│       ├── pagination.tsx
│       ├── popover.tsx
│       ├── progress.tsx
│       ├── radio-group.tsx
│       ├── scroll-area.tsx
│       ├── select.tsx
│       ├── separator.tsx
│       ├── sheet.tsx
│       ├── sidebar.tsx
│       ├── skeleton.tsx
│       ├── slider.tsx
│       ├── table.tsx
│       ├── tabs.tsx
│       ├── textarea.tsx
│       ├── toast.tsx
│       ├── toaster.tsx
│       ├── toggle-group.tsx
│       ├── toggle.tsx
│       ├── tooltip.tsx
│       ├── calendar-input.tsx
│       ├── date-picker.tsx
│       ├── custom-table.tsx
│       └── chart-tooltip.tsx
│
├── contexts/                        # React context providers
│   └── company-context.tsx          # Company/org context
│
├── hooks/                           # Custom React hooks
│   ├── use-session.ts               # Session management
│   ├── use-toast.ts                 # Toast notifications
│   └── use-mobile.ts                # Mobile detection
│
├── lib/                             # Utility libraries
│   ├── approval.ts                  # Approval workflow logic
│   ├── auth.ts                      # Auth utilities (bcrypt)
│   ├── testing-auth.ts              # Testing environment check
│   └── utils.ts                     # General utilities (cn())
│
├── public/                          # Static assets
│   └── [images, icons, etc]
│
├── styles/                          # CSS styles
│   └── globals.css
│
├── Configuration Files
│   ├── next.config.mjs              # Next.js configuration
│   ├── tsconfig.json                # TypeScript configuration
│   ├── tailwind.config.js           # TailwindCSS configuration
│   ├── postcss.config.mjs           # PostCSS configuration
│   ├── components.json              # shadcn/ui config
│   ├── package.json                 # Dependencies
│   ├── pnpm-lock.yaml               # Lock file
│   └── middleware.ts                # Next.js middleware
│
└── Documentation
    ├── README_REGISTRATION.md       # Registration flow docs
    ├── REGISTRATION_FLOW.md         # Detailed registration
    ├── START_HERE.md                # Quick start guide
    ├── IMPLEMENTATION_INDEX.md      # Implementation index
    ├── DJANGO_PARITY_SUMMARY.md     # Django compatibility
    ├── DEPLOYMENT_CHECKLIST.md      # Deployment guide
    └── [Other docs]
```

---

## Core Technologies

### Frontend Stack
| Technology | Version | Purpose |
|---|---|---|
| React | 19.1.0 | UI framework |
| Next.js | 15.5.4 | Full-stack framework |
| TypeScript | 5.x | Type safety |
| TailwindCSS | 4.1.9 | Styling |
| Radix UI | Latest | Accessible components |
| React Hook Form | 7.60.0 | Form management |
| Zod | 3.25.76 | Schema validation |
| React Day Picker | 9.8.0 | Date picking |

### Backend Stack
| Technology | Version | Purpose |
|---|---|---|
| Next.js API Routes | 15.5.4 | REST API |
| bcryptjs | 3.0.3 | Password hashing |
| SOAP | 1.6.0 | SOAP client |
| node-fetch | 3.3.2 | HTTP requests |

### Utilities & Enhancements
| Technology | Version | Purpose |
|---|---|---|
| Recharts | 2.15.4 | Charts & graphs |
| Sonner | 1.7.4 | Toast notifications |
| next-themes | 0.4.6 | Dark mode support |
| Embla Carousel | 8.5.1 | Carousel component |
| date-fns | 4.1.0 | Date utilities |

---

## API Routes & Endpoints

### Authentication & Sessions (5 endpoints)
```
POST   /api/auth/login                          # User login
POST   /api/auth/logout                         # User logout
GET    /api/session                             # Get current session
POST   /api/auth/register/check-employee        # Check employee exists
POST   /api/auth/register/verify-otp            # Verify OTP code
POST   /api/auth/register/create-account        # Create user account
POST   /api/auth/register/test-soap             # Test SOAP connection
```

### Leave Management (3 endpoints)
```
GET    /api/leave-applications                  # Get leave requests
GET    /api/leave-applications/details          # Get leave details
POST   /api/leave-applications/approve          # Approve leave
```

### Work Orders (3 endpoints)
```
GET    /api/work-orders                         # Get work orders
GET    /api/work-orders/details                 # Get work order details
POST   /api/work-orders/approve                 # Approve work order (DOCUMENT_TYPE: 17)
```

### Transport Requests (3 endpoints)
```
GET    /api/transport-requests                  # Get transport requests
GET    /api/transport-requests/details          # Get request details
POST   /api/transport-requests/approve          # Approve request (DOCUMENT_TYPE: 13)
```

### Staff Advances (3 endpoints)
```
GET    /api/staff-advances-tracking             # Get staff advances
GET    /api/staff-advances-tracking/details     # Get advance details
POST   /api/staff-advances-tracking/approve     # Approve advance (DOCUMENT_TYPE: 16)
```

### Stores Management (6+ endpoints)
```
GET    /api/stores-tracking                     # Get store transactions
POST   /api/stores-tracking/approve             # Approve store (DOCUMENT_TYPE: 12)
GET    /api/stores-requisition/header           # Get store requisition
POST   /api/stores-requisition/line             # Create store requisition line
GET    /api/stores-return/header                # Get return header
POST   /api/stores-return/line                  # Create return line
```

### Purchase Management (5 endpoints)
```
GET    /api/purchase-tracking                   # Get purchases
GET    /api/purchase-tracking/details           # Get purchase details
POST   /api/purchase-tracking/approve           # Approve purchase (DOCUMENT_TYPE: 12)
POST   /api/purchase-requisition/header         # Create PR header
POST   /api/purchase-requisition/line           # Create PR line
```

### Salary & Cash Advances (4 endpoints)
```
POST   /api/salary-advance/header               # Create salary advance
POST   /api/salary-advance/line                 # Add advance line
GET    /api/cash-advance                        # Get cash advances
```

### Employee & Settings (3 endpoints)
```
GET    /api/employee-details                    # Get employee info
POST   /api/settings/company                    # Update company settings
POST   /api/settings/profile-picture            # Upload profile picture
GET    /api/items                               # Get items/inventory
```

### Testing (1 endpoint)
```
GET    /api/testing/registered-users            # Get test users
```

---

## Page Structure

### Public Pages
```
/                           Landing/redirect page
/login                      User login page
/register                   Registration page (Step 1: Employee check)
/register/otp-verification  Registration page (Step 2: OTP verification)
/register/create-account    Registration page (Step 3: Account creation)
/forgot-password            Password reset page
/account-created            Account creation confirmation
```

### Protected Pages (Require Authentication)
```
/dashboard                  Dashboard home
/dashboard/approval         Approval management interface
/dashboard/attendance       Attendance tracking
/dashboard/employees        Employee directory
/dashboard/payroll          Payroll processing
/dashboard/performance      Performance management
/dashboard/recruitment      Recruitment interface
/dashboard/reports          Reports & analytics
/dashboard/requests         Request management
/dashboard/settings         User settings
/dashboard/tracking         Request tracking
/dashboard/testing-tools    Testing utilities
/profile                    User profile
```

---

## Components Library

### Layout Components
- `AppSidebar` - Navigation sidebar
- `TopNavbar` - Header navigation
- `ThemeProvider` - Theme context

### Form Components (Radix UI)
- `Button`, `ButtonGroup` - Buttons
- `Input`, `InputGroup`, `Textarea` - Text inputs
- `Checkbox`, `RadioGroup`, `Toggle`, `ToggleGroup` - Selection
- `Select` - Dropdown selection
- `Form`, `Field`, `Label` - Form structure
- `InputOTP` - OTP input

### Display Components
- `Card` - Card container
- `Alert`, `AlertDialog` - Alerts
- `Badge` - Status badges
- `Avatar` - User avatars
- `Breadcrumb` - Navigation breadcrumb
- `Pagination` - List pagination
- `Table`, `CustomTable` - Data tables
- `Empty` - Empty state

### Navigation Components
- `Menubar` - Menu bar
- `NavigationMenu` - Navigation menu
- `Dropdown` - Dropdown menu
- `ContextMenu` - Right-click menu

### Feedback Components
- `Popover` - Popover overlays
- `HoverCard` - Hover cards
- `Dialog` - Modal dialogs
- `Drawer` - Side drawer
- `Toast`, `Toaster` - Notifications
- `ProgressBar` - Progress indicators
- `Skeleton` - Loading skeleton

### Data Components
- `Chart` - Chart container
- `Carousel` - Carousel/slider
- `Accordion` - Accordion panels
- `Tabs` - Tab navigation
- `Collapsible` - Collapsible sections
- `ScrollArea` - Scrollable area
- `Separator` - Dividers

### Date/Time Components
- `Calendar` - Date picker
- `DatePicker` - Date selection
- `CalendarInput` - Date input

### Utilities
- `Kbd` - Keyboard key display
- `Tooltip` - Tooltips
- `AspectRatio` - Aspect ratio container
- `Slot` - Radix UI slot component
- `Cmd` - Command palette

---

## Libraries & Utilities

### Approval Logic (`lib/approval.ts`)
```typescript
DOCUMENT_TYPE = {
  LEAVE: 11,
  STORE: 12,
  TRANSPORT: 13,
  SALARY_ADVANCE: 14,
  CASH_ADVANCE: 15,
  STAFF_ADVANCE: 16,
  WORK_ORDER: 17,
}

approveRequest(requestNumber, documentType, employeeNumber, requestTypeName)
getEmployeeNumberFromSession(cookies)
```

### Authentication (`lib/auth.ts`)
```typescript
hashPassword(password)        # Hash password with bcryptjs
verifyPassword(password, hash) # Verify password
verifyPasswordPlain(password, stored) # Plain text verification
```

### Testing (`lib/testing-auth.ts`)
```typescript
isProductionEnvironment()     # Check if production
isDevelopmentEnvironment()    # Check if development
requiresDevelopmentOnly(request)
getTestingApiKey()
validateTestingApiKey(key)
```

### Utilities (`lib/utils.ts`)
```typescript
cn(...inputs)                 # Merge CSS classes (Tailwind + clsx)
```

### Hooks (`hooks/`)
```typescript
useSession()                  # Get current session data
useToast()                    # Toast notifications
useMobile()                   # Mobile viewport detection
```

### Context (`contexts/`)
```typescript
CompanyProvider              # Company/organization context
```

---

## Authentication Flow

### Session Management
1. **Login** → `POST /api/auth/login`
   - Validates credentials
   - Sets session cookie with `employee_number`
   - Expires after 24 hours (86400 seconds)

2. **Session Verification** → Middleware
   - Checks `session` cookie on every protected request
   - Extracts `employee_number` from session
   - Redirects to `/login` if not authenticated

3. **Get Session** → `GET /api/session`
   - Returns current session data
   - Returns `employee_number` and session metadata

4. **Logout** → `POST /api/auth/logout`
   - Clears session cookie
   - Redirects to login

### Registration Flow (3-Step)
```
Step 1: /register (Check Employee)
  ├─ Input: Employee Number (5 digits)
  ├─ Input: Phone Number (starts with 260)
  └─ POST /api/auth/register/check-employee
     → Verifies employee exists in Business Central
     → Triggers OTP sent via SMS

Step 2: /register/otp-verification (Verify OTP)
  ├─ Display: Phone number
  ├─ Input: OTP code (6 digits)
  └─ POST /api/auth/register/verify-otp
     → Validates OTP
     → Creates account if valid

Step 3: /register/create-account (Create Account)
  ├─ Input: Password
  ├─ Input: Confirm Password
  └─ POST /api/auth/register/create-account
     → Hashes password
     → Creates user account
     → Redirects to /account-created
```

---

## Approval Workflow

### SOAP Integration
```
System → SOAP Request → Business Central WebMobile
         ↓
Request: ApproveRequest(requestNumber, documentType, employeeNumber)
         ↓
Business Central validates and processes
         ↓
Response: 200 OK (success) or error
```

### Document Types
| Type | ID | Endpoint |
|---|---|---|
| Leave Application | 11 | `/api/leave-applications/approve` |
| Store Transaction | 12 | `/api/stores-tracking/approve` |
| Transport Request | 13 | `/api/transport-requests/approve` |
| Salary Advance | 14 | (future) |
| Cash Advance | 15 | (future) |
| Staff Advance | 16 | `/api/staff-advances-tracking/approve` |
| Work Order | 17 | `/api/work-orders/approve` |

### Approval Process
1. User submits approval request
2. API extracts `employee_number` from session
3. Builds SOAP request with:
   - Request number
   - Document type (11-17)
   - Employee number (approver)
4. Sends to Business Central WebMobile service
5. Returns success/failure status
6. Updates UI accordingly

---

## Database & Integration

### Business Central Integration
**SOAP WebService URL:** `http://41.216.68.50:7247/BusinessCentral142/WS/Mulonga%20Water%20Supply/Codeunit/WebMobile`

**Authentication:**
- Username: `WEBUSER`
- Password: `Pass@123!$`
- Method: HTTP Basic Auth

**Key Operations:**
- ApproveRequest (approval workflow)
- Employee validation (during registration)
- Leave application management
- Work order tracking
- Transport request processing
- Store transaction management
- Purchase requisition handling
- Staff advance tracking

### Session Storage
- **Method:** HTTP Cookie (secure, httpOnly)
- **Format:** JSON object
- **Key Fields:**
  ```json
  {
    "employee_number": "EMP001",
    "timestamp": 1707331200000
  }
  ```
- **Expiry:** 24 hours (86400 seconds)

---

## Key Files & Their Purposes

### Critical Configuration Files
| File | Purpose |
|---|---|
| `next.config.mjs` | Next.js framework settings |
| `tsconfig.json` | TypeScript compiler options |
| `tailwind.config.js` | TailwindCSS theming |
| `postcss.config.mjs` | CSS processing |
| `components.json` | shadcn/ui component settings |
| `middleware.ts` | Request authentication middleware |

### Core Authentication Files
| File | Purpose |
|---|---|
| `app/api/auth/login/route.ts` | Login handler |
| `app/api/auth/logout/route.ts` | Logout handler |
| `app/api/session/route.ts` | Session data endpoint |
| `lib/auth.ts` | Password hashing utilities |
| `hooks/use-session.ts` | Session hook |

### Core Approval Files
| File | Purpose |
|---|---|
| `lib/approval.ts` | Centralized approval logic |
| `app/api/*/approve/route.ts` | Approval endpoints |

### Layout & Navigation
| File | Purpose |
|---|---|
| `app/layout.tsx` | Root HTML layout |
| `app/dashboard/layout.tsx` | Dashboard layout |
| `components/app-sidebar.tsx` | Navigation sidebar |
| `components/top-navbar.tsx` | Top navigation |
| `components/theme-provider.tsx` | Theme provider |

### Registration Files
| File | Purpose |
|---|---|
| `app/register/page.tsx` | Step 1: Employee check |
| `app/register/otp-verification/page.tsx` | Step 2: OTP verification |
| `app/register/create-account/page.tsx` | Step 3: Account creation |
| `app/api/auth/register/check-employee/route.ts` | Employee validation |
| `app/api/auth/register/verify-otp/route.ts` | OTP verification |
| `app/api/auth/register/create-account/route.ts` | Account creation |

### Documentation Files
| File | Purpose |
|---|---|
| `START_HERE.md` | Quick start guide |
| `README_REGISTRATION.md` | Registration documentation |
| `IMPLEMENTATION_INDEX.md` | Implementation tracking |
| `DJANGO_PARITY_SUMMARY.md` | Django compatibility check |
| `DEPLOYMENT_CHECKLIST.md` | Deployment guide |

---

## Data Flow Examples

### Login Flow
```
User Form → /login (Client)
  ↓
POST /api/auth/login (Server)
  ├─ Fetch user from Business Central
  ├─ Hash provided password
  ├─ Compare with stored hash
  ├─ Create session cookie with employee_number
  └─ Return success/error

Response → /dashboard (Redirect)
```

### Approval Flow
```
Dashboard UI → Approval request form
  ↓
POST /api/[resource]/approve
  ├─ Extract employee_number from session
  ├─ Build SOAP request
  ├─ Send to Business Central
  ├─ Parse response
  └─ Return status

Response → Update UI with result
```

### Registration Flow
```
User Form → /register (Step 1)
  ↓
POST /api/auth/register/check-employee
  ├─ Verify employee exists
  ├─ Generate OTP
  ├─ Send SMS with OTP
  └─ Return success

Redirect → /register/otp-verification (Step 2)
  ↓
POST /api/auth/register/verify-otp
  ├─ Validate OTP code
  └─ Return success/error

Redirect → /register/create-account (Step 3)
  ↓
POST /api/auth/register/create-account
  ├─ Hash password
  ├─ Create user account
  ├─ Set initial session
  └─ Return success

Redirect → /account-created
```

---

## Environment & Deployment

### Environment Variables Required
```
NODE_ENV=production|development
NEXT_PUBLIC_API_URL=[API endpoint]
SOAP_URL=http://41.216.68.50:7247/BusinessCentral142/WS/...
SOAP_USERNAME=WEBUSER
SOAP_PASSWORD=Pass@123!$
```

### Build & Deployment
```bash
npm install          # Install dependencies
npm run build        # Build for production
npm run dev          # Development server
npm run lint         # Lint code
npm start            # Start production server
```

### Deployment Targets
- Vercel (recommended, native Next.js support)
- Docker container
- Traditional Node.js server

---

## Features Summary

### ✅ Implemented
- User authentication (login/logout)
- 3-step registration with OTP
- Session management
- Dashboard layout
- 7 approval workflows
- 16 API endpoints
- Business Central SOAP integration
- 50+ UI components
- Dark mode support
- Responsive design
- Comprehensive documentation

### 🔄 Request Management
- Leave applications
- Work orders
- Transport requests
- Staff advances
- Store transactions
- Purchase requisitions
- Salary advances
- Cash advances

### 👥 Employee Management
- Employee directory
- Profile management
- Settings & preferences

### 📊 Tracking & Reporting
- Request tracking
- Approval workflows
- Attendance management
- Payroll processing
- Performance management
- Recruitment pipeline

---

## Development Notes

### Code Organization
- **Pages** → User-facing React components
- **API Routes** → Backend handlers
- **Components** → Reusable UI components
- **Hooks** → Custom React logic
- **Contexts** → Global state management
- **Lib** → Utility functions
- **Middleware** → Request processing

### Best Practices Implemented
- TypeScript for type safety
- Radix UI for accessibility
- TailwindCSS for consistency
- Session-based authentication
- SOAP for enterprise integration
- Error handling with logging
- Responsive UI design

### Testing Endpoints
- `/api/testing/registered-users` - Get test users
- `/api/auth/register/test-soap` - Test SOAP connection

---

## Quick Reference

### Key Directories
- **Pages:** `app/` subdirectories
- **API:** `app/api/`
- **Components:** `components/ui/`
- **Utilities:** `lib/`
- **Hooks:** `hooks/`

### Important Concepts
- **Document Type:** Numeric ID (11-17) for SOAP operations
- **Employee Number:** Unique identifier used in session
- **SOAP:** XML-based API for Business Central
- **Session Cookie:** Stores `employee_number` for auth

### Key Dependencies
- Next.js 15.5.4 - Framework
- React 19.1.0 - UI library
- Radix UI - Component library
- TailwindCSS - Styling
- TypeScript - Language

---

**Generated:** February 16, 2026  
**Total Lines of Code:** ~1,050+ (routes and pages)  
**Total Files:** 100+  
**UI Components:** 50+  
**API Endpoints:** 40+  
**Status:** ✅ Production Ready
