import React, { useEffect, useState } from 'react';
import { CustomersService, OrdersService } from '../api';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import { Link } from 'react-router-dom';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { OrderListResponse } from '../api';

const getTodayIsoDate = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
};

const toIsoDate = (date: Date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
};

const Home: React.FC = () => {
    const today = getTodayIsoDate();
    const [startDate, setStartDate] = useState<string>(today);
    const [endDate, setEndDate] = useState<string>(today);
    const [totalOrders, setTotalOrders] = useState<number | null>(null);
    const [totalCustomers, setTotalCustomers] = useState<number | null>(null);
    const [totalSales, setTotalSales] = useState<number | null>(null);
    const [orders, setOrders] = useState<OrderListResponse[]>([]);
    const [error, setError] = useState<string | null>(null);

    const applyTodayPreset = () => {
        const todayValue = getTodayIsoDate();
        setStartDate(todayValue);
        setEndDate(todayValue);
    };

    const applyLast7DaysPreset = () => {
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - 6);

        setStartDate(toIsoDate(start));
        setEndDate(toIsoDate(end));
    };

    const applyThisMonthPreset = () => {
        const end = new Date();
        const start = new Date(end.getFullYear(), end.getMonth(), 1);

        setStartDate(toIsoDate(start));
        setEndDate(toIsoDate(end));
    };

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (startDate > endDate) {
                setError('Start date cannot be after end date');
                return;
            }

            try {
                setError(null);

                const [orders, customers] = await Promise.all([
                    OrdersService.getList(startDate, endDate),
                    CustomersService.getAllCustomers(),
                ]);

                setOrders(orders);
                setTotalOrders(orders.length);
                setTotalCustomers(customers.length);

                const sales = orders.reduce((sum, order) => sum + (order.totalAmount ?? 0), 0);
                setTotalSales(sales);
            } catch {
                setError('Could not fetch dashboard data');
            }
        };

        fetchDashboardData();
    }, [startDate, endDate]);

    return (
        <Box sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, gap: 2, flexWrap: 'wrap' }}>
                <Typography variant="h4" gutterBottom sx={{ mb: 0 }}>
                    Home
                </Typography>
                <Button component={Link} to="/orders" variant="contained">
                    Orders
                </Button>
            </Box>

            <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                    <Button variant="outlined" size="small" onClick={applyTodayPreset}>Today</Button>
                    <Button variant="outlined" size="small" onClick={applyLast7DaysPreset}>Last 7 Days</Button>
                    <Button variant="outlined" size="small" onClick={applyThisMonthPreset}>This Month</Button>
                    <TextField
                        label="Start Date"
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                    />
                    <TextField
                        label="End Date"
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                    />
                </Box>
            </Paper>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 4 }}>
                    <Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}>
                        <Typography variant="h6">Total Orders</Typography>
                        <Typography variant="h3" color="primary">
                            {totalOrders !== null ? totalOrders : '...'}
                        </Typography>
                    </Paper>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}>
                        <Typography variant="h6">Total Customers</Typography>
                        <Typography variant="h3" color="primary">
                            {totalCustomers !== null ? totalCustomers : '...'}
                        </Typography>
                    </Paper>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}>
                        <Typography variant="h6">Total Sales</Typography>
                        <Typography variant="h3" color="primary">
                            {totalSales !== null ? totalSales.toFixed(2) : '...'}
                        </Typography>
                    </Paper>
                </Grid>
            </Grid>

            <Paper elevation={2} sx={{ mt: 3, p: 2 }}>
                <Typography variant="h6" gutterBottom>
                    Orders
                </Typography>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Date</TableCell>
                                <TableCell align="right">Value</TableCell>
                                <TableCell align="right">Status</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {orders.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={3}>No orders in selected range.</TableCell>
                                </TableRow>
                            ) : (
                                orders.map((order) => (
                                    <TableRow key={order.id}>
                                        <TableCell>{order.orderDate ?? '-'}</TableCell>
                                        <TableCell align="right">{(order.totalAmount ?? 0).toFixed(2)}</TableCell>
                                        <TableCell align="right">{order.orderStatusId ?? '-'}</TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </Box>
    );
};

export default Home;
