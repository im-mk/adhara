using System.Text.Json;
using Adhara.Api.Entities;
using Adhara.Api.Mappers;
using Adhara.Api.Models;
using Adhara.Api.Repositories;

namespace Adhara.Api.Services;

public class OrderService : IOrderService
{
    private readonly IOrdersRepository _ordersRepository;
    private readonly IOrderLinesRepository _orderLinesRepository;
    private readonly IOutboxRepository _outboxRepository;
    private readonly ICustomersRepository _customersRepository;
    private readonly System.Data.IDbConnection _dbConnection;
    private readonly IProductRepository _productRepository;

    public OrderService(
        System.Data.IDbConnection dbConnection,
        IOrdersRepository ordersRepository,
        IOrderLinesRepository orderLinesRepository,
        ICustomersRepository customersRepository,
        IOutboxRepository outboxRepository,
        IProductRepository productRepository)
    {
        _dbConnection = dbConnection;
        _ordersRepository = ordersRepository;
        _orderLinesRepository = orderLinesRepository;
        _customersRepository = customersRepository;
        _productRepository = productRepository;
        _outboxRepository = outboxRepository;
    }

    public async Task<OrderCreatedResponse> CreateOrder(CreateOrderRequest request)
    {
        var customer = await _customersRepository.Get(request.CustomerId)
            ?? throw new ArgumentException("Invalid customer ID", nameof(request.CustomerId));

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

            var outboxResult = await InsertOutboxEvent(customer, order, tx, orderLines, productsMap.Values.ToList());
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

        var customer = await _customersRepository.Get(order.CustomerId)
            ?? throw new InvalidOperationException($"Customer not found: {order.CustomerId}");

        var orderLines = (await _orderLinesRepository.GetByOrderId(orderId)).ToList();

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

        return await MapToOrderDetailsResponse(order, customer, orderLines, productsMap.Values.ToList());
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

    public async Task<IEnumerable<OrderListResponse>> GetList(DateOnly? startDate, DateOnly? endDate)
    {
        var orders = await _ordersRepository.GetList(startDate, endDate);
        return orders.Select(MapToOrderListResponse);
    }

    public async Task<bool> DeleteOrder(int orderId)
    {
        var rows = await _ordersRepository.Delete(orderId);
        return rows == 1;
    }

    private async Task<OrderDetailsResponse> MapToOrderDetailsResponse(Order order, Customer customer, List<OrderLine> orderLines, List<Product> products)
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
            CustomerName = customer != null ? $"{customer.FirstName} {customer.LastName}" : null,
            OrderLines = detailLines
        };
    }

    private async Task<int> InsertOutboxEvent(Customer customer, Order order, System.Data.IDbTransaction tx, List<OrderLine> orderLines, IEnumerable<Product> products)
    {
        var orderLineEvents = await MapOrderLines(orderLines, products);

        var orderCreatedEvent = new OrderCreatedEvent
        {
            OrderId = order.Id,
            CreatedAt = DateTime.UtcNow,
            CustomerName = $"{customer.FirstName} {customer.LastName}",
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
            TotalAmount = order.TotalAmount
        };
    }

    private static OrderCreatedResponse MapToOrderCreatedResponse(Order order)
    {
        return new OrderCreatedResponse(orderId: order.Id, orderNumber: order.OrderNumber);
    }
}