import React, { useEffect, useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControlLabel from '@mui/material/FormControlLabel';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { CountriesService, Country, Customer, CustomersService } from '../api';

type AddressForm = {
    addressLine1: string;
    addressLine2: string;
    addressLine3: string;
    addressLine4: string;
    postcode: string;
    country: string;
};

type CreateCustomerDialogProps = {
    open: boolean;
    onClose: () => void;
    onCreated: (customer: Customer) => void;
};

const createEmptyAddress = (): AddressForm => ({
    addressLine1: '',
    addressLine2: '',
    addressLine3: '',
    addressLine4: '',
    postcode: '',
    country: '',
});

const CreateCustomerDialog: React.FC<CreateCustomerDialogProps> = ({ open, onClose, onCreated }) => {
    const [createStep, setCreateStep] = useState<number>(0);
    const [createFirstName, setCreateFirstName] = useState<string>('');
    const [createLastName, setCreateLastName] = useState<string>('');
    const [billingAddress, setBillingAddress] = useState<AddressForm>(createEmptyAddress());
    const [shippingAddress, setShippingAddress] = useState<AddressForm>(createEmptyAddress());
    const [isBillingSameAsShipping, setIsBillingSameAsShipping] = useState<boolean>(true);
    const [creatingCustomer, setCreatingCustomer] = useState<boolean>(false);
    const [createDialogError, setCreateDialogError] = useState<string | null>(null);
    const [countries, setCountries] = useState<Country[]>([]);
    const [loadingCountries, setLoadingCountries] = useState<boolean>(false);
    const [countriesError, setCountriesError] = useState<string | null>(null);

    useEffect(() => {
        if (!open || countries.length > 0) {
            return;
        }

        let cancelled = false;

        const loadCountries = async () => {
            try {
                setLoadingCountries(true);
                setCountriesError(null);

                const data = await CountriesService.getAllCountries();
                if (cancelled) {
                    return;
                }

                const sortedCountries = [...data].sort((left, right) =>
                    (left.name ?? left.id ?? '').localeCompare(right.name ?? right.id ?? '')
                );

                setCountries(sortedCountries);
            } catch {
                if (!cancelled) {
                    setCountriesError('Could not load countries');
                }
            } finally {
                if (!cancelled) {
                    setLoadingCountries(false);
                }
            }
        };

        loadCountries();

        return () => {
            cancelled = true;
        };
    }, [open, countries.length]);

    const countrySelectionUnavailable = loadingCountries || (countries.length === 0 && countriesError !== null);

    const resetCreateDialog = () => {
        setCreateStep(0);
        setCreateFirstName('');
        setCreateLastName('');
        setBillingAddress(createEmptyAddress());
        setShippingAddress(createEmptyAddress());
        setIsBillingSameAsShipping(true);
        setCreateDialogError(null);
    };

    const handleClose = () => {
        if (creatingCustomer) {
            return;
        }
        onClose();
        resetCreateDialog();
    };

    const handleCreateNextStep = () => {
        if (createStep === 0) {
            if (!createFirstName.trim() || !createLastName.trim()) {
                setCreateDialogError('First name and last name are required');
                return;
            }
            setCreateDialogError(null);
            setCreateStep(1);
            return;
        }

        if (createStep === 1) {
            if (!shippingAddress.addressLine1.trim() || !shippingAddress.postcode.trim() || !shippingAddress.country.trim()) {
                setCreateDialogError('Shipping address line 1, postcode, and country are required');
                return;
            }
            setCreateDialogError(null);
            setCreateStep(2);
        }
    };

    const handleCreatePreviousStep = () => {
        setCreateStep((prev) => Math.max(prev - 1, 0));
    };

    const handleShippingAddressChange = (key: keyof AddressForm, value: string) => {
        setShippingAddress((prev) => {
            const next = { ...prev, [key]: value };

            if (isBillingSameAsShipping) {
                setBillingAddress(next);
            }

            return next;
        });
    };

    const handleBillingSameAsShippingChange = (checked: boolean) => {
        setIsBillingSameAsShipping(checked);
        if (checked) {
            setBillingAddress(shippingAddress);
        }
    };

    const handleCreateCustomer = async () => {
        if (!isBillingSameAsShipping && (!billingAddress.addressLine1.trim() || !billingAddress.postcode.trim() || !billingAddress.country.trim())) {
            setCreateDialogError('Billing address line 1, postcode, and country are required');
            return;
        }

        try {
            setCreatingCustomer(true);
            setCreateDialogError(null);

            const created = await CustomersService.createCustomer({
                firstName: createFirstName.trim(),
                lastName: createLastName.trim(),
                billingAddress: {
                    addressLine1: (isBillingSameAsShipping ? shippingAddress.addressLine1 : billingAddress.addressLine1).trim(),
                    addressLine2: (isBillingSameAsShipping ? shippingAddress.addressLine2 : billingAddress.addressLine2).trim() || null,
                    addressLine3: (isBillingSameAsShipping ? shippingAddress.addressLine3 : billingAddress.addressLine3).trim() || null,
                    addressLine4: (isBillingSameAsShipping ? shippingAddress.addressLine4 : billingAddress.addressLine4).trim() || null,
                    postcode: (isBillingSameAsShipping ? shippingAddress.postcode : billingAddress.postcode).trim(),
                    country: (isBillingSameAsShipping ? shippingAddress.country : billingAddress.country).trim(),
                },
                shippingAddress: {
                    addressLine1: shippingAddress.addressLine1.trim(),
                    addressLine2: shippingAddress.addressLine2.trim() || null,
                    addressLine3: shippingAddress.addressLine3.trim() || null,
                    addressLine4: shippingAddress.addressLine4.trim() || null,
                    postcode: shippingAddress.postcode.trim(),
                    country: shippingAddress.country.trim(),
                },
            });

            onCreated(created);
            onClose();
            resetCreateDialog();
        } catch {
            setCreateDialogError('Could not create customer');
        } finally {
            setCreatingCustomer(false);
        }
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            fullWidth
            maxWidth="sm"
        >
            <DialogTitle>Create Customer</DialogTitle>
            <DialogContent>
                {createDialogError && <Alert severity="error" sx={{ mb: 2 }}>{createDialogError}</Alert>}
                {countriesError && <Alert severity="error" sx={{ mb: 2 }}>{countriesError}</Alert>}
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Step {createStep + 1} of 3
                </Typography>

                {createStep === 0 && (
                    <Box sx={{ display: 'grid', gap: 2 }}>
                        <TextField
                            label="First Name"
                            value={createFirstName}
                            onChange={(e) => setCreateFirstName(e.target.value)}
                            fullWidth
                        />
                        <TextField
                            label="Last Name"
                            value={createLastName}
                            onChange={(e) => setCreateLastName(e.target.value)}
                            fullWidth
                        />
                    </Box>
                )}

                {createStep === 1 && (
                    <Box sx={{ display: 'grid', gap: 2 }}>
                        <Typography variant="subtitle1">Shipping Address</Typography>
                        <TextField
                            label="Address Line 1"
                            value={shippingAddress.addressLine1}
                            onChange={(e) => handleShippingAddressChange('addressLine1', e.target.value)}
                            fullWidth
                        />
                        <TextField
                            label="Address Line 2"
                            value={shippingAddress.addressLine2}
                            onChange={(e) => handleShippingAddressChange('addressLine2', e.target.value)}
                            fullWidth
                        />
                        <TextField
                            label="Address Line 3"
                            value={shippingAddress.addressLine3}
                            onChange={(e) => handleShippingAddressChange('addressLine3', e.target.value)}
                            fullWidth
                        />
                        <TextField
                            label="Address Line 4"
                            value={shippingAddress.addressLine4}
                            onChange={(e) => handleShippingAddressChange('addressLine4', e.target.value)}
                            fullWidth
                        />
                        <TextField
                            label="Postcode"
                            value={shippingAddress.postcode}
                            onChange={(e) => handleShippingAddressChange('postcode', e.target.value)}
                            fullWidth
                        />
                        <TextField
                            select
                            label="Country"
                            value={shippingAddress.country}
                            onChange={(e) => handleShippingAddressChange('country', e.target.value)}
                            disabled={loadingCountries || countries.length === 0}
                            helperText={loadingCountries ? 'Loading countries...' : undefined}
                            fullWidth
                        >
                            <MenuItem value="">
                                Select Country
                            </MenuItem>
                            {countries.map((country) => {
                                const countryValue = country.id ?? '';
                                const countryLabel = country.name ?? country.id ?? '';

                                return (
                                    <MenuItem key={countryValue} value={countryValue}>
                                        {countryLabel}
                                    </MenuItem>
                                );
                            })}
                        </TextField>
                    </Box>
                )}

                {createStep === 2 && (
                    <Box sx={{ display: 'grid', gap: 2 }}>
                        <Typography variant="subtitle1">Billing Address</Typography>
                        <FormControlLabel
                            control={(
                                <Checkbox
                                    checked={isBillingSameAsShipping}
                                    onChange={(e) => handleBillingSameAsShippingChange(e.target.checked)}
                                />
                            )}
                            label="Same as shipping"
                        />
                        <TextField
                            label="Address Line 1"
                            value={billingAddress.addressLine1}
                            onChange={(e) => setBillingAddress((prev) => ({ ...prev, addressLine1: e.target.value }))}
                            disabled={isBillingSameAsShipping}
                            fullWidth
                        />
                        <TextField
                            label="Address Line 2"
                            value={billingAddress.addressLine2}
                            onChange={(e) => setBillingAddress((prev) => ({ ...prev, addressLine2: e.target.value }))}
                            disabled={isBillingSameAsShipping}
                            fullWidth
                        />
                        <TextField
                            label="Address Line 3"
                            value={billingAddress.addressLine3}
                            onChange={(e) => setBillingAddress((prev) => ({ ...prev, addressLine3: e.target.value }))}
                            disabled={isBillingSameAsShipping}
                            fullWidth
                        />
                        <TextField
                            label="Address Line 4"
                            value={billingAddress.addressLine4}
                            onChange={(e) => setBillingAddress((prev) => ({ ...prev, addressLine4: e.target.value }))}
                            disabled={isBillingSameAsShipping}
                            fullWidth
                        />
                        <TextField
                            label="Postcode"
                            value={billingAddress.postcode}
                            onChange={(e) => setBillingAddress((prev) => ({ ...prev, postcode: e.target.value }))}
                            disabled={isBillingSameAsShipping}
                            fullWidth
                        />
                        <TextField
                            select
                            label="Country"
                            value={billingAddress.country}
                            onChange={(e) => setBillingAddress((prev) => ({ ...prev, country: e.target.value }))}
                            disabled={isBillingSameAsShipping || loadingCountries || countries.length === 0}
                            helperText={loadingCountries ? 'Loading countries...' : undefined}
                            fullWidth
                        >
                            <MenuItem value="">
                                Select Country
                            </MenuItem>
                            {countries.map((country) => {
                                const countryValue = country.id ?? '';
                                const countryLabel = country.name ?? country.id ?? '';

                                return (
                                    <MenuItem key={countryValue} value={countryValue}>
                                        {countryLabel}
                                    </MenuItem>
                                );
                            })}
                        </TextField>
                    </Box>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} disabled={creatingCustomer}>Cancel</Button>
                {createStep > 0 && (
                    <Button onClick={handleCreatePreviousStep} disabled={creatingCustomer}>
                        Back
                    </Button>
                )}
                {createStep < 2 ? (
                    <Button onClick={handleCreateNextStep} variant="contained" disabled={creatingCustomer || (createStep === 1 && countrySelectionUnavailable)}>
                        Next
                    </Button>
                ) : (
                    <Button onClick={handleCreateCustomer} variant="contained" disabled={creatingCustomer || countrySelectionUnavailable}>
                        {creatingCustomer ? 'Saving...' : 'Save Customer'}
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
};

export default CreateCustomerDialog;
