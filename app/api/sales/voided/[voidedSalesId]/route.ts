import { NextRequest, NextResponse } from 'next/server';
import { proxyRequest } from '@/lib/api-proxy';

interface Params {
    params: {
        voidedSaleId: string;
    };
}

export async function GET(request: NextRequest, { params }: Params) {
    return proxyRequest(request, `/v1/sales/voided/${params.voidedSaleId}`, params);
}