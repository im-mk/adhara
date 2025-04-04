namespace Adhara.Api.Repositories;

public interface IOrdersRepository
{
    Task<string?> Get(int orderId);
}