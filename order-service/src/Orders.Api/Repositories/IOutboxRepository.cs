using System.Data;
using Orders.Api.Entities;

namespace Orders.Api.Repositories;

public interface IOutboxRepository
{
    Task<IEnumerable<OutboxEvent>> GetPendingAsync(int batchSize = 50);
    Task<int> InsertAsync(OutboxEvent evt, IDbTransaction? tx = null);
    Task<int> MarkProcessedAsync(int id);
}
