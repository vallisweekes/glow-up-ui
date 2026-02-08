/*
  Warnings:

  - You are about to drop the column `exercisedTwice` on the `WeeklyCheckIn` table. All the data in the column will be lost.
  - You are about to drop the column `mentalHealthCheckIn` on the `WeeklyCheckIn` table. All the data in the column will be lost.
  - You are about to drop the column `selfCareAction` on the `WeeklyCheckIn` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "WeeklyCheckIn" DROP COLUMN "exercisedTwice",
DROP COLUMN "mentalHealthCheckIn",
DROP COLUMN "selfCareAction";
