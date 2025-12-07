using TaskMasterPro.Domain.Entities;

namespace TaskMasterPro.Domain.Interfaces;

public interface ITaskRepository
{
    Task<TaskEntity?> GetByIdAsync(Guid id);
    Task<List<TaskEntity>> GetAllAsync(int page = 1, int pageSize = 20);
    Task<List<TaskEntity>> GetByUserIdAsync(Guid userId);
    Task<List<TaskEntity>> GetByStatusAsync(Enums.TaskStatus status);
    Task<TaskEntity> CreateAsync(TaskEntity task);
    Task<TaskEntity> UpdateAsync(TaskEntity task);
    Task DeleteAsync(Guid id);
    Task<int> GetTotalCountAsync();
}

public interface IUserRepository
{
    Task<User?> GetByIdAsync(Guid id);
    Task<User?> GetByEmailAsync(string email);
    Task<User> CreateAsync(User user);
    Task<User> UpdateAsync(User user);
    Task<List<User>> GetAllAsync();
}

public interface INotificationRepository
{
    Task<Notification?> GetByIdAsync(Guid id);
    Task<List<Notification>> GetByUserIdAsync(Guid userId, bool unreadOnly = false);
    Task<Notification> CreateAsync(Notification notification);
    Task MarkAsReadAsync(Guid id);
    Task<int> GetUnreadCountAsync(Guid userId);
}

public interface IAttachmentRepository
{
    Task<TaskAttachment?> GetByIdAsync(Guid id);
    Task<List<TaskAttachment>> GetByTaskIdAsync(Guid taskId);
    Task<TaskAttachment> CreateAsync(TaskAttachment attachment);
    Task<TaskAttachment> UpdateAsync(TaskAttachment attachment);
    Task DeleteAsync(Guid id);
}