'use client';

import { CartItem } from "@/types/pos";
import { ProductType } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Truck, Weight, Minus, Plus, Trash2 } from "lucide-react";

interface CartItemProps {
    item: CartItem;
    onIncrease: (productId: string) => void;
    onDecrease: (productId: string) => void;
    onRemove: (productId: string) => void;
}

const getProductSpecs = (product: any) => {
    if (product.type === ProductType.TIRE) {
        return {
            mainSpec: product.tireSize || "N/A",
            secondarySpec: `${product.tireUsage || "Standard"} • ${product.tireCategory || "NEW"}`,
        };
    }
    return {
        mainSpec: `${product.baleWeight || 0}kg`,
        secondarySpec: product.baleCategory || product.commodity || "General",
    };
};

export const CartItemComponent = ({
    item,
    onIncrease,
    onDecrease,
    onRemove,
}: CartItemProps) => {
    const specs = getProductSpecs(item.product);

    return (
        <div className="flex gap-3">
            <Avatar className="w-12 h-12 rounded-lg bg-muted">
                <AvatarFallback className="rounded-lg">
                    {item.product.type === ProductType.TIRE ? (
                        <Truck className="w-6 h-6 text-muted-foreground" />
                    ) : (
                        <Weight className="w-6 h-6 text-muted-foreground" />
                    )}
                </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                    <h4 className="text-foreground font-medium text-sm truncate mb-1">
                        {item.product.name}
                    </h4>
                    <Badge variant="secondary" className="ml-2 text-xs">
                        x{item.quantity}
                    </Badge>
                </div>
                <div className="space-y-1">
                    <p className="text-muted-foreground text-xs">
                        {specs.mainSpec} • {specs.secondarySpec}
                    </p>
                    <div className="flex items-center justify-between">
                        <span className="text-foreground font-semibold text-sm">
                            M{((item.unitPrice ?? item.product.basePrice) * item.quantity).toFixed(2)}
                        </span>
                        <div className="flex items-center gap-1">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => onDecrease(item.product.id)}
                            >
                                <Minus className="w-3 h-3" />
                            </Button>
                            <span className="text-xs w-6 text-center">{item.quantity}</span>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => onIncrease(item.product.id)}
                            >
                                <Plus className="w-3 h-3" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={() => onRemove(item.product.id)}
            >
                <Trash2 className="w-4 h-4" />
            </Button>
        </div>
    );
};