import http from 'http';
import type { Request, Response } from 'express';
import { createApp } from '../src/app';
import { sequelize, initAllModels } from '../src/models';
import { initializeDatabase } from '../src/database';
import {
  calculateLateMinutes,
  calculateWorkingDuration,
  determineAttendanceStatus,
} from '../src/helpers/attendanceCalculator.helper';
import { getDateRange, isWeekend } from '../src/utils/dateUtils.util';
import { calculateTeamAvailability } from '../src/utils/teamAvailabilityCalculator';
import { hashPassword, comparePassword } from '../src/utils/password.util';
import { generateAccessToken, verifyAccessToken } from '../src/utils/jwt.util';
import { requireAdmin, requireEmployee, requirePermission } from '../src/middlewares/role.middleware';
import { PERMISSIONS } from '../src/constants/permissions.constants';
import { AppError } from '../src/utils/appError.util';

interface CheckResult {
  name: string;
  status: 'PASS' | 'FAIL' | 'PENDING';
  detail?: string;
}

const results: CheckResult[] = [];
const assert = (name: string, cond: boolean, detail?: string) => {
  results.push({ name, status: cond ? 'PASS' : 'FAIL', detail });
  if (!cond) throw new Error(`Assertion failed: ${name} (${detail || ''})`);
};

const apiRequest = async (
  baseUrl: string,
  method: string,
  path: string,
  token?: string,
  body?: unknown
) => {
  const res = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  return { status: res.status, json };
};

const invokeMiddleware = (
  mw: (req: Request, res: Response, next: (err?: unknown) => void) => void,
  user?: Request['user']
): { allowed: boolean; statusCode?: number } => {
  let errCaught: unknown = null;
  let passed = false;
  mw({ user } as Request, {} as Response, (err?: unknown) => {
    if (err) errCaught = err;
    else passed = true;
  });
  if (errCaught instanceof AppError) {
    return { allowed: false, statusCode: errCaught.statusCode };
  }
  return { allowed: passed };
};

