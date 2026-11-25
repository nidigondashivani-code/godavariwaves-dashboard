import { initAutoAbsentCron, runAutoAbsentCheck } from './attendanceAutoAbsent.cron';

export const initAllCronJobs = () => {
  initAutoAbsentCron();
};

export { runAutoAbsentCheck, initAutoAbsentCron };
export default initAllCronJobs;
