// Order interface definition

export interface Order {
  id: number;
  orderNumber: string;
  orderDate: Date;
  orderStatusId: number;
  totalAmount: number;
  customerId: number;
}
