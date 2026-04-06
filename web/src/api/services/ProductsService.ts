import type { Product } from '../models/products/Product';
import { requestWithAuth } from './httpClient';

export class ProductsService {
    public static getAllProducts(name?: string): Promise<Array<Product>> {
        const trimmedName = name?.trim();

        return requestWithAuth<Array<Product>>('/Products', {
            query: {
                name: trimmedName && trimmedName.length > 0 ? trimmedName : undefined,
            },
        });
    }
}
