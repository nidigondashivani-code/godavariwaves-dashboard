# Godavari Waves EMS — Two-Developer Collaboration & Aiven Cloud MySQL Guide

Repository: `https://github.com/ranjurandi/godavariwaves-dashboard.git`

This repository contains **one shared Express + TypeScript + Sequelize backend** (`employee_dashboard-backend`), **one shared MySQL 8 cloud database** (`godavari_waves` on Aiven Free MySQL), and **one React + Vite + TypeScript frontend** (`employee_dashboard-frontend`) serving both portals:

* **Admin Dashboard (`/admin`)** — Owned and maintained by **Friend** (the single visual design source of truth).
* **Employee Dashboard (`/employee/*`)** — Owned and maintained by **You** (mirrors the exact Admin Dashboard solid-color design system).

---

## 1. Ownership & Strict Boundaries

| Developer | Primary Scope | Files Owned |
| :--- | :--- | :--- |
| **Friend (Admin Owner)** | Admin Dashboard UI, Departments, Role & Permissions, Employee Directory UI, Calendar & Profile UI | `src/layouts/AdminLayout/*`, `src/modules/Dashboard/pages/AdminDashboardPage.tsx`, `src/modules/Departments/*`, `src/modules/RolePermissions/*`, `src/modules/Employee/pages/ManageEmployeesPage.tsx` |
| **You (Employee Owner)** | Employee Dashboard UI (11 modules) & Employee/Shared API integration | `src/layouts/EmployeeLayout/*`, `src/modules/*/pages/Employee*.tsx`, `src/components/common/UI.tsx` |
| **Shared (Coordinate First!)** | Routing, Auth, API client, Global CSS, Backend Models/Routes | `src/App.tsx`, `src/routes/AppRoutes.tsx`, `src/api/apiClient.ts`, `src/styles/index.css`, `employee_dashboard-backend/src/*` |

### Visual & Engineering Rules (Both Developers)
1. **Admin Dashboard is the design source of truth** — never redesign Admin screens, colors, sidebar (`17rem` / `5.5rem` solid `#1E3A8A`), header (`76px` solid white), logo (`<CompanyLogo />`), or card spacing.
2. **No gradients anywhere** in newly developed Employee UI or global CSS.
3. **Never use `localStorage` as the permanent database** — all real business records live in the shared MySQL 8 database.
4. **Never commit secrets** (`.env`, `*.pem`, `*.crt`, `*.key`, `certs/` are gitignored).
5. **Never force-push (`git push --force`)** or use `git reset --hard` on shared branches.

---

## 2. Aiven Free MySQL 8 Setup Guide (Shared Cloud Database)

Official free tier: `https://aiven.io/free-mysql-database`

