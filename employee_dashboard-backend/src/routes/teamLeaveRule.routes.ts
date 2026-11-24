import { Router } from 'express';
import teamLeaveRuleController from '../controllers/teamLeaveRule.controller';
import authenticate from '../middlewares/auth.middleware';
import { requireAdmin } from '../middlewares/role.middleware';

const router: Router = Router();

router.use(authenticate);

// Availability & Conflicts
router.get('/availability/:teamId', teamLeaveRuleController.getTeamAvailability);
router.post('/check-conflict', teamLeaveRuleController.checkConflict);
router.get('/conflicts', requireAdmin, teamLeaveRuleController.getConflictHistory);

// Rules CRUD (Admin)
router.get('/', teamLeaveRuleController.getRules);
router.get('/team/:teamId', teamLeaveRuleController.getRuleByTeam);
router.post('/', requireAdmin, teamLeaveRuleController.createRule);
router.put('/:id', requireAdmin, teamLeaveRuleController.updateRule);
router.delete('/:id', requireAdmin, teamLeaveRuleController.deleteRule);

export default router;
