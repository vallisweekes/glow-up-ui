/**
 * Backend-for-Frontend (BFF) Data Store
 * 
 * Now using Prisma + Neon PostgreSQL for persistent storage.
 * All functions are re-exported from prisma-service.
 */

export {
  // User Management
  getAllUsers,
  getUserById,
  getUserByName,
  createUser,
  updateUserPin,
  verifyUserPin,
  // Daily Routines
  getDailyRoutine,
  saveDailyRoutine,
  getMonthlyRoutines,
  deleteDailyRoutine,
  // Shared Templates
  getSharedTemplate,
  saveSharedTemplate,
  deleteSharedTemplate,
  // Monthly Templates (User-specific)
  getMonthlyTemplate,
  saveMonthlyTemplate,
  deleteMonthlyTemplate,
  // Monthly Reading
  getMonthlyReading,
  saveMonthlyReading,
  // Utility
  getAllRoutines,
  getAllTemplates,
  getStoreStats,
  // Weekly Check-ins
  getWeeklyCheckIn,
  saveWeeklyCheckIn,
} from './prisma-service';


