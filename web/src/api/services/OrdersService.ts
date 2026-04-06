import type { CreateOrderRequest } from '../models/order/CreateOrderRequest';
import type { OrderCreatedResponse } from '../models/order/OrderCreatedResponse';
import type { OrderDetailsResponse } from '../models/order/OrderDetailsResponse';
import type { OrderListResponse } from '../models/order/OrderListResponse';
import type { UpdateOrderRequest } from '../models/order/UpdateOrderRequest';
import { requestWithAuth, requestWithAuthResponse } from './httpClient';

export type PagedOrdersResult = {
    items: Array<OrderListResponse>;
    totalCount: number;
};

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

    public static getList(startDate?: string, endDate?: string, customerId?: number, orderNumber?: string, orderStatusId?: number): Promise<Array<OrderListResponse>> {
        return requestWithAuth<Array<OrderListResponse>>('/Orders', {
            query: {
                startDate,
                endDate,
                customerId,
                orderNumber,
                orderStatusId,
            },
        });
    }

    public static async getListPaged(page: number, pageSize: number, startDate?: string, endDate?: string, customerId?: number, orderNumber?: string, orderStatusId?: number): Promise<PagedOrdersResult> {
        const response = await requestWithAuthResponse<Array<OrderListResponse>>('/Orders', {
            query: {
                startDate,
                endDate,
                customerId,
                orderNumber,
                orderStatusId,
                page,
                pageSize,
            },
        });

        const totalCountHeader = response.headers.get('x-total-count');
        const parsedTotal = totalCountHeader ? Number(totalCountHeader) : NaN;

        return {
            items: response.data ?? [],
            totalCount: Number.isFinite(parsedTotal) ? parsedTotal : (response.data?.length ?? 0),
        };
    }

    public static createOrder(requestBody?: CreateOrderRequest): Promise<OrderCreatedResponse> {
        return requestWithAuth<OrderCreatedResponse>('/Orders', {
            method: 'POST',
            body: requestBody,
        });
    }
}
