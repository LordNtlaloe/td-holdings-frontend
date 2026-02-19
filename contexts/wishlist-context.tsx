// contexts/wishlist-context.tsx
"use client"

import { Product } from '@/types'
import { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import { toast } from 'sonner'

type WishlistContextType = {
    wishlist: Product[]
    addToWishlist: (product: Product) => void
    removeFromWishlist: (productId: string) => void
    toggleWishlist: (product: Product) => void
    isInWishlist: (productId: string) => boolean
    clearWishlist: () => void
    getWishlistCount: () => number
    isLoading: boolean
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined)

export function WishlistProvider({ children }: { children: ReactNode }) {
    const [wishlist, setWishlist] = useState<Product[]>([])
    const [isLoading, setIsLoading] = useState(true)

    // Load wishlist from localStorage on mount
    useEffect(() => {
        try {
            const savedWishlist = localStorage.getItem('tdh-wishlist')
            if (savedWishlist) {
                const parsedWishlist = JSON.parse(savedWishlist)
                setWishlist(parsedWishlist || [])
            }
        } catch (error) {
            console.error('Error loading wishlist from localStorage:', error)
        } finally {
            setIsLoading(false)
        }
    }, [])

    // Save wishlist to localStorage whenever it changes
    useEffect(() => {
        if (!isLoading) {
            localStorage.setItem('tdh-wishlist', JSON.stringify(wishlist))
        }
    }, [wishlist, isLoading])

    const addToWishlist = (product: Product) => {
        setWishlist(prev => {
            // Check if product is already in wishlist
            if (prev.some(item => item.id === product.id)) {
                return prev
            }
            return [...prev, product]
        })

        toast.success("Added to Wishlist", {
            description: `${product.name} has been added to your wishlist.`,
        })
    }

    const removeFromWishlist = (productId: string) => {
        setWishlist(prev => prev.filter(item => item.id !== productId))

        toast.success("Removed from Wishlist", {
            description: "Item has been removed from your wishlist.",
        })
    }

    const toggleWishlist = (product: Product) => {
        if (isInWishlist(product.id)) {
            removeFromWishlist(product.id)
        } else {
            addToWishlist(product)
        }
    }

    const isInWishlist = (productId: string): boolean => {
        return wishlist.some(item => item.id === productId)
    }

    const clearWishlist = () => {
        setWishlist([])
        toast.success("Wishlist Cleared", {
            description: "All items have been removed from your wishlist.",
        })
    }

    const getWishlistCount = () => {
        return wishlist.length
    }

    return (
        <WishlistContext.Provider
            value={{
                wishlist,
                addToWishlist,
                removeFromWishlist,
                toggleWishlist,
                isInWishlist,
                clearWishlist,
                getWishlistCount,
                isLoading
            }}
        >
            {children}
        </WishlistContext.Provider>
    )
}

export function useWishlist() {
    const context = useContext(WishlistContext)
    if (!context) {
        throw new Error('useWishlist must be used within a WishlistProvider')
    }
    return context
}