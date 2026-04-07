import { Badge } from '@/components/ui/badge';

export type PaymentMethod =
    | 'CASH'
    | 'CREDIT_CARD'
    | 'DEBIT_CARD'
    | 'BANK_TRANSFER'
    | 'MOBILE_MONEY'
    | 'CREDIT';

interface PaymentMethodBadgeProps {
    method: PaymentMethod | string;
}

const paymentMethodConfig: Record<string, { color: string; label: string }> = {
    CASH: { color: 'bg-green-100 text-green-800 hover:bg-green-100', label: 'Cash' },
    CREDIT_CARD: { color: 'bg-blue-100 text-blue-800 hover:bg-blue-100', label: 'Credit Card' },
    DEBIT_CARD: { color: 'bg-purple-100 text-purple-800 hover:bg-purple-100', label: 'Debit Card' },
    BANK_TRANSFER: { color: 'bg-orange-100 text-orange-800 hover:bg-orange-100', label: 'Bank Transfer' },
    MOBILE_MONEY: { color: 'bg-pink-100 text-pink-800 hover:bg-pink-100', label: 'Mobile Money' },
    CREDIT: { color: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100', label: 'Credit' },
};

export function PaymentMethodBadge({ method }: PaymentMethodBadgeProps) {
    const config = paymentMethodConfig[method] ?? {
        color: 'bg-gray-100 text-gray-800 hover:bg-gray-100',
        label: String(method).replace(/_/g, ' '),
    };

    return (
        <Badge className={config.color} variant="outline">
            {config.label}
        </Badge>
    );
}