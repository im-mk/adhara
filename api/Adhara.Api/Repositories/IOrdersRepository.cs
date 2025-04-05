namespace Adhara.Api.Repositories;

public interface IOrdersRepository
{
    Task<string?> Get(int orderId);
    Task<IEnumerable<string>> GetAll(DateOnly orderDate);
}