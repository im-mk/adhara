import type { Product } from '../models/products/Product';
import { requestWithAuth } from './httpClient';

export class ProductsService {
    public static getAllProducts(): Promise<Array<Product>> {
        return requestWithAuth<Array<Product>>('/Products');
    }
}
