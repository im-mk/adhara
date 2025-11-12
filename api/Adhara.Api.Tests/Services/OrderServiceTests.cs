using Moq;
using Adhara.Api.Services;
using Adhara.Api.Repositories;
using Adhara.Api.Models;
using Adhara.Api.Entities;

namespace Adhara.Api.Tests.Services;

public class OrderServiceTests
{
    private readonly Mock<System.Data.IDbConnection> _mockConn;
    private readonly Mock<IOrdersRepository> _mockOrders;
    private readonly Mock<IOrderLinesRepository> _mockLines;
    private readonly OrderService _service;

    public OrderServiceTests()
    {
        _mockConn = new Mock<System.Data.IDbConnection>();
        _mockOrders = new Mock<IOrdersRepository>();
        _mockLines = new Mock<IOrderLinesRepository>();

        _service = new OrderService(_mockConn.Object, _mockOrders.Object, _mockLines.Object);
    }

    [Fact]
    public async Task CreateOrderAsync_InsertsOrderAndLinesAndCommits()
    {
        var tx = new Mock<System.Data.IDbTransaction>();
        _mockConn.Setup(c => c.BeginTransaction()).Returns(tx.Object);

        var req = new CreateOrderRequest { TotalAmount = 100m, CustomerId = 1, OrderLines = new List<OrderItem> { new OrderItem { ProductId = 2, Quantity = 1, UnitPrice = 100m } } };

        _mockOrders.Setup(r => r.Insert(It.IsAny<Order>(), tx.Object)).ReturnsAsync(42);
        _mockLines.Setup(r => r.Insert(It.IsAny<OrderLine>(), tx.Object)).ReturnsAsync(100);

        var created = await _service.CreateOrderAsync(req);

        Assert.Equal(42, created.Id);
        _mockOrders.Verify(r => r.Insert(It.IsAny<Order>(), tx.Object), Times.Once);
        _mockLines.Verify(r => r.Insert(It.IsAny<OrderLine>(), tx.Object), Times.Once);
        tx.Verify(t => t.Commit(), Times.Once);
    }
}
