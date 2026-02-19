'use client';

import { Product, ProductType, ProductGrade } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { Truck, Weight, Grid3x3, MapPin, Scale, Plus, X } from "lucide-react";
import { ProductSpecs } from "@/types/pos";

interface ProductCardProps {
    product: Product;
    availability: number;
    isInCart: boolean;
    cartQuantity?: number;
    transactionType: "retail" | "wholesale" | "transfer";
    onAddToCart: (product: Product) => void;
}

const gradeColors = {
    [ProductGrade.A]: "bg-green-500/10 text-green-500 border-green-500/20",
    [ProductGrade.B]: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    [ProductGrade.C]: "bg-red-500/10 text-red-500 border-red-500/20",
};

const getProductSpecs = (product: Product): ProductSpecs => {
    if (product.type === ProductType.TIRE) {
        return {
            mainSpec: product.tireSize || "N/A",
            secondarySpec: `${product.tireUsage || "Standard"} • ${product.tireCategory || "NEW"}`,
            details: `${product.loadIndex || "-"}/${product.speedRating || "-"}`,
            icon: <Truck className="w-4 h-4" />,
        };
    }
    return {
        mainSpec: `${product.baleWeight || 0}kg`,
        secondarySpec: product.baleCategory || product.commodity || "General",
        details: product.originCountry || "Local",
        icon: <Weight className="w-4 h-4" />,
    };
};

export const ProductCard = ({
    product,
    availability,
    isInCart,
    cartQuantity,
    transactionType,
    onAddToCart,
}: ProductCardProps) => {
    const isAvailable = availability > 0;
    const specs = getProductSpecs(product);

    return (
        <Card className="overflow-hidden h-full flex flex-col">
            {/* Image */}
            <div className="relative h-40 bg-muted">
                {(product as any).imageUrl ? (
                    <Image
                        src={(product as any).imageUrl}
                        alt={product.name}
                        fill
                        className="object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        {product.type === ProductType.TIRE ? (
                            <Truck className="w-12 h-12 text-muted-foreground" />
                        ) : (
                            <Weight className="w-12 h-12 text-muted-foreground" />
                        )}
                    </div>
                )}
                <div className="absolute top-2 right-2">
                    <Badge
                        variant={isAvailable ? "default" : "destructive"}
                        className="backdrop-blur-sm"
                    >
                        {isAvailable ? `${availability} in stock` : "Out of Stock"}
                    </Badge>
                </div>
                <div className="absolute top-2 left-2">
                    <Badge
                        variant="outline"
                        className={`${gradeColors[product.grade]} backdrop-blur-sm`}
                    >
                        Grade {product.grade}
                    </Badge>
                </div>
            </div>

            {/* Info */}
            <CardContent className="p-4 flex-1 flex flex-col">
                <div className="flex items-start justify-between mb-1">
                    <h3 className="font-medium text-sm text-foreground line-clamp-2 flex-1">
                        {product.name}
                    </h3>
                    {specs.icon}
                </div>

                <div className="space-y-1 mt-2">
                    <div className="flex items-center gap-1 text-xs">
                        <Grid3x3 className="w-3 h-3 text-muted-foreground" />
                        <span className="text-muted-foreground">Size:</span>
                        <span className="text-foreground font-medium">{specs.mainSpec}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs">
                        <MapPin className="w-3 h-3 text-muted-foreground" />
                        <span className="text-muted-foreground">Type:</span>
                        <span className="text-foreground">{specs.secondarySpec}</span>
                    </div>
                    {specs.details && (
                        <div className="flex items-center gap-1 text-xs">
                            <Scale className="w-3 h-3 text-muted-foreground" />
                            <span className="text-muted-foreground">Details:</span>
                            <span className="text-foreground">{specs.details}</span>
                        </div>
                    )}
                </div>

                {/* Store-specific price if available */}
                <div className="mt-3 pt-3 border-t border-border">
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <span className="text-foreground font-bold text-lg">
                                M
                                {(
                                    (product as any).inventory?.storePrice ?? product.basePrice
                                ).toFixed(2)}
                            </span>
                            {(product as any).inventory?.storePrice &&
                                (product as any).inventory.storePrice !== product.basePrice && (
                                    <span className="text-xs text-muted-foreground ml-2 line-through">
                                        M{product.basePrice.toFixed(2)}
                                    </span>
                                )}
                        </div>
                        {transactionType === "wholesale" && (
                            <Badge variant="secondary">Wholesale</Badge>
                        )}
                    </div>

                    {isAvailable ? (
                        isInCart ? (
                            <Button
                                onClick={() => onAddToCart(product)}
                                variant="secondary"
                                className="w-full gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                Add More ({cartQuantity} in cart)
                            </Button>
                        ) : (
                            <Button onClick={() => onAddToCart(product)} className="w-full gap-2">
                                <Plus className="w-4 h-4" />
                                Add to Cart
                            </Button>
                        )
                    ) : (
                        <Button disabled variant="outline" className="w-full gap-2 cursor-not-allowed">
                            <X className="w-4 h-4" />
                            Out of Stock
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};