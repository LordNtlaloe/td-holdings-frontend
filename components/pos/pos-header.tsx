'use client';

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Store, Users, ShoppingCart, Package, Truck, Calendar, Bell, ChevronDown } from "lucide-react";
import { Store as StoreType, Employee } from "@/types";

interface POSHeaderProps {
    store: StoreType | null;
    employee: Employee | null;
    user: any;
    transactionType: "retail" | "wholesale" | "transfer";
    onTransactionTypeChange: (type: "retail" | "wholesale" | "transfer") => void;
}

// Helper function to get store initials
const getStoreInitials = (storeName: string): string => {
    if (!storeName) return "ST";

    const words = storeName.trim().split(/\s+/);
    if (words.length === 1) {
        // If single word, take first two letters (or just first if it's short)
        return words[0].substring(0, Math.min(2, words[0].length)).toUpperCase();
    }

    // If multiple words, take first letter of first two words
    return (words[0][0] + words[1][0]).toUpperCase();
};

export const POSHeader = ({
    store,
    employee,
    user,
    transactionType,
    onTransactionTypeChange,
}: POSHeaderProps) => {
    return (
        <header className="h-16 bg-card border-b border-border px-6 flex items-center justify-between">
            <div className="flex items-center gap-8">
                <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10 bg-primary/10">
                        <AvatarFallback className="text-primary font-medium">
                            {store ? getStoreInitials(store.name) : "ST"}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <h1 className="text-foreground font-semibold text-xs">
                            {store?.name || "Select Store"}
                        </h1>
                    </div>
                </div>

                {/* Store badge */}
                <div className="flex items-center gap-3">
                    {store && (
                        <Badge variant="outline" className="px-3 py-1 gap-2">
                            <Store className="w-3 h-3" />
                            <span>{store.name}</span>
                            {store.isMainStore && (
                                <span className="text-xs text-muted-foreground">(Main)</span>
                            )}
                        </Badge>
                    )}

                    {/* Employee badge */}
                    {employee && (
                        <Badge variant="secondary" className="px-3 py-1 gap-2">
                            <Users className="w-3 h-3" />
                            <span>
                                {employee.user?.firstName ?? user?.firstName}{" "}
                                {employee.user?.lastName ?? user?.lastName}
                            </span>
                        </Badge>
                    )}
                </div>

                {/* Transaction Type */}
                <Tabs
                    value={transactionType}
                    onValueChange={(v) => onTransactionTypeChange(v as typeof transactionType)}
                    className="w-auto"
                >
                    <TabsList>
                        <TabsTrigger value="retail" className="gap-2">
                            <ShoppingCart className="w-4 h-4" />
                            Retail
                        </TabsTrigger>
                        <TabsTrigger value="wholesale" className="gap-2">
                            <Package className="w-4 h-4" />
                            Wholesale
                        </TabsTrigger>
                        <TabsTrigger value="transfer" className="gap-2">
                            <Truck className="w-4 h-4" />
                            Transfer
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <Calendar className="w-4 h-4" />
                    <span>
                        {new Date().toLocaleDateString("en-US", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                        })}
                    </span>
                </div>
                <Button variant="ghost" size="icon" className="text-muted-foreground">
                    <Bell className="w-5 h-5" />
                </Button>
                <div className="flex items-center gap-3">
                    <span className="text-foreground text-sm font-medium">
                        {user?.firstName} {user?.lastName}
                    </span>
                    <Avatar className="w-8 h-8 bg-primary">
                        <AvatarFallback className="text-primary-foreground">
                            {user?.firstName?.[0]}{user?.lastName?.[0]}
                        </AvatarFallback>
                    </Avatar>
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </div>
            </div>
        </header>
    );
};