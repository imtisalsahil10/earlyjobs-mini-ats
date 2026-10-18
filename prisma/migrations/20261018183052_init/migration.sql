-- CreateTable
CREATE TABLE "Job" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "employment" TEXT NOT NULL DEFAULT 'Full-time',
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "minSalary" INTEGER,
    "maxSalary" INTEGER,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Candidate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "location" TEXT,
    "title" TEXT,
    "skills" TEXT NOT NULL DEFAULT '',
    "source" TEXT NOT NULL DEFAULT 'Careers Page',
    "stage" TEXT NOT NULL DEFAULT 'APPLIED',
    "rating" INTEGER NOT NULL DEFAULT 0,
    "avatarSeed" TEXT,
    "resumeUrl" TEXT,
    "linkedinUrl" TEXT,
    "appliedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "jobId" TEXT NOT NULL,
    CONSTRAINT "Candidate_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "StageEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fromStage" TEXT,
    "toStage" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "candidateId" TEXT NOT NULL,
    CONSTRAINT "StageEvent_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Note" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "body" TEXT NOT NULL,
    "author" TEXT NOT NULL DEFAULT 'Recruiter',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "candidateId" TEXT NOT NULL,
    CONSTRAINT "Note_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Job_status_idx" ON "Job"("status");

-- CreateIndex
CREATE INDEX "Candidate_stage_idx" ON "Candidate"("stage");

-- CreateIndex
CREATE INDEX "Candidate_jobId_idx" ON "Candidate"("jobId");

-- CreateIndex
CREATE INDEX "Candidate_name_idx" ON "Candidate"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Candidate_email_jobId_key" ON "Candidate"("email", "jobId");

-- CreateIndex
CREATE INDEX "StageEvent_candidateId_idx" ON "StageEvent"("candidateId");

-- CreateIndex
CREATE INDEX "StageEvent_toStage_idx" ON "StageEvent"("toStage");

-- CreateIndex
CREATE INDEX "Note_candidateId_idx" ON "Note"("candidateId");
