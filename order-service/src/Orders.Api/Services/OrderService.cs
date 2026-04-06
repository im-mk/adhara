using System.Text.Json;
using Orders.Api.Entities;
using Orders.Api.Mappers;
using Orders.Api.Models;
using Orders.Api.Repositories;

namespace Orders.Api.Services;

public class OrderService : IOrderService
{
    private readonly IOrdersRepository _ordersRepository;
    private readonly IOrderLinesRepository _orderLinesRepository;
    private readonly IOutboxRepository _outboxRepository;
    private readonly IAddressesRepository _addressesRepository;
    private readonly System.Data.IDbConnection _dbConnection;
    private readonly IProductRepository _productRepository;

    public OrderService(
        System.Data.IDbConnection dbConnection,
        IOrdersRepository ordersRepository,
        IOrderLinesRepository orderLinesRepository,
        IOutboxRepository outboxRepository,
        IProductRepository productRepository,
        IAddressesRepository addressesRepository)
    {
        _dbConnection = dbConnection;
        _ordersRepository = ordersRepository;
        _orderLinesRepository = orderLinesRepository;
        _productRepository = productRepository;
        _outboxRepository = outboxRepository;
        _addressesRepository = addressesRepository;
    }

    public async Task<OrderCreatedResponse> CreateOrder(CreateOrderRequest request)
    {
        var productIds = request.OrderLines.Select(ol => ol.ProductId).ToList();
        var productsMap = new Dictionary<int, Product>();
        foreach (var productId in productIds)
        {
            var product = await _productRepository.Get(productId)
                ?? throw new ArgumentException($"Invalid product ID: {productId}", nameof(request.OrderLines));
            productsMap[productId] = product;
        }

        var order = OrderMapper.FromCreate(request);

        using var tx = _dbConnection.BeginTransaction();
        try
        {
            var shippingAddressId = await _addressesRepository.Insert(
                AddressMapper.FromRequest(request.ShippingAddress), tx);

            var billingAddressId = await _addressesRepository.Insert(
                AddressMapper.FromRequest(request.BillingAddress), tx);

            order.ShippingAddressId = shippingAddressId;
            order.BillingAddressId = billingAddressId;

            var id = await _ordersRepository.Insert(order, tx);
            if (id <= 0)
                throw new InvalidOperationException("Failed to insert order");

            order.Id = id;

            var orderLines = new List<OrderLine>();
            foreach (var item in request.OrderLines)
            {
                var line = OrderLineMapper.FromItem(item, order.Id, productsMap[item.ProductId]);

                var lineId = await _orderLinesRepository.Insert(line, tx);
                if (lineId <= 0)
                    throw new InvalidOperationException("Failed to insert order line");

                line.Id = lineId;
                orderLines.Add(line);
            }

            var outboxResult = await InsertOutboxEvent(request.CustomerName, order, tx, orderLines, productsMap.Values.ToList());
            if (outboxResult < 1)
                throw new InvalidOperationException("Failed to insert outbox event");

            tx.Commit();

            return MapToOrderCreatedResponse(order);
        }
        catch
        {
            tx.Rollback();
            throw;
        }
    }

    public async Task<OrderDetailsResponse?> GetOrder(int orderId)
    {
        var order = await _ordersRepository.Get(orderId);
        if (order == null) return null;

        var orderLines = (await _orderLinesRepository.GetByOrderId(orderId)).ToList();
        var billingAddress = await _addressesRepository.Get(order.BillingAddressId);
        var shippingAddress = await _addressesRepository.Get(order.ShippingAddressId);

        var productsMap = new Dictionary<int, Product>();
        foreach (var line in orderLines)
        {
            if (!productsMap.ContainsKey(line.ProductId))
            {
                var product = await _productRepository.Get(line.ProductId)
                    ?? throw new InvalidOperationException($"Product not found: {line.ProductId}");
                productsMap[line.ProductId] = product;
            }
        }

        return MapToOrderDetailsResponse(order, orderLines, productsMap.Values.ToList(), billingAddress, shippingAddress);
    }

