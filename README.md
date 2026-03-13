# ChemTrack — Chemical Inventory Management System

A full-stack Next.js 14 application for managing chemical product inventories in a laboratory setting, with a complete admin panel and student search interface.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MySQL 8+ (running locally or remote)
- npm or yarn

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
```
Edit `.env` with your values:
```env
DATABASE_URL="mysql://root:yourpassword@localhost:3306/chemtrack"
JWT_SECRET="change-this-to-a-long-random-secret"
```

### 3. Set up the database
```bash
# Push schema to database
npx prisma db push

# Generate Prisma client
npx prisma generate

# Seed with demo data (admin + student + sample products)
npx ts-node prisma/seed.ts
```

### 4. Run the dev server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

---

## 🔐 Default Credentials

| Role    | Email                        | Password     |
|---------|------------------------------|--------------|
| Admin   | admin@chemtrack.local        | admin123     |
| Student | student@chemtrack.local      | student123   |

> ⚠️ Change these immediately in production!

---

## 📁 Project Structure

```
chemtrack/
├── app/
│   ├── admin/                  # Admin panel (protected)
│   │   ├── page.tsx            # Dashboard
│   │   ├── products/           # Product CRUD
│   │   ├── locations/          # Building/Room/Cabinet/Shelf tree
│   │   ├── users/              # User management
│   │   ├── history/            # Consultation traceability
│   │   ├── import/             # XLS/XLSX import + export
│   │   └── settings/           # SMTP + OTP config
│   ├── student/                # Student interface (protected)
│   │   ├── page.tsx            # Search
│   │   ├── product/[id]/       # Product detail + location
│   │   └── history/            # Personal history
│   ├── auth/                   # Public auth pages
│   │   ├── login/
│   │   ├── register/
│   │   └── forgot-password/    # OTP reset flow
│   └── api/                    # Next.js API routes
│       ├── auth/               # login, register, logout, me, otp
│       ├── products/           # CRUD + pagination + search
│       ├── locations/          # Hierarchy CRUD
│       ├── users/              # Admin user management
│       ├── history/            # View tracking
│       ├── import/             # XLS upload
│       ├── export/             # XLSX download
│       └── config/             # App settings
├── components/
│   ├── admin/                  # Admin-specific components
│   │   ├── AdminSidebar.tsx
│   │   └── ProductForm.tsx
│   ├── student/
│   │   └── StudentNav.tsx
│   └── ui/                     # Reusable UI components
│       ├── Modal.tsx
│       ├── Pagination.tsx
│       ├── Toast.tsx
│       └── ConfirmDialog.tsx
├── lib/
│   ├── prisma.ts               # Prisma singleton
│   ├── auth.ts                 # JWT utilities
│   ├── email.ts                # SMTP + OTP
│   ├── import.ts               # XLS import logic
│   ├── validations.ts          # Zod schemas
│   └── utils.ts                # Helpers
├── prisma/
│   ├── schema.prisma           # Database schema
│   └── seed.ts                 # Demo data seed
└── middleware.ts               # Route protection
```

---

## 🗄️ Database Schema

```
Building
  └── Room (many per building)
        └── Cabinet (many per room)
              └── Shelf (many per cabinet)
                    └── Product (many per shelf)

User → ProductView ← Product   (traceability)
AppConfig                       (SMTP, OTP settings)
```

---

## 📦 XLS Import Format

The import expects an Excel file with these columns:

| Column       | Required | Notes                        |
|--------------|----------|------------------------------|
| CAS          | No       | CAS number (e.g. 7732-18-5) |
| Name         | ✅ Yes   | Product name                 |
| Molar Mass   | No       | Numeric value                |
| Stock        | No       | e.g. "100g"                  |
| Packaging    | No       | e.g. "500g", "1L"           |
| Brand        | No       | Manufacturer name            |
| Toxic        | No       | "Oui"/"Yes" or true          |
| CMR          | No       | "Oui"/"Yes" or true          |
| Pureté %     | No       | 0–1 or 0–100                |
| etat physique| No       | solid/liquid/gas/…           |
| Bâtiment     | ✅ Yes   | Building name                |
| Salle        | ✅ Yes   | Room name                    |
| Armoire      | ✅ Yes   | Cabinet name                 |
| Étagère      | ✅ Yes   | Shelf name                   |

> Missing locations (building, room, cabinet, shelf) are **created automatically**.

---

## ⚙️ Admin Configuration

### SMTP (for OTP emails)
Navigate to **Admin → Settings → SMTP Configuration**

| Field    | Example              |
|----------|----------------------|
| Host     | smtp.gmail.com       |
| Port     | 587                  |
| Email    | lab@university.edu   |
| Password | App-specific password|
| Secure   | No (port 587)        |

### OTP Expiry
Set how long a password-reset OTP remains valid (default: 10 minutes).

---

## 🔑 Authentication Flow

1. **Login** → JWT token stored in httpOnly cookie (7 days)
2. **Register** → Student account created, requires manual activation if needed
3. **Forgot Password** → 6-digit OTP sent via SMTP → verify OTP → set new password
4. **Middleware** → Protects `/admin` (ADMIN only) and `/student` routes

---

## 🧪 Packaging Units

**Mass:** `kg`, `g`, `mg`, `µg`, `ng`  
**Volume:** `L`, `dL`, `cL`, `mL`, `µL`

Values and units stored separately in the database for SI-compliant calculations.

---

## 🛡️ Role System

| Feature                    | Admin | Student |
|----------------------------|-------|---------|
| Dashboard & stats          | ✅    | ❌      |
| Product CRUD               | ✅    | ❌      |
| Import/Export XLS          | ✅    | ❌      |
| Manage locations           | ✅    | ❌      |
| Manage users               | ✅    | ❌      |
| View all history           | ✅    | ❌      |
| Configure SMTP/OTP         | ✅    | ❌      |
| Search products            | ✅    | ✅      |
| View product details       | ✅    | ✅      |
| View personal history      | ✅    | ✅      |
| Register / Login           | ✅    | ✅      |
| Forgot password (OTP)      | ✅    | ✅      |

---

## 🚢 Production Deployment

```bash
# Build
npm run build

# Start
npm start
```

### Environment variables for production:
```env
DATABASE_URL="mysql://user:password@host:3306/chemtrack"
JWT_SECRET="use-a-long-random-value-min-32-chars"
NODE_ENV="production"
```

### MySQL setup:
```sql
CREATE DATABASE chemtrack CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'chemtrack'@'localhost' IDENTIFIED BY 'securepassword';
GRANT ALL PRIVILEGES ON chemtrack.* TO 'chemtrack'@'localhost';
FLUSH PRIVILEGES;
```

---

## 🛠️ Tech Stack

| Layer      | Technology                        |
|------------|-----------------------------------|
| Framework  | Next.js 14 (App Router)           |
| Styling    | Tailwind CSS + DM Sans font       |
| Database   | MySQL via Prisma ORM              |
| Auth       | Custom JWT (httpOnly cookies)     |
| Email      | Nodemailer (SMTP configurable)    |
| Validation | Zod                               |
| Icons      | Lucide React                      |
| XLS Import | SheetJS (xlsx)                    |

---

## 📧 Support

For issues or questions, check the project structure and API routes. Each route is fully typed with TypeScript and validated with Zod.
