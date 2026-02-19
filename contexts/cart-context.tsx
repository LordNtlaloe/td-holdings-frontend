"use client"
import { CartItem, Product, Store } from '@/types';
import { Employee } from '@/types';
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { toast } from 'sonner';

type DiscountType = {
    type: 'percentage' | 'fixed';
    value: number;
} | null;

type PosContextType = {
    cart: CartItem[];
    discount: DiscountType;
    employee: Employee | null;
    store: Store | null;
    addToCart: (product: Product) => void;
    removeFromCart: (productId: string) => void;
    increaseQuantity: (productId: string) => void;
    decreaseQuantity: (productId: string) => void;
    clearCart: () => void;
    openPaymentDialog: () => void;
    closePaymentDialog: () => void;
    isPaymentDialogVisible: boolean;
    applyDiscount: (discount: DiscountType) => void;
    removeDiscount: () => void;
    calculateTotals: () => {
        subtotal: number;
        totalDiscount: number;
        total: number;
        tax: number;
        totalWithTax: number;
    };
    getAvailableQuantity: (product: Product, storeId?: string) => number;
    getCartItemCount: () => number;
    getCartTotal: () => number;
    setEmployee: (employee: Employee | null) => void;
    setStore: (store: Store | null) => void;
    isLoading: boolean;
};

const PosContext = createContext<PosContextType | undefined>(undefined);

const TAX_RATE = 0.15; // 15% tax rate

