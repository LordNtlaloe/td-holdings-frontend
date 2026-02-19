"use client";

import { useState } from "react";
import { X, Percent, DollarSign } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { usePos } from "@/contexts/cart-context";

interface DiscountDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

export function DiscountDialog({ isOpen, onClose }: DiscountDialogProps) {
    const { applyDiscount, removeDiscount, discount, calculateTotals } = usePos();
    const [discountType, setDiscountType] = useState<"percentage" | "fixed">("percentage");
    const [discountValue, setDiscountValue] = useState("");

    const { subtotal } = calculateTotals();

    const handleApplyDiscount = () => {
        const value = parseFloat(discountValue);

        if (isNaN(value) || value <= 0) {
            toast.error("Invalid discount value");
            return;
        }

        if (discountType === "percentage" && value > 100) {
            toast.error("Percentage cannot exceed 100%");
            return;
        }

        if (discountType === "fixed" && value > subtotal) {
            toast.error("Discount cannot exceed subtotal");
            return;
        }

        applyDiscount({
            type: discountType,
            value,
        });

        onClose();
        setDiscountValue("");
    };

    const handleRemoveDiscount = () => {
        removeDiscount();
        onClose();
        setDiscountValue("");
    };

    const presetDiscounts = [
        { label: "5%", type: "percentage" as const, value: 5 },
        { label: "10%", type: "percentage" as const, value: 10 },
        { label: "15%", type: "percentage" as const, value: 15 },
        { label: "20%", type: "percentage" as const, value: 20 },
    ];

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 max-w-md w-full overflow-hidden"
                >
                    {/* Header */}
                    <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-white">Apply Discount</h2>
                            <p className="text-sm text-slate-400 mt-1">
                                Add discount to order
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-slate-700 transition-colors"
                        >
                            <X className="w-5 h-5 text-slate-400" />
                        </button>
                    </div>

                    <div className="px-6 py-6 space-y-6">
                        {/* Current Discount */}
                        {discount && (
                            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-emerald-400 font-medium mb-1">
                                            Current Discount
                                        </p>
                                        <p className="text-lg font-bold text-white">
                                            {discount.type === "percentage"
                                                ? `${discount.value}%`
                                                : `M${discount.value.toFixed(2)}`}
                                        </p>
                                    </div>
                                    <button
                                        onClick={handleRemoveDiscount}
                                        className="px-4 py-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors text-sm font-medium"
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Discount Type Selection */}
                        <div>
                            <label className="text-sm font-medium text-slate-300 mb-3 block">
                                Discount Type
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => setDiscountType("percentage")}
                                    className={`p-4 rounded-xl border-2 transition-all ${discountType === "percentage"
                                            ? "bg-emerald-500/10 border-emerald-500 text-emerald-400"
                                            : "bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600"
                                        }`}
                                >
                                    <Percent className="w-6 h-6 mx-auto mb-2" />
                                    <span className="text-xs font-medium">Percentage</span>
                                </button>
                                <button
                                    onClick={() => setDiscountType("fixed")}
                                    className={`p-4 rounded-xl border-2 transition-all ${discountType === "fixed"
                                            ? "bg-emerald-500/10 border-emerald-500 text-emerald-400"
                                            : "bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600"
                                        }`}
                                >
                                    <DollarSign className="w-6 h-6 mx-auto mb-2" />
                                    <span className="text-xs font-medium">Fixed Amount</span>
                                </button>
                            </div>
                        </div>

                        {/* Preset Discounts (for percentage) */}
                        {discountType === "percentage" && (
                            <div>
                                <label className="text-sm font-medium text-slate-300 mb-3 block">
                                    Quick Discounts
                                </label>
                                <div className="grid grid-cols-4 gap-2">
                                    {presetDiscounts.map((preset) => (
                                        <button
                                            key={preset.label}
                                            onClick={() => setDiscountValue(preset.value.toString())}
                                            className="px-3 py-3 bg-slate-800 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-700 transition-colors"
                                        >
                                            {preset.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Discount Value Input */}
                        <div>
                            <label className="text-sm font-medium text-slate-300 mb-2 block">
                                {discountType === "percentage" ? "Percentage (%)" : "Amount (M)"}
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    value={discountValue}
                                    onChange={(e) => setDiscountValue(e.target.value)}
                                    placeholder={discountType === "percentage" ? "0" : "0.00"}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white text-lg font-medium focus:outline-none focus:border-emerald-500 pr-12"
                                    step={discountType === "percentage" ? "1" : "0.01"}
                                    min="0"
                                    max={discountType === "percentage" ? "100" : undefined}
                                />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">
                                    {discountType === "percentage" ? "%" : "M"}
                                </div>
                            </div>
                            {discountType === "percentage" && (
                                <p className="text-xs text-slate-500 mt-2">
                                    Maximum: 100%
                                </p>
                            )}
                            {discountType === "fixed" && subtotal > 0 && (
                                <p className="text-xs text-slate-500 mt-2">
                                    Maximum: M{subtotal.toFixed(2)} (subtotal)
                                </p>
                            )}
                        </div>

                        {/* Preview */}
                        {discountValue && !isNaN(parseFloat(discountValue)) && (
                            <div className="bg-slate-800/50 rounded-xl p-4 space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-400">Subtotal</span>
                                    <span className="text-white">M{subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-emerald-400">Discount</span>
                                    <span className="text-emerald-400">
                                        -M
                                        {(discountType === "percentage"
                                            ? subtotal * (parseFloat(discountValue) / 100)
                                            : parseFloat(discountValue)
                                        ).toFixed(2)}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between pt-2 border-t border-slate-700">
                                    <span className="font-bold text-white">New Total</span>
                                    <span className="text-lg font-bold text-white">
                                        M
                                        {(discountType === "percentage"
                                            ? subtotal - subtotal * (parseFloat(discountValue) / 100)
                                            : subtotal - parseFloat(discountValue)
                                        ).toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            <button
                                onClick={onClose}
                                className="flex-1 py-3 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-700 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleApplyDiscount}
                                disabled={!discountValue || isNaN(parseFloat(discountValue))}
                                className="flex-1 py-3 bg-linear-to-r from-emerald-500 to-teal-600 text-white font-bold rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                            >
                                Apply Discount
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}