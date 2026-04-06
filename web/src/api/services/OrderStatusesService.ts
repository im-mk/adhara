import type { OrderStatus } from '../models/order/OrderStatus';
import { requestWithAuth } from './httpClient';

export class OrderStatusesService {
    public static getAll(): Promise<Array<OrderStatus>> {
        return requestWithAuth<Array<OrderStatus>>('/OrderStatuses');
    }
}
