namespace TaskMasterPro.Domain.Interfaces;

public interface IS3Service
{
    Task<string> GeneratePresignedUploadUrlAsync(string key, string contentType, int expirationMinutes = 15);
    Task<string> GeneratePresignedDownloadUrlAsync(string key, int expirationMinutes = 60);
    Task<bool> DeleteFileAsync(string key);
    Task<long> GetFileSizeAsync(string key);
    Task<bool> FileExistsAsync(string key);
}

public interface ISqsService
{
    Task SendMessageAsync(string queueUrl, object message);
    Task<List<T>> ReceiveMessagesAsync<T>(string queueUrl, int maxMessages = 10);
    Task DeleteMessageAsync(string queueUrl, string receiptHandle);
}

public interface ISnsService
{
    Task PublishAsync(string topicArn, string message, string subject = "");
    Task PublishAsync<T>(string topicArn, T message, string subject = "") where T : class;
}

public interface ICloudWatchService
{
    Task LogInfoAsync(string message, Dictionary<string, object>? properties = null);
    Task LogErrorAsync(string message, Exception? exception = null, Dictionary<string, object>? properties = null);
    Task PublishMetricAsync(string metricName, double value, string unit = "Count");
}