import React, { useEffect, useState } from "react";

import { Table, Modal, Button } from "antd";
import OrderDetails from "./OrderDetails";
import { Order, OrdersService } from "../api";


const OrderList: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

    const fetchOrders = async () => {
        try {
            const orders = await OrdersService.getAll('2023-01-01', '2030-01-01');
            setOrders(orders);
        } catch {
            setError("Could not fetch orders");
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);


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

            {error && <div style={{ color: 'red' }}>{error}</div>}
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
