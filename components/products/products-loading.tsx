import { RefreshCw } from 'lucide-react';

interface ProductLoadingProps {
    message?: string;
}

export function ProductLoading({ message = "Loading products..." }: ProductLoadingProps) {
    return (
        <div className="flex items-center justify-center h-96">
            <div className="text-center">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                <p className="mt-2 text-muted-foreground">{message}</p>
            </div>
        </div>
    );
}