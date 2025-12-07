using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TaskMasterPro.API.Models.Requests;
using TaskMasterPro.API.Models.Responses;
using TaskMasterPro.API.Services;

namespace TaskMasterPro.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class TasksController : ControllerBase
{
    private readonly ITaskService _taskService;
    private readonly ILogger<TasksController> _logger;

    public TasksController(ITaskService taskService, ILogger<TasksController> logger)
    {
        _taskService = taskService;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<TaskResponse>>>> GetAll([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        try
        {
            var tasks = await _taskService.GetAllTasksAsync(page, pageSize);
            return Ok(ApiResponse<List<TaskResponse>>.SuccessResponse(tasks));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting tasks");
            return BadRequest(ApiResponse<List<TaskResponse>>.ErrorResponse(ex.Message));
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<TaskResponse>>> GetById(Guid id)
    {
        try
        {
            var task = await _taskService.GetTaskByIdAsync(id);
            if (task == null)
            {
                return NotFound(ApiResponse<TaskResponse>.ErrorResponse("Task not found"));
            }

            return Ok(ApiResponse<TaskResponse>.SuccessResponse(task));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting task");
            return BadRequest(ApiResponse<TaskResponse>.ErrorResponse(ex.Message));
        }
    }

    [HttpGet("user/{userId}")]
    public async Task<ActionResult<ApiResponse<List<TaskResponse>>>> GetByUserId(Guid userId)
    {
        try
        {
            var tasks = await _taskService.GetTasksByUserIdAsync(userId);
            return Ok(ApiResponse<List<TaskResponse>>.SuccessResponse(tasks));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting user tasks");
            return BadRequest(ApiResponse<List<TaskResponse>>.ErrorResponse(ex.Message));
        }
    }

    [HttpGet("my-tasks")]
    public async Task<ActionResult<ApiResponse<List<TaskResponse>>>> GetMyTasks()
    {
        try
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(ApiResponse<List<TaskResponse>>.ErrorResponse("User not authenticated"));
            }

            var tasks = await _taskService.GetTasksByUserIdAsync(Guid.Parse(userId));
            return Ok(ApiResponse<List<TaskResponse>>.SuccessResponse(tasks));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting my tasks");
            return BadRequest(ApiResponse<List<TaskResponse>>.ErrorResponse(ex.Message));
        }
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<TaskResponse>>> Create([FromBody] CreateTaskRequest request)
    {
        try
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(ApiResponse<TaskResponse>.ErrorResponse("User not authenticated"));
            }

            var task = await _taskService.CreateTaskAsync(request, Guid.Parse(userId));
            return CreatedAtAction(nameof(GetById), new { id = task.Id }, 
                ApiResponse<TaskResponse>.SuccessResponse(task, "Task created successfully"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating task");
            return BadRequest(ApiResponse<TaskResponse>.ErrorResponse(ex.Message));
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ApiResponse<TaskResponse>>> Update(Guid id, [FromBody] UpdateTaskRequest request)
    {
        try
        {
            var task = await _taskService.UpdateTaskAsync(id, request);
            return Ok(ApiResponse<TaskResponse>.SuccessResponse(task, "Task updated successfully"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating task");
            return BadRequest(ApiResponse<TaskResponse>.ErrorResponse(ex.Message));
        }
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult<ApiResponse<object>>> Delete(Guid id)
    {
        try
        {
            await _taskService.DeleteTaskAsync(id);
            return Ok(ApiResponse<object>.SuccessResponse(null, "Task deleted successfully"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting task");
            return BadRequest(ApiResponse<object>.ErrorResponse(ex.Message));
        }
    }
}