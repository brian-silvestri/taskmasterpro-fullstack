using Amazon.S3;
using Amazon.S3.Model;
using TaskMasterPro.Domain.Interfaces;

namespace TaskMasterPro.Infrastructure.AwsServices;

public class S3Service : IS3Service
{
    private readonly IAmazonS3 _s3Client;
    private readonly string _bucketName;

    public S3Service(IAmazonS3 s3Client, string bucketName)
    {
        _s3Client = s3Client;
        _bucketName = bucketName;
    }

    public async Task<string> GeneratePresignedUploadUrlAsync(string key, string contentType, int expirationMinutes = 15)
    {
        var request = new GetPreSignedUrlRequest
        {
            BucketName = _bucketName,
            Key = key,
            Verb = HttpVerb.PUT,
            Expires = DateTime.UtcNow.AddMinutes(expirationMinutes),
            ContentType = contentType
        };

        return await Task.FromResult(_s3Client.GetPreSignedURL(request));
    }

    public async Task<string> GeneratePresignedDownloadUrlAsync(string key, int expirationMinutes = 60)
    {
        var request = new GetPreSignedUrlRequest
        {
            BucketName = _bucketName,
            Key = key,
            Verb = HttpVerb.GET,
            Expires = DateTime.UtcNow.AddMinutes(expirationMinutes)
        };

        return await Task.FromResult(_s3Client.GetPreSignedURL(request));
    }

    public async Task<bool> DeleteFileAsync(string key)
    {
        try
        {
            await _s3Client.DeleteObjectAsync(_bucketName, key);
            return true;
        }
        catch
        {
            return false;
        }
    }

    public async Task<long> GetFileSizeAsync(string key)
    {
        var metadata = await _s3Client.GetObjectMetadataAsync(_bucketName, key);
        return metadata.ContentLength;
    }

    public async Task<bool> FileExistsAsync(string key)
    {
        try
        {
            await _s3Client.GetObjectMetadataAsync(_bucketName, key);
            return true;
        }
        catch
        {
            return false;
        }
    }
}