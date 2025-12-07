using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Amazon.S3;
using Amazon.SQS;
using Amazon.SimpleNotificationService;
using TaskMasterPro.Infrastructure.Data;
using TaskMasterPro.Domain.Interfaces;
using TaskMasterPro.Infrastructure.Repositories;
using TaskMasterPro.Infrastructure.AwsServices;
using TaskMasterPro.API.Services;

var builder = WebApplication.CreateBuilder(args);

// Configure port for Railway/Cloud deployment
var port = Environment.GetEnvironmentVariable("PORT") ?? "8080";
builder.WebHost.UseUrls($"http://0.0.0.0:{port}");

// Configure Npgsql to use timestamp without timezone
AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);

// Load configuration from environment variables
var configuration = builder.Configuration;

// Database Configuration
var connectionString = Environment.GetEnvironmentVariable("DATABASE_CONNECTION_STRING")  // ← CAMBIAR NOMBRE
    ?? Environment.GetEnvironmentVariable("CONNECTION_STRING") 
    ?? configuration.GetConnectionString("DefaultConnection")
    ?? "Host=localhost;Port=5432;Database=taskmasterdb;Username=postgres;Password=postgres";

// DEBUG: Log connection string info
Console.WriteLine($"=== CONNECTION STRING DEBUG ===");
Console.WriteLine($"From DATABASE_CONNECTION_STRING: {Environment.GetEnvironmentVariable("DATABASE_CONNECTION_STRING") ?? "NULL"}");
Console.WriteLine($"From CONNECTION_STRING: {Environment.GetEnvironmentVariable("CONNECTION_STRING") ?? "NULL"}");
Console.WriteLine($"Final value length: {connectionString?.Length ?? 0}");
Console.WriteLine($"First 50 chars: {(connectionString?.Length > 50 ? connectionString.Substring(0, 50) : connectionString ?? "NULL")}");
Console.WriteLine($"================================");
builder.Services.AddDbContext<TaskMasterDbContext>(options =>
    options.UseNpgsql(connectionString));

// AWS Services Configuration
var useLocalStack = Environment.GetEnvironmentVariable("USE_LOCALSTACK") == "true";
var awsEndpoint = Environment.GetEnvironmentVariable("AWS_ENDPOINT_URL") ?? "http://localhost:4566";

if (useLocalStack)
{
    // Configure for LocalStack
    builder.Services.AddSingleton<IAmazonS3>(sp =>
    {
        var config = new Amazon.S3.AmazonS3Config
        {
            ServiceURL = awsEndpoint,
            ForcePathStyle = true
        };
        return new Amazon.S3.AmazonS3Client("test", "test", config);
    });

    builder.Services.AddSingleton<IAmazonSQS>(sp =>
    {
        var config = new Amazon.SQS.AmazonSQSConfig
        {
            ServiceURL = awsEndpoint
        };
        return new Amazon.SQS.AmazonSQSClient("test", "test", config);
    });

    builder.Services.AddSingleton<IAmazonSimpleNotificationService>(sp =>
    {
        var config = new Amazon.SimpleNotificationService.AmazonSimpleNotificationServiceConfig
        {
            ServiceURL = awsEndpoint
        };
        return new Amazon.SimpleNotificationService.AmazonSimpleNotificationServiceClient("test", "test", config);
    });
}
else
{
    // Configure for real AWS
    builder.Services.AddDefaultAWSOptions(configuration.GetAWSOptions());
    builder.Services.AddAWSService<IAmazonS3>();
    builder.Services.AddAWSService<IAmazonSQS>();
    builder.Services.AddAWSService<IAmazonSimpleNotificationService>();
}

// Repositories
builder.Services.AddScoped<ITaskRepository, TaskRepository>();
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<INotificationRepository, NotificationRepository>();
builder.Services.AddScoped<IAttachmentRepository, AttachmentRepository>();

// AWS Services
var bucketName = Environment.GetEnvironmentVariable("S3_BUCKET_NAME") ?? "taskmaster-attachments";
builder.Services.AddScoped<IS3Service>(sp => 
    new S3Service(sp.GetRequiredService<IAmazonS3>(), bucketName));
builder.Services.AddScoped<ISqsService, SqsService>();
builder.Services.AddScoped<ISnsService, SnsService>();

// Application Services
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<ITaskService, TaskService>();

// JWT Authentication
var jwtSecret = Environment.GetEnvironmentVariable("JWT_SECRET") 
    ?? configuration["JWT_SECRET"]
    ?? "super-secret-jwt-key-change-in-production-please-12345678";
var jwtIssuer = Environment.GetEnvironmentVariable("JWT_ISSUER") ?? "TaskMasterPro";
var jwtAudience = Environment.GetEnvironmentVariable("JWT_AUDIENCE") ?? "TaskMasterPro";

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtIssuer,
            ValidAudience = jwtAudience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret))
        };
    });

builder.Services.AddAuthorization();

// CORS
var allowedOrigins = Environment.GetEnvironmentVariable("CORS_ALLOWED_ORIGINS")
    ?.Split(',') ?? new[] { "http://localhost:4200", "http://localhost:3000" };

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins(allowedOrigins)
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

// Controllers and Swagger
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "TaskMaster Pro API", Version = "v1" });
    
    // JWT Authentication in Swagger
    c.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\"",
        Name = "Authorization",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

// Apply migrations automatically
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<TaskMasterDbContext>();
    var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
    try
    {
        logger.LogInformation("Checking database migrations...");
        if (db.Database.IsRelational())
        {
            db.Database.Migrate();
            logger.LogInformation("Database migrations applied successfully.");
        }
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "An error occurred while migrating the database.");
        throw;
    }
}

// Configure the HTTP request pipeline
// Enable Swagger in all environments for testing (remove the if condition)
app.UseSwagger();
app.UseSwaggerUI();

app.UseCors();
app.UseMiddleware<TaskMasterPro.API.Middleware.ExceptionHandlingMiddleware>();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// Health check endpoint
app.MapGet("/health", () => Results.Ok(new 
{ 
    status = "healthy", 
    timestamp = DateTime.UtcNow,
    environment = app.Environment.EnvironmentName
}));

app.Run();

// Make the implicit Program class public so tests can reference it
public partial class Program { }