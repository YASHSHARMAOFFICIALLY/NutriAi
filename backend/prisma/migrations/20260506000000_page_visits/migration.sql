CREATE TABLE "PageVisit" (
    "id" TEXT NOT NULL,
    "visitorId" TEXT,
    "path" TEXT NOT NULL,
    "referrer" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PageVisit_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "PageVisit_createdAt_idx" ON "PageVisit"("createdAt");
CREATE INDEX "PageVisit_visitorId_createdAt_idx" ON "PageVisit"("visitorId", "createdAt");
CREATE INDEX "PageVisit_path_createdAt_idx" ON "PageVisit"("path", "createdAt");
