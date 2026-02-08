-- CreateTable
CREATE TABLE "SharedTemplate" (
    "id" TEXT NOT NULL,
    "month" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT '',
    "focus" TEXT NOT NULL DEFAULT '',
    "morningRoutine" JSONB NOT NULL,
    "healthHabits" JSONB NOT NULL,
    "nightRoutine" JSONB NOT NULL,
    "weeklyGoals" JSONB NOT NULL,
    "readingGoal" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SharedTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyRoutine" (
    "id" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "month" TEXT NOT NULL,
    "user" TEXT NOT NULL,
    "morningRoutine" JSONB NOT NULL,
    "healthHabits" JSONB NOT NULL,
    "nightRoutine" JSONB NOT NULL,
    "nutrition" JSONB NOT NULL,
    "pushUpsCount" INTEGER NOT NULL DEFAULT 0,
    "stepsCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailyRoutine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeeklyCheckIn" (
    "id" TEXT NOT NULL,
    "weekNumber" INTEGER NOT NULL,
    "month" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "user" TEXT NOT NULL,
    "glowUpEntries" JSONB NOT NULL,
    "exercisedTwice" BOOLEAN NOT NULL DEFAULT false,
    "mentalHealthCheckIn" BOOLEAN NOT NULL DEFAULT false,
    "selfCareAction" BOOLEAN NOT NULL DEFAULT false,
    "customGoals" JSONB,
    "oneWin" TEXT NOT NULL DEFAULT '',
    "oneProud" TEXT NOT NULL DEFAULT '',
    "oneImprove" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WeeklyCheckIn_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MonthlyReading" (
    "id" TEXT NOT NULL,
    "month" TEXT NOT NULL,
    "user" TEXT NOT NULL,
    "bookTitle" TEXT NOT NULL DEFAULT '',
    "readThisWeek" JSONB NOT NULL,
    "finishedBook" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MonthlyReading_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SharedTemplate_month_key" ON "SharedTemplate"("month");

-- CreateIndex
CREATE INDEX "SharedTemplate_month_idx" ON "SharedTemplate"("month");

-- CreateIndex
CREATE INDEX "DailyRoutine_user_date_idx" ON "DailyRoutine"("user", "date");

-- CreateIndex
CREATE INDEX "DailyRoutine_user_month_idx" ON "DailyRoutine"("user", "month");

-- CreateIndex
CREATE UNIQUE INDEX "DailyRoutine_date_user_key" ON "DailyRoutine"("date", "user");

-- CreateIndex
CREATE INDEX "WeeklyCheckIn_user_year_month_idx" ON "WeeklyCheckIn"("user", "year", "month");

-- CreateIndex
CREATE UNIQUE INDEX "WeeklyCheckIn_user_year_month_weekNumber_key" ON "WeeklyCheckIn"("user", "year", "month", "weekNumber");

-- CreateIndex
CREATE INDEX "MonthlyReading_user_month_idx" ON "MonthlyReading"("user", "month");

-- CreateIndex
CREATE UNIQUE INDEX "MonthlyReading_user_month_key" ON "MonthlyReading"("user", "month");
