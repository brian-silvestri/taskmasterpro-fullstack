using System.Text.Json;
using Amazon.SQS;
using Amazon.SQS.Model;
using TaskMasterPro.Domain.Interfaces;

namespace TaskMasterPro.Infrastructure.AwsServices;

public class SqsService : ISqsService
{
    private readonly IAmazonSQS _sqsClient;

    public SqsService(IAmazonSQS sqsClient)
    {
        _sqsClient = sqsClient;
    }

    public async Task SendMessageAsync(string queueUrl, object message)
    {
        var messageBody = JsonSerializer.Serialize(message);
        
        var request = new SendMessageRequest
        {
            QueueUrl = queueUrl,
            MessageBody = messageBody
        };

        await _sqsClient.SendMessageAsync(request);
    }

    public async Task<List<T>> ReceiveMessagesAsync<T>(string queueUrl, int maxMessages = 10)
    {
        var request = new ReceiveMessageRequest
        {
            QueueUrl = queueUrl,
            MaxNumberOfMessages = maxMessages,
            WaitTimeSeconds = 5
        };

        var response = await _sqsClient.ReceiveMessageAsync(request);
        
        return response.Messages
            .Select(m => JsonSerializer.Deserialize<T>(m.Body))
            .Where(m => m != null)
            .Cast<T>()
            .ToList();
    }

    public async Task DeleteMessageAsync(string queueUrl, string receiptHandle)
    {
        await _sqsClient.DeleteMessageAsync(queueUrl, receiptHandle);
    }
}