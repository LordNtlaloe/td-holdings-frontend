// hooks/use-product-attributes.ts
import { useState, useEffect } from 'react';

export interface FilterAttributes {
    productTypes: string[];
    productGrades: string[];
    tireCategories: string[];
    tireUsages: string[];
    origins?: string[];
    commodities?: string[];
}

// Helper function to filter out empty/invalid strings
const filterValidStrings = (arr: string[] | undefined): string[] => {
    if (!arr) return [];
    return arr.filter(item =>
        item &&
        typeof item === 'string' &&
        item.trim() !== '' &&
        item !== 'null' &&
        item !== 'undefined'
    );
};

export function useProductFilterAttributes() {
    const [attributes, setAttributes] = useState<FilterAttributes | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchAttributes = async () => {
        setIsLoading(true);
        setError(null);

        try {
            // Use the public API endpoint
            const response = await fetch('/api/products/attributes');

            if (!response.ok) {
                throw new Error(`Failed to fetch attributes: ${response.status}`);
            }

            const result = await response.json();

            let data;
            // Extract data from the response
            if (result.success && result.data) {
                data = result.data;
            } else if (result.productTypes) {
                data = result;
            } else {
                // Fallback to defaults
                data = {
                    productTypes: ['TIRE', 'BALE'],
                    productGrades: ['A', 'B', 'C'],
                    tireCategories: ['NEW', 'SECOND_HAND'],
                    tireUsages: ['FOUR_BY_FOUR', 'REGULAR', 'TRUCK'],
                    origins: [],
                    commodities: []
                };
            }

            // Filter out empty values
            const filteredData = {
                productTypes: filterValidStrings(data.productTypes),
                productGrades: filterValidStrings(data.productGrades),
                tireCategories: filterValidStrings(data.tireCategories),
                tireUsages: filterValidStrings(data.tireUsages),
                origins: filterValidStrings(data.origins),
                commodities: filterValidStrings(data.commodities)
            };

            // Ensure we have at least the basic values
            if (filteredData.productTypes.length === 0) {
                filteredData.productTypes = ['TIRE', 'BALE'];
            }
            if (filteredData.productGrades.length === 0) {
                filteredData.productGrades = ['A', 'B', 'C'];
            }

            setAttributes(filteredData);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch filter attributes');
            console.error('Failed to fetch product attributes:', err);

            // Fallback to default attributes with filtering
            const defaultAttributes = {
                productTypes: ['TIRE', 'BALE'],
                productGrades: ['A', 'B', 'C'],
                tireCategories: ['NEW', 'SECOND_HAND'],
                tireUsages: ['FOUR_BY_FOUR', 'REGULAR', 'TRUCK'],
                origins: [],
                commodities: []
            };

            setAttributes(defaultAttributes);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAttributes();
    }, []);

    return {
        attributes,
        isLoading,
        error,
        refresh: fetchAttributes,
    };
}