-- CreateEnum
CREATE TYPE "MealType" AS ENUM ('BREAKFAST', 'LUNCH', 'DINNER', 'SNACK');

-- CreateTable
CREATE TABLE "Meal" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "mealType" "MealType" NOT NULL,
    "loggedAt" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "foodQueryId" TEXT,
    "totalCalories" DOUBLE PRECISION NOT NULL,
    "totalProtein" DOUBLE PRECISION NOT NULL,
    "totalCarbs" DOUBLE PRECISION NOT NULL,
    "totalFat" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Meal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MealItem" (
    "id" TEXT NOT NULL,
    "mealId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "quantity" TEXT,
    "calories" DOUBLE PRECISION NOT NULL,
    "protein" DOUBLE PRECISION NOT NULL,
    "carbs" DOUBLE PRECISION NOT NULL,
    "fat" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "MealItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Meal_userId_loggedAt_idx" ON "Meal"("userId", "loggedAt");

-- CreateIndex
CREATE INDEX "Meal_userId_mealType_idx" ON "Meal"("userId", "mealType");

-- CreateIndex
CREATE INDEX "MealItem_mealId_idx" ON "MealItem"("mealId");

-- AddForeignKey
ALTER TABLE "Meal" ADD CONSTRAINT "Meal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MealItem" ADD CONSTRAINT "MealItem_mealId_fkey" FOREIGN KEY ("mealId") REFERENCES "Meal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

