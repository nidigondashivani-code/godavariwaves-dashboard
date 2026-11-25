import cron from 'node-cron';
import { Op } from 'sequelize';
import { Attendance, Employee, LeaveRequest, Holiday } from '../models';
import { getTodayDateString } from '../utils/dateUtils.util';
import { logger } from '../utils/logger.util';

/**
 * Marks active employees as Absent if they have not logged in by 11:00 AM on a working day,
 * unless they have an approved leave, company holiday, weekend, or admin-approved correction.
 */
export const runAutoAbsentCheck = async (): Promise<number> => {
  try {
    const today = getTodayDateString();
    const todayDate = new Date();
    const dayOfWeek = todayDate.getDay();

    // Sunday (0) is a weekend
    if (dayOfWeek === 0) {
      return 0;
    }

    // Check if today is a Company Holiday
    const holiday = await Holiday.findOne({ where: { date: today } });
    if (holiday) {
      return 0;
    }

    // Retrieve all active employees
    const activeEmployees = await Employee.findAll({
      where: {
        employment_status: 'Active',
        is_deleted: false,
      },
    });

    let markedCount = 0;

    for (const emp of activeEmployees) {
      const existing = await Attendance.findOne({
        where: { employee_id: emp.id, date: today },
      });

      // If already clocked in or corrected/approved by admin, skip
      if (existing && (existing.clock_in || existing.is_corrected || existing.is_approved)) {
        continue;
      }

      // Check if on approved leave
      const approvedLeave = await LeaveRequest.findOne({
        where: {
          employee_id: emp.id,
          status: 'Approved',
          start_date: { [Op.lte]: today },
          end_date: { [Op.gte]: today },
        },
      });

      if (approvedLeave) {
        if (!existing) {
          await Attendance.create({
            employee_id: emp.id,
            date: today,
            status: 'On Leave',
            clock_in: null,
            clock_out: null,
            working_hours: 0,
            working_minutes: 0,
            late_minutes: 0,
            notes: 'Approved Leave',
          });
        }
        continue;
      }

      // Mark as Absent if not already marked
      if (existing) {
        if (!existing.clock_in && existing.status !== 'Absent') {
          existing.status = 'Absent';
          await existing.save();
          markedCount++;
        }
      } else {
        await Attendance.create({
          employee_id: emp.id,
          date: today,
          status: 'Absent',
          clock_in: null,
          clock_out: null,
          working_hours: 0,
          working_minutes: 0,
          late_minutes: 0,
          notes: 'Auto-marked Absent (Not logged in by 11:00 AM)',
        });
        markedCount++;
      }
    }

    if (markedCount > 0) {
      logger.info(`Auto-absent check completed: marked ${markedCount} employees as Absent for ${today}`);
    }
    return markedCount;
  } catch (error) {
    logger.error('Error running auto-absent check:', error);
    return 0;
  }
};

export const initAutoAbsentCron = () => {
  // Run every 15 minutes between 11:00 AM and 6:30 PM, Monday through Saturday
  cron.schedule('*/15 11-18 * * 1-6', async () => {
    await runAutoAbsentCheck();
  });
  logger.info('Auto-absent cron job scheduled (11:00 AM - 6:30 PM).');
};

export default { runAutoAbsentCheck, initAutoAbsentCron };
