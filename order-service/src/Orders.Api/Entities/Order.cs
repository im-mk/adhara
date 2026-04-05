namespace Orders.Api.Entities;

public class Order
{
    public int Id { get; set; }
    public string OrderNumber { get; set; } = default!;
    public DateTime OrderDate { get; set; }
    public int OrderStatusId { get; set; }
    public decimal TotalAmount { get; set; }
    public int CustomerId { get; set; }
    public string CustomerName { get; set; } = default!;
    public int ShippingAddressId { get; set; }
    public int BillingAddressId { get; set; }
}
