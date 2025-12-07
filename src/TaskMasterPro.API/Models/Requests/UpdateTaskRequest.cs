using System.ComponentModel.DataAnnotations;
using TaskPriority = TaskMasterPro.Domain.Enums.TaskPriority;
using TaskStatus = TaskMasterPro.Domain.Enums.TaskStatus;

namespace TaskMasterPro.API.Models.Requests;

public class UpdateTaskRequest
{
    [StringLength(150, MinimumLength = 3)]
    public string? Title { get; set; }

    [StringLength(1000)]
    public string? Description { get; set; }

    public TaskStatus? Status { get; set; }
    public TaskPriority? Priority { get; set; }
    public DateTime? DueDate { get; set; }
    public Guid? AssignedToUserId { get; set; }
}
