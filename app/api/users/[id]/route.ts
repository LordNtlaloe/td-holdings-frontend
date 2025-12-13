import { NextRequest, NextResponse } from 'next/server';
import { proxyRequest } from '@/lib/api-proxy';

interface Params {
    params: {
        id: string;
    };
}

// GET /api/v1/users/[id] - Get user by ID
export async function GET(request: NextRequest, { params }: Params) {
    return proxyRequest(request, `/v1/users/${params.id}`);
}

// PUT /api/v1/users/[id] - Update user
export async function PUT(request: NextRequest, { params }: Params) {
    return proxyRequest(request, `/v1/users/${params.id}`);
}

// DELETE /api/v1/users/[id] - Delete user
export async function DELETE(request: NextRequest, { params }: Params) {
    return proxyRequest(request, `/v1/users/${params.id}`);
}

// PATCH /api/v1/users/[id] - Partial update
export async function PATCH(request: NextRequest, { params }: Params) {
    return proxyRequest(request, `/v1/users/${params.id}`);
}