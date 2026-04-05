import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    IconButton,
    MenuItem,
    Paper,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { CustomersService, OrderItem, OrdersService, type AddressRequest } from '../../api';
import { useNotification } from '../../components/notification-context';

type OrderLineForm = {
    id: string;
    productId: string;
    quantity: string;
};

type ProductOption = {
    id: number;
    name: string;
    price: number;
};

type AddressLike = {
    addressLine1?: string | null;
    addressLine2?: string | null;
    addressLine3?: string | null;
    addressLine4?: string | null;
    postcode?: string | null;
    country?: string | null;
};

const createEmptyLine = (): OrderLineForm => ({
    id: `${Date.now()}-${Math.random()}`,
    productId: '',
    quantity: '1',
});

const NewOrderPage: React.FC = () => {
    const { customerId } = useParams();
    const parsedCustomerId = Number(customerId);
    const navigate = useNavigate();
    const { notify } = useNotification();
    const [customerName, setCustomerName] = useState<string>('');
    const [shippingAddress, setShippingAddress] = useState<AddressLike | null>(null);
    const [billingAddress, setBillingAddress] = useState<AddressLike | null>(null);
    const [orderLines, setOrderLines] = useState<OrderLineForm[]>([createEmptyLine()]);
    const [products, setProducts] = useState<ProductOption[]>([]);
    const [loadingProducts, setLoadingProducts] = useState<boolean>(true);
    const [loadingCustomer, setLoadingCustomer] = useState<boolean>(true);
    const [saving, setSaving] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [productError, setProductError] = useState<string | null>(null);
    const [discountValue, setDiscountValue] = useState<string>('0');

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

                setShippingAddress(customer.shippingAddress ?? null);
                setBillingAddress(customer.billingAddress ?? null);
            } catch {
                setError('Could not load customer');
            } finally {
                setLoadingCustomer(false);
            }
        };

        loadCustomer();
    }, [parsedCustomerId]);

    useEffect(() => {
        const loadProducts = async () => {
            try {
                const response = await fetch('/api/products');
                if (!response.ok) {
                    throw new Error('Failed to fetch products');
                }

                const data = await response.json();
                const mapped: ProductOption[] = (Array.isArray(data) ? data : [])
                    .map((product: { id?: number; name?: string; price?: number }) => ({
                        id: Number(product.id),
                        name: product.name ?? `Product ${product.id}`,
                        price: Number(product.price ?? 0),
                    }))
                    .filter((product) => Number.isInteger(product.id) && product.id > 0);

                setProducts(mapped);
            } catch {
                setProductError('Could not load products from API, showing sample products.');
                setProducts([
                    { id: 1, name: 'Product 1', price: 99.99 },
                    { id: 2, name: 'Product 2', price: 149.99 },
                    { id: 3, name: 'Product 3', price: 199.99 },
                ]);
            } finally {
                setLoadingProducts(false);
            }
        };

        loadProducts();
    }, []);

    const parsedOrderLines = useMemo<OrderItem[] | null>(() => {
        const mapped = orderLines
            .map((line) => ({
                productId: Number(line.productId),
                quantity: Number(line.quantity),
            }))
            .filter((line) => Number.isInteger(line.productId) && line.productId > 0 && Number.isInteger(line.quantity) && line.quantity > 0);

        return mapped.length > 0 ? mapped : null;
    }, [orderLines]);

    const productMap = useMemo(() => {
        return new Map(products.map((product) => [String(product.id), product]));
    }, [products]);

    const orderSummary = useMemo(() => {
        const lines = orderLines.map((line) => {
            const product = productMap.get(line.productId);
            const quantity = Number(line.quantity);
            const safeQuantity = Number.isFinite(quantity) && quantity > 0 ? quantity : 0;
            const unitPrice = product?.price ?? 0;
            const lineTotal = unitPrice * safeQuantity;

            return {
                id: line.id,
                label: product ? product.name : 'Unselected product',
                quantity: safeQuantity,
                unitPrice,
                lineTotal,
            };
        });

        const net = lines.reduce((sum, line) => sum + line.lineTotal, 0);
        const discount = Math.max(0, Number(discountValue) || 0);
        const taxableAmount = Math.max(0, net - discount);
        const vatRate = 0.15;
        const vat = taxableAmount * vatRate;
        const orderTotal = taxableAmount + vat;

        return {
            net,
            discount,
            vat,
            orderTotal,
        };
    }, [orderLines, productMap, discountValue]);

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

    const toAddressRequest = (address: AddressLike | null): AddressRequest | null => {
        if (!address) {
            return null;
        }

        const addressLine1 = address.addressLine1?.trim() ?? '';
        const postcode = address.postcode?.trim() ?? '';
        const country = address.country?.trim() ?? '';

        if (!addressLine1 || !postcode || !country) {
            return null;
        }

        return {
            addressLine1,
            addressLine2: address.addressLine2?.trim() || null,
            addressLine3: address.addressLine3?.trim() || null,
            addressLine4: address.addressLine4?.trim() || null,
            postcode,
            country,
        };
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

        const normalizedCustomerName = customerName.trim();
        if (!normalizedCustomerName) {
            setError('Customer full name is required');
            return;
        }

        const shippingAddressRequest = toAddressRequest(shippingAddress);
        if (!shippingAddressRequest) {
            setError('Shipping address is required');
            return;
        }

        const billingAddressRequest = toAddressRequest(billingAddress);
        if (!billingAddressRequest) {
            setError('Billing address is required');
            return;
        }

        try {
            setSaving(true);
            setError(null);

            const created = await OrdersService.createOrder({
                customerId: parsedCustomerId,
                customerName: normalizedCustomerName,
                totalAmount: Number(orderSummary.orderTotal.toFixed(2)),
                shippingAddress: shippingAddressRequest,
                billingAddress: billingAddressRequest,
                orderLines: parsedOrderLines,
            });

            notify(`Order created: ${created.orderNumber ?? created.orderId}`, 'success');

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
            {productError && <Alert severity="warning" sx={{ mb: 2 }}>{productError}</Alert>}

            {loadingCustomer ? (
                <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
                    <Box display="flex" justifyContent="center" py={2}>
                        <CircularProgress size={24} />
                    </Box>
                </Paper>
            ) : (
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' },
                        gap: 2,
                        mb: 3,
                    }}
                >
                    <Paper elevation={2} sx={{ p: 3, textAlign: 'left' }}>
                        <Typography variant="subtitle1" gutterBottom>Customer Details</Typography>
                        <Typography>{parsedCustomerId > 0 ? `${customerName}` : '-'}</Typography>
                        <Typography color="text.secondary">ID: {parsedCustomerId > 0 ? parsedCustomerId : '-'}</Typography>
                    </Paper>

                    <Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}>
                        <Typography variant="subtitle1" gutterBottom>Shipping Address</Typography>
                        {shippingAddress ? (
                            <>
                                <Typography>{shippingAddress.addressLine1 ?? '-'}</Typography>
                                <Typography>{shippingAddress.addressLine2 ?? ''}</Typography>
                                <Typography>{shippingAddress.addressLine3 ?? ''}</Typography>
                                <Typography>{shippingAddress.addressLine4 ?? ''}</Typography>
                                <Typography>{shippingAddress.postcode ?? ''}</Typography>
                                <Typography>{shippingAddress.country ?? ''}</Typography>
                            </>
                        ) : (
                            <Typography color="text.secondary">Shipping address not available.</Typography>
                        )}
                    </Paper>

                    <Paper elevation={2} sx={{ p: 3, textAlign: 'right' }}>
                        <Typography variant="subtitle1" gutterBottom>Billing Address</Typography>
                        {billingAddress ? (
                            <>
                                <Typography>{billingAddress.addressLine1 ?? '-'}</Typography>
                                <Typography>{billingAddress.addressLine2 ?? ''}</Typography>
                                <Typography>{billingAddress.addressLine3 ?? ''}</Typography>
                                <Typography>{billingAddress.addressLine4 ?? ''}</Typography>
                                <Typography>{billingAddress.postcode ?? ''}</Typography>
                                <Typography>{billingAddress.country ?? ''}</Typography>
                            </>
                        ) : (
                            <Typography color="text.secondary">Billing address not available.</Typography>
                        )}
                    </Paper>
                </Box>
            )}

            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' },
                    gap: 2,
                    alignItems: 'start',
                }}
            >
                <Paper elevation={2} sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, gap: 2, flexWrap: 'wrap' }}>
                        <Typography variant="h6" sx={{ mb: 0 }}>
                            Order Lines
                        </Typography>
                    </Box>

                    <Stack spacing={2}>
                        {orderLines.map((line, index) => (
                            <Box
                                key={line.id}
                                sx={{
                                    display: 'grid',
                                    gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr auto' },
                                    gap: 2,
                                    alignItems: 'center',
                                }}
                            >
                                <TextField
                                    select
                                    label={`Product #${index + 1}`}
                                    value={line.productId}
                                    onChange={(e) => handleLineChange(line.id, 'productId', e.target.value)}
                                    disabled={loadingProducts}
                                >
                                    <MenuItem value="">
                                        Select Product
                                    </MenuItem>
                                    {products.map((product) => (
                                        <MenuItem key={product.id} value={String(product.id)}>
                                            {product.name} (ID: {product.id})
                                        </MenuItem>
                                    ))}
                                </TextField>
                                <TextField
                                    label="Quantity"
                                    value={line.quantity}
                                    onChange={(e) => handleLineChange(line.id, 'quantity', e.target.value)}
                                />
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Line Total</Typography>
                                    <Typography>
                                        {(() => {
                                            const product = productMap.get(line.productId);
                                            const quantity = Number(line.quantity);
                                            const safeQuantity = Number.isFinite(quantity) && quantity > 0 ? quantity : 0;
                                            const lineTotal = (product?.price ?? 0) * safeQuantity;
                                            return lineTotal.toFixed(2);
                                        })()}
                                    </Typography>
                                </Box>
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
                    </Box>
                </Paper>

                <Paper elevation={2} sx={{ p: 3, position: { md: 'sticky' }, top: { md: 16 } }}>
                    <Typography variant="h6" gutterBottom>
                        Order Summary
                    </Typography>
                    <Stack spacing={1}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography color="text.secondary">Net</Typography>
                            <Typography>{orderSummary.net.toFixed(2)}</Typography>
                        </Box>
                        <TextField
                            label="Discount"
                            size="small"
                            value={discountValue}
                            onChange={(e) => setDiscountValue(e.target.value)}
                        />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography color="text.secondary">VAT (15%)</Typography>
                            <Typography>{orderSummary.vat.toFixed(2)}</Typography>
                        </Box>
                        <Box sx={{ borderTop: '1px solid', borderColor: 'divider', pt: 1, mt: 1, display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="subtitle1">Order Total</Typography>
                            <Typography variant="h6">{orderSummary.orderTotal.toFixed(2)}</Typography>
                        </Box>
                        <Button
                            variant="contained"
                            onClick={handleCreateOrder}
                            disabled={saving || loadingCustomer || loadingProducts}
                            sx={{ mt: 1 }}
                        >
                            {saving ? 'Creating...' : 'Create Order'}
                        </Button>
                    </Stack>
                </Paper>
            </Box>
        </Box>
    );
};

export default NewOrderPage;
