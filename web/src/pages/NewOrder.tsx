import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    IconButton,
    Paper,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { CustomersService, OrderItem, OrdersService } from '../api';

type OrderLineForm = {
    id: string;
    productId: string;
    quantity: string;
};

const createEmptyLine = (): OrderLineForm => ({
    id: `${Date.now()}-${Math.random()}`,
    productId: '',
    quantity: '1',
});

const NewOrder: React.FC = () => {
    const { customerId } = useParams();
    const parsedCustomerId = Number(customerId);
    const navigate = useNavigate();
    const [customerName, setCustomerName] = useState<string>('');
    const [orderLines, setOrderLines] = useState<OrderLineForm[]>([createEmptyLine()]);
    const [loadingCustomer, setLoadingCustomer] = useState<boolean>(true);
    const [saving, setSaving] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        const loadCustomer = async () => {
            if (!Number.isInteger(parsedCustomerId) || parsedCustomerId <= 0) {
                setError('Invalid customer id. Open create order from a customer page.');
                setLoadingCustomer(false);
                return;
            }

            try {
                const customer = await CustomersService.getCustomerById(parsedCustomerId);
                setCustomerName(`${customer.firstName ?? ''} ${customer.lastName ?? ''}`.trim() || `Customer ${parsedCustomerId}`);
            } catch {
                setError('Could not load customer');
            } finally {
                setLoadingCustomer(false);
            }
        };

        loadCustomer();
    }, [parsedCustomerId]);

    const parsedOrderLines = useMemo<OrderItem[] | null>(() => {
        const mapped = orderLines
            .map((line) => ({
                productId: Number(line.productId),
                quantity: Number(line.quantity),
            }))
            .filter((line) => Number.isInteger(line.productId) && line.productId > 0 && Number.isInteger(line.quantity) && line.quantity > 0);

        return mapped.length > 0 ? mapped : null;
    }, [orderLines]);

    const handleLineChange = (lineId: string, key: 'productId' | 'quantity', value: string) => {
        setOrderLines((prev) => prev.map((line) => (line.id === lineId ? { ...line, [key]: value } : line)));
    };

    const handleAddLine = () => {
        setOrderLines((prev) => [...prev, createEmptyLine()]);
    };

    const handleRemoveLine = (lineId: string) => {
        setOrderLines((prev) => {
            if (prev.length === 1) {
                return prev;
            }
            return prev.filter((line) => line.id !== lineId);
        });
    };

    const handleCreateOrder = async () => {
        if (!Number.isInteger(parsedCustomerId) || parsedCustomerId <= 0) {
            setError('Invalid customer id. Open create order from a customer page.');
            return;
        }

        if (!parsedOrderLines || parsedOrderLines.length === 0) {
            setError('Add at least one valid order line');
            return;
        }

        try {
            setSaving(true);
            setError(null);
            setSuccess(null);

            const created = await OrdersService.createOrder({
                customerId: parsedCustomerId,
                orderLines: parsedOrderLines,
            });

            setSuccess(`Order created: ${created.orderNumber ?? created.orderId}`);

            if (created.orderId) {
                navigate(`/orders/${created.orderId}`);
            }
        } catch {
            setError('Failed to create order');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                Create New Order
            </Typography>

            <Typography variant="body2" sx={{ mb: 2 }}>
                <Link to={parsedCustomerId > 0 ? `/customers/${parsedCustomerId}` : '/orders'}>
                    Back
                </Link>
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

            <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
                {loadingCustomer ? (
                    <Box display="flex" justifyContent="center" py={2}>
                        <CircularProgress size={24} />
                    </Box>
                ) : (
                    <TextField
                        fullWidth
                        label="Customer"
                        value={parsedCustomerId > 0 ? `${customerName} (ID: ${parsedCustomerId})` : ''}
                        slotProps={{ input: { readOnly: true } }}
                    />
                )}
            </Paper>

            <Paper elevation={2} sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                    Order Lines
                </Typography>

                <Stack spacing={2}>
                    {orderLines.map((line, index) => (
                        <Box
                            key={line.id}
                            sx={{
                                display: 'grid',
                                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr auto' },
                                gap: 2,
                                alignItems: 'center',
                            }}
                        >
                            <TextField
                                label={`Product Id #${index + 1}`}
                                value={line.productId}
                                onChange={(e) => handleLineChange(line.id, 'productId', e.target.value)}
                            />
                            <TextField
                                label="Quantity"
                                value={line.quantity}
                                onChange={(e) => handleLineChange(line.id, 'quantity', e.target.value)}
                            />
                            <Box sx={{ display: 'flex', justifyContent: { xs: 'flex-start', sm: 'center' } }}>
                                <IconButton
                                    aria-label="remove line"
                                    onClick={() => handleRemoveLine(line.id)}
                                    disabled={orderLines.length === 1 || saving}
                                >
                                    <DeleteOutlineIcon />
                                </IconButton>
                            </Box>
                        </Box>
                    ))}
                </Stack>

                <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Button variant="outlined" onClick={handleAddLine} disabled={saving}>
                        Add Line
                    </Button>
                    <Button variant="contained" onClick={handleCreateOrder} disabled={saving || loadingCustomer}>
                        {saving ? 'Creating...' : 'Create Order'}
                    </Button>
                </Box>
            </Paper>
        </Box>
    );
};

export default NewOrder;
