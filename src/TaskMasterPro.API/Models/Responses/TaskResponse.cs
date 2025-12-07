namespace TaskMasterPro.API.Models.Responses;

public class TaskResponse
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public Domain.Enums.TaskStatus Status { get; set; }
    public Domain.Enums.TaskPriority Priority { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? DueDate { get; set; }
    public DateTime? CompletedAt { get; set; }
    public UserResponse? AssignedToUser { get; set; }
    public UserResponse CreatedByUser { get; set; } = null!;
}