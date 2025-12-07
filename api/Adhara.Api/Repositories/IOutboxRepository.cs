using System.Data;
using Adhara.Api.Entities;

namespace Adhara.Api.Repositories;

public interface IOutboxRepository
{
    Task<IEnumerable<OutboxEvent>> GetPendingAsync(int batchSize = 50);
    Task<int> InsertAsync(OutboxEvent evt, IDbTransaction? tx = null);
    Task<int> MarkProcessedAsync(int id);
}
