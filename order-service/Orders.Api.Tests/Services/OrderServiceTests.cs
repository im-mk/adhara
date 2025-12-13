using Orders.Api.Entities;
using Orders.Api.Models;
using Orders.Api.Repositories;
using Orders.Api.Services;
using Moq;

namespace Orders.Api.Tests.Services;

public class OrderServiceTests
{
    private readonly Mock<System.Data.IDbConnection> _mockConn;
    private readonly Mock<IOrdersRepository> _mockOrders;
    private readonly Mock<IOrderLinesRepository> _mockLines;
    private readonly Mock<ICustomersRepository> _mockCustomers;
    private readonly Mock<IOutboxRepository> _mockOutbox;
    private readonly Mock<IProductRepository> _mockProducts;
    private readonly OrderService _service;

    public OrderServiceTests()
    {
        _mockConn = new Mock<System.Data.IDbConnection>();
        _mockOrders = new Mock<IOrdersRepository>();
        _mockLines = new Mock<IOrderLinesRepository>();
        _mockCustomers = new Mock<ICustomersRepository>();
        _mockOutbox = new Mock<IOutboxRepository>();
        _mockProducts = new Mock<IProductRepository>();
        _mockLines = new Mock<IOrderLinesRepository>();
        _service = new OrderService(_mockConn.Object, _mockOrders.Object, _mockLines.Object, _mockCustomers.Object, _mockOutbox.Object, _mockProducts.Object);
    }

    [Fact]
    public async Task CreateOrder_InsertsOrderAndLinesAndCommits()
    {
        var tx = new Mock<System.Data.IDbTransaction>();
        tx.Setup(t => t.Commit()).Verifiable();
        tx.Setup(t => t.Rollback()).Verifiable();
        _mockConn.Setup(c => c.BeginTransaction()).Returns(tx.Object);

        var req = new CreateOrderRequest { TotalAmount = 100m, CustomerId = 1, OrderLines = new List<OrderItem> { new OrderItem { ProductId = 2, Quantity = 1 } } };

        // Mock customer validation
        _mockCustomers.Setup(r => r.Get(It.IsAny<int>())).ReturnsAsync(new Customer { Id = 1, FirstName = "John", LastName = "Doe" });

        // Mock product validation
        _mockProducts.Setup(r => r.Get(It.IsAny<int>())).ReturnsAsync(new Product { Id = 2, ProductName = "Test Product", ProductDescription = "Test Description", UnitPrice = 100m });

        _mockOrders.Setup(r => r.Insert(It.IsAny<Order>(), tx.Object)).ReturnsAsync(42);
        _mockLines.Setup(r => r.Insert(It.IsAny<OrderLine>(), tx.Object)).ReturnsAsync(100);
        _mockOutbox.Setup(r => r.InsertAsync(It.IsAny<OutboxEvent>(), tx.Object)).ReturnsAsync(2);

        var created = await _service.CreateOrder(req);

        Assert.Equal(42, created.OrderId);
        _mockOrders.Verify(r => r.Insert(It.IsAny<Order>(), tx.Object), Times.Once);
        _mockLines.Verify(r => r.Insert(It.IsAny<OrderLine>(), tx.Object), Times.Once);
        tx.Verify(t => t.Commit(), Times.Once);
    }
}
