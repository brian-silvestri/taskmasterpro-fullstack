using TaskMasterPro.API.Models.Requests;
using TaskMasterPro.API.Models.Responses;
using TaskMasterPro.Domain.Entities;
using TaskStatus = TaskMasterPro.Domain.Enums.TaskStatus;
using TaskPriority = TaskMasterPro.Domain.Enums.TaskPriority;
using TaskMasterPro.Domain.Interfaces;

namespace TaskMasterPro.API.Services;

public class TaskService : ITaskService
{
    private readonly ITaskRepository _taskRepository;
    private readonly IUserRepository _userRepository;

    public TaskService(ITaskRepository taskRepository, IUserRepository userRepository)
    {
        _taskRepository = taskRepository;
        _userRepository = userRepository;
    }

    public async Task<TaskResponse> CreateTaskAsync(CreateTaskRequest request, Guid createdByUserId)
    {
        var task = new TaskEntity
        {
            Title = request.Title,
            Description = request.Description,
            Priority = request.Priority,
            Status = TaskStatus.Pending,
            DueDate = request.DueDate,
            AssignedToUserId = request.AssignedToUserId,
            CreatedByUserId = createdByUserId
        };

        var createdTask = await _taskRepository.CreateAsync(task);
        
        // Load related entities
        var taskWithDetails = await _taskRepository.GetByIdAsync(createdTask.Id);
        
        return MapToTaskResponse(taskWithDetails!);
    }

    public async Task<TaskResponse?> GetTaskByIdAsync(Guid id)
    {
        var task = await _taskRepository.GetByIdAsync(id);
        return task == null ? null : MapToTaskResponse(task);
    }

    public async Task<List<TaskResponse>> GetAllTasksAsync(int page = 1, int pageSize = 20)
    {
        var tasks = await _taskRepository.GetAllAsync(page, pageSize);
        return tasks.Select(MapToTaskResponse).ToList();
    }

    public async Task<List<TaskResponse>> GetTasksByUserIdAsync(Guid userId)
    {
        var tasks = await _taskRepository.GetByUserIdAsync(userId);
        return tasks.Select(MapToTaskResponse).ToList();
    }

    public async Task<TaskResponse> UpdateTaskAsync(Guid id, UpdateTaskRequest request)
    {
        var task = await _taskRepository.GetByIdAsync(id);
        
        if (task == null)
        {
            throw new Exception("Task not found");
        }

        if (request.Title != null) task.Title = request.Title;
        if (request.Description != null) task.Description = request.Description;
        if (request.Status.HasValue) task.Status = request.Status.Value;
        if (request.Priority.HasValue) task.Priority = request.Priority.Value;
        if (request.DueDate.HasValue) task.DueDate = request.DueDate.Value;
        if (request.AssignedToUserId.HasValue) task.AssignedToUserId = request.AssignedToUserId.Value;

        if (request.Status == TaskStatus.Completed && task.CompletedAt == null)
        {
            task.CompletedAt = DateTime.UtcNow;
        }

        var updatedTask = await _taskRepository.UpdateAsync(task);
        
        // Reload with related entities
        var taskWithDetails = await _taskRepository.GetByIdAsync(updatedTask.Id);
        
        return MapToTaskResponse(taskWithDetails!);
    }

    public async Task DeleteTaskAsync(Guid id)
    {
        await _taskRepository.DeleteAsync(id);
    }

    private TaskResponse MapToTaskResponse(TaskEntity task)
    {
        return new TaskResponse
        {
            Id = task.Id,
            Title = task.Title,
            Description = task.Description,
            Status = task.Status,
            Priority = task.Priority,
            CreatedAt = task.CreatedAt,
            DueDate = task.DueDate,
            CompletedAt = task.CompletedAt,
            AssignedToUser = task.AssignedToUser == null ? null : new UserResponse
            {
                Id = task.AssignedToUser.Id,
                Email = task.AssignedToUser.Email,
                FirstName = task.AssignedToUser.FirstName,
                LastName = task.AssignedToUser.LastName,
                FullName = task.AssignedToUser.FullName,
                CreatedAt = task.AssignedToUser.CreatedAt
            },
            CreatedByUser = new UserResponse
            {
                Id = task.CreatedByUser.Id,
                Email = task.CreatedByUser.Email,
                FirstName = task.CreatedByUser.FirstName,
                LastName = task.CreatedByUser.LastName,
                FullName = task.CreatedByUser.FullName,
                CreatedAt = task.CreatedByUser.CreatedAt
            }
        };
    }
}