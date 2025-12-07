using Microsoft.EntityFrameworkCore;
using TaskMasterPro.Domain.Entities;

namespace TaskMasterPro.Infrastructure.Data;

public class TaskMasterDbContext : DbContext
{
    public TaskMasterDbContext(DbContextOptions<TaskMasterDbContext> options) : base(options)
    {
    }

    public DbSet<TaskEntity> Tasks { get; set; }
    public DbSet<User> Users { get; set; }
    public DbSet<TaskAttachment> Attachments { get; set; }
    public DbSet<TaskComment> Comments { get; set; }
    public DbSet<Notification> Notifications { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Task Entity Configuration
        modelBuilder.Entity<TaskEntity>(entity =>
        {
            entity.ToTable("Tasks");
            entity.HasKey(e => e.Id);
            
            entity.Property(e => e.Title)
                .IsRequired()
                .HasMaxLength(200);
            
            entity.Property(e => e.Description)
                .HasMaxLength(2000);
            
            entity.Property(e => e.Status)
                .IsRequired()
                .HasConversion<int>();
            
            entity.Property(e => e.Priority)
                .IsRequired()
                .HasConversion<int>();
            
            entity.HasOne(e => e.CreatedByUser)
                .WithMany(u => u.CreatedTasks)
                .HasForeignKey(e => e.CreatedByUserId)
                .OnDelete(DeleteBehavior.Restrict);
            
            entity.HasOne(e => e.AssignedToUser)
                .WithMany(u => u.AssignedTasks)
                .HasForeignKey(e => e.AssignedToUserId)
                .OnDelete(DeleteBehavior.SetNull);
            
            entity.HasIndex(e => e.Status);
            entity.HasIndex(e => e.DueDate);
            entity.HasIndex(e => e.CreatedByUserId);
            entity.HasIndex(e => e.AssignedToUserId);
        });

        // User Configuration
        modelBuilder.Entity<User>(entity =>
        {
            entity.ToTable("Users");
            entity.HasKey(e => e.Id);
            
            entity.Property(e => e.Email)
                .IsRequired()
                .HasMaxLength(255);
            
            entity.Property(e => e.PasswordHash)
                .IsRequired();
            
            entity.Property(e => e.FirstName)
                .IsRequired()
                .HasMaxLength(100);
            
            entity.Property(e => e.LastName)
                .IsRequired()
                .HasMaxLength(100);
            
            entity.HasIndex(e => e.Email)
                .IsUnique();
        });

        // TaskAttachment Configuration
        modelBuilder.Entity<TaskAttachment>(entity =>
        {
            entity.ToTable("TaskAttachments");
            entity.HasKey(e => e.Id);
            
            entity.Property(e => e.FileName)
                .IsRequired()
                .HasMaxLength(255);
            
            entity.Property(e => e.S3Key)
                .IsRequired()
                .HasMaxLength(500);
            
            entity.Property(e => e.ContentType)
                .IsRequired()
                .HasMaxLength(100);
            
            entity.Property(e => e.Status)
                .IsRequired()
                .HasConversion<int>();
            
            entity.HasOne(e => e.Task)
                .WithMany(t => t.Attachments)
                .HasForeignKey(e => e.TaskId)
                .OnDelete(DeleteBehavior.Cascade);
            
            entity.HasOne(e => e.UploadedByUser)
                .WithMany()
                .HasForeignKey(e => e.UploadedByUserId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // TaskComment Configuration
        modelBuilder.Entity<TaskComment>(entity =>
        {
            entity.ToTable("TaskComments");
            entity.HasKey(e => e.Id);
            
            entity.Property(e => e.Content)
                .IsRequired()
                .HasMaxLength(1000);
            
            entity.HasOne(e => e.Task)
                .WithMany(t => t.Comments)
                .HasForeignKey(e => e.TaskId)
                .OnDelete(DeleteBehavior.Cascade);
            
            entity.HasOne(e => e.User)
                .WithMany()
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // Notification Configuration
        modelBuilder.Entity<Notification>(entity =>
        {
            entity.ToTable("Notifications");
            entity.HasKey(e => e.Id);
            
            entity.Property(e => e.Title)
                .IsRequired()
                .HasMaxLength(200);
            
            entity.Property(e => e.Message)
                .IsRequired()
                .HasMaxLength(1000);
            
            entity.Property(e => e.Type)
                .IsRequired()
                .HasConversion<int>();
            
            entity.HasOne(e => e.User)
                .WithMany(u => u.Notifications)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);
            
            entity.HasIndex(e => new { e.UserId, e.IsRead });
        });
    }
}