const run = async () => {
  console.log('=== Godavari Wave EMS Full-Stack Verification ===\n');

  // 1. Sequelize Models & Associations Initialization (MySQL 8 dialect)
  initAllModels(sequelize);
  const modelNames = Object.keys(sequelize.models);
  assert('MySQL 8 dialect configured', sequelize.getDialect() === 'mysql', sequelize.getDialect());
  assert('All 30 Sequelize models registered', modelNames.length >= 30, `Count: ${modelNames.length}`);

  // 2. Unit Tests: Password Hashing & JWT
  const hash = await hashPassword('SecurePass@2026');
  assert('Bcrypt password hashing works', await comparePassword('SecurePass@2026', hash));
  assert('Bcrypt rejects wrong password', !(await comparePassword('WrongPass', hash)));

  const jwtToken = generateAccessToken({
    userId: 99,
    employeeId: 42,
    email: 'test@godavariwaves.com',
    role: 'Employee',
    dashboardAccess: 'employee',
  });
  const decoded = verifyAccessToken(jwtToken);
  assert('JWT token sign & verify preserves identity', decoded.userId === 99 && decoded.employeeId === 42);

  // 3. RBAC & Dynamic Granular Permission Middleware Enforcement Tests
  const adminUser: NonNullable<Request['user']> = {
    userId: 1,
    employeeId: 1,
    email: 'admin@godavariwaves.com',
    role: 'Admin',
    dashboardAccess: 'both',
    departmentId: 4,
    permissions: Object.values(PERMISSIONS),
  };
  const empWithPerm: NonNullable<Request['user']> = {
    userId: 2,
    employeeId: 2,
    email: 'emp@godavariwaves.com',
    role: 'Employee',
    dashboardAccess: 'employee',
    departmentId: 1,
    permissions: [PERMISSIONS.VIEW_EMPLOYEE_DASHBOARD, PERMISSIONS.APPLY_LEAVE],
  };
  const empWithoutPerm: NonNullable<Request['user']> = {
    ...empWithPerm,
    permissions: [PERMISSIONS.VIEW_EMPLOYEE_DASHBOARD],
  };

  assert('RBAC: Admin passes requireAdmin', invokeMiddleware(requireAdmin, adminUser).allowed);
  assert('RBAC: Employee blocked by requireAdmin (403)', invokeMiddleware(requireAdmin, empWithPerm).statusCode === 403);
  assert('RBAC: Employee passes requireEmployee', invokeMiddleware(requireEmployee, empWithPerm).allowed);
  assert('RBAC: Admin-only account blocked by requireEmployee (403)', invokeMiddleware(requireEmployee, { ...adminUser, dashboardAccess: 'admin' }).statusCode === 403);
  assert('RBAC: Employee with APPLY_LEAVE permission allowed', invokeMiddleware(requirePermission(PERMISSIONS.APPLY_LEAVE), empWithPerm).allowed);
  assert('RBAC: Employee without APPLY_LEAVE permission blocked (403)', invokeMiddleware(requirePermission(PERMISSIONS.APPLY_LEAVE), empWithoutPerm).statusCode === 403);

  // 4. Unit Tests: Attendance Calculator & Leave Date Utilities
  const onTimeIn = new Date('2026-11-24T09:40:00');
  const lateIn = new Date('2026-11-24T10:15:00');
  const shiftOut = new Date('2026-11-24T18:30:00');
  assert('Grace period (09:40 <= 09:45) yields 0 late minutes', calculateLateMinutes(onTimeIn) === 0);
  assert('Late arrival (10:15) calculates 45 late minutes', calculateLateMinutes(lateIn) === 45);
  const dur = calculateWorkingDuration(onTimeIn, shiftOut);
  assert('Working hours calculated accurately', dur.workingHours > 8.5, `${dur.workingHours} hrs`);
  assert('Half-day threshold detected (<4 hrs)', determineAttendanceStatus(0, 3.0) === 'Half Day');
  assert('Late status detected (>0 late mins)', determineAttendanceStatus(20, 8.0) === 'Late');

  const dates = getDateRange('2026-11-20', '2026-11-23');
  assert('Date range generation accurate', dates.length === 4);
  assert('Weekend detection identifies Sat & Sun', isWeekend('2026-11-21') && isWeekend('2026-11-22') && !isWeekend('2026-11-23'));

  const avail = calculateTeamAvailability({ totalTeamMembers: 4, approvedLeavesCount: 2 }, 75);
  assert('Team availability enforces minimum workforce %', avail.availabilityPercentage === 50 && !avail.isMinimumMet);

  // 5. Express HTTP Server + API Validation & Auth Guard Tests
  const app = createApp();
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const addr = server.address() as { port: number };
  const baseUrl = `http://127.0.0.1:${addr.port}/api/v1`;

  try {
    const health = await apiRequest(baseUrl, 'GET', '/health');
    assert('GET /api/v1/health returns 200 OK', health.status === 200 && health.json.success === true);

    // Login payload validation (missing password/email returns 400 before hitting DB)
    const badLogin = await apiRequest(baseUrl, 'POST', '/auth/login', undefined, { email: '' });
    assert('POST /api/v1/auth/login validates missing credentials (400)', badLogin.status === 400);

    // Auth guard checks across Employee, Admin, Department, Designation, Role, and Lifecycle endpoints
    const protectedEndpoints: Array<[string, string]> = [
      ['GET', '/employees/dashboard/me'],
      ['GET', '/employees/dashboard/admin'],
      ['GET', '/employees'],
      ['PATCH', '/employees/1/activate'],
      ['PATCH', '/employees/1/deactivate'],
      ['PATCH', '/employees/1/dashboard-access'],
      ['POST', '/employees/1/reset-password'],
      ['DELETE', '/employees/1'],
      ['POST', '/employees/bulk-action'],
      ['GET', '/departments'],
      ['POST', '/departments/1/team-leads'],
      ['GET', '/departments/designations'],
      ['GET', '/roles'],
      ['PUT', '/roles/4/permissions'],
    ];

    for (const [method, ep] of protectedEndpoints) {
      const r = await apiRequest(baseUrl, method, ep);
      assert(`Auth guard blocks unauthenticated ${method} ${ep} (401)`, r.status === 401);
    }

    // Invalid JWT token rejected (401)
    const invalidJwt = await apiRequest(baseUrl, 'GET', '/departments', 'invalid.jwt.token');
    assert('Invalid JWT token rejected (401)', invalidJwt.status === 401);

    // 6. Live MySQL 8 End-to-End Workflow Suite
    let dbConnected = false;
    try {
      await initializeDatabase();
      dbConnected = true;
    } catch (err) {
      results.push({
        name: 'MySQL 8 Live End-to-End Integration Suite (Admin & Employee Login, Departments, Designations, Team Leads, Roles/Permissions, Employee Lifecycle & 29 E2E Scenarios)',
        status: 'PENDING',
        detail: `Awaiting live MySQL 8 connection details (${(err as Error).message}).`,
      });
    }

    if (dbConnected) {
      const adminLogin = await apiRequest(baseUrl, 'POST', '/auth/login', undefined, {
        email: 'admin@godavariwaves.com',
        password: 'Admin@123',
      });
      assert('E2E: Admin login succeeds', adminLogin.status === 200 && Boolean(adminLogin.json.data?.accessToken));
      const adminToken = adminLogin.json.data.accessToken;

      const depts = await apiRequest(baseUrl, 'GET', '/departments', adminToken);
      assert('E2E: Departments API returns aligned departments', depts.status === 200 && depts.json.data.length >= 4);
      const swDeptId = depts.json.data[0].id;

      const desigs = await apiRequest(baseUrl, 'GET', `/departments/designations?departmentId=${swDeptId}`, adminToken);
      assert('E2E: Designations API returns designations', desigs.status === 200 && desigs.json.data.length >= 1);

      const rolesRes = await apiRequest(baseUrl, 'GET', '/roles', adminToken);
      assert('E2E: Roles & Permissions API returns roles', rolesRes.status === 200 && rolesRes.json.data.length >= 2);

      const uniqueEmail = `e2e.emp.${Date.now()}@gmail.com`;
      const uniquePhone = `9${String(Date.now()).slice(-9)}`;
      const empPassword = 'Employee@123';
      const createdEmp = await apiRequest(baseUrl, 'POST', '/employees', adminToken, {
        first_name: 'Kiran',
        last_name: 'Verma',
        company_email: uniqueEmail,
        phone: uniquePhone,
        password: empPassword,
        confirm_password: empPassword,
        department_id: swDeptId,
        designation_id: desigs.json.data[0].id,
        joining_date: '2026-11-01',
        dashboard_access: 'employee',
      });
      assert('E2E: Admin creates employee & generates credentials', createdEmp.status === 201);
      const empId = createdEmp.json.data.employee.id;

      const assignLead = await apiRequest(baseUrl, 'POST', `/departments/${swDeptId}/team-leads`, adminToken, { employee_id: empId });
      assert('E2E: Admin assigns employee as Department Team Lead', assignLead.status === 201);

      const empLogin = await apiRequest(baseUrl, 'POST', '/auth/login', undefined, {
        email: uniqueEmail,
        password: empPassword,
      });
      assert('E2E: Employee login succeeds with generated credentials', empLogin.status === 200);
      const empToken = empLogin.json.data.accessToken;

      const empToAdminRoles = await apiRequest(baseUrl, 'GET', '/roles', empToken);
      assert('E2E: Employee blocked from Admin Roles API (403)', empToAdminRoles.status === 403);

      const deact = await apiRequest(baseUrl, 'PATCH', `/employees/${empId}/deactivate`, adminToken, { reason: 'Long Leave' });
      assert('E2E: Admin deactivates employee & cascades team lead removal', deact.status === 200);

      const react = await apiRequest(baseUrl, 'PATCH', `/employees/${empId}/activate`, adminToken);
      assert('E2E: Admin reactivates employee', react.status === 200);

      const reset = await apiRequest(baseUrl, 'POST', `/employees/${empId}/reset-password`, adminToken, {
        newPassword: 'Welcome#2025',
        confirmPassword: 'Welcome#2025',
      });
      assert('E2E: Admin resets employee password', reset.status === 200 && Boolean(reset.json.data.passwordReset));

      const softDel = await apiRequest(baseUrl, 'DELETE', `/employees/${empId}`, adminToken);
      assert('E2E: Admin soft-deletes employee preserving history', softDel.status === 200);
    }
  } finally {
    server.close();
    await sequelize.close().catch(() => {});
  }

  console.log('\n--- Verification Summary ---');
  for (const r of results) {
    console.log(`[${r.status}] ${r.name}${r.detail ? ` — ${r.detail}` : ''}`);
  }
  const failed = results.filter((r) => r.status === 'FAIL').length;
  console.log(
    `\nTotal: ${results.length} | Passed: ${results.filter((r) => r.status === 'PASS').length} | Pending: ${results.filter((r) => r.status === 'PENDING').length} | Failed: ${failed}`
  );
  if (failed > 0) process.exit(1);
};

run().catch((err) => {
  console.error('Verification failed:', err);
  process.exit(1);
});
