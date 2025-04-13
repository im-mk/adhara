// OrderAPI class extending ApiClient

import { ApiClient } from "./ApiClient";
import { Order } from "./Models/Order";

export class OrderApi extends ApiClient {
  // Fetch a single order by its ID using GET
  async getOrder(
    orderId: number,
    onSuccess: (order: Order) => void,
    onError: (error: any) => void
  ): Promise<void> {
    await this.get<Order>(
      `/orders/${orderId}`,      
      onSuccess,
      onError
    );
  }

  // Fetch all orders filtered by orderDate using GET
  async getAllOrders(
    orderDate: string,
    onSuccess: (orders: Order[]) => void,
    onError: (error: any) => void
  ): Promise<void> {
    await this.get<Order[]>(
      `/orders?orderDate=${orderDate}`,      
      onSuccess,
      onError
    );
  }
}