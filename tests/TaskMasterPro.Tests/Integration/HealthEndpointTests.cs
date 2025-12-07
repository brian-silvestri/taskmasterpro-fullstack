using System.Net;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc.Testing;
using System.Net.Http.Json;
using System.Text.Json;

namespace TaskMasterPro.Tests.Integration;

public class HealthEndpointTests : IntegrationTestBase
{
    public HealthEndpointTests(CustomWebApplicationFactory factory) : base(factory)
    {
    }

    [Fact]
    public async Task Health_ReturnsOkAndStatusHealthy()
    {
        var response = await Client.GetAsync("/health");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var payload = await response.Content.ReadFromJsonAsync<JsonElement>();
        payload.TryGetProperty("status", out var status).Should().BeTrue();
        status.GetString().Should().Be("healthy");
    }
}
