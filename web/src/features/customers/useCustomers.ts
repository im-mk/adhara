// hooks/useCustomers.ts
import { useEffect, useState } from 'react';
import { Customer, CustomersService } from './../../api';

interface UseCustomersProps {
    initialPage?: number;
    initialRowsPerPage?: number;
}

export const useCustomers = ({ initialPage = 0, initialRowsPerPage = 10 }: UseCustomersProps = {}) => {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [totalCount, setTotalCount] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [nameQuery, setNameQuery] = useState<string>('');
    const [postcodeQuery, setPostcodeQuery] = useState<string>('');
    const [page, setPage] = useState<number>(initialPage);
    const [rowsPerPage, setRowsPerPage] = useState<number>(initialRowsPerPage);

    // Fetch customers with filters and pagination in one request.
    useEffect(() => {
        const fetchCustomers = async () => {
            setLoading(true);
            setError(null);

            try {
                const result = await CustomersService.getCustomersPaged(page + 1, rowsPerPage, {
                    name: nameQuery,
                    postcode: postcodeQuery,
                });

                setCustomers(result.items);
                setTotalCount(result.totalCount);
            } catch {
                setError('Could not fetch customers');
            } finally {
                setLoading(false);
            }
        };

        fetchCustomers();
    }, [nameQuery, postcodeQuery, page, rowsPerPage]);

    // Reset page when filters change
    useEffect(() => {
        setPage(0);
    }, [nameQuery, postcodeQuery]);

    const handlePageChange = (_event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    return {
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
    };
};