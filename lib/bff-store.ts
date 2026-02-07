/**
 * Backend-for-Frontend (BFF) Data Store
 * 
 * Now using Prisma + Neon PostgreSQL for persistent storage.
 * All functions are re-exported from prisma-service.
 */

export {
  getDailyRoutine,
  saveDailyRoutine,
  getMonthlyRoutines,
  deleteDailyRoutine,
  getSharedTemplate,
  saveSharedTemplate,
  deleteSharedTemplate,
  getAllRoutines,
  getAllTemplates,
  getStoreStats,
} from './prisma-service';
