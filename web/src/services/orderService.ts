export const getOrderName = async (orderId: number): Promise<string> => {
    const response = await fetch(`http://localhost:8080/orders/${orderId}`);
  
    if (!response.ok) {
      throw new Error("Failed to fetch order");
    }
  
    const data = await response.text();
    return data;
  };