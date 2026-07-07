import { cookies } from 'next/headers';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

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

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };

    // If options.headers is provided, we need to merge it carefully
    if (options.headers) {
        if (options.headers instanceof Headers) {
            options.headers.forEach((value, key) => {
                headers[key] = value;
            });
        } else if (Array.isArray(options.headers)) {
            options.headers.forEach(([key, value]) => {
                headers[key] = value;
            });
        } else {
            Object.assign(headers, options.headers);
        }
    }

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers,
        });

        // Some endpoints might return empty body (e.g., 204 No Content)
        if (response.status === 204) {
            return { data: {} as T };
        }

        const data = await response.json();
        
        if (!response.ok) {
            // Transform non-2xx responses into our standard error format if not already
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
    } catch (error: any) {
        return {
            error: {
                code: 'NETWORK_ERROR',
                message: error.message || 'Failed to connect to the server',
            }
        };
    }
}