export function PosProvider({ children }: { children: ReactNode }) {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [discount, setDiscount] = useState<DiscountType>(null);
    const [isPaymentDialogVisible, setIsPaymentDialogVisible] = useState(false);
    const [employee, setEmployee] = useState<Employee | null>(null);
    const [store, setStore] = useState<Store | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Load cart from localStorage on mount
    useEffect(() => {
        try {
            const savedCart = localStorage.getItem('agro-cart');
            const savedDiscount = localStorage.getItem('agro-cart-discount');
            const savedEmployee = localStorage.getItem('agro-pos-employee');
            const savedStore = localStorage.getItem('agro-pos-store');

            if (savedCart) {
                const parsedCart = JSON.parse(savedCart);
                setCart(parsedCart || []);
            }

            if (savedDiscount) {
                const parsedDiscount = JSON.parse(savedDiscount);
                setDiscount(parsedDiscount);
            }

            if (savedEmployee) {
                const parsedEmployee = JSON.parse(savedEmployee);
                setEmployee(parsedEmployee);
            }

            if (savedStore) {
                const parsedStore = JSON.parse(savedStore);
                setStore(parsedStore);
            }
        } catch (error) {
            console.error('Error loading from localStorage:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Save to localStorage whenever state changes
    useEffect(() => {
        if (!isLoading) {
            localStorage.setItem('agro-cart', JSON.stringify(cart));
        }
    }, [cart, isLoading]);

    useEffect(() => {
        if (!isLoading) {
            localStorage.setItem('agro-cart-discount', JSON.stringify(discount));
        }
    }, [discount, isLoading]);

    useEffect(() => {
        if (!isLoading && employee) {
            localStorage.setItem('agro-pos-employee', JSON.stringify(employee));
        } else if (!isLoading && !employee) {
            localStorage.removeItem('agro-pos-employee');
        }
    }, [employee, isLoading]);

    useEffect(() => {
        if (!isLoading && store) {
            localStorage.setItem('agro-pos-store', JSON.stringify(store));
        } else if (!isLoading && !store) {
            localStorage.removeItem('agro-pos-store');
        }
    }, [store, isLoading]);

    // Helper function to get available quantity for a product
    const getAvailableQuantity = (product: Product, storeId?: string): number => {
        if (!product?.inventories || product?.inventories.length === 0) {
            return 0;
        }

        if (storeId) {
            const inventory = product?.inventories.find(inv => inv.storeId === storeId);
            return inventory?.quantity || 0;
        } else {
            return product?.inventories.reduce((sum, inv) => sum + inv.quantity, 0);
        }
    };

    // Helper function to get item price safely
    const getItemPrice = (item: CartItem): number => {
        return item.unitPrice || item.product?.basePrice || 0;
    };

    const addToCart = (product: Product) => {
        const availableQuantity = getAvailableQuantity(product, store?.id);

        if (availableQuantity <= 0) {
            toast.error("Out of Stock", {
                description: `${product?.name} is currently out of stock.`,
            });
            return;
        }

        setCart(prev => {
            const existingItem = prev.find(item => item.product?.id === product?.id);

            if (existingItem) {
                if (existingItem.quantity + 1 > availableQuantity) {
                    toast.error("Insufficient Stock", {
                        description: `Only ${availableQuantity} units available.`,
                    });
                    return prev;
                }
                return prev.map(item =>
                    item.product?.id === product?.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }

            return [...prev, {
                id: Date.now().toString(),
                product,
                quantity: 1,
                discount: 0,
                unitPrice: product?.basePrice
            }];
        });

        toast.success("Added to Cart", {
            description: `${product?.name} has been added to your cart.`,
        });
    };

    const removeFromCart = (productId: string) => {
        setCart(prev => prev.filter(item => item.product?.id !== productId));
        toast.success("Item Removed", {
            description: "Item has been removed from your cart.",
        });
    };

    const increaseQuantity = (productId: string) => {
        setCart(prev => {
            const item = prev.find(item => item.product?.id === productId);
            if (!item) return prev;

            const availableQuantity = getAvailableQuantity(item.product, store?.id);

            if (item.quantity + 1 > availableQuantity) {
                toast.error("Insufficient Stock", {
                    description: `Only ${availableQuantity} units available.`,
                });
                return prev;
            }

            return prev.map(item =>
                item.product?.id === productId
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            );
        });
    };

    const decreaseQuantity = (productId: string) => {
        setCart(prev =>
            prev.map(item =>
                item.product?.id === productId
                    ? { ...item, quantity: Math.max(1, item.quantity - 1) }
                    : item
            ).filter(item => item.quantity > 0)
        );
    };

    const clearCart = () => {
        setCart([]);
        setDiscount(null);
        localStorage.removeItem('agro-cart');
        localStorage.removeItem('agro-cart-discount');
        toast.success("Cart Cleared", {
            description: "All items have been removed from your cart.",
        });
    };

    const openPaymentDialog = () => setIsPaymentDialogVisible(true);
    const closePaymentDialog = () => setIsPaymentDialogVisible(false);

    const applyDiscount = (newDiscount: DiscountType) => {
        setDiscount(newDiscount);
        if (newDiscount) {
            toast.success("Discount Applied", {
                description: `Discount of ${newDiscount.value}${newDiscount.type === 'percentage' ? '%' : ''} has been applied.`,
            });
        }
    };

    const removeDiscount = () => {
        setDiscount(null);
        toast.info("Discount Removed");
    };

    const calculateTotals = () => {
        const subtotal = cart.reduce(
            (sum, item) => sum + getItemPrice(item) * item.quantity,
            0
        );

        let totalDiscount = 0;

        if (discount) {
            if (discount.type === 'percentage') {
                totalDiscount = subtotal * (Math.min(discount.value, 100) / 100);
            } else {
                totalDiscount = Math.min(discount.value, subtotal);
            }
        }

        const total = subtotal - totalDiscount;
        const tax = subtotal * TAX_RATE;
        const totalWithTax = total + tax;

        return { subtotal, totalDiscount, total, tax, totalWithTax };
    };

    const getCartItemCount = () => {
        return cart.reduce((total, item) => total + item.quantity, 0);
    };

    const getCartTotal = () => {
        return cart.reduce((total, item) => total + getItemPrice(item) * item.quantity, 0);
    };

    return (
        <PosContext.Provider
            value={{
                cart,
                discount,
                employee,
                store,
                addToCart,
                removeFromCart,
                increaseQuantity,
                decreaseQuantity,
                clearCart,
                openPaymentDialog,
                closePaymentDialog,
                isPaymentDialogVisible,
                applyDiscount,
                removeDiscount,
                calculateTotals,
                getAvailableQuantity,
                getCartItemCount,
                getCartTotal,
                setEmployee,
                setStore,
                isLoading,
            }}
        >
            {children}
        </PosContext.Provider>
    );
}

export function usePos() {
    const context = useContext(PosContext);
    if (!context) {
        throw new Error('usePos must be used within a PosProvider');
    }
    return context;
}