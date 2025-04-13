// src/pages/OrderDetails.tsx

import React, { useEffect, useState } from "react";
import { OrderApi } from "../api/OrderApi";
import { Order } from "../api/Models/Order";
import { Table, Modal, Button } from "antd";
// import { useNavigate } from "react-router-dom";  // Updated to useNavigate
import OrderDetails from "./OrderDetails"; // Make sure this is properly imported

const OrderList: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

    useEffect(() => {
        const orderApi = new OrderApi();

        orderApi.getAllOrders(
            "2025-04-07",
            (orders) => {
                setOrders(orders);
            },
            () => {
                setError("Could not fetch order");
            });

    }, []);

    if (error) return <div>{error}</div>;
    if (orders.length === 0) return <div>Loading...</div>;

    const handleOrderClick = (orderId: number) => {
        setSelectedOrderId(orderId);
        setIsModalVisible(true);
    };

    const handleModalClose = () => {
        setIsModalVisible(false);
        setSelectedOrderId(null);
    };

    const columns = [
        {
            title: 'Order ID',  // Changed column title to 'Order ID'
            dataIndex: 'id',    // Using `id` as the dataIndex here
            key: 'id',
            render: (id: number) => <Button type="link" onClick={() => handleOrderClick(id)}>{id}</Button>,
        },
        {
            title: 'Order Number',
            dataIndex: 'orderNumber',
            key: 'orderNumber',
        },
        {
            title: 'Date',
            dataIndex: 'orderDate',
            key: 'orderDate',
        },
        {
            title: 'Total Amount',
            dataIndex: 'totalAmount',
            key: 'totalAmount',
        },
    ];

    return (
        <div>
            <Table dataSource={orders} columns={columns} rowKey="orderNumber" />

            <Modal
                title={`Order Details for Order #${selectedOrderId}`}
                open={isModalVisible}
                onCancel={handleModalClose}
                footer={[
                    <Button key="close" onClick={handleModalClose}>
                        Close
                    </Button>,
                ]}
            >

                {selectedOrderId && <OrderDetails orderId={selectedOrderId} />}
            </Modal>
        </div>
    );
};

export default OrderList;
