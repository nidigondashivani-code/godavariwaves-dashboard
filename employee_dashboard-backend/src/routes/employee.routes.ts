import { Router } from 'express';
import employeeController from '../controllers/Employee/employee.controller';
import authenticate from '../middlewares/auth.middleware';
import { requireAdmin, requireEmployee, requirePermission } from '../middlewares/role.middleware';
import { PERMISSIONS } from '../constants/permissions.constants';
import validateRequest from '../middlewares/validateRequest.middleware';
import {
  createEmployeeSchema,
  updateEmployeeSchema,
  resetEmployeePasswordSchema,
} from '../validators/employee.validator';

const router = Router();

router.use(authenticate);

// Shared metadata (departments, designations, roles)
router.get('/metadata', employeeController.getMetadata);

// Employee Dashboard overview (strictly scoped to authenticated employee + permission check)
router.get(
  '/dashboard/me',
  requireEmployee,
  requirePermission(PERMISSIONS.VIEW_EMPLOYEE_DASHBOARD),
  employeeController.getEmployeeDashboard
);

// Admin-only employee directory & lifecycle management
router.get('/dashboard/admin', requireAdmin, employeeController.getAdminDashboard);
router.post('/bulk-action', requireAdmin, employeeController.bulkAction);
router.get('/', requireAdmin, employeeController.listEmployees);
router.get('/:id', requireAdmin, employeeController.getEmployeeById);
router.post('/', requireAdmin, validateRequest(createEmployeeSchema), employeeController.createEmployee);
router.put('/:id', requireAdmin, validateRequest(updateEmployeeSchema), employeeController.updateEmployee);
router.patch('/:id/activate', requireAdmin, employeeController.activateEmployee);
router.patch('/:id/deactivate', requireAdmin, employeeController.deactivateEmployee);
router.patch('/:id/dashboard-access', requireAdmin, employeeController.toggleDashboardAccess);
router.post('/:id/reset-password', requireAdmin, validateRequest(resetEmployeePasswordSchema), employeeController.resetPassword);
router.delete('/:id', requireAdmin, employeeController.softDeleteEmployee);

export default router;
