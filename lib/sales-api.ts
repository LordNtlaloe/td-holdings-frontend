// lib/sales-api.ts

export interface CreateSaleData {
    items: Array<{
        productId: string;
        quantity: number;
        price: number;
    }>;
    customerInfo?: {
        name?: string;
        email?: string;
        phone?: string;
    };
    paymentMethod: string;
    amountReceived?: number;
    subtotal?: number;
    tax?: number;
    total: number;
    employeeId?: string;
}

export interface SaleResponse {
    success: boolean;
    message?: string;
    saleId?: string;
    sale?: any;
    receipt?: any;
    printResult?: any;
    error?: string;
}

export async function createSale(saleData: CreateSaleData): Promise<SaleResponse> {
    try {
        console.log('Creating sale:', saleData);

        const response = await fetch('/api/sales', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(saleData),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Failed to create sale:', data);
            return {
                success: false,
                error: data.error || data.message || 'Failed to create sale',
            };
        }

        return {
            success: true,
            ...data
        };
    } catch (error: any) {
        console.error('Error creating sale:', error);
        return {
            success: false,
            error: error.message || 'Network error',
        };
    }
}

export async function printReceipt(receiptData: any): Promise<{
    success: boolean;
    message?: string;
    error?: string;
}> {
    try {
        console.log('Printing receipt:', receiptData);

        const response = await fetch('/api/print', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(receiptData),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Failed to print receipt:', data);
            return {
                success: false,
                error: data.error || 'Failed to print receipt',
            };
        }

        return {
            success: true,
            ...data
        };
    } catch (error: any) {
        console.error('Error printing receipt:', error);
        return {
            success: false,
            error: error.message || 'Network error',
        };
    }
}