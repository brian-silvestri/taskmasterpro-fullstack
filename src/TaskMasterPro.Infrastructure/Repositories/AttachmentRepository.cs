using Microsoft.EntityFrameworkCore;
using TaskMasterPro.Domain.Entities;
using TaskMasterPro.Domain.Interfaces;
using TaskMasterPro.Infrastructure.Data;

namespace TaskMasterPro.Infrastructure.Repositories;

public class AttachmentRepository : IAttachmentRepository
{
    private readonly TaskMasterDbContext _context;

    public AttachmentRepository(TaskMasterDbContext context)
    {
        _context = context;
    }

    public async Task<TaskAttachment?> GetByIdAsync(Guid id)
    {
        return await _context.Attachments
            .Include(a => a.Task)
            .Include(a => a.UploadedByUser)
            .FirstOrDefaultAsync(a => a.Id == id);
    }

    public async Task<List<TaskAttachment>> GetByTaskIdAsync(Guid taskId)
    {
        return await _context.Attachments
            .Include(a => a.UploadedByUser)
            .Where(a => a.TaskId == taskId)
            .OrderByDescending(a => a.UploadedAt)
            .ToListAsync();
    }

    public async Task<TaskAttachment> CreateAsync(TaskAttachment attachment)
    {
        attachment.Id = Guid.NewGuid();
        attachment.UploadedAt = DateTime.UtcNow;
        _context.Attachments.Add(attachment);
        await _context.SaveChangesAsync();
        return attachment;
    }

    public async Task<TaskAttachment> UpdateAsync(TaskAttachment attachment)
    {
        _context.Attachments.Update(attachment);
        await _context.SaveChangesAsync();
        return attachment;
    }

    public async Task DeleteAsync(Guid id)
    {
        var attachment = await _context.Attachments.FindAsync(id);
        if (attachment != null)
        {
            _context.Attachments.Remove(attachment);
            await _context.SaveChangesAsync();
        }
    }
}