export interface Order {
  id: number;
  orderNumber: string;
  orderDate: Date;
  orderStatusId: number;
  totalAmount: number;
  customerId: number;
}

export const getOrder = async (orderId: number): Promise<Order> => {
  const apiUrl = process.env.REACT_APP_API_URL;
  
  const response = await fetch(`${apiUrl}/orders/${orderId}`);
  
    if (!response.ok) {
      throw new Error("Failed to fetch order");
    }
  
    return await response.json();    
  };

  export const getAllOrders = async (orderDate: string): Promise<Order[]> => {
    const apiUrl = process.env.REACT_APP_API_URL;
    
    const response = await fetch(`${apiUrl}/orders?orderDate=${orderDate}`);
    
      if (!response.ok) {
        throw new Error("Failed to fetch order");
      }
    
      return await response.json();
    };