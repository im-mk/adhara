namespace Adhara.Api.Entities;

public class OrderCreatedEvent
{
    public int OrderId { get; set; }
    public DateTime CreatedAt { get; set; }
    public required string CustomerName { get; set; }
    public required decimal TotalAmount { get; set; }
    public IEnumerable<OrderLineCreatedEvent> Lines { get; set; } = [];
}

public class OrderLineCreatedEvent
{
    public int OrderLineId { get; set; }
    public int Quantity { get; set; }
    public decimal LineTotal { get; set; }
    public string ProductName { get; set; } = "";
}