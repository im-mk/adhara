export const AUTH_TOKEN_STORAGE_KEY = 'authToken';
export const REFRESH_TOKEN_STORAGE_KEY = 'refreshToken';
export const AUTH_STATE_CHANGE_EVENT = 'auth-state-changed';
export const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8020';

import { AuthService } from './api/services/AuthService';

let refreshInFlight: Promise<string | null> | null = null;

export const getAccessToken = (): string | null => localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);

export const getRefreshToken = (): string | null => localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);

export const isAuthenticated = (): boolean => Boolean(getAccessToken());

export const setAuthSession = (token: string, refreshToken?: string): void => {
    localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);

    if (refreshToken) {
        localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, refreshToken);
    } else {
        localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
    }

    window.dispatchEvent(new Event(AUTH_STATE_CHANGE_EVENT));
};

export const clearAuthSession = (): void => {
    localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
    localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
    window.dispatchEvent(new Event(AUTH_STATE_CHANGE_EVENT));
};

export const refreshAccessToken = async (): Promise<string | null> => {
    const currentRefreshToken = getRefreshToken();
    if (!currentRefreshToken) {
        return null;
    }

    if (refreshInFlight) {
        return refreshInFlight;
    }

    refreshInFlight = (async () => {
        try {
            const data = await AuthService.refresh({ refresh_token: currentRefreshToken });
            if (!data.token) {
                return null;
            }

            setAuthSession(data.token, data.refresh_token ?? currentRefreshToken);
            return data.token;
        } catch {
            return null;
        } finally {
            refreshInFlight = null;
        }
    })();

    return refreshInFlight;
};