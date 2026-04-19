-- Challenges feature: preset templates + user participation tracking.

CREATE TYPE "ChallengeCategory" AS ENUM ('SUGAR', 'PROTEIN', 'HYDRATION', 'CALORIES', 'STEPS', 'HABIT');
CREATE TYPE "ChallengeStatus"  AS ENUM ('ACTIVE', 'COMPLETED', 'ABANDONED');

-- Preset challenge templates (seeded separately).
CREATE TABLE "Challenge" (
  "id"           TEXT         NOT NULL,
  "slug"         TEXT         NOT NULL,
  "title"        TEXT         NOT NULL,
  "description"  TEXT         NOT NULL,
  "category"     "ChallengeCategory" NOT NULL,
  "durationDays" INTEGER      NOT NULL,
  "icon"         TEXT         NOT NULL,
  "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "Challenge_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Challenge_slug_key"     ON "Challenge"("slug");
CREATE INDEX "Challenge_category_idx"        ON "Challenge"("category");
CREATE INDEX "Challenge_durationDays_idx"    ON "Challenge"("durationDays");

-- User's active / past challenge instances.
CREATE TABLE "UserChallenge" (
  "id"              TEXT              NOT NULL,
  "userId"          TEXT              NOT NULL,
  "challengeId"     TEXT,
  "title"           TEXT              NOT NULL,
  "description"     TEXT,
  "durationDays"    INTEGER           NOT NULL,
  "startDate"       TIMESTAMP(3)      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "status"          "ChallengeStatus" NOT NULL DEFAULT 'ACTIVE',
  "daysCheckedIn"   INTEGER           NOT NULL DEFAULT 0,
  "lastCheckInDate" TIMESTAMP(3),
  "createdAt"       TIMESTAMP(3)      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"       TIMESTAMP(3)      NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "UserChallenge_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "UserChallenge_userId_status_idx"  ON "UserChallenge"("userId", "status");
CREATE INDEX "UserChallenge_userId_createdAt_idx" ON "UserChallenge"("userId", "createdAt");

ALTER TABLE "UserChallenge"
  ADD CONSTRAINT "UserChallenge_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "UserChallenge"
  ADD CONSTRAINT "UserChallenge_challengeId_fkey"
  FOREIGN KEY ("challengeId") REFERENCES "Challenge"("id") ON DELETE SET NULL ON UPDATE CASCADE;
