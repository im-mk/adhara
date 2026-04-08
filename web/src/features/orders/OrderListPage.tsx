import React from "react";
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
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
import { useOrders } from './useOrders';

const OrderListPage: React.FC = () => {
    const {
        orders,
        loading,
        error,
        totalCount,
        page,
        rowsPerPage,
        orderStatuses,
        orderNumberInput,
        orderStatusId,
        startDate,
        endDate,
        statusName,
        handleOrderNumberChange,
        handleStatusChange,
        handleStartDateChange,
        handleEndDateChange,
        handleChangePage,
        handleChangeRowsPerPage,
    } = useOrders();

    return (
        <Box>
            <Paper sx={{ p: 2, mb: 2 }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ flexWrap: 'wrap' }}>
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
                            {orderStatuses.map((s) => (
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