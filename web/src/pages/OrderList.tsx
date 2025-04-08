// src/pages/OrderDetails.tsx

import React, { useEffect, useState } from "react";
import { getAllOrders, Order } from "../services/orderService";
import { Table, Modal, Button } from "antd";
// import { useNavigate } from "react-router-dom";  // Updated to useNavigate
import OrderDetails from "./OrderDetails"; // Make sure this is properly imported

const OrderList: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
    // const navigate = useNavigate();  // Using useNavigate instead of useHistory

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const ordersResponse = await getAllOrders("2025-04-07");
                setOrders(ordersResponse);
            } catch (err) {
                setError("Could not fetch orders.");
                console.error(err);  // Log the actual error for debugging
            }
        };

        fetchOrders();
    }, []);

    if (error) return <div>{error}</div>;
    if (orders.length === 0) return <div>Loading...</div>;

    const handleOrderClick = (orderId: number) => {
        // Navigate to the order details page
        //navigate(`/order-details/${orderId}`);  // Use navigate to programmatically route

        // Or, if you want to open it in a modal:
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
            render: (id: number) => <a onClick={() => handleOrderClick(id)}>{id}</a>, // Passing id here
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

            {/* Modal to display OrderDetails */}
            <Modal
                title={`Order Details for Order #${selectedOrderId}`}
                visible={isModalVisible}
                onCancel={handleModalClose}
                footer={[
                    <Button key="close" onClick={handleModalClose}>
                        Close
                    </Button>,
                ]}
            >
                {/* Assuming OrderDetails accepts orderId as a prop */}
                {selectedOrderId && <OrderDetails orderId={selectedOrderId} />}
            </Modal>
        </div>
    );
};

export default OrderList;
