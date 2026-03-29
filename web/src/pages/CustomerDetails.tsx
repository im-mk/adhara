import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Customer, CustomersService, OrderListResponse, OrdersService } from '../api';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import MuiLink from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

type CustomerOrderRow = {
    id: number;
    orderNumber?: string | null;
    orderDate?: string;
    orderStatusId?: number;
    totalAmount?: number;
};

const CustomerDetails: React.FC = () => {
    const { customerId } = useParams();
    const parsedCustomerId = Number(customerId);

    const [customer, setCustomer] = useState<Customer | null>(null);
    const [customerOrders, setCustomerOrders] = useState<CustomerOrderRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!parsedCustomerId || parsedCustomerId <= 0) {
                setError('Invalid customer id in URL');
                setLoading(false);
                return;
            }

            try {
                const customerResponse = await CustomersService.getCustomerById(parsedCustomerId);
                setCustomer(customerResponse);

                const allOrders = await OrdersService.getList('2023-01-01', '2030-01-01');
                const withId = allOrders.filter((order): order is Required<Pick<OrderListResponse, 'id'>> & OrderListResponse =>
                    Boolean(order.id)
                );

                const detailResponses = await Promise.all(
                    withId.map(async (order) => {
                        const details = await OrdersService.getOrderById(order.id);
                        return { order, details };
                    })
                );

                const filteredOrders = detailResponses
                    .filter(({ details }) => details.order?.customerId === parsedCustomerId)
                    .map(({ order, details }): CustomerOrderRow => ({
                        id: order.id!,
                        orderNumber: order.orderNumber,
                        orderDate: order.orderDate,
                        orderStatusId: details.order?.orderStatusId ?? order.orderStatusId,
                        totalAmount: order.totalAmount,
                    }));

                setCustomerOrders(filteredOrders);
            } catch {
                setError('Could not fetch customer details');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [parsedCustomerId]);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return <Alert severity="error">{error}</Alert>;
    }

    return (
        <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, gap: 2, flexWrap: 'wrap' }}>
                <Typography variant="h4" gutterBottom sx={{ mb: 0 }}>
                    Customer Details
                </Typography>
                {parsedCustomerId > 0 && (
                    <Button component={Link} to={`/customers/${parsedCustomerId}/orders/new`} variant="contained">
                        Create Order
                    </Button>
                )}
            </Box>

            <Typography variant="body2" sx={{ mb: 2 }}>
                <MuiLink component={Link} to="/orders" underline="hover">
                    Back to orders
                </MuiLink>
            </Typography>

            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                    gap: 2,
                    mb: 3,
                }}
            >
                <Paper elevation={2} sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        Customer
                    </Typography>
                    <Typography>Customer Id: {customer?.id ?? '-'}</Typography>
                    <Typography>First Name: {customer?.firstName ?? '-'}</Typography>
                    <Typography>Last Name: {customer?.lastName ?? '-'}</Typography>
                </Paper>

                <Paper elevation={2} sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        Billing Address
                    </Typography>
                    <Typography color="text.secondary">
                        Billing address is not available in the current customer details response.
                    </Typography>
                </Paper>

                <Paper elevation={2} sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        Shipping Address
                    </Typography>
                    <Typography color="text.secondary">
                        Shipping address is not available in the current customer details response.
                    </Typography>
                </Paper>
            </Box>

            <Typography variant="h6" gutterBottom>
                Previous Orders
            </Typography>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Order Number</TableCell>
                            <TableCell>Order Date</TableCell>
                            <TableCell align="right">Order Status</TableCell>
                            <TableCell align="right">Total Amount</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {customerOrders.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4}>No previous orders found for this customer.</TableCell>
                            </TableRow>
                        ) : (
                            customerOrders.map((order) => (
                                <TableRow key={order.id}>
                                    <TableCell>
                                        <MuiLink
                                            href={`/orders/${order.id}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            underline="hover"
                                        >
                                            {order.orderNumber ?? `Order ${order.id}`}
                                        </MuiLink>
                                    </TableCell>
                                    <TableCell>{order.orderDate ?? '-'}</TableCell>
                                    <TableCell align="right">{order.orderStatusId ?? '-'}</TableCell>
                                    <TableCell align="right">{order.totalAmount ?? '-'}</TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default CustomerDetails;
