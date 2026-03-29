import React, { useCallback, useMemo, useState } from 'react';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import { NotificationContext, NotificationSeverity } from './notification-context';

type NotificationItem = {
    id: number;
    message: string;
    severity: NotificationSeverity;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [items, setItems] = useState<NotificationItem[]>([]);

    const notify = useCallback((message: string, severity: NotificationSeverity = 'success') => {
        setItems((prev) => [
            ...prev,
            {
                id: Date.now() + Math.floor(Math.random() * 1000),
                message,
                severity,
            },
        ]);
    }, []);

    const remove = useCallback((id: number) => {
        setItems((prev) => prev.filter((item) => item.id !== id));
    }, []);

    const contextValue = useMemo(() => ({ notify }), [notify]);

    return (
        <NotificationContext.Provider value={contextValue}>
            {children}
            {items.map((item, index) => (
                <Snackbar
                    key={item.id}
                    open
                    autoHideDuration={3500}
                    onClose={() => remove(item.id)}
                    anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                    sx={{ mt: `${index * 64}px` }}
                >
                    <Alert
                        onClose={() => remove(item.id)}
                        severity={item.severity}
                        variant="filled"
                        sx={{ width: '100%' }}
                    >
                        {item.message}
                    </Alert>
                </Snackbar>
            ))}
        </NotificationContext.Provider>
    );
};
