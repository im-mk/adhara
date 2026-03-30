using Orders.Api.Entities;
namespace Orders.Api.Models;

public class OrderDetailsResponse
{
    public Order Order { get; set; } = default!;
    public string? CustomerName { get; set; }
    public List<OrderLineDetails> OrderLines { get; set; } = new List<OrderLineDetails>();
}

public class OrderLineDetails
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public string ProductName { get; set; } = default!;
    public int Quantity { get; set; }
    public decimal Price { get; set; }
    public decimal Total { get; set; }
}
