import React from 'react';
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
    TablePagination,
    TextField,
} from '@mui/material';
import { useProducts } from './useProducts';

const ProductsPage: React.FC = () => {
    const {
        products,
        filteredProducts,
        pagedProducts,
        nameQuery,
        setNameQuery,
        page,
        rowsPerPage,
        loading,
        error,
        handleChangePage,
        handleChangeRowsPerPage,
    } = useProducts();

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
                Products
            </Typography>

            <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
                <TextField
                    label="Search product name"
                    value={nameQuery}
                    onChange={(event) => setNameQuery(event.target.value)}
                    size="small"
                    sx={{ minWidth: { xs: '100%', sm: 280 } }}
                />
            </Paper>

            {error && <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>}

            {products.length === 0 ? (
                <Alert severity="info">No products available</Alert>
            ) : filteredProducts.length === 0 ? (
                <Alert severity="info">No products found for current search.</Alert>
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
                                    {pagedProducts.map((product) => (
                                        <TableRow key={product.id} hover>
                                            <TableCell>{product.productName}</TableCell>
                                            <TableCell>{product.productDescription ?? '-'}</TableCell>
                                            <TableCell align="right">${product.unitPrice.toFixed(2)}</TableCell>
                                            <TableCell align="right">-</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Box>

                    {/* Card View - Mobile */}
                    <Grid container spacing={2} sx={{ display: { xs: 'grid', md: 'none' } }}>
                        {pagedProducts.map((product) => (
                            <Grid size={{ xs: 12 }} key={product.id}>
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>
                                            {product.productName}
                                        </Typography>
                                        <Typography color="textSecondary" gutterBottom>
                                            {product.productDescription ?? '-'}
                                        </Typography>
                                        <Typography variant="body2">
                                            Price: ${product.unitPrice.toFixed(2)}
                                        </Typography>
                                        <Typography variant="body2">
                                            Quantity: -
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>

                    <TablePagination
                        component="div"
                        count={filteredProducts.length}
                        page={page}
                        onPageChange={handleChangePage}
                        rowsPerPage={rowsPerPage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        rowsPerPageOptions={[5, 10, 25, 50]}
                    />
                </>
            )}
        </Box>
    );
};

export default ProductsPage;
