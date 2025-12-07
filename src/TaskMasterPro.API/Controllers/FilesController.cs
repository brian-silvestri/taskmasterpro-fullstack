using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TaskMasterPro.API.Models.Responses;
using TaskMasterPro.Domain.Interfaces;

namespace TaskMasterPro.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class FilesController : ControllerBase
{
    private readonly IS3Service _s3Service;
    private readonly ILogger<FilesController> _logger;

    public FilesController(IS3Service s3Service, ILogger<FilesController> logger)
    {
        _s3Service = s3Service;
        _logger = logger;
    }

    [HttpPost("upload-url")]
    public async Task<ActionResult<ApiResponse<string>>> GetUploadUrl([FromQuery] string fileName, [FromQuery] string contentType)
    {
        try
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(ApiResponse<string>.ErrorResponse("User not authenticated"));
            }

            var key = $"uploads/{userId}/{Guid.NewGuid()}-{fileName}";
            var url = await _s3Service.GeneratePresignedUploadUrlAsync(key, contentType);

            return Ok(ApiResponse<string>.SuccessResponse(url, "Upload URL generated"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating upload URL");
            return BadRequest(ApiResponse<string>.ErrorResponse(ex.Message));
        }
    }

    [HttpGet("download-url")]
    public async Task<ActionResult<ApiResponse<string>>> GetDownloadUrl([FromQuery] string key)
    {
        try
        {
            var url = await _s3Service.GeneratePresignedDownloadUrlAsync(key);
            return Ok(ApiResponse<string>.SuccessResponse(url, "Download URL generated"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating download URL");
            return BadRequest(ApiResponse<string>.ErrorResponse(ex.Message));
        }
    }

    [HttpDelete("{key}")]
    public async Task<ActionResult<ApiResponse<bool>>> DeleteFile(string key)
    {
        try
        {
            var result = await _s3Service.DeleteFileAsync(key);
            return Ok(ApiResponse<bool>.SuccessResponse(result, "File deleted"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting file");
            return BadRequest(ApiResponse<bool>.ErrorResponse(ex.Message));
        }
    }
}