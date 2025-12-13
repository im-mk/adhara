namespace Orders.Api.Entities;

public enum OrderStatusEnum
{
    Pending = 1,
    Processing = 2,
    Shipped = 3,
    Delivered = 4,
    Cancelled = 5,
    Returned = 6
}
