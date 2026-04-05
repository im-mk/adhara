import React, { useEffect, useState } from 'react';
import {
    Box,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    CircularProgress,
    Alert,
    Card,
    CardContent,
    Grid,
} from '@mui/material';

interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    quantity?: number;
}

const ProductsPage: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                // Replace with your actual products API endpoint
                const response = await fetch('/api/products');

                if (!response.ok) {
                    throw new Error('Failed to fetch products');
                }

                const data = await response.json();
                setProducts(data || []);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
                // Mock data for demo purposes
                setProducts([
                    {
                        id: '1',
                        name: 'Product 1',
                        description: 'High quality product',
                        price: 99.99,
                        quantity: 50,
                    },
                    {
                        id: '2',
                        name: 'Product 2',
                        description: 'Premium quality product',
                        price: 149.99,
                        quantity: 30,
                    },
                    {
                        id: '3',
                        name: 'Product 3',
                        description: 'Excellent product',
                        price: 199.99,
                        quantity: 20,
                    },
                ]);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
                Products
            </Typography>

            {error && <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>}

            {products.length === 0 ? (
                <Alert severity="info">No products available</Alert>
            ) : (
                <>
                    {/* Grid View - Desktop */}
                    <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                        <TableContainer component={Paper}>
                            <Table>
                                <TableHead>
                                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                                        <TableCell><strong>Product Name</strong></TableCell>
                                        <TableCell><strong>Description</strong></TableCell>
                                        <TableCell align="right"><strong>Price</strong></TableCell>
                                        <TableCell align="right"><strong>Quantity</strong></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {products.map((product) => (
                                        <TableRow key={product.id} hover>
                                            <TableCell>{product.name}</TableCell>
                                            <TableCell>{product.description}</TableCell>
                                            <TableCell align="right">${product.price.toFixed(2)}</TableCell>
                                            <TableCell align="right">{product.quantity || 0}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Box>

                    {/* Card View - Mobile */}
                    <Grid container spacing={2} sx={{ display: { xs: 'grid', md: 'none' } }}>
                        {products.map((product) => (
                            <Grid size={{ xs: 12 }} key={product.id}>
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>
                                            {product.name}
                                        </Typography>
                                        <Typography color="textSecondary" gutterBottom>
                                            {product.description}
                                        </Typography>
                                        <Typography variant="body2">
                                            Price: ${product.price.toFixed(2)}
                                        </Typography>
                                        <Typography variant="body2">
                                            Quantity: {product.quantity || 0}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </>
            )}
        </Box>
    );
};

export default ProductsPage;
