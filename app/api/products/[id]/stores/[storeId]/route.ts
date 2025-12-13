import { NextRequest, NextResponse } from 'next/server';
import { proxyRequest } from '@/lib/api-proxy';

interface Params {
    params: {
        productId: string;
        storeId: string;
    };
}

export async function DELETE(request: NextRequest, { params }: Params) {
    return proxyRequest(request, `/v1/products/${params.productId}/stores/${params.storeId}`, params);
}