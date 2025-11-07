// src/layout/Layout.tsx
import React from 'react';
import Box from '@mui/material/Box';
import AppMenu from '../components/AppMenu';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <Box sx={{ flexGrow: 1 }}>
        <AppMenu />
        <Box sx={{ p: 2 }}>{children}</Box>
    </Box>
);

export default Layout;
