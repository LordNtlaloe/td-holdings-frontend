import { NextRequest, NextResponse } from 'next/server';
import { proxyRequest } from '@/lib/api-proxy';

interface Params {
    params: {
        inventoryId: string;
    };
}

export async function POST(request: NextRequest, { params }: Params) {
    return proxyRequest(request, `/v1/inventory/${params.inventoryId}/adjust`, params);
}