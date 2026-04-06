import { useEffect, useMemo, useState } from 'react';
import { ProductsService, type Product } from '../../api';

interface UseProductsProps {
    initialPage?: number;
    initialRowsPerPage?: number;
}

export const useProducts = ({ initialPage = 0, initialRowsPerPage = 10 }: UseProductsProps = {}) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [nameQuery, setNameQuery] = useState<string>('');
    const [page, setPage] = useState<number>(initialPage);
    const [rowsPerPage, setRowsPerPage] = useState<number>(initialRowsPerPage);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await ProductsService.getAllProducts(nameQuery);
                setProducts(data || []);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Could not load products');
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [nameQuery]);

    const filteredProducts = useMemo(() => products, [products]);

    const pagedProducts = useMemo(
        () => filteredProducts.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
        [filteredProducts, page, rowsPerPage],
    );

    useEffect(() => {
        setPage(0);
    }, [nameQuery]);

    const handleChangePage = (_event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    return {
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
    };
};
