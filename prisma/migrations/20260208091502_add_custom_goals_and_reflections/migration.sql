/*
  Warnings:

  - Added the required column `customReflections` to the `WeeklyCheckIn` table without a default value. This is not possible if the table is not empty.
  - Made the column `customGoals` on table `WeeklyCheckIn` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "WeeklyCheckIn" ADD COLUMN     "customReflections" JSONB NOT NULL,
ALTER COLUMN "customGoals" SET NOT NULL;
