using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using TaskMasterPro.Infrastructure.Data;

namespace TaskMasterPro.Tests.Integration;

/// <summary>
/// Custom factory to run the API against an in-memory database during integration tests.
/// </summary>
public class CustomWebApplicationFactory : WebApplicationFactory<Program>
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Development");
        builder.ConfigureServices(services =>
        {
            // Use LocalStack/fake AWS during tests to avoid real AWS calls
            Environment.SetEnvironmentVariable("USE_LOCALSTACK", "true");

            // Replace Postgres with in-memory database for tests
            var descriptor = services.SingleOrDefault(
                d => d.ServiceType == typeof(DbContextOptions<TaskMasterDbContext>));
            if (descriptor != null)
            {
                services.Remove(descriptor);
            }

            const string databaseName = "InMemoryDbForTesting";
            services.AddDbContext<TaskMasterDbContext>(options =>
                options.UseInMemoryDatabase(databaseName));

            // Ensure database is created
            var sp = services.BuildServiceProvider();
            using var scope = sp.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<TaskMasterDbContext>();
            db.Database.EnsureCreated();
        });
    }
}
