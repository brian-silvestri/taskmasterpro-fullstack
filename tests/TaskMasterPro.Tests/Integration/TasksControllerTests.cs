using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc.Testing;
using TaskMasterPro.API.Models.Requests;
using TaskMasterPro.API.Models.Responses;
using TaskMasterPro.Domain.Enums;
using TaskStatus = TaskMasterPro.Domain.Enums.TaskStatus;

namespace TaskMasterPro.Tests.Integration;

public class TasksControllerTests : IntegrationTestBase
{
    public TasksControllerTests(CustomWebApplicationFactory factory) : base(factory)
    {
    }

    [Fact]
    public async Task CreateTask_WithValidData_ReturnsSuccess()
    {
        // Arrange
        await GetAuthenticatedClientAsync();

        var request = new CreateTaskRequest
        {
            Title = "Test Task",
            Description = "This is a test task description",
            Priority = TaskPriority.Medium,
            DueDate = DateTime.UtcNow.AddDays(7)
        };

        // Act
        var response = await Client.PostAsJsonAsync("/api/tasks", request);

        // Assert
        var content = await response.Content.ReadAsStringAsync();
        response.StatusCode.Should().Be(HttpStatusCode.Created, $"Response: {content}");

        var result = await response.Content.ReadFromJsonAsync<ApiResponse<TaskResponse>>();
        result.Should().NotBeNull();
        result!.Success.Should().BeTrue();
        result.Data.Should().NotBeNull();
        result.Data!.Title.Should().Be(request.Title);
        result.Data.Description.Should().Be(request.Description);
        result.Data.Priority.Should().Be(request.Priority);
        result.Data.Status.Should().Be(TaskStatus.Pending);
    }

