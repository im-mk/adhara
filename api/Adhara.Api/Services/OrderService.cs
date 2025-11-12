using Adhara.Api.Models;
using Adhara.Api.Repositories;
using Adhara.Api.Entities;
using Dapper;
using Adhara.Api.Mappers;

namespace Adhara.Api.Services;

public class OrderService : IOrderService
{
    private readonly IOrdersRepository _ordersRepository;
    private readonly IOrderLinesRepository _orderLinesRepository;

    private readonly System.Data.IDbConnection _dbConnection;

    public OrderService(
        System.Data.IDbConnection dbConnection,
        IOrdersRepository ordersRepository,
        IOrderLinesRepository orderLinesRepository)
    {
        _dbConnection = dbConnection;
        _ordersRepository = ordersRepository;
        _orderLinesRepository = orderLinesRepository;
    }

    public async Task<Order> CreateOrderAsync(CreateOrderRequest request)
    {
        var order = OrderMapper.FromCreate(request);

        using var tx = _dbConnection.BeginTransaction();
        try
        {
            var id = await _ordersRepository.Insert(order, tx);
            if (id <= 0)
            {
                tx.Rollback();
                throw new InvalidOperationException("Failed to insert order");
            }
            order.Id = id;

            foreach (var item in request.OrderLines)
            {
                var line = OrderLineMapper.FromItem(item, order.Id);

                var lineId = await _orderLinesRepository.Insert(line, tx);
                if (lineId <= 0)
                {
                    tx.Rollback();
                    throw new InvalidOperationException("Failed to insert order line");
                }
                line.Id = lineId;
            }

            tx.Commit();
            return order;
        }
        catch
        {
            try { tx.Rollback(); } catch { }
            throw;
        }
    }

    public async Task<bool> UpdateOrderAsync(int orderId, UpdateOrderRequest request)
    {
        // simple update: fetch, modify fields, save
        var existing = await _ordersRepository.Get(orderId);
        if (existing == null) return false;

        existing.OrderStatusId = request.OrderStatusId;
        existing.TotalAmount = request.TotalAmount;

        var rows = await _ordersRepository.Update(existing);
        return rows == 1;
    }

    public Task<Order?> GetOrderAsync(int orderId)
    {
        return _ordersRepository.Get(orderId);
    }

    public async Task<IEnumerable<Order>> GetAllOrdersAsync(DateOnly? startDate, DateOnly? endDate)
    {
        return await _ordersRepository.GetAll(startDate, endDate);
    }

    public async Task<bool> DeleteOrderAsync(int orderId)
    {
        // Use repository delete; wrap in transaction if you need cascading deletes
        var rows = await _ordersRepository.Delete(orderId);
        return rows == 1;
    }
}
