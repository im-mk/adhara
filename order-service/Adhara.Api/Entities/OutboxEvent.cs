namespace Adhara.Api.Entities;

public class OutboxEvent
{
    public long Id { get; set; }    
    public string AggregateType { get; set; } = default!;
    public string AggregateId { get; set; } = default!;
    public string EventType { get; set; } = default!;
    public string Payload { get; set; } = default!;
    public DateTime OccurredAt { get; set; } = DateTime.UtcNow;
    public DateTime? ProcessedAt { get; set; }
}
