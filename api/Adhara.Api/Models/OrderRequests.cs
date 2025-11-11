namespace Adhara.Api.Models;

public class CreateOrderRequest
{

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
