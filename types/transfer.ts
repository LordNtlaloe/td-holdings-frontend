export enum TransferStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED',
    REJECTED = 'REJECTED'
}

export interface ProductTransfer {
    id: string;
    productId: string;
    product: {
        id: string;
        name: string;
        type: string;
        grade: string;
    };
    fromStoreId: string;
    fromStore: {
        id: string;
        name: string;
        location: string;
    };
    toStoreId: string;
    toStore: {
        id: string;
        name: string;
        location: string;
    };
    quantity: number;
    status: TransferStatus;
    reason?: string;
    notes?: string;
    initiatedById: string;
    initiatedBy: {
        id: string;
        name: string;
    };
    approvedById?: string;
    approvedBy?: {
        id: string;
        name: string;
    };
    receivedById?: string;
    receivedBy?: {
        id: string;
        name: string;
    };
    createdAt: string;
    updatedAt: string;
    approvedAt?: string;
    completedAt?: string;
    cancelledAt?: string;
}

export interface CreateTransferFormValues {
    productId: string;
    fromStoreId: string;
    toStoreId: string;
    quantity: number;
    reason?: string;
    notes?: string;
}

export interface UpdateTransferFormValues {
    status?: TransferStatus;
    reason?: string;
    notes?: string;
}

export interface TransferFilters {
    productId?: string;
    fromStoreId?: string;
    toStoreId?: string;
    status?: TransferStatus;
    initiatedBy?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface PaginatedTransfersResponse {
    transfers: ProductTransfer[];
    total: number;
    page: number;
    totalPages: number;
}