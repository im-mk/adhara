import type { LoginRequest } from '../models/auth/LoginRequest';
import type { LoginResponse } from '../models/auth/LoginResponse';
import type { RefreshRequest } from '../models/auth/RefreshRequest';
import type { RefreshResponse } from '../models/auth/RefreshResponse';
import { request } from './httpClient';

export class AuthService {
    public static login(payload: LoginRequest): Promise<LoginResponse> {
        return request<LoginResponse>('/login', {
            method: 'POST',
            body: payload,
        });
    }

    public static refresh(payload: RefreshRequest): Promise<RefreshResponse> {
        return request<RefreshResponse>('/refresh', {
            method: 'POST',
            body: payload,
        });
    }
}