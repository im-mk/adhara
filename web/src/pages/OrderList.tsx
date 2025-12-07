import React, { useEffect, useState } from "react";
import OrderDetails from "./OrderDetails";
import { Order, OrderListResponse, OrdersService } from "../api";
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Link from "@mui/material/Link";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";

const OrderList: React.FC = () => {

    const [orders, setOrders] = useState<OrderListResponse[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [selectedOrderId, setSelectedOrderId] = useState<number | undefined>(undefined);
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

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


    const handleOrderClick = (orderId: number) => {
        setSelectedOrderId(orderId);
        setIsModalVisible(true);
    };

    const handleModalClose = () => {
        setIsModalVisible(false);
        setSelectedOrderId(undefined);
    };

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
                                    <Link href="#" onClick={() => handleOrderClick(row.id!)}>{row.orderNumber}</Link>
                                </TableCell>
                                <TableCell align="right">{row.orderDate}</TableCell>
                                <TableCell align="right">{row.orderStatusId}</TableCell>
                                <TableCell align="right">{row.totalAmount}</TableCell>                                
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {isModalVisible && selectedOrderId && selectedOrderId > 0 && (
                <Dialog
                    open={isModalVisible}
                    onClose={handleModalClose}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogTitle id="alert-dialog-title">
                        {"Order Details"}
                    </DialogTitle>
                    <DialogContent>
                        <OrderDetails orderId={selectedOrderId} />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleModalClose} autoFocus>
                            Close
                        </Button>
                    </DialogActions>
                </Dialog>
            )}
        </div>
    );
};

export default OrderList;