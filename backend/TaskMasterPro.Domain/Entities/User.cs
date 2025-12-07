namespace TaskMasterPro.Domain.Entities;

public class User
{
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime? LastLoginAt { get; set; }
    public bool IsActive { get; set; }
    
    // Navigation properties
    public ICollection<TaskEntity> CreatedTasks { get; set; } = new List<TaskEntity>();
    public ICollection<TaskEntity> AssignedTasks { get; set; } = new List<TaskEntity>();
    public ICollection<Notification> Notifications { get; set; } = new List<Notification>();
    
    public string FullName => $"{FirstName} {LastName}";
}