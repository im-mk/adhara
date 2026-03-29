import React, { useEffect, useState } from "react";
import { OrderListResponse, OrdersService } from "../api";
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Link from "@mui/material/Link";
import { Link as RouterLink } from 'react-router-dom';

const OrderList: React.FC = () => {

    const [orders, setOrders] = useState<OrderListResponse[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const orderData = await OrdersService.getList('2023-01-01', '2030-01-01');
                setOrders(orderData);
            } catch {
                setError("Could not fetch orders");
            }
        };

        fetchOrders();
    }, []);

    return (
        <div>

            {error && <div style={{ color: 'red' }}>{error}</div>}
            <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                    <TableHead>
                        <TableRow>
                            <TableCell>Order Number</TableCell>
                            <TableCell align="right">Order Date</TableCell>
                            <TableCell align="right">Order Status Id</TableCell>
                            <TableCell align="right">Total Amount</TableCell>
                            <TableCell align="right">Customer Id</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {orders.map((row) => (
                            <TableRow key={row.id}
                            >
                                <TableCell component="th" scope="row">
                                    {row.id ? (
                                        <Link component={RouterLink} to={`/orders/${row.id}`} underline="hover">
                                            {row.orderNumber}
                                        </Link>
                                    ) : (
                                        row.orderNumber
                                    )}
                                </TableCell>
                                <TableCell align="right">{row.orderDate}</TableCell>
                                <TableCell align="right">{row.orderStatusId}</TableCell>
                                <TableCell align="right">{row.totalAmount}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </div>
    );
};

export default OrderList;