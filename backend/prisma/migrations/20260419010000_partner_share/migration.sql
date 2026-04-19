CREATE TYPE "ShareStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REVOKED');

CREATE TABLE "PartnerShare" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "viewerId" TEXT NOT NULL,
    "invitedEmail" TEXT NOT NULL,
    "status" "ShareStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acceptedAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),

    CONSTRAINT "PartnerShare_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PartnerShare_ownerId_viewerId_key" ON "PartnerShare"("ownerId", "viewerId");
CREATE INDEX "PartnerShare_ownerId_status_idx" ON "PartnerShare"("ownerId", "status");
CREATE INDEX "PartnerShare_viewerId_status_idx" ON "PartnerShare"("viewerId", "status");

ALTER TABLE "PartnerShare" ADD CONSTRAINT "PartnerShare_ownerId_fkey"
  FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PartnerShare" ADD CONSTRAINT "PartnerShare_viewerId_fkey"
  FOREIGN KEY ("viewerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
