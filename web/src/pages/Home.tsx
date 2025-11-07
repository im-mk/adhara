import React, { useEffect, useState } from 'react';
import { OrdersService } from '../api';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

const Home: React.FC = () => {
    const [totalOrders, setTotalOrders] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const orders = await OrdersService.getAll('2023-01-01', '2030-01-01');
                setTotalOrders(orders.length);
            } catch {
                setError('Could not fetch orders');
            }
        };
        fetchOrders();
    }, []);

    return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
            <Paper elevation={3} sx={{ p: 4, minWidth: 30, textAlign: 'center' }}>
                <Typography variant="h4" gutterBottom>
                    Home
                </Typography>
                {error ? (
                    <Typography color="error">{error}</Typography>
                ) : (
                    <>
                        <Typography variant="h6">Total Orders</Typography>
                        <Typography variant="h2" color="primary">
                            {totalOrders !== null ? totalOrders : '...'}
                        </Typography>
                    </>
                )}
            </Paper>
        </Box>
    );
};

export default Home;
