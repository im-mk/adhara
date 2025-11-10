using Dapper.FluentMap.Mapping;

namespace Adhara.Api.Entities.Mappings;

public class ProductMap : EntityMap<Product>
{
    public ProductMap()
    {
        Map(p => p.Id).ToColumn("id");
        Map(p => p.ProductName).ToColumn("product_name");
        Map(p => p.ProductDescription).ToColumn("product_description");
    }
}
