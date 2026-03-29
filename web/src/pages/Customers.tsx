import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Customer, CustomersService } from '../api';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
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
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

const Customers: React.FC = () => {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [saving, setSaving] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [actionMessage, setActionMessage] = useState<string | null>(null);
    const [nameQuery, setNameQuery] = useState<string>('');
    const [postcodeQuery, setPostcodeQuery] = useState<string>('');

    const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [customerBeingEdited, setCustomerBeingEdited] = useState<Customer | null>(null);
    const [editDialogOpen, setEditDialogOpen] = useState<boolean>(false);
    const [editFirstName, setEditFirstName] = useState<string>('');
    const [editLastName, setEditLastName] = useState<string>('');

    const isMenuOpen = Boolean(menuAnchorEl);

    const getCustomerPostcode = (customer: Customer): string => {
        const dynamicCustomer = customer as unknown as {
            postcode?: string | null;
            billingAddress?: { postcode?: string | null };
            shippingAddress?: { postcode?: string | null };
        };

        return (
            dynamicCustomer.postcode
            ?? dynamicCustomer.billingAddress?.postcode
            ?? dynamicCustomer.shippingAddress?.postcode
            ?? ''
        );
    };

    const filteredCustomers = customers.filter((customer) => {
        const fullName = `${customer.firstName ?? ''} ${customer.lastName ?? ''}`.trim().toLowerCase();
        const postcode = getCustomerPostcode(customer).toLowerCase();

        const matchesName = fullName.includes(nameQuery.trim().toLowerCase());
        const matchesPostcode = postcode.includes(postcodeQuery.trim().toLowerCase());

        return matchesName && matchesPostcode;
    });

    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                const data = await CustomersService.getAllCustomers();
                setCustomers(data);
            } catch {
                setError('Could not fetch customers');
            } finally {
                setLoading(false);
            }
        };

        fetchCustomers();
    }, []);

    const handleOpenMenu = (event: React.MouseEvent<HTMLElement>, customer: Customer) => {
        setMenuAnchorEl(event.currentTarget);
        setSelectedCustomer(customer);
    };

    const handleCloseMenu = () => {
        setMenuAnchorEl(null);
        setSelectedCustomer(null);
    };

    const handleOpenEditDialog = () => {
        if (!selectedCustomer) {
            return;
        }

        setCustomerBeingEdited(selectedCustomer);
        setEditFirstName(selectedCustomer.firstName ?? '');
        setEditLastName(selectedCustomer.lastName ?? '');
        setEditDialogOpen(true);
        handleCloseMenu();
    };

    const handleSaveCustomer = async () => {
        if (!customerBeingEdited?.id) {
            setError('Cannot edit customer without id');
            return;
        }

        const firstName = editFirstName.trim();
        const lastName = editLastName.trim();

        if (!firstName || !lastName) {
            setError('First name and last name are required');
            return;
        }

        try {
            setSaving(true);
            setError(null);
            setActionMessage(null);

            await CustomersService.updateCustomer(customerBeingEdited.id, {
                firstName,
                lastName,
            });

            setCustomers((prev) => prev.map((customer) => (
                customer.id === customerBeingEdited.id
                    ? { ...customer, firstName, lastName }
                    : customer
            )));

            setEditDialogOpen(false);
            setCustomerBeingEdited(null);
            setActionMessage('Customer updated');
        } catch {
            setError('Could not update customer');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                Customers
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {actionMessage && <Alert severity="success" sx={{ mb: 2 }}>{actionMessage}</Alert>}

            <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <TextField
                        label="Search name"
                        value={nameQuery}
                        onChange={(e) => setNameQuery(e.target.value)}
                        size="small"
                    />
                    <TextField
                        label="Filter postcode"
                        value={postcodeQuery}
                        onChange={(e) => setPostcodeQuery(e.target.value)}
                        size="small"
                    />
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
                        {filteredCustomers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5}>No customers found for current filters.</TableCell>
                            </TableRow>
                        ) : (
                            filteredCustomers.map((customer) => (
                                <TableRow key={customer.id}>
                                    <TableCell>
                                        {customer.id ? (
                                            <MuiLink component={Link} to={`/customers/${customer.id}`} underline="hover">
                                                {customer.id}
                                            </MuiLink>
                                        ) : (
                                            '-'
                                        )}
                                    </TableCell>
                                    <TableCell>{customer.firstName ?? '-'}</TableCell>
                                    <TableCell>{customer.lastName ?? '-'}</TableCell>
                                    <TableCell align="right">
                                        {customer.id ? (
                                            <Button
                                                component={Link}
                                                to={`/customers/${customer.id}/orders/new`}
                                                size="small"
                                                variant="outlined"
                                            >
                                                Create Order
                                            </Button>
                                        ) : (
                                            '-'
                                        )}
                                    </TableCell>
                                    <TableCell align="right">
                                        <IconButton
                                            aria-label="customer actions"
                                            onClick={(event) => handleOpenMenu(event, customer)}
                                            disabled={saving}
                                        >
                                            <MoreVertIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Menu
                anchorEl={menuAnchorEl}
                open={isMenuOpen}
                onClose={handleCloseMenu}
            >
                <MenuItem onClick={handleOpenEditDialog}>
                    Edit Customer
                </MenuItem>
            </Menu>

            <Dialog
                open={editDialogOpen}
                onClose={() => setEditDialogOpen(false)}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>Edit Customer</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'grid', gap: 2, mt: 1 }}>
                        <TextField
                            label="First Name"
                            value={editFirstName}
                            onChange={(e) => setEditFirstName(e.target.value)}
                            fullWidth
                        />
                        <TextField
                            label="Last Name"
                            value={editLastName}
                            onChange={(e) => setEditLastName(e.target.value)}
                            fullWidth
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => { setEditDialogOpen(false); setCustomerBeingEdited(null); }}>Cancel</Button>
                    <Button onClick={handleSaveCustomer} variant="contained" disabled={saving}>
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Customers;
