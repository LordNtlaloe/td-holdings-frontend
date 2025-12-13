import { NextRequest, NextResponse } from 'next/server';
import { proxyRequest } from '@/lib/api-proxy';

interface Params {
    params: {
        productId: string;
    };
}

export async function GET(request: NextRequest, { params }: Params) {
    return proxyRequest(request, `/v1/inventory/product/${params.productId}/across-stores`, params);
}