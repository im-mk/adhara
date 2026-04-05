import { API_BASE_URL, clearAuthSession, getAccessToken, refreshAccessToken } from '../../auth.ts';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

type RequestOptions = {
    method?: HttpMethod;
    body?: unknown;
    query?: Record<string, string | number | undefined>;
};

const buildUrl = (path: string, query?: Record<string, string | number | undefined>): string => {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    const url = new URL(`${API_BASE_URL}${normalizedPath}`);

    if (query) {
        Object.entries(query).forEach(([key, value]) => {
            if (value !== undefined && value !== null && `${value}` !== '') {
                url.searchParams.set(key, String(value));
            }
        });
    }

    return url.toString();
};

const parseJson = async <T>(response: Response): Promise<T | null> => {
    try {
        return await response.json() as T;
    } catch {
        return null;
    }
};

const requestRaw = async (path: string, options: RequestOptions = {}, token?: string | null): Promise<Response> => {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(buildUrl(path, options.query), {
        method: options.method ?? 'GET',
        headers,
        body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    });

    return response;
};

export const request = async <T>(path: string, options: RequestOptions = {}): Promise<T> => {
    const response = await requestRaw(path, options);
    if (!response.ok) {
        const errorPayload = await parseJson<{ error?: string }>(response);
        throw new Error(errorPayload?.error ?? `Request failed with status ${response.status}`);
    }

    if (response.status === 204) {
        return undefined as T;
    }

    const payload = await parseJson<T>(response);
    return (payload ?? undefined) as T;
};

export const requestWithAuth = async <T>(path: string, options: RequestOptions = {}): Promise<T> => {
    const firstResponse = await requestRaw(path, options, getAccessToken());

    if (firstResponse.status !== 401) {
        if (!firstResponse.ok) {
            const errorPayload = await parseJson<{ error?: string }>(firstResponse);
            throw new Error(errorPayload?.error ?? `Request failed with status ${firstResponse.status}`);
        }

        if (firstResponse.status === 204) {
            return undefined as T;
        }

        const payload = await parseJson<T>(firstResponse);
        return (payload ?? undefined) as T;
    }

    const refreshedToken = await refreshAccessToken();
    if (!refreshedToken) {
        clearAuthSession();

        if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
            window.location.assign('/login');
        }

        throw new Error('Session expired');
    }

    const retryResponse = await requestRaw(path, options, refreshedToken);
    if (!retryResponse.ok) {
        const errorPayload = await parseJson<{ error?: string }>(retryResponse);
        throw new Error(errorPayload?.error ?? `Request failed with status ${retryResponse.status}`);
    }

    if (retryResponse.status === 204) {
        return undefined as T;
    }

    const payload = await parseJson<T>(retryResponse);
    return (payload ?? undefined) as T;
};