namespace TaskMasterPro.Domain.Enums;

public enum TaskStatus
{
    Pending = 0,
    InProgress = 1,
    Completed = 2,
    Cancelled = 3
}

public enum TaskPriority
{
    Low = 0,
    Medium = 1,
    High = 2,
    Critical = 3
}

public enum AttachmentStatus
{
    Pending = 0,
    Processing = 1,
    Ready = 2,
    Failed = 3
}

public enum NotificationType
{
    TaskCreated = 0,
    TaskAssigned = 1,
    TaskCompleted = 2,
    TaskDeadlineApproaching = 3,
    FileProcessed = 4,
    CommentAdded = 5,
    SystemAlert = 6
}