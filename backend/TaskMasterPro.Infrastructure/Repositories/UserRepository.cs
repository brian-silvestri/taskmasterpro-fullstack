using Microsoft.EntityFrameworkCore;
using TaskMasterPro.Domain.Entities;
using TaskMasterPro.Domain.Interfaces;
using TaskMasterPro.Infrastructure.Data;

namespace TaskMasterPro.Infrastructure.Repositories;

public class UserRepository : IUserRepository
{
    private readonly TaskMasterDbContext _context;

    public UserRepository(TaskMasterDbContext context)
    {
        _context = context;
    }

    public async Task<User?> GetByIdAsync(Guid id)
    {
        return await _context.Users.FindAsync(id);
    }

    public async Task<User?> GetByEmailAsync(string email)
    {
        return await _context.Users
            .FirstOrDefaultAsync(u => u.Email.ToLower() == email.ToLower());
    }

    public async Task<User> CreateAsync(User user)
    {
        user.Id = Guid.NewGuid();
        user.CreatedAt = DateTime.UtcNow;
        _context.Users.Add(user);
        await _context.SaveChangesAsync();
        return user;
    }

    public async Task<User> UpdateAsync(User user)
    {
        _context.Users.Update(user);
        await _context.SaveChangesAsync();
        return user;
    }

    public async Task<List<User>> GetAllAsync()
    {
        return await _context.Users
            .Where(u => u.IsActive)
            .ToListAsync();
    }
}