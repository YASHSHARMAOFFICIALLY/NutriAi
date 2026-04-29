-- Store admin-visible login/session metadata collected from auth requests.
CREATE TABLE "UserSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "refreshTokenId" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "deviceType" TEXT,
    "deviceModel" TEXT,
    "os" TEXT,
    "browser" TEXT,
    "location" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMP(3),

    CONSTRAINT "UserSession_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "UserSession_refreshTokenId_key" ON "UserSession"("refreshTokenId");
CREATE INDEX "UserSession_userId_lastSeenAt_idx" ON "UserSession"("userId", "lastSeenAt");
CREATE INDEX "UserSession_ipAddress_idx" ON "UserSession"("ipAddress");

ALTER TABLE "UserSession" ADD CONSTRAINT "UserSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UserSession" ADD CONSTRAINT "UserSession_refreshTokenId_fkey" FOREIGN KEY ("refreshTokenId") REFERENCES "RefreshToken"("id") ON DELETE CASCADE ON UPDATE CASCADE;
