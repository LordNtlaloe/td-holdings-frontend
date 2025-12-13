// context/pos-context.tsx
"use client"

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Product, Employee, Store } from '@/types';

interface CartItem {
    id: string;
    product: Product;
    quantity: number;
    discount: number;
}

interface Receipt {
    id: string;
    saleNumber: string;
    date: Date;
    items: Array<{
        productId: string;
        productName: string;
        quantity: number;
        price: number;
        discount: number;
        subtotal: number;
    }>;
    subtotal: number;
    totalDiscount: number;
    total: number;
    paymentMethod: string;
    amountReceived?: number;
    changeAmount?: number;
    cashier: string;
    store: string;
}

interface PosContextType {
    cart: CartItem[];
    addToCart: (product: Product, quantity?: number) => void;
    removeFromCart: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    increaseQuantity: (productId: string) => void;
    decreaseQuantity: (productId: string) => void;
    applyDiscount: (productId: string, discount: number) => void;
    applyCartDiscount: (amount: number) => void;
    removeCartDiscount: () => void;
    calculateTotals: () => { subtotal: number; totalDiscount: number; total: number };
    clearCart: () => void;
    isPaymentDialogVisible: boolean;
    openPaymentDialog: () => void;
    closePaymentDialog: () => void;
    currentStore: Store | null;
    setCurrentStore: (store: Store | null) => void;
    currentEmployee: Employee | null;
    setCurrentEmployee: (employee: Employee | null) => void;
    currencySymbol: string;
    currentReceipt: Receipt | null;
    setCurrentReceipt: (receipt: Receipt | null) => void;
}

const PosContext = createContext<PosContextType | undefined>(undefined);

interface PosProviderProps {
    children: ReactNode;
    initialStore?: Store | null;
    initialEmployee?: Employee | null;
    initialProducts?: Product[];
}

export function PosProvider({
    children,
    initialStore = null,
    initialEmployee = null,
    initialProducts = []
}: PosProviderProps) {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isPaymentDialogVisible, setIsPaymentDialogVisible] = useState(false);
    const [currentStore, setCurrentStore] = useState<Store | null>(initialStore);
    const [currentEmployee, setCurrentEmployee] = useState<Employee | null>(initialEmployee);
    const [currentReceipt, setCurrentReceipt] = useState<Receipt | null>(null);

    const currencySymbol = 'M';

    const addToCart = (product: Product, quantity: number = 1) => {
        if (product.quantity <= 0) return;

        setCart(prevCart => {
            const existingItem = prevCart.find(item => item.product.id === product.id);
            if (existingItem) {
                const newQuantity = existingItem.quantity + quantity;
                if (newQuantity > product.quantity) {
                    alert(`Only ${product.quantity} items available in stock`);
                    return prevCart;
                }
                return prevCart.map(item =>
                    item.product.id === product.id
                        ? { ...item, quantity: newQuantity }
                        : item
                );
            }
            return [...prevCart, {
                id: Date.now().toString(),
                product,
                quantity: Math.min(quantity, product.quantity),
                discount: 0
            }];
        });
    };

    const removeFromCart = (productId: string) => {
        setCart(prevCart => prevCart.filter(item => item.product.id !== productId));
    };

    const updateQuantity = (productId: string, quantity: number) => {
        if (quantity <= 0) {
            removeFromCart(productId);
            return;
        }

        setCart(prevCart =>
            prevCart.map(item => {
                if (item.product.id === productId) {
                    if (quantity > item.product.quantity) {
                        alert(`Only ${item.product.quantity} items available in stock`);
                        return item;
                    }
                    return { ...item, quantity };
                }
                return item;
            })
        );
    };

    const increaseQuantity = (productId: string) => {
        const item = cart.find(item => item.product.id === productId);
        if (item) updateQuantity(productId, item.quantity + 1);
    };

    const decreaseQuantity = (productId: string) => {
        const item = cart.find(item => item.product.id === productId);
        if (item) updateQuantity(productId, item.quantity - 1);
    };

    const applyDiscount = (productId: string, discount: number) => {
        setCart(prevCart =>
            prevCart.map(item =>
                item.product.id === productId ? { ...item, discount } : item
            )
        );
    };

    const applyCartDiscount = (discount: number) => {
        setCart(prevCart => prevCart.map(item => ({ ...item, discount })));
    };

    const removeCartDiscount = () => {
        setCart(prevCart => prevCart.map(item => ({ ...item, discount: 0 })));
    };

    const calculateTotals = () => {
        const subtotal = cart.reduce(
            (sum, item) => sum + (item.product.price * item.quantity),
            0
        );
        const totalDiscount = cart.reduce(
            (sum, item) => sum + (item.discount || 0),
            0
        );
        return {
            subtotal,
            totalDiscount,
            total: subtotal - totalDiscount,
        };
    };

    const clearCart = () => setCart([]);
    const openPaymentDialog = () => setIsPaymentDialogVisible(true);
    const closePaymentDialog = () => setIsPaymentDialogVisible(false);

    return (
        <PosContext.Provider
            value={{
                cart,
                addToCart,
                removeFromCart,
                updateQuantity,
                increaseQuantity,
                decreaseQuantity,
                applyDiscount,
                applyCartDiscount,
                removeCartDiscount,
                calculateTotals,
                clearCart,
                isPaymentDialogVisible,
                openPaymentDialog,
                closePaymentDialog,
                currentStore,
                setCurrentStore,
                currentEmployee,
                setCurrentEmployee,
                currencySymbol,
                currentReceipt,
                setCurrentReceipt
            }}
        >
            {children}
        </PosContext.Provider>
    );
}

export function usePos() {
    const context = useContext(PosContext);
    if (context === undefined) {
        throw new Error('usePos must be used within a PosProvider');
    }
    return context;
}