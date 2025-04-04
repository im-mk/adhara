// src/pages/OrderDetails.tsx

import React, { useEffect, useState } from "react";
import { getOrderName } from "../services/orderService";

const OrderDetails: React.FC<{ orderId: number }> = ({ orderId }) => {
    const [orderName, setOrderName] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const name = await getOrderName(orderId);
                setOrderName(name);
            } catch (err) {
                setError("Could not fetch order");
            }
        };

        fetchOrder();
    }, [orderId]);

    if (error) return <div>{error}</div>;
    if (!orderName) return <div>Loading...</div>;

    return <div>Order Name: {orderName}</div>;
};

export default OrderDetails;