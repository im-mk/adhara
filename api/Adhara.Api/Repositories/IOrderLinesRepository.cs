using Adhara.Api.Entities;

namespace Adhara.Api.Repositories;

public interface IOrderLinesRepository
{
    Task<int> Insert(OrderLine orderLine, System.Data.IDbTransaction? transaction = null);
}
