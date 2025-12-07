namespace TaskMasterPro.Domain.Entities;

public class TaskEntity
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public Enums.TaskStatus Status { get; set; }
    public Enums.TaskPriority Priority { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? DueDate { get; set; }
    public DateTime? CompletedAt { get; set; }
    public Guid? AssignedToUserId { get; set; }
    public Guid CreatedByUserId { get; set; }
    
    // Navigation properties
    public User? AssignedToUser { get; set; }
    public User CreatedByUser { get; set; } = null!;
    public ICollection<TaskAttachment> Attachments { get; set; } = new List<TaskAttachment>();
    public ICollection<TaskComment> Comments { get; set; } = new List<TaskComment>();
}

public class TaskAttachment
{
    public Guid Id { get; set; }
    public Guid TaskId { get; set; }
    public string FileName { get; set; } = string.Empty;
    public string S3Key { get; set; } = string.Empty;
    public string ContentType { get; set; } = string.Empty;
    public long FileSizeBytes { get; set; }
    public DateTime UploadedAt { get; set; }
    public Guid UploadedByUserId { get; set; }
    public Enums.AttachmentStatus Status { get; set; }
    public string? ProcessingError { get; set; }
    
    // Navigation properties
    public TaskEntity Task { get; set; } = null!;
    public User UploadedByUser { get; set; } = null!;
}

public class TaskComment
{
    public Guid Id { get; set; }
    public Guid TaskId { get; set; }
    public Guid UserId { get; set; }
    public string Content { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    
    // Navigation properties
    public TaskEntity Task { get; set; } = null!;
    public User User { get; set; } = null!;
}