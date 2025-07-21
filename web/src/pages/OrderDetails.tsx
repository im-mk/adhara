import React, { useEffect, useState } from "react";
import { OrdersService } from "../api";


const OrderDetails: React.FC<{ orderId: number }> = ({ orderId }) => {
    const [orderName, setOrderName] = useState<string | undefined>(undefined);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const order = await OrdersService.getOrderById(orderId);
                setOrderName(order.orderNumber);
            } catch {
                setError("Could not fetch order");
            }
        };

        if (orderId > 0) {
            fetchOrder();
        }
    }, [orderId]);


    if (error) return <div>{error}</div>;
    if (!orderName) return <div>Loading...</div>;

    return <div>Order Name: {orderName}</div>;
};

export default OrderDetails;