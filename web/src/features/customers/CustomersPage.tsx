// CustomersPage.tsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Customer } from '../../api';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import MuiLink from '@mui/material/Link';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import CreateCustomerDialog from './CreateCustomerDialog';
import EditCustomerDialog from './EditCustomerDialog';
import { useCustomers } from './useCustomers';

const CustomersPage: React.FC = () => {
    const navigate = useNavigate();
    const {
        customers,
        totalCount,
        loading,
        error,
        nameQuery,
        setNameQuery,
        postcodeQuery,
        setPostcodeQuery,
        page,
        rowsPerPage,
        handlePageChange,
        handleRowsPerPageChange,
    } = useCustomers();

    const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [editDialogOpen, setEditDialogOpen] = useState<boolean>(false);
    const [createDialogOpen, setCreateDialogOpen] = useState<boolean>(false);
    const [actionMessage, setActionMessage] = useState<string | null>(null);

    const isMenuOpen = Boolean(menuAnchorEl);

    const handleOpenMenu = (event: React.MouseEvent<HTMLElement>, customer: Customer) => {
        setMenuAnchorEl(event.currentTarget);
        setSelectedCustomer(customer);
    };
    const handleCloseMenu = () => setMenuAnchorEl(null);
    const handleOpenEditDialog = () => {
        if (!selectedCustomer) return;
        setEditDialogOpen(true);
        handleCloseMenu();
    };

    const handleCreatedCustomer = (created: Customer) => {
        if (!created.id) return;
        setActionMessage('Customer created');
        setCreateDialogOpen(false);
        navigate(`/customers/${created.id}/orders/new`);
    };

    const handleSavedCustomer = (updatedCustomer: Customer) => {
        if (!updatedCustomer.id) return;
        setEditDialogOpen(false);
        setSelectedCustomer(null);
        setActionMessage('Customer updated');
    };

    if (loading) return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
            <CircularProgress />
        </Box>
    );

    return (
        <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, gap: 2, flexWrap: 'wrap' }}>
                <Typography variant="h4" gutterBottom sx={{ mb: 0 }}>Customers</Typography>
                <Button variant="contained" onClick={() => setCreateDialogOpen(true)}>Create Customer</Button>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {actionMessage && <Alert severity="success" sx={{ mb: 2 }}>{actionMessage}</Alert>}

            <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <TextField label="Search name" value={nameQuery} onChange={(e) => setNameQuery(e.target.value)} size="small" />
                    <TextField label="Filter postcode" value={postcodeQuery} onChange={(e) => setPostcodeQuery(e.target.value)} size="small" />
                </Box>
            </Paper>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Customer Id</TableCell>
                            <TableCell>First Name</TableCell>
                            <TableCell>Last Name</TableCell>
                            <TableCell align="right">Create Order</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {customers.length === 0 ? (
                            <TableRow><TableCell colSpan={5}>No customers found for current filters.</TableCell></TableRow>
                        ) : (
                            customers.map((customer) => (
                                <TableRow key={customer.id}>
                                    <TableCell>
                                        {customer.id ? (
                                            <MuiLink component={Link} to={`/customers/${customer.id}`} underline="hover">{customer.id}</MuiLink>
                                        ) : '-'}
                                    </TableCell>
                                    <TableCell>{customer.firstName ?? '-'}</TableCell>
                                    <TableCell>{customer.lastName ?? '-'}</TableCell>
                                    <TableCell align="right">
                                        {customer.id ? (
                                            <Button component={Link} to={`/customers/${customer.id}/orders/new`} size="small" variant="outlined">
                                                Create Order
                                            </Button>
                                        ) : '-'}
                                    </TableCell>
                                    <TableCell align="right">
                                        <IconButton aria-label="customer actions" onClick={(e) => handleOpenMenu(e, customer)}>
                                            <MoreVertIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <TablePagination
                component="div"
                count={totalCount}
                page={page}
                onPageChange={handlePageChange}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleRowsPerPageChange}
                rowsPerPageOptions={[5, 10, 25, 50]}
            />

            <Menu anchorEl={menuAnchorEl} open={isMenuOpen} onClose={handleCloseMenu}>
                <MenuItem onClick={handleOpenEditDialog}>Edit Customer</MenuItem>
            </Menu>

            <EditCustomerDialog
                open={editDialogOpen}
                customer={selectedCustomer}
                onClose={() => { setEditDialogOpen(false); setSelectedCustomer(null); }}
                onSaved={handleSavedCustomer}
            />

            <CreateCustomerDialog
                open={createDialogOpen}
                onClose={() => setCreateDialogOpen(false)}
                onCreated={handleCreatedCustomer}
            />
        </Box>
    );
};

export default CustomersPage;