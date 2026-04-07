using Orders.Api.Entities;
using Dapper;
using ZiggyCreatures.Caching.Fusion;

namespace Orders.Api.Repositories;

public class OrderStatusesRepository(
    System.Data.IDbConnection dbConnection,
    IFusionCache fusionCache) : IOrderStatusesRepository
{
    public async Task<IEnumerable<OrderStatus>> GetAllAsync()
    {
        const string cacheKey = "order_statuses:all";

        return await fusionCache.GetOrSetAsync(
            cacheKey,
            async _ => await LoadFromDatabaseAsync(),
            TimeSpan.FromDays(1)
        );
    }

    private async Task<List<OrderStatus>> LoadFromDatabaseAsync()
    {
        const string sql = @"SELECT id AS Id, status_name AS StatusName, status_description AS StatusDescription FROM public.order_statuses ORDER BY id";
        var rows = await dbConnection.QueryAsync<OrderStatus>(sql);
        return rows.ToList();
    }
}
