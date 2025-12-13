import { NextRequest, NextResponse } from 'next/server';
import { proxyRequest } from '@/lib/api-proxy';

interface Params {
    params: {
        tokenId: string;
    };
}

export async function DELETE(request: NextRequest, { params }: Params) {
    return proxyRequest(request, `/v1/auth/sessions/${params.tokenId}`, params);
}