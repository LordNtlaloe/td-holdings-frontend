import { NextRequest, NextResponse } from 'next/server';
import { proxyRequest } from '@/lib/api-proxy';

interface Params {
    params: {
        userId: string;
    };
}

export async function POST(request: NextRequest, { params }: Params) {
    return proxyRequest(request, `/v1/auth/logout-all/${params.userId}`, params);
}