export type Order = {
    id?: number;
    orderNumber?: string | null;
    orderDate?: string;
    orderStatusId?: number;
    totalAmount?: number;
    customerId?: number;
    customerName?: string | null;
};

