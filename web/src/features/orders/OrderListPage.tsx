import React, { useEffect, useRef, useState } from "react";
import { OrderListResponse, OrderStatus, OrdersService } from "../../api";
import { OrderStatusesService } from "../../api/services/OrderStatusesService";
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Link from "@mui/material/Link";
import { Link as RouterLink } from 'react-router-dom';

const OrderListPage: React.FC = () => {

    const [orders, setOrders] = useState<OrderListResponse[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [totalCount, setTotalCount] = useState<number>(0);
    const [page, setPage] = useState<number>(0);
    const [rowsPerPage, setRowsPerPage] = useState<number>(10);
    const [orderStatuses, setOrderStatuses] = useState<OrderStatus[]>([]);

    const statusName = (id?: number) =>
        orderStatuses.find(s => s.id === id)?.statusName ?? (id != null ? String(id) : '—');

    useEffect(() => {
        OrderStatusesService.getAll()
            .then(setOrderStatuses)
            .catch(() => { /* non-critical, silently ignore */ });
    }, []);

    // filters
    const [orderNumberInput, setOrderNumberInput] = useState<string>('');
    const [orderNumber, setOrderNumber] = useState<string | undefined>(undefined);
    const [orderStatusId, setOrderStatusId] = useState<number | undefined>(undefined);
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');

    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleOrderNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setOrderNumberInput(value);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            setOrderNumber(value.trim() || undefined);
            setPage(0);
        }, 400);
    };

    const handleStatusChange = (e: SelectChangeEvent<string>) => {
        const val = e.target.value;
        setOrderStatusId(val === '' ? undefined : Number(val));
        setPage(0);
    };

    const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setStartDate(e.target.value);
        setPage(0);
    };

    const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEndDate(e.target.value);
        setPage(0);
    };

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setLoading(true);
                const sd = startDate || undefined;
                const ed = endDate || undefined;
                const orderPage = await OrdersService.getListPaged(page + 1, rowsPerPage, sd, ed, undefined, orderNumber, orderStatusId);
                setOrders(orderPage.items);
                setTotalCount(orderPage.totalCount);
            } catch {
                setError("Could not fetch orders");
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [page, rowsPerPage, orderNumber, orderStatusId, startDate, endDate]);

    const handleChangePage = (_event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    return (
        <Box>
            <Paper sx={{ p: 2, mb: 2 }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} flexWrap="wrap">
                    <TextField
                        label="Search order number"
                        size="small"
                        value={orderNumberInput}
                        onChange={handleOrderNumberChange}
                        sx={{ minWidth: 200 }}
                    />
                    <FormControl size="small" sx={{ minWidth: 160 }}>
                        <InputLabel>Status</InputLabel>
                        <Select
                            label="Status"
                            value={orderStatusId != null ? String(orderStatusId) : ''}
                            onChange={handleStatusChange}
                        >
                            <MenuItem value=""><em>All statuses</em></MenuItem>
                            {orderStatuses.map(s => (
                                <MenuItem key={s.id} value={String(s.id)}>{s.statusName}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <TextField
                        label="From date"
                        type="date"
                        size="small"
                        value={startDate}
                        onChange={handleStartDateChange}
                        slotProps={{ inputLabel: { shrink: true } }}
                        sx={{ minWidth: 160 }}
                    />
                    <TextField
                        label="To date"
                        type="date"
                        size="small"
                        value={endDate}
                        onChange={handleEndDateChange}
                        slotProps={{ inputLabel: { shrink: true } }}
                        sx={{ minWidth: 160 }}
                    />
                </Stack>
            </Paper>

            {error && <Box sx={{ color: 'error.main', mb: 1 }}>{error}</Box>}

            <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} aria-label="orders table">
                    <TableHead>
                        <TableRow>
                            <TableCell>Order Number</TableCell>
                            <TableCell align="right">Order Date</TableCell>
                            <TableCell align="right">Status</TableCell>
                            <TableCell align="right">Total Amount</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={4}>Loading orders...</TableCell>
                            </TableRow>
                        ) : orders.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4}>No orders found.</TableCell>
                            </TableRow>
                        ) : orders.map((row) => (
                            <TableRow key={row.id}>
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
                                <TableCell align="right">{statusName(row.orderStatusId)}</TableCell>
                                <TableCell align="right">{row.totalAmount}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <TablePagination
                component="div"
                count={totalCount}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[5, 10, 25, 50]}
            />
        </Box>
    );
};

export default OrderListPage;