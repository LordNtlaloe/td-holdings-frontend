import { NextRequest, NextResponse } from 'next/server';
import { proxyRequest } from '@/lib/api-proxy';

interface Params {
    params: {
        saleId: string;
    };
}

export async function GET(request: NextRequest, { params }: Params) {
    return proxyRequest(request, `/v1/sales/${params.saleId}`, params);
}