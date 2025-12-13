import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.BACKEND_URL || 'http://localhost:4000/api';

export async function proxyRequest(
    request: NextRequest,
    backendPath: string,
    params?: { [key: string]: string },
    methodOverride?: string
) {
    try {
        // Replace dynamic segments in path
        let finalPath = backendPath;
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                finalPath = finalPath.replace(`[${key}]`, value);
            });
        }

        const method = methodOverride || request.method;
        const url = new URL(request.url);

        // Log incoming request
        console.log(`Frontend API: ${method} ${finalPath}`);

        // Construct backend URL with query params
        const searchParams = url.searchParams.toString();
        const queryString = searchParams ? `?${searchParams}` : '';
        const backendUrl = `${API_BASE_URL}${finalPath}${queryString}`;

        // Prepare headers
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };

        // Forward authorization header if present
        const authHeader = request.headers.get('authorization');
        if (authHeader) {
            headers['Authorization'] = authHeader;
        }

        // Forward other important headers
        const forwardHeaders = ['x-request-id', 'x-correlation-id', 'user-agent', 'accept-language'];
        forwardHeaders.forEach(header => {
            const value = request.headers.get(header);
            if (value) {
                headers[header] = value;
            }
        });

        // Prepare request body
        let body = null;
        if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
            try {
                const contentType = request.headers.get('content-type') || '';
                if (contentType.includes('application/json')) {
                    body = await request.json();
                } else if (contentType.includes('multipart/form-data')) {
                    const formData = await request.formData();
                    body = formData;
                    headers['Content-Type'] = contentType;
                } else {
                    body = await request.text();
                }
            } catch (error) {
                // No body or parsing error
            }
        }

        // Forward request to backend
        const response = await fetch(backendUrl, {
            method,
            headers,
            body: body ? (body instanceof FormData ? body : JSON.stringify(body)) : undefined,
            credentials: 'include',
            cache: 'no-store',
        });

        console.log(`Backend response: ${response.status} ${response.statusText}`);

        // Handle response
        const responseHeaders: Record<string, string> = {};

        // Copy response headers
        response.headers.forEach((value, key) => {
            if (!key.toLowerCase().startsWith('set-cookie')) {
                responseHeaders[key] = value;
            }
        });

        // Handle different response types
        let data;
        const contentType = response.headers.get('content-type') || '';

        if (contentType.includes('application/json')) {
            data = await response.json();
        } else if (contentType.includes('text/')) {
            data = await response.text();
        } else if (contentType.includes('application/pdf')) {
            data = await response.blob();
        } else {
            data = await response.text();
        }

        // Create Next.js response
        const nextResponse = NextResponse.json(data, {
            status: response.status,
            headers: responseHeaders
        });

        // Handle cookies
        const setCookieHeaders = response.headers.getSetCookie();
        if (setCookieHeaders && setCookieHeaders.length > 0) {
            const isProduction = process.env.NODE_ENV === 'production';

            setCookieHeaders.forEach(cookie => {
                const [cookieContent, ...options] = cookie.split(';').map(opt => opt.trim());
                const [name, ...valueParts] = cookieContent.split('=');
                const value = valueParts.join('=');

                const cookieOpts: any = {
                    name,
                    value,
                    httpOnly: true,
                    secure: isProduction,
                    sameSite: isProduction ? 'strict' : 'lax',
                    path: '/',
                };

                // Parse cookie options from backend
                options.forEach(option => {
                    const [optName, optValue] = option.split('=').map(s => s.trim());
                    const optNameLower = optName.toLowerCase();

                    switch (optNameLower) {
                        case 'max-age':
                            const maxAge = parseInt(optValue, 10);
                            if (!isNaN(maxAge)) cookieOpts.maxAge = maxAge;
                            break;
                        case 'expires':
                            cookieOpts.expires = new Date(optValue);
                            break;
                        case 'path':
                            cookieOpts.path = optValue;
                            break;
                        case 'domain':
                            cookieOpts.domain = optValue;
                            break;
                        case 'secure':
                            cookieOpts.secure = true;
                            break;
                        case 'httponly':
                            cookieOpts.httpOnly = true;
                            break;
                        case 'samesite':
                            cookieOpts.sameSite = optValue as 'strict' | 'lax' | 'none';
                            break;
                    }
                });

                // Override security for development
                if (!isProduction) {
                    cookieOpts.secure = false;
                    cookieOpts.sameSite = 'lax';
                }

                nextResponse.cookies.set(cookieOpts);
            });

            console.log(`Forwarded ${setCookieHeaders.length} cookies`);
        }

        return nextResponse;

    } catch (error) {
        console.error(`Proxy error for ${backendPath}:`, error);
        return NextResponse.json(
            {
                error: 'ProxyError',
                message: 'Failed to communicate with backend service',
                details: error instanceof Error ? error.message : 'Unknown error',
                path: backendPath
            },
            { status: 502 }
        );
    }
}