using System.Text.Json;
using Amazon.SimpleNotificationService;
using Amazon.SimpleNotificationService.Model;
using TaskMasterPro.Domain.Interfaces;

namespace TaskMasterPro.Infrastructure.AwsServices;

public class SnsService : ISnsService
{
    private readonly IAmazonSimpleNotificationService _snsClient;

    public SnsService(IAmazonSimpleNotificationService snsClient)
    {
        _snsClient = snsClient;
    }

    public async Task PublishAsync(string topicArn, string message, string subject = "")
    {
        var request = new PublishRequest
        {
            TopicArn = topicArn,
            Message = message,
            Subject = string.IsNullOrEmpty(subject) ? "Notification" : subject
        };

        await _snsClient.PublishAsync(request);
    }

    public async Task PublishAsync<T>(string topicArn, T message, string subject = "") where T : class
    {
        var messageBody = JsonSerializer.Serialize(message);
        await PublishAsync(topicArn, messageBody, subject);
    }
}