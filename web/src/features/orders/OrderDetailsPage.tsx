import React, { useEffect, useState } from "react";
import { Link, useParams } from 'react-router-dom';
import { OrderDetailsResponse, OrdersService } from "../../api";
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import MuiLink from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import type { OrderLineDetails } from '../../api';

const OrderDetailsPage: React.FC = () => {
    const { orderId } = useParams();
    const parsedOrderId = Number(orderId);
    const [orderDetails, setOrderDetails] = useState<OrderDetailsResponse | null>(null);
    const [orderLines, setOrderLines] = useState<OrderLineDetails[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [actionError, setActionError] = useState<string | null>(null);
    const [actionMessage, setActionMessage] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [statusValue, setStatusValue] = useState<string>('');

    const [replaceDialogOpen, setReplaceDialogOpen] = useState<boolean>(false);
    const [lineToReplaceId, setLineToReplaceId] = useState<number | null>(null);
    const [replaceProductId, setReplaceProductId] = useState<string>('');
    const [replaceProductName, setReplaceProductName] = useState<string>('');
    const [replaceQuantity, setReplaceQuantity] = useState<string>('1');
    const [replacePrice, setReplacePrice] = useState<string>('0');
    const [lineMenuAnchorEl, setLineMenuAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedLine, setSelectedLine] = useState<OrderLineDetails | null>(null);

    const isLineMenuOpen = Boolean(lineMenuAnchorEl);

    const calculateTotal = (lines: OrderLineDetails[]) => {
        return lines.reduce((sum, line) => {
            const lineTotal = line.total ?? ((line.quantity ?? 0) * (line.price ?? 0));
            return sum + lineTotal;
        }, 0);
    };

    const updateOrderTotal = async (lines: OrderLineDetails[]) => {
        const newTotal = calculateTotal(lines);
        await OrdersService.updateOrder(parsedOrderId, { totalAmount: newTotal });

        setOrderDetails((prev) => {
            if (!prev?.order) {
                return prev;
            }

            return {
                ...prev,
                order: {
                    ...prev.order,
                    totalAmount: newTotal,
                },
            };
        });
    };

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const order = await OrdersService.getOrderById(parsedOrderId);
                setOrderDetails(order);
                setOrderLines(order.orderLines ?? []);
                setStatusValue(String(order.order?.orderStatusId ?? ''));
            } catch {
                setError("Could not fetch order");
            } finally {
                setLoading(false);
            }
        };

        if (parsedOrderId > 0) {
            fetchOrder();
        } else {
            setError('Invalid order id in URL');
            setLoading(false);
        }
    }, [parsedOrderId]);

    const handleUpdateStatus = async () => {
        const parsedStatus = Number(statusValue);
        if (!Number.isInteger(parsedStatus) || parsedStatus <= 0) {
            setActionError('Please enter a valid status id');
            return;
        }

        try {
            setIsSaving(true);
            setActionError(null);
            setActionMessage(null);

            await OrdersService.updateOrder(parsedOrderId, { orderStatusId: parsedStatus });

            setOrderDetails((prev) => {
                if (!prev?.order) {
                    return prev;
                }

                return {
                    ...prev,
                    order: {
                        ...prev.order,
                        orderStatusId: parsedStatus,
                    },
                };
            });

            setActionMessage('Order status updated');
        } catch {
            setActionError('Failed to update order status');
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancelLine = async (lineId?: number) => {
        if (!lineId) {
            setActionError('Cannot cancel this line because it has no id');
            return;
        }

        try {
            setIsSaving(true);
            setActionError(null);
            setActionMessage(null);

            const updatedLines = orderLines.filter((line) => line.id !== lineId);
            await updateOrderTotal(updatedLines);

            setOrderLines(updatedLines);
            setActionMessage('Order line canceled and total updated');
        } catch {
            setActionError('Failed to cancel order line');
        } finally {
            setIsSaving(false);
        }
    };

    const openReplaceDialog = (line: OrderLineDetails) => {
        setLineToReplaceId(line.id ?? null);
        setReplaceProductId(String(line.productId ?? ''));
        setReplaceProductName(line.productName ?? '');
        setReplaceQuantity(String(line.quantity ?? 1));
        setReplacePrice(String(line.price ?? 0));
        setReplaceDialogOpen(true);
    };

    const handleReplaceItem = async () => {
        if (!lineToReplaceId) {
            setActionError('No line selected for replacement');
            return;
        }

        const nextProductId = Number(replaceProductId);
        const nextQuantity = Number(replaceQuantity);
        const nextPrice = Number(replacePrice);

        if (!replaceProductName.trim()) {
            setActionError('Product name is required');
            return;
        }

        if (Number.isNaN(nextProductId) || Number.isNaN(nextQuantity) || Number.isNaN(nextPrice)) {
            setActionError('Product id, quantity, and price must be numbers');
            return;
        }

        if (nextQuantity <= 0 || nextPrice < 0) {
            setActionError('Quantity must be > 0 and price must be >= 0');
            return;
        }

        try {
            setIsSaving(true);
            setActionError(null);
            setActionMessage(null);

            const updatedLines = orderLines.map((line) => {
                if (line.id !== lineToReplaceId) {
                    return line;
                }

                return {
                    ...line,
                    productId: nextProductId,
                    productName: replaceProductName.trim(),
                    quantity: nextQuantity,
                    price: nextPrice,
                    total: nextQuantity * nextPrice,
                };
            });

            await updateOrderTotal(updatedLines);
            setOrderLines(updatedLines);
            setReplaceDialogOpen(false);
            setActionMessage('Order line replaced and total updated');
        } catch {
            setActionError('Failed to replace order line item');
        } finally {
            setIsSaving(false);
        }
    };

    const handleLineMenuOpen = (event: React.MouseEvent<HTMLElement>, line: OrderLineDetails) => {
        setLineMenuAnchorEl(event.currentTarget);
        setSelectedLine(line);
    };

    const handleLineMenuClose = () => {
        setLineMenuAnchorEl(null);
        setSelectedLine(null);
    };

    const handleCancelLineFromMenu = async () => {
        await handleCancelLine(selectedLine?.id);
        handleLineMenuClose();
    };

    const handleReplaceLineFromMenu = () => {
        if (selectedLine) {
            openReplaceDialog(selectedLine);
        }
        handleLineMenuClose();
    };

    const vatRate = 0.15;
    const netAmount = calculateTotal(orderLines);
    const vatAmount = netAmount * vatRate;
    const grossAmount = netAmount + vatAmount;

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                <CircularProgress />
            </Box>
        );
    }

    if (error) return <Alert severity="error">{error}</Alert>;
    if (!orderDetails?.order) return <Alert severity="warning">Order not found</Alert>;

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                Order Details
            </Typography>

            <Typography variant="body2" sx={{ mb: 2 }}>
                <Link to="/orders">Back to orders</Link>
            </Typography>

            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                    gap: 2,
                    mb: 3,
                    alignItems: 'stretch',
                }}
            >
                <Paper elevation={2} sx={{ p: 3, textAlign: 'left' }}>
                    <Typography variant="h6" gutterBottom>
                        Order Summary
                    </Typography>
                    <Typography>Order Number: {orderDetails.order.orderNumber}</Typography>
                    <Typography>Order Date: {orderDetails.order.orderDate}</Typography>
                    <Typography>Status Id: {orderDetails.order.orderStatusId}</Typography>
                    <Typography>Total Amount: {orderDetails.order.totalAmount}</Typography>
                    <Typography>
                        Customer:{' '}
                        {orderDetails.order.customerId ? (
                            <MuiLink
                                component={Link}
                                to={`/customers/${orderDetails.order.customerId}`}
                                underline="hover"
                            >
                                {orderDetails.customerName ?? `Customer ${orderDetails.order.customerId}`}
                            </MuiLink>
                        ) : (
                            '-'
                        )}
                    </Typography>

                    <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
                        Actions
                    </Typography>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                        <TextField
                            label="Status Id"
                            size="small"
                            value={statusValue}
                            onChange={(e) => setStatusValue(e.target.value)}
                        />
                        <Button variant="contained" onClick={handleUpdateStatus} disabled={isSaving}>
                            Update Status
                        </Button>
                    </Stack>
                </Paper>

                <Paper elevation={2} sx={{ p: 3, textAlign: 'right' }}>
                    <Typography variant="h6" gutterBottom>
                        Billing Address
                    </Typography>
                    <Typography color="text.secondary" sx={{ mb: 2 }}>
                        Billing address details are not available in the current order details response.
                    </Typography>

                    <Typography variant="h6" gutterBottom>
                        Shipping Address
                    </Typography>
                    <Typography color="text.secondary">
                        Shipping address details are not available in the current order details response.
                    </Typography>
                </Paper>
            </Box>

            {actionError && <Alert severity="error" sx={{ mb: 2 }}>{actionError}</Alert>}
            {actionMessage && <Alert severity="success" sx={{ mb: 2 }}>{actionMessage}</Alert>}

            <Typography variant="h6" gutterBottom>
                Order Lines
            </Typography>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Product</TableCell>
                            <TableCell align="right">Quantity</TableCell>
                            <TableCell align="right">Price</TableCell>
                            <TableCell align="right">Total</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {orderLines.map((line) => (
                            <TableRow key={line.id}>
                                <TableCell>{line.productName}</TableCell>
                                <TableCell align="right">{line.quantity}</TableCell>
                                <TableCell align="right">{line.price}</TableCell>
                                <TableCell align="right">{line.total}</TableCell>
                                <TableCell align="right">
                                    <IconButton
                                        aria-label="line actions"
                                        aria-controls={isLineMenuOpen ? 'order-line-actions-menu' : undefined}
                                        aria-haspopup="true"
                                        aria-expanded={isLineMenuOpen ? 'true' : undefined}
                                        onClick={(event) => handleLineMenuOpen(event, line)}
                                        disabled={isSaving}
                                    >
                                        <MoreVertIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Paper elevation={2} sx={{ p: 2, mt: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Box sx={{ minWidth: 260 }}>
                        <Stack spacing={1}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography color="text.secondary">Net</Typography>
                                <Typography>{netAmount.toFixed(2)}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography color="text.secondary">VAT (15%)</Typography>
                                <Typography>{vatAmount.toFixed(2)}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="h6">Total</Typography>
                                <Typography variant="h6">{grossAmount.toFixed(2)}</Typography>
                            </Box>
                        </Stack>
                    </Box>
                </Box>
            </Paper>

            <Menu
                id="order-line-actions-menu"
                anchorEl={lineMenuAnchorEl}
                open={isLineMenuOpen}
                onClose={handleLineMenuClose}
            >
                <MenuItem onClick={handleCancelLineFromMenu} disabled={isSaving}>
                    Cancel Line
                </MenuItem>
                <MenuItem onClick={handleReplaceLineFromMenu} disabled={isSaving}>
                    Replace Item
                </MenuItem>
            </Menu>

            <Dialog open={replaceDialogOpen} onClose={() => setReplaceDialogOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle>Replace Order Item</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        <TextField
                            label="Product Id"
                            value={replaceProductId}
                            onChange={(e) => setReplaceProductId(e.target.value)}
                            fullWidth
                        />
                        <TextField
                            label="Product Name"
                            value={replaceProductName}
                            onChange={(e) => setReplaceProductName(e.target.value)}
                            fullWidth
                        />
                        <TextField
                            label="Quantity"
                            value={replaceQuantity}
                            onChange={(e) => setReplaceQuantity(e.target.value)}
                            fullWidth
                        />
                        <TextField
                            label="Price"
                            value={replacePrice}
                            onChange={(e) => setReplacePrice(e.target.value)}
                            fullWidth
                        />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setReplaceDialogOpen(false)}>Close</Button>
                    <Button onClick={handleReplaceItem} variant="contained" disabled={isSaving}>
                        Save Replacement
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default OrderDetailsPage;