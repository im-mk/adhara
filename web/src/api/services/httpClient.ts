import { API_BASE_URL, clearAuthSession, getAccessToken, refreshAccessToken } from '../../auth.ts';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

type RequestOptions = {
    method?: HttpMethod;
    body?: unknown;
    query?: Record<string, string | number | undefined>;
    requestId?: string;
};

export type ResponseWithMeta<T> = {
    data: T;
    headers: Headers;
    requestId: string;
};

const REQUEST_ID_HEADER = 'X-Request-Id';

const generateRequestId = (): string => {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
    }

    return `web-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const logRequest = (method: HttpMethod, url: string, status: number, durationMs: number, requestId: string): void => {
    const duration = Number(durationMs.toFixed(1));
    console.info(`[http] ${method} ${url} -> ${status} (${duration} ms) requestId=${requestId}`);
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

const requestRaw = async (
    path: string,
    options: RequestOptions = {},
    token?: string | null,
    requestId?: string,
): Promise<Response> => {
    const effectiveRequestId = requestId ?? options.requestId ?? generateRequestId();
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        [REQUEST_ID_HEADER]: effectiveRequestId,
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const requestUrl = buildUrl(path, options.query);
    const method = options.method ?? 'GET';
    const startedAt = performance.now();

    const response = await fetch(requestUrl, {
        method: options.method ?? 'GET',
        headers,
        body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    });

    logRequest(method, requestUrl, response.status, performance.now() - startedAt, effectiveRequestId);

    return response;
};

export const request = async <T>(path: string, options: RequestOptions = {}): Promise<T> => {
    const requestId = options.requestId ?? generateRequestId();
    const response = await requestRaw(path, options, undefined, requestId);
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
    const result = await requestWithAuthResponse<T>(path, options);
    return result.data;
};

export const requestWithAuthResponse = async <T>(path: string, options: RequestOptions = {}): Promise<ResponseWithMeta<T>> => {
    const requestId = options.requestId ?? generateRequestId();
    const firstResponse = await requestRaw(path, options, getAccessToken(), requestId);

    if (firstResponse.status !== 401) {
        if (!firstResponse.ok) {
            const errorPayload = await parseJson<{ error?: string }>(firstResponse);
            throw new Error(errorPayload?.error ?? `Request failed with status ${firstResponse.status}`);
        }

        if (firstResponse.status === 204) {
            return {
                data: undefined as T,
                headers: firstResponse.headers,
                requestId,
            };
        }

        const payload = await parseJson<T>(firstResponse);
        return {
            data: (payload ?? undefined) as T,
            headers: firstResponse.headers,
            requestId,
        };
    }

    const refreshedToken = await refreshAccessToken();
    if (!refreshedToken) {
        clearAuthSession();

        if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
            window.location.assign('/login');
        }

        throw new Error('Session expired');
    }

    const retryResponse = await requestRaw(path, options, refreshedToken, requestId);
    if (!retryResponse.ok) {
        const errorPayload = await parseJson<{ error?: string }>(retryResponse);
        throw new Error(errorPayload?.error ?? `Request failed with status ${retryResponse.status}`);
    }

    if (retryResponse.status === 204) {
        return {
            data: undefined as T,
            headers: retryResponse.headers,
            requestId,
        };
    }

    const payload = await parseJson<T>(retryResponse);
    return {
        data: (payload ?? undefined) as T,
        headers: retryResponse.headers,
        requestId,
    };
};