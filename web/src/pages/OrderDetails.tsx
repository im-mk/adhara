import React, { useEffect, useState } from "react";
import { OrderApi } from "../api/OrderApi";

const OrderDetails: React.FC<{ orderId: number }> = ({ orderId }) => {
    const [orderName, setOrderName] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const orderApi = new OrderApi();

        orderApi.getOrder(
            orderId,
            (order) => {
                setOrderName(order.orderNumber);
            },
            () => {
                setError("Could not fetch order");
            });

    }, [orderId]);

    if (error) return <div>{error}</div>;
    if (!orderName) return <div>Loading...</div>;

    return <div>Order Name: {orderName}</div>;
};

export default OrderDetails;