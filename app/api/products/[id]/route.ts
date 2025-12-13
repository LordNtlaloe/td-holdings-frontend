import { NextRequest, NextResponse } from 'next/server';
import { proxyRequest } from '@/lib/api-proxy';

interface Params {
    params: {
        productId: string;
    };
}

export async function GET(request: NextRequest, { params }: Params) {
    return proxyRequest(request, `/v1/products/${params.productId}`, params);
}

export async function PUT(request: NextRequest, { params }: Params) {
    return proxyRequest(request, `/v1/products/${params.productId}`, params);
}

export async function DELETE(request: NextRequest, { params }: Params) {
    return proxyRequest(request, `/v1/products/${params.productId}`, params);
}