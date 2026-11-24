import { Router } from 'express';
import departmentController from '../controllers/Department/department.controller';
import authenticate from '../middlewares/auth.middleware';
import { requireAdmin } from '../middlewares/role.middleware';

const router = Router();
router.use(authenticate);

// Designations sub-routes (accessible for read by authenticated users, write by Admin)
router.get('/designations', departmentController.listDesignations);
router.post('/designations', requireAdmin, departmentController.createDesignation);
router.put('/designations/:id', requireAdmin, departmentController.updateDesignation);
router.delete('/designations/:id', requireAdmin, departmentController.deleteDesignation);

// Department activity log
router.get('/activities', requireAdmin, departmentController.getActivities);

// Departments CRUD & Multiple Team Leads
router.get('/', departmentController.listDepartments);
router.get('/:id', departmentController.getDepartment);
router.post('/', requireAdmin, departmentController.createDepartment);
router.put('/:id', requireAdmin, departmentController.updateDepartment);
router.post('/:id/team-leads', requireAdmin, departmentController.assignTeamLead);
router.delete('/:id/team-leads/:employeeId', requireAdmin, departmentController.removeTeamLead);

export default router;
