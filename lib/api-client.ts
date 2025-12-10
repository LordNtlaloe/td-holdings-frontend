// lib/api-client.ts
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4000';

export interface ApiError {
    error: string;
    code?: string;
    details?: any;
}

export async function forwardRequest(
    path: string,
    method: string,
    request: Request,
    options?: {
        headers?: Record<string, string>;
        body?: any;
    }
): Promise<Response> {
    try {
        const url = `${BACKEND_URL}${path}`;

        // Get the original request headers
        const headers = new Headers(request.headers);

        // Remove headers that shouldn't be forwarded
        headers.delete('host');
        headers.delete('content-length');

        // Add custom headers if provided
        if (options?.headers) {
            Object.entries(options.headers).forEach(([key, value]) => {
                headers.set(key, value);
            });
        }

        // Forward the request to the backend
        const response = await fetch(url, {
            method,
            headers,
            body: options?.body || request.body,
            // @ts-ignore - duplex is needed for body streaming
            duplex: 'half'
        });

        return response;
    } catch (error) {
        console.error('Backend request failed:', error);
        return new Response(
            JSON.stringify({
                error: 'Backend service unavailable',
                code: 'BACKEND_ERROR'
            }),
            {
                status: 503,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
}

export function getTokenFromRequest(request: Request): string | null {
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.substring(7);
    }
    return null;
}