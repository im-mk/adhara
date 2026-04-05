import React, { useState } from 'react';
import {
    Box,
    Paper,
    TextField,
    Button,
    Typography,
    Alert,
    CircularProgress,
} from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { setAuthSession } from '../../auth.ts';
import { AuthService } from '../../api/services/AuthService';

const LoginPage: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const redirectTo = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? '/';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const nextUsername = username.trim();
            const nextPassword = password.trim();

            if (!nextUsername || !nextPassword) {
                throw new Error('Username and password are required');
            }

            const data = await AuthService.login({ username: nextUsername, password: nextPassword });

            if (!data.token) {
                throw new Error('Login response did not include an access token');
            }

            setAuthSession(data.token, data.refresh_token);
            navigate(redirectTo, { replace: true });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
            <Paper elevation={3} sx={{ p: 4, minWidth: 400 }}>
                <Typography variant="h4" gutterBottom textAlign="center" sx={{ mb: 3 }}>
                    Login
                </Typography>

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                <form onSubmit={handleSubmit}>
                    <TextField
                        fullWidth
                        label="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        margin="normal"
                        disabled={loading}
                        required
                    />

                    <TextField
                        fullWidth
                        label="Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        margin="normal"
                        disabled={loading}
                        required
                    />

                    <Button
                        fullWidth
                        variant="contained"
                        color="primary"
                        type="submit"
                        sx={{ mt: 3 }}
                        disabled={loading}
                    >
                        {loading ? <CircularProgress size={24} /> : 'Sign In'}
                    </Button>
                </form>
            </Paper>
        </Box>
    );
};

export default LoginPage;
