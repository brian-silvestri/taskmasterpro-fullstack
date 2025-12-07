using System.ComponentModel.DataAnnotations;

namespace TaskMasterPro.API.Models.Requests;

public class RegisterRequest
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    [StringLength(100, MinimumLength = 6)]
    public string Password { get; set; } = string.Empty;

  
  [Required]
  [StringLength(120, MinimumLength = 2)]
  public string FullName { get; set; } = string.Empty;
}
