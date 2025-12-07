using Microsoft.EntityFrameworkCore;
using TaskMasterPro.Domain.Entities;
using TaskMasterPro.Domain.Enums;
using TaskMasterPro.Domain.Interfaces;
using TaskMasterPro.Infrastructure.Data;

namespace TaskMasterPro.Infrastructure.Repositories;

public class TaskRepository : ITaskRepository
{
    private readonly TaskMasterDbContext _context;

    public TaskRepository(TaskMasterDbContext context)
    {
        _context = context;
    }

    public async Task<TaskEntity?> GetByIdAsync(Guid id)
    {
        return await _context.Tasks
            .Include(t => t.Attachments)
            .Include(t => t.Comments)
            .Include(t => t.AssignedToUser)
            .Include(t => t.CreatedByUser)
            .FirstOrDefaultAsync(t => t.Id == id);
    }

    public async Task<List<TaskEntity>> GetAllAsync(int page = 1, int pageSize = 20)
    {
        return await _context.Tasks
            .Include(t => t.AssignedToUser)
            .Include(t => t.CreatedByUser)
            .OrderByDescending(t => t.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
    }

    public async Task<List<TaskEntity>> GetByUserIdAsync(Guid userId)
    {
        return await _context.Tasks
            .Include(t => t.AssignedToUser)
            .Include(t => t.CreatedByUser)
            .Where(t => t.AssignedToUserId == userId || t.CreatedByUserId == userId)
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync();
    }

    public async Task<List<TaskEntity>> GetByStatusAsync(Domain.Enums.TaskStatus status)
    {
        return await _context.Tasks
            .Include(t => t.AssignedToUser)
            .Include(t => t.CreatedByUser)
            .Where(t => t.Status == status)
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync();
    }

    public async Task<TaskEntity> CreateAsync(TaskEntity task)
    {
        task.Id = Guid.NewGuid();
        task.CreatedAt = DateTime.UtcNow;
        _context.Tasks.Add(task);
        await _context.SaveChangesAsync();
        return task;
    }

    public async Task<TaskEntity> UpdateAsync(TaskEntity task)
    {
        _context.Tasks.Update(task);
        await _context.SaveChangesAsync();
        return task;
    }

    public async Task DeleteAsync(Guid id)
    {
        var task = await _context.Tasks.FindAsync(id);
        if (task != null)
        {
            _context.Tasks.Remove(task);
            await _context.SaveChangesAsync();
        }
    }

    public async Task<int> GetTotalCountAsync()
    {
        return await _context.Tasks.CountAsync();
    }
}