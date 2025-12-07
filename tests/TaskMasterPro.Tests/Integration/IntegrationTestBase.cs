using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using TaskMasterPro.API.Models.Requests;
using TaskMasterPro.API.Models.Responses;

namespace TaskMasterPro.Tests.Integration;

public class IntegrationTestBase : IClassFixture<CustomWebApplicationFactory>
{
    protected readonly HttpClient Client;
    protected readonly CustomWebApplicationFactory Factory;
    protected readonly JsonSerializerOptions JsonOptions;

    public IntegrationTestBase(CustomWebApplicationFactory factory)
    {
        Factory = factory;
        Client = factory.CreateClient();
        JsonOptions = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        };
    }

    protected async Task<string> GetAuthTokenAsync()
    {
        // Register a test user
        var registerRequest = new RegisterRequest
        {
            Email = $"test{Guid.NewGuid()}@example.com",
            Password = "Test123!",
            FirstName = "Test",
            LastName = "User"
        };

        var response = await Client.PostAsJsonAsync("/api/auth/register", registerRequest);
        if (!response.IsSuccessStatusCode)
        {
            var error = await response.Content.ReadAsStringAsync();
            throw new Exception($"Register failed: {response.StatusCode} - {error}");
        }

        var result = await response.Content.ReadFromJsonAsync<ApiResponse<AuthResponse>>();
        return result!.Data!.Token;
    }

    protected void SetAuthToken(string token)
    {
        Client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
    }

    protected async Task<(HttpClient Client, string Token)> GetAuthenticatedClientAsync()
    {
        var token = await GetAuthTokenAsync();
        SetAuthToken(token);
        return (Client, token);
    }
}