### Step A — Create the Free MySQL Service (One-Time, Account Owner)
1. Sign in to [Aiven Console](https://console.aiven.io/) and click **Create service → MySQL**.
2. Select the **Free** plan (verify `$0/month` — do **not** select a paid tier).
3. Choose **MySQL 8** and the region closest to both developers.
4. Once the service status is **Running**, open the service Overview page and collect:
   * **Host** (`DB_HOST`)
   * **Port** (`DB_PORT`)
   * **User** (`DB_USER`, usually `avnadmin`)
   * **Password** (`DB_PASSWORD`)
   * Download the **CA Certificate** (`ca.pem`).
5. Create the database `godavari_waves` in Aiven Console (**Databases** tab → **Create database** → `godavari_waves`) — or reuse your existing database name if already created.

### Step B — Configure Local Private Environment (Both Developers)
1. Save the downloaded Aiven CA certificate at:
   ```text
   employee_dashboard-backend\certs\ca.pem
   ```
2. Copy `.env.example` to `.env` inside `employee_dashboard-backend\`:
   ```powershell
   Copy-Item employee_dashboard-backend\.env.example employee_dashboard-backend\.env
   ```
3. Open `employee_dashboard-backend\.env` privately and enter your Aiven values:
   ```env
   PORT=5000
   NODE_ENV=development
   CLIENT_URL=http://localhost:5173

   DB_HOST=<your-aiven-service>.aivencloud.com
   DB_PORT=<your-aiven-port>
   DB_NAME=godavari_waves
   DB_USER=avnadmin
   DB_PASSWORD=<your-private-aiven-password>
   DB_DIALECT=mysql
   DB_SSL=true
   DB_CA_CERT_PATH=certs/ca.pem
   DB_SSL_REJECT_UNAUTHORIZED=true

   JWT_ACCESS_SECRET=<shared-strong-secret-min-32-chars>
   JWT_ACCESS_EXPIRY=1d
   JWT_REFRESH_SECRET=<shared-strong-refresh-secret-min-32-chars>
   JWT_REFRESH_EXPIRY=7d
   ```
   *(Share credentials and `ca.pem` privately over encrypted chat/password manager — NEVER via GitHub.)*

4. Verify connectivity and inspect the live schema **read-only** BEFORE running migrations:
   ```powershell
   npm.cmd --prefix employee_dashboard-backend run db:test-connection
   ```
   This verifies DNS, TCP port, SSL/TLS handshake, MySQL authentication, database existence, Sequelize connection, existing tables, and `SequelizeMeta` status without printing passwords or modifying data.

5. **Safe Schema Initialization / Migrations**:
   * **If `db:test-connection` reports 0 tables (brand-new empty `godavari_waves`)**: start the backend once (`npm.cmd --prefix employee_dashboard-backend run dev`) to create tables non-destructively and seed default roles, 4 departments (`Software Development`, `Digital Marketing`, `Sales`, `Administration`), designations, leave types, holidays, and initial Admin account (`admin@godavariwaves.com`).
   * **If `db:test-connection` reports existing tables**: inspect existing tables first, then run only safe additive migrations:
     ```powershell
     npm.cmd --prefix employee_dashboard-backend run migrate
     ```
   * **NEVER** run `sequelize.sync({ force: true })`, `DROP TABLE`, or `TRUNCATE` on the shared database.

---

## 3. Daily Git Workflow (Windows PowerShell Commands)

### Before Starting Any Work (Both Developers)
```powershell
cd C:\Users\Hp\Documents\godavariwaves-dashboard
git status
git fetch --all --prune
git checkout main
git pull --ff-only origin main
```

### Working on Feature Branches
* **Friend (Admin changes)**:
  ```powershell
  git checkout -b admin-dashboard-feature
  # ... make Admin changes, build & test ...
  git status
  git add <specific-files>
  git commit -m "feat(admin): describe change"
  git push -u origin admin-dashboard-feature
  ```
* **You (Employee changes)**:
  ```powershell
  git checkout -b employee-dashboard-feature
  # ... make Employee changes, build & test ...
  git status
  git add <specific-files>
  git commit -m "feat(employee): describe change"
  git push -u origin employee-dashboard-feature
  ```

### Pulling Your Friend's Latest Approved Changes Safely
If you have uncommitted local edits:
```powershell
git stash push -u -m "wip-before-pull"
git fetch --all --prune
git checkout main
git pull --ff-only origin main
git checkout employee-dashboard-feature
git merge main
git stash pop
```
If merge conflicts occur in shared files (`App.tsx`, `AppRoutes.tsx`, `apiClient.ts`, `index.css`):
* Inspect every conflict marker carefully (`<<<<<<<`, `=======`, `>>>>>>>`).
* Preserve **both** Admin routes/styles and Employee routes/styles.
* Never blindly choose `--ours` or `--theirs`.
* Run both frontend and backend builds before committing the merge.

---

## 4. Running & Testing Locally (Windows PowerShell)

### Install Dependencies (First Time or After `package.json` Changes)
```powershell
npm.cmd --prefix employee_dashboard-backend install
npm.cmd --prefix employee_dashboard-frontend install
```

### Start Backend & Frontend (Two Separate PowerShell Terminals)
```powershell
# Terminal 1 — Shared Express + TypeScript Backend (http://localhost:5000)
npm.cmd --prefix employee_dashboard-backend run dev

# Terminal 2 — Shared React + Vite Frontend (http://localhost:5173)
npm.cmd --prefix employee_dashboard-frontend run dev
```

### Build & Verification Commands
```powershell
# 1. Test Aiven Cloud MySQL connection & read-only schema check
npm.cmd --prefix employee_dashboard-backend run db:test-connection

# 2. Verify backend TypeScript compilation
npm.cmd --prefix employee_dashboard-backend run build

# 3. Verify frontend TypeScript & Vite production build
npm.cmd --prefix employee_dashboard-frontend run build

# 4. Run full API, RBAC, and live MySQL E2E verification suite
npm.cmd --prefix employee_dashboard-backend run verify
```
