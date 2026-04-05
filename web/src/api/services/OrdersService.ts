import type { CreateOrderRequest } from '../models/order/CreateOrderRequest';
import type { OrderCreatedResponse } from '../models/order/OrderCreatedResponse';
import type { OrderDetailsResponse } from '../models/order/OrderDetailsResponse';
import type { OrderListResponse } from '../models/order/OrderListResponse';
import type { UpdateOrderRequest } from '../models/order/UpdateOrderRequest';
import { requestWithAuth } from './httpClient';

export class OrdersService {
    public static getOrderById(orderId: number): Promise<OrderDetailsResponse> {
        return requestWithAuth<OrderDetailsResponse>(`/Orders/${orderId}`);
    }

    public static updateOrder(orderId: number, requestBody?: UpdateOrderRequest): Promise<void> {
        return requestWithAuth<void>(`/Orders/${orderId}`, {
            method: 'PUT',
            body: requestBody,
        });
    }

    public static deleteOrder(orderId: number): Promise<void> {
        return requestWithAuth<void>(`/Orders/${orderId}`, {
            method: 'DELETE',
        });
    }

    public static getList(startDate?: string, endDate?: string): Promise<Array<OrderListResponse>> {
        return requestWithAuth<Array<OrderListResponse>>('/Orders', {
            query: {
                startDate,
                endDate,
            },
        });
    }

    public static createOrder(requestBody?: CreateOrderRequest): Promise<OrderCreatedResponse> {
        return requestWithAuth<OrderCreatedResponse>('/Orders', {
            method: 'POST',
            body: requestBody,
        });
    }
}
