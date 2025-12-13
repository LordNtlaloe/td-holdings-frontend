import { NextRequest, NextResponse } from 'next/server';
import { proxyRequest } from '@/lib/api-proxy';

interface Params {
    params: {
        employeeId: string;
    };
}

export async function GET(request: NextRequest, { params }: Params) {
    return proxyRequest(request, `/v1/employees/${params.employeeId}/performance`, params);
}