namespace Adhara.Api.Models;

public class CreateOrderRequest
{
    public string OrderNumber { get; set; } = default!;
    public DateTime OrderDate { get; set; }
    public int OrderStatusId { get; set; }
    public decimal TotalAmount { get; set; }
    public int CustomerId { get; set; }
    public List<OrderItem> OrderLines { get; set; } = new List<OrderItem>();
}

public class OrderItem
{
    public int ProductId { get; set; }
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
}
