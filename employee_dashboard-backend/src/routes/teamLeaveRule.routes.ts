import { Router } from 'express';
import teamLeaveRuleController from '../controllers/teamLeaveRule.controller';
import { validateTeamLeaveRule, validateRuleId } from '../validators/teamLeaveRule.validator';
import { validateLeaveConflictCheck } from '../validators/leaveConflict.validator';

const router: Router = Router();

/**
 * Team Leave Rule Routes
 * Endpoints for managing team leave policies and checking conflicts.
 */

// Rules CRUD
router.get('/', teamLeaveRuleController.getRules);
router.get('/team/:teamId', teamLeaveRuleController.getRuleByTeam);
router.post('/', validateTeamLeaveRule, teamLeaveRuleController.createRule);
router.put('/:id', validateRuleId, validateTeamLeaveRule, teamLeaveRuleController.updateRule);
router.delete('/:id', validateRuleId, teamLeaveRuleController.deleteRule);

// Availability & Conflicts
router.get('/availability/:teamId', teamLeaveRuleController.getTeamAvailability);
router.post('/check-conflict', validateLeaveConflictCheck, teamLeaveRuleController.checkConflict);

export default router;
