import { NextRequest, NextResponse } from 'next/server';
import { proxyRequest } from '@/lib/api-proxy';

// GET /api/v1/users - Get all users
export async function GET(request: NextRequest) {
    return proxyRequest(request, '/v1/users');
}

// POST /api/v1/users - Create user
export async function POST(request: NextRequest) {
    return proxyRequest(request, '/v1/users');
}