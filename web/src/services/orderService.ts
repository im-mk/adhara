export const getOrderName = async (orderId: number): Promise<string> => {
  const apiUrl = process.env.REACT_APP_API_URL;
  
  const response = await fetch(`${apiUrl}/orders/${orderId}`);
  
    if (!response.ok) {
      throw new Error("Failed to fetch order");
    }
  
    const data = await response.text();
    return data;
  };