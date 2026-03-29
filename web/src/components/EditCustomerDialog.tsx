import React, { useEffect, useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import { Customer, CustomersService } from '../api';

type EditCustomerDialogProps = {
    open: boolean;
    customer: Customer | null;
    onClose: () => void;
    onSaved: (customer: Customer) => void;
};

const EditCustomerDialog: React.FC<EditCustomerDialogProps> = ({ open, customer, onClose, onSaved }) => {
    const [saving, setSaving] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [firstName, setFirstName] = useState<string>('');
    const [lastName, setLastName] = useState<string>('');

    useEffect(() => {
        if (open && customer) {
            setFirstName(customer.firstName ?? '');
            setLastName(customer.lastName ?? '');
            setError(null);
        }
    }, [open, customer]);

    const handleSave = async () => {
        if (!customer?.id) {
            setError('Cannot edit customer without id');
            return;
        }

        const nextFirstName = firstName.trim();
        const nextLastName = lastName.trim();

        if (!nextFirstName || !nextLastName) {
            setError('First name and last name are required');
            return;
        }

        try {
            setSaving(true);
            setError(null);

            await CustomersService.updateCustomer(customer.id, {
                firstName: nextFirstName,
                lastName: nextLastName,
            });

            onSaved({
                ...customer,
                firstName: nextFirstName,
                lastName: nextLastName,
            });
        } catch {
            setError('Could not update customer');
        } finally {
            setSaving(false);
        }
    };

    const handleClose = () => {
        if (saving) {
            return;
        }
        setError(null);
        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            fullWidth
            maxWidth="sm"
        >
            <DialogTitle>Edit Customer</DialogTitle>
            <DialogContent>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                <Box sx={{ display: 'grid', gap: 2, mt: 1 }}>
                    <TextField
                        label="First Name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        fullWidth
                    />
                    <TextField
                        label="Last Name"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        fullWidth
                    />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                <Button onClick={handleSave} variant="contained" disabled={saving}>
                    {saving ? 'Saving...' : 'Save'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default EditCustomerDialog;
