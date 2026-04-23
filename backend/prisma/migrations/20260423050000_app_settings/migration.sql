CREATE TABLE "AppSettings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "aiDailyBudgetUsd" DOUBLE PRECISION,
    "aiChatDailyMessageLimit" INTEGER,
    "aiChatMaxWords" INTEGER,
    "aiChatHistoryWindow" INTEGER,
    "aiChatMaxOutputTokens" INTEGER,
    "aiFoodTextMaxWords" INTEGER,
    "aiImageDailyLimit" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AppSettings_pkey" PRIMARY KEY ("id")
);
