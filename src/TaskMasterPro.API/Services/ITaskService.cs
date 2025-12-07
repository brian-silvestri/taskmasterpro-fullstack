using TaskMasterPro.API.Models.Requests;
using TaskMasterPro.API.Models.Responses;

namespace TaskMasterPro.API.Services;

public interface ITaskService
{
    Task<TaskResponse> CreateTaskAsync(CreateTaskRequest request, Guid createdByUserId);
    Task<TaskResponse?> GetTaskByIdAsync(Guid id);
    Task<List<TaskResponse>> GetAllTasksAsync(int page = 1, int pageSize = 20);
    Task<List<TaskResponse>> GetTasksByUserIdAsync(Guid userId);
    Task<TaskResponse> UpdateTaskAsync(Guid id, UpdateTaskRequest request);
    Task DeleteTaskAsync(Guid id);
}