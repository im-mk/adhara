using System.Data;
using Orders.Api.Entities;
using Dapper;

namespace Orders.Api.Repositories;

public class OutboxRepository : IOutboxRepository
{
    private readonly IDbConnection _db;

    public OutboxRepository(IDbConnection db) => _db = db;

    public async Task<int> InsertAsync(OutboxEvent evt, IDbTransaction? tx = null)
    {
        var sql = @"INSERT INTO outbox_events(aggregate_type, aggregate_id, event_type, payload, occurred_at)
                VALUES(@AggregateType, @AggregateId, @EventType, @Payload::jsonb, @OccurredAt)
                RETURNING id;";

        return await _db.QuerySingleAsync<int>(sql, evt, tx);
    }

    public async Task<IEnumerable<OutboxEvent>> GetPendingAsync(int batchSize = 50)
    {
        var sql = @"SELECT * FROM outbox_events
                    WHERE processed_at IS NULL
                    ORDER BY occurred_at
                    LIMIT @BatchSize";
        return await _db.QueryAsync<OutboxEvent>(sql, new { BatchSize = batchSize });
    }

    public async Task<int> MarkProcessedAsync(int id)
    {
        var sql = @"UPDATE outbox_events SET processed_at = now() WHERE id = @Id";
        return await _db.ExecuteAsync(sql, new { Id = id });
    }
}