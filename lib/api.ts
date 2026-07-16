import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation'

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface ApiResponse<T = any> {
    data?: T;
    meta?: any;
    error?: {
        code: string;
        message: string;
    };
}

/**
 * Core fetch wrapper for Server Components and Server Actions.
 * Automatically injects the JWT token from HttpOnly cookies.
 */
export async function fetchAPI<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<ApiResponse<T>> {
    const cookieStore = await cookies();
    const token = cookieStore.get('jwt')?.value;

    const reqHeaders = new Headers(options.headers);
    reqHeaders.set('Content-Type', 'application/json');

    if (token) {
        reqHeaders.set('Authorization', `Bearer ${token}`);
    }

    const headerStore = await headers();
    const forwardedFor = headerStore.get('x-forwarded-for');
    const realIp = headerStore.get('x-real-ip');

    if (forwardedFor) reqHeaders.set('x-forwarded-for', forwardedFor);
    if (realIp) reqHeaders.set('x-real-ip', realIp);

    let response: Response;

    try {
        response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers: reqHeaders,
        });

    } catch (error: any) {
        return {
            error: {
                code: 'NETWORK_ERROR',
                message: error.message || 'Failed to connect to the server',
            }
        };
    }

    if (response.status === 401) {
        if (!endpoint.includes('/login')) {
            cookieStore.delete('jwt');
            redirect('/login?reason=expired');
        }
    }

    if (response.status === 204) {
        return { data: {} as T };
    }

    try {
        const data = await response.json();

        if (!response.ok) {
            if (!data.error) {
                return {
                    error: {
                        code: `HTTP_${response.status}`,
                        message: data.message || response.statusText,
                    }
                };
            }
            return data;
        }

        return data;
    } catch (error) {
        return {
            error: {
                code: 'PARSE_ERROR',
                message: 'Invalid JSON response from server',
            }
        };
    }
}
