using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc.Testing;
using TaskMasterPro.API.Models.Requests;
using TaskMasterPro.API.Models.Responses;

namespace TaskMasterPro.Tests.Integration;

public class AuthControllerTests : IntegrationTestBase
{
    public AuthControllerTests(CustomWebApplicationFactory factory) : base(factory)
    {
    }

    [Fact]
    public async Task Register_WithValidData_ReturnsSuccess()
    {
        // Arrange
        var request = new RegisterRequest
        {
            Email = $"test{Guid.NewGuid()}@example.com",
            Password = "Test123!",
            FirstName = "John",
            LastName = "Doe"
        };

        // Act
        var response = await Client.PostAsJsonAsync("/api/auth/register", request);

        // Assert
        var content = await response.Content.ReadAsStringAsync();
        response.StatusCode.Should().Be(HttpStatusCode.OK, $"Response: {content}");

        var result = await response.Content.ReadFromJsonAsync<ApiResponse<AuthResponse>>();
        result.Should().NotBeNull();
        result!.Success.Should().BeTrue();
        result.Data.Should().NotBeNull();
        result.Data!.Token.Should().NotBeNullOrEmpty();
        result.Data.User.Should().NotBeNull();
        result.Data.User.Email.Should().Be(request.Email);
        result.Data.User.FirstName.Should().Be(request.FirstName);
        result.Data.User.LastName.Should().Be(request.LastName);
    }

    [Fact]
    public async Task Register_WithDuplicateEmail_ReturnsBadRequest()
    {
        // Arrange
        var email = $"test{Guid.NewGuid()}@example.com";
        var request = new RegisterRequest
        {
            Email = email,
            Password = "Test123!",
            FirstName = "John",
            LastName = "Doe"
        };

        // First registration
        await Client.PostAsJsonAsync("/api/auth/register", request);

        // Act - Second registration with same email
        var response = await Client.PostAsJsonAsync("/api/auth/register", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task Login_WithValidCredentials_ReturnsSuccess()
    {
        // Arrange
        var email = $"test{Guid.NewGuid()}@example.com";
        var password = "Test123!";

        var registerRequest = new RegisterRequest
        {
            Email = email,
            Password = password,
            FirstName = "John",
            LastName = "Doe"
        };

        await Client.PostAsJsonAsync("/api/auth/register", registerRequest);

        var loginRequest = new LoginRequest
        {
            Email = email,
            Password = password
        };

        // Act
        var response = await Client.PostAsJsonAsync("/api/auth/login", loginRequest);

        // Assert
        var content = await response.Content.ReadAsStringAsync();
        response.StatusCode.Should().Be(HttpStatusCode.OK, $"Response: {content}");

        var result = await response.Content.ReadFromJsonAsync<ApiResponse<AuthResponse>>();
        result.Should().NotBeNull();
        result!.Success.Should().BeTrue();
        result.Data.Should().NotBeNull();
        result.Data!.Token.Should().NotBeNullOrEmpty();
        result.Data.User.Email.Should().Be(email);
    }

    [Fact]
    public async Task Login_WithInvalidPassword_ReturnsBadRequest()
    {
        // Arrange
        var email = $"test{Guid.NewGuid()}@example.com";

        var registerRequest = new RegisterRequest
        {
            Email = email,
            Password = "Test123!",
            FirstName = "John",
            LastName = "Doe"
        };

        await Client.PostAsJsonAsync("/api/auth/register", registerRequest);

        var loginRequest = new LoginRequest
        {
            Email = email,
            Password = "WrongPassword123!"
        };

        // Act
        var response = await Client.PostAsJsonAsync("/api/auth/login", loginRequest);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task Login_WithNonExistentUser_ReturnsBadRequest()
    {
        // Arrange
        var loginRequest = new LoginRequest
        {
            Email = "nonexistent@example.com",
            Password = "Test123!"
        };

        // Act
        var response = await Client.PostAsJsonAsync("/api/auth/login", loginRequest);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }
}
