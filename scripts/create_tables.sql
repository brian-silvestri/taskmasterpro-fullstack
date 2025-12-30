-- TaskMaster Pro Database Schema

-- Users Table
CREATE TABLE "Users" (
    "Id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "Email" VARCHAR(255) NOT NULL UNIQUE,
    "PasswordHash" TEXT NOT NULL,
    "FirstName" VARCHAR(100) NOT NULL,
    "LastName" VARCHAR(100) NOT NULL,
    "CreatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "LastLoginAt" TIMESTAMP NULL,
    "IsActive" BOOLEAN NOT NULL DEFAULT TRUE
);

-- Tasks Table
CREATE TABLE "Tasks" (
    "Id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "Title" VARCHAR(200) NOT NULL,
    "Description" VARCHAR(2000) NULL,
    "Status" INTEGER NOT NULL DEFAULT 0,
    "Priority" INTEGER NOT NULL DEFAULT 0,
    "CreatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "DueDate" TIMESTAMP NULL,
    "CompletedAt" TIMESTAMP NULL,
    "AssignedToUserId" UUID NULL,
    "CreatedByUserId" UUID NOT NULL,
    CONSTRAINT "FK_Tasks_CreatedByUser" FOREIGN KEY ("CreatedByUserId")
        REFERENCES "Users"("Id") ON DELETE RESTRICT,
    CONSTRAINT "FK_Tasks_AssignedToUser" FOREIGN KEY ("AssignedToUserId")
        REFERENCES "Users"("Id") ON DELETE SET NULL
);

-- TaskAttachments Table
CREATE TABLE "TaskAttachments" (
    "Id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "TaskId" UUID NOT NULL,
    "FileName" VARCHAR(255) NOT NULL,
    "S3Key" VARCHAR(500) NOT NULL,
    "ContentType" VARCHAR(100) NOT NULL,
    "FileSizeBytes" BIGINT NOT NULL,
    "UploadedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UploadedByUserId" UUID NOT NULL,
    "Status" INTEGER NOT NULL DEFAULT 0,
    "ProcessingError" TEXT NULL,
    CONSTRAINT "FK_TaskAttachments_Task" FOREIGN KEY ("TaskId")
        REFERENCES "Tasks"("Id") ON DELETE CASCADE,
    CONSTRAINT "FK_TaskAttachments_UploadedBy" FOREIGN KEY ("UploadedByUserId")
        REFERENCES "Users"("Id") ON DELETE RESTRICT
);

-- TaskComments Table
CREATE TABLE "TaskComments" (
    "Id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "TaskId" UUID NOT NULL,
    "UserId" UUID NOT NULL,
    "Content" VARCHAR(1000) NOT NULL,
    "CreatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP NULL,
    CONSTRAINT "FK_TaskComments_Task" FOREIGN KEY ("TaskId")
        REFERENCES "Tasks"("Id") ON DELETE CASCADE,
    CONSTRAINT "FK_TaskComments_User" FOREIGN KEY ("UserId")
        REFERENCES "Users"("Id") ON DELETE RESTRICT
);

-- Notifications Table
CREATE TABLE "Notifications" (
    "Id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "UserId" UUID NOT NULL,
    "Type" INTEGER NOT NULL,
    "Title" VARCHAR(200) NOT NULL,
    "Message" VARCHAR(1000) NOT NULL,
    "CreatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "IsRead" BOOLEAN NOT NULL DEFAULT FALSE,
    "RelatedEntityId" UUID NULL,
    "RelatedEntityType" VARCHAR(100) NULL,
    CONSTRAINT "FK_Notifications_User" FOREIGN KEY ("UserId")
        REFERENCES "Users"("Id") ON DELETE CASCADE
);

-- Create Indexes
CREATE INDEX "IX_Tasks_Status" ON "Tasks"("Status");
CREATE INDEX "IX_Tasks_DueDate" ON "Tasks"("DueDate");
CREATE INDEX "IX_Tasks_CreatedByUserId" ON "Tasks"("CreatedByUserId");
CREATE INDEX "IX_Tasks_AssignedToUserId" ON "Tasks"("AssignedToUserId");
CREATE INDEX "IX_Users_Email" ON "Users"("Email");
CREATE INDEX "IX_Notifications_UserId_IsRead" ON "Notifications"("UserId", "IsRead");