    public async Task<bool> UpdateOrder(int orderId, UpdateOrderRequest request)
    {
        var existing = await _ordersRepository.Get(orderId);
        if (existing == null)
            return false;

        existing.OrderStatusId = request.OrderStatusId;
        existing.TotalAmount = request.TotalAmount;

        var rows = await _ordersRepository.Update(existing);
        return rows == 1;
    }

    public async Task<IEnumerable<OrderListResponse>> GetList(DateOnly? startDate, DateOnly? endDate, int? customerId = null, string? orderNumber = null, int? orderStatusId = null)
    {
        var orders = await _ordersRepository.GetList(startDate, endDate, customerId, orderNumber, orderStatusId);
        return orders.Select(MapToOrderListResponse);
    }

    public async Task<(IReadOnlyCollection<OrderListResponse> Orders, int TotalCount)> GetListPaged(DateOnly? startDate, DateOnly? endDate, int page, int pageSize, int? customerId = null, string? orderNumber = null, int? orderStatusId = null)
    {
        var (orders, totalCount) = await _ordersRepository.GetListPaged(startDate, endDate, page, pageSize, customerId, orderNumber, orderStatusId);
        var mapped = orders.Select(MapToOrderListResponse).ToArray();
        return (mapped, totalCount);
    }

    public async Task<bool> DeleteOrder(int orderId)
    {
        var rows = await _ordersRepository.Delete(orderId);
        return rows == 1;
    }

    private static OrderDetailsResponse MapToOrderDetailsResponse(Order order, List<OrderLine> orderLines, List<Product> products, Address? billingAddress, Address? shippingAddress)
    {
        var detailLines = orderLines.Select(l =>
        {
            var product = products.First(p => p.Id == l.ProductId);
            return new OrderLineDetails
            {
                Id = l.Id,
                ProductId = l.ProductId,
                ProductName = product.ProductName,
                Quantity = l.Quantity,
                Price = l.Price,
                Total = l.Total
            };
        }).ToList();

        return new OrderDetailsResponse
        {
            Order = order,
            CustomerName = order.CustomerName,
            BillingAddress = billingAddress,
            ShippingAddress = shippingAddress,
            OrderLines = detailLines
        };
    }

    private async Task<int> InsertOutboxEvent(string customerName, Order order, System.Data.IDbTransaction tx, List<OrderLine> orderLines, IEnumerable<Product> products)
    {
        var orderLineEvents = await MapOrderLines(orderLines, products);

        var orderCreatedEvent = new OrderCreatedEvent
        {
            OrderId = order.Id,
            CreatedAt = DateTime.UtcNow,
            CustomerName = customerName,
            TotalAmount = order.TotalAmount,
            Lines = orderLineEvents
        };

        var outboxEntry = new OutboxEvent
        {
            AggregateType = nameof(Order),
            AggregateId = order.Id.ToString(),
            EventType = nameof(OrderCreatedEvent),
            Payload = JsonSerializer.Serialize(orderCreatedEvent),
            OccurredAt = DateTime.UtcNow
        };

        return await _outboxRepository.InsertAsync(outboxEntry, tx);
    }

    private async Task<List<OrderLineCreatedEvent>> MapOrderLines(IEnumerable<OrderLine> orderLines, IEnumerable<Product> products)
    {
        var results = new List<OrderLineCreatedEvent>();

        foreach (var line in orderLines)
            results.Add(await MapOrderLineToEvent(line, products.First(p => p.Id == line.ProductId)));

        return results;
    }

    private async Task<OrderLineCreatedEvent> MapOrderLineToEvent(OrderLine line, Product product)
    {
        return new OrderLineCreatedEvent
        {
            OrderLineId = line.Id,
            Quantity = line.Quantity,
            LineTotal = line.LineTotal,
            ProductName = product.ProductName
        };
    }

    private OrderListResponse MapToOrderListResponse(OrderList order)
    {
        return new OrderListResponse
        {
            Id = order.Id,
            OrderNumber = order.OrderNumber,
            OrderDate = order.OrderDate,
            OrderStatusId = order.OrderStatusId,
            TotalAmount = order.TotalAmount,
            CustomerId = order.CustomerId
        };
    }

    private static OrderCreatedResponse MapToOrderCreatedResponse(Order order)
    {
        return new OrderCreatedResponse(orderId: order.Id, orderNumber: order.OrderNumber);
    }
}