    [Fact]
    public async Task CreateTask_WithoutAuthentication_ReturnsUnauthorized()
    {
        // Arrange
        var request = new CreateTaskRequest
        {
            Title = "Test Task",
            Description = "This is a test task description",
            Priority = TaskPriority.Medium
        };

        // Act
        var response = await Client.PostAsJsonAsync("/api/tasks", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task GetAllTasks_WithAuthentication_ReturnsSuccess()
    {
        // Arrange
        await GetAuthenticatedClientAsync();

        // Create a test task first
        var createRequest = new CreateTaskRequest
        {
            Title = "Test Task",
            Description = "This is a test task description",
            Priority = TaskPriority.High
        };

        await Client.PostAsJsonAsync("/api/tasks", createRequest);

        // Act
        var response = await Client.GetAsync("/api/tasks");

        // Assert
        var content = await response.Content.ReadAsStringAsync();
        response.StatusCode.Should().Be(HttpStatusCode.OK, $"Response: {content}");

        var result = await response.Content.ReadFromJsonAsync<ApiResponse<List<TaskResponse>>>();
        result.Should().NotBeNull();
        result!.Success.Should().BeTrue();
        result.Data.Should().NotBeNull();
        result.Data.Should().NotBeEmpty();
    }

    [Fact]
    public async Task GetTaskById_WithValidId_ReturnsSuccess()
    {
        // Arrange
        await GetAuthenticatedClientAsync();

        var createRequest = new CreateTaskRequest
        {
            Title = "Test Task",
            Description = "This is a test task description",
            Priority = TaskPriority.Low
        };

        var createResponse = await Client.PostAsJsonAsync("/api/tasks", createRequest);
        var createResult = await createResponse.Content.ReadFromJsonAsync<ApiResponse<TaskResponse>>();
        var taskId = createResult!.Data!.Id;

        // Act
        var response = await Client.GetAsync($"/api/tasks/{taskId}");

        // Assert
        var content = await response.Content.ReadAsStringAsync();
        response.StatusCode.Should().Be(HttpStatusCode.OK, $"Response: {content}");

        var result = await response.Content.ReadFromJsonAsync<ApiResponse<TaskResponse>>();
        result.Should().NotBeNull();
        result!.Success.Should().BeTrue();
        result.Data.Should().NotBeNull();
        result.Data!.Id.Should().Be(taskId);
        result.Data.Title.Should().Be(createRequest.Title);
    }

    [Fact]
    public async Task GetTaskById_WithInvalidId_ReturnsNotFound()
    {
        // Arrange
        await GetAuthenticatedClientAsync();
        var invalidId = Guid.NewGuid();

        // Act
        var response = await Client.GetAsync($"/api/tasks/{invalidId}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task UpdateTask_WithValidData_ReturnsSuccess()
    {
        // Arrange
        await GetAuthenticatedClientAsync();

        var createRequest = new CreateTaskRequest
        {
            Title = "Original Task",
            Description = "Original description",
            Priority = TaskPriority.Low
        };

        var createResponse = await Client.PostAsJsonAsync("/api/tasks", createRequest);
        var createResult = await createResponse.Content.ReadFromJsonAsync<ApiResponse<TaskResponse>>();
        var taskId = createResult!.Data!.Id;

        var updateRequest = new UpdateTaskRequest
        {
            Title = "Updated Task",
            Description = "Updated description",
            Status = TaskStatus.InProgress,
            Priority = TaskPriority.High
        };

        // Act
        var response = await Client.PutAsJsonAsync($"/api/tasks/{taskId}", updateRequest);

        // Assert
        var content = await response.Content.ReadAsStringAsync();
        response.StatusCode.Should().Be(HttpStatusCode.OK, $"Response: {content}");

        var result = await response.Content.ReadFromJsonAsync<ApiResponse<TaskResponse>>();
        result.Should().NotBeNull();
        result!.Success.Should().BeTrue();
        result.Data.Should().NotBeNull();
        result.Data!.Title.Should().Be(updateRequest.Title);
        result.Data.Description.Should().Be(updateRequest.Description);
        result.Data.Status.Should().Be(updateRequest.Status);
        result.Data.Priority.Should().Be(updateRequest.Priority);
    }

    [Fact]
    public async Task DeleteTask_WithValidId_ReturnsSuccess()
    {
        // Arrange
        await GetAuthenticatedClientAsync();

        var createRequest = new CreateTaskRequest
        {
            Title = "Task to Delete",
            Description = "This task will be deleted",
            Priority = TaskPriority.Medium
        };

        var createResponse = await Client.PostAsJsonAsync("/api/tasks", createRequest);
        var createResult = await createResponse.Content.ReadFromJsonAsync<ApiResponse<TaskResponse>>();
        var taskId = createResult!.Data!.Id;

        // Act
        var response = await Client.DeleteAsync($"/api/tasks/{taskId}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        // Verify task is deleted
        var getResponse = await Client.GetAsync($"/api/tasks/{taskId}");
        getResponse.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task GetMyTasks_WithAuthentication_ReturnsOnlyUserTasks()
    {
        // Arrange
        await GetAuthenticatedClientAsync();

        // Create multiple tasks
        for (int i = 0; i < 3; i++)
        {
            var createRequest = new CreateTaskRequest
            {
                Title = $"My Task {i + 1}",
                Description = $"Description for task {i + 1}",
                Priority = TaskPriority.Medium
            };

            await Client.PostAsJsonAsync("/api/tasks", createRequest);
        }

        // Act
        var response = await Client.GetAsync("/api/tasks/my-tasks");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var result = await response.Content.ReadFromJsonAsync<ApiResponse<List<TaskResponse>>>();
        result.Should().NotBeNull();
        result!.Success.Should().BeTrue();
        result.Data.Should().NotBeNull();
        result.Data.Should().HaveCountGreaterThanOrEqualTo(3);
    }

    [Fact]
    public async Task CreateTask_WithAllFields_ReturnsSuccess()
    {
        // Arrange
        await GetAuthenticatedClientAsync();

        var dueDate = DateTime.UtcNow.AddDays(14);
        var request = new CreateTaskRequest
        {
            Title = "Complete Task",
            Description = "Task with all fields filled",
            Priority = TaskPriority.Critical,
            DueDate = dueDate
        };

        // Act
        var response = await Client.PostAsJsonAsync("/api/tasks", request);

        // Assert
        var content = await response.Content.ReadAsStringAsync();
        response.StatusCode.Should().Be(HttpStatusCode.Created, $"Response: {content}");

        var result = await response.Content.ReadFromJsonAsync<ApiResponse<TaskResponse>>();
        result.Should().NotBeNull();
        result!.Data.Should().NotBeNull();
        result.Data!.Title.Should().Be(request.Title);
        result.Data.Description.Should().Be(request.Description);
        result.Data.Priority.Should().Be(request.Priority);
        result.Data.DueDate.Should().NotBeNull();
    }
}
