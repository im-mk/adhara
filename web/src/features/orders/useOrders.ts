import { useEffect, useRef, useState } from 'react';
import type { SelectChangeEvent } from '@mui/material/Select';
import { OrderListResponse, OrderStatus, OrdersService } from '../../api';
import { OrderStatusesService } from '../../api/services/OrderStatusesService';

interface UseOrdersProps {
    initialPage?: number;
    initialRowsPerPage?: number;
}

export const useOrders = ({ initialPage = 0, initialRowsPerPage = 10 }: UseOrdersProps = {}) => {
    const [orders, setOrders] = useState<OrderListResponse[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [totalCount, setTotalCount] = useState<number>(0);
    const [page, setPage] = useState<number>(initialPage);
    const [rowsPerPage, setRowsPerPage] = useState<number>(initialRowsPerPage);
    const [orderStatuses, setOrderStatuses] = useState<OrderStatus[]>([]);

    const [orderNumberInput, setOrderNumberInput] = useState<string>('');
    const [orderNumber, setOrderNumber] = useState<string | undefined>(undefined);
    const [orderStatusId, setOrderStatusId] = useState<number | undefined>(undefined);
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');

    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        OrderStatusesService.getAll()
            .then(setOrderStatuses)
            .catch(() => {
                // Non-critical, page can still function without status labels.
            });
    }, []);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setLoading(true);
                setError(null);

                const sd = startDate || undefined;
                const ed = endDate || undefined;
                const orderPage = await OrdersService.getListPaged(
                    page + 1,
                    rowsPerPage,
                    sd,
                    ed,
                    undefined,
                    orderNumber,
                    orderStatusId,
                );

                setOrders(orderPage.items);
                setTotalCount(orderPage.totalCount);
            } catch {
                setError('Could not fetch orders');
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [page, rowsPerPage, orderNumber, orderStatusId, startDate, endDate]);

    useEffect(() => {
        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };
    }, []);

    const statusName = (id?: number) =>
        orderStatuses.find((s) => s.id === id)?.statusName ?? (id != null ? String(id) : '—');

    const handleOrderNumberChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setOrderNumberInput(value);

        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        debounceRef.current = setTimeout(() => {
            setOrderNumber(value.trim() || undefined);
            setPage(0);
        }, 400);
    };

    const handleStatusChange = (event: SelectChangeEvent<string>) => {
        const value = event.target.value;
        setOrderStatusId(value === '' ? undefined : Number(value));
        setPage(0);
    };

    const handleStartDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setStartDate(event.target.value);
        setPage(0);
    };

    const handleEndDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setEndDate(event.target.value);
        setPage(0);
    };

    const handleChangePage = (_event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    return {
        orders,
        loading,
        error,
        totalCount,
        page,
        rowsPerPage,
        orderStatuses,
        orderNumberInput,
        orderStatusId,
        startDate,
        endDate,
        statusName,
        handleOrderNumberChange,
        handleStatusChange,
        handleStartDateChange,
        handleEndDateChange,
        handleChangePage,
        handleChangeRowsPerPage,
    };
};
