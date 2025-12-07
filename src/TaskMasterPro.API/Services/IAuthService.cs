using TaskMasterPro.API.Models.Requests;
using TaskMasterPro.API.Models.Responses;

namespace TaskMasterPro.API.Services;

public interface IAuthService
{
    Task<AuthResponse> RegisterAsync(RegisterRequest request);
    Task<AuthResponse> LoginAsync(LoginRequest request);
    Task<UserResponse?> GetCurrentUserAsync(Guid userId);
}