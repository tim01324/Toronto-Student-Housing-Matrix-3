import React, { createContext, useCallback, useContext, useMemo, useState, ReactNode } from 'react';
import { Listing, mockListings } from '../data/mockData';

interface CompareContextType {
    compareListDirs: string[];
    addToCompare: (id: string) => void;
    removeFromCompare: (id: string) => void;
    toggleCompare: (id: string) => void;
    getCompareListings: () => Listing[];
    clearCompare: () => void;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

export function CompareProvider({ children }: { children: ReactNode }) {
    const [compareListDirs, setCompareListDirs] = useState<string[]>([]);

    const addToCompare = useCallback((id: string) => {
        setCompareListDirs((prev) => {
            // Limit to 3 items for the radar chart layout
            if (prev.length >= 3 && !prev.includes(id)) {
                return [...prev.slice(1), id]; // remove oldest, add new
            }
            if (!prev.includes(id)) {
                return [...prev, id];
            }
            return prev;
        });
    }, []);

    const removeFromCompare = useCallback((id: string) => {
        setCompareListDirs((prev) => prev.filter(item => item !== id));
    }, []);

    const toggleCompare = useCallback((id: string) => {
        setCompareListDirs((prev) => {
            if (prev.includes(id)) {
                return prev.filter(item => item !== id);
            } else {
                if (prev.length >= 3) {
                    return [...prev.slice(1), id];
                }
                return [...prev, id];
            }
        });
    }, []);

    const getCompareListings = useCallback(() => {
        return compareListDirs
            .map(id => mockListings.find(l => l.id === id))
            .filter((l): l is Listing => l !== undefined);
    }, [compareListDirs]);

    const clearCompare = useCallback(() => {
        setCompareListDirs([]);
    }, []);

    const value = useMemo(() => ({
        compareListDirs,
        addToCompare,
        removeFromCompare,
        toggleCompare,
        getCompareListings,
        clearCompare,
    }), [compareListDirs, addToCompare, removeFromCompare, toggleCompare, getCompareListings, clearCompare]);

    return (
        <CompareContext.Provider value={value}>
            {children}
        </CompareContext.Provider>
    );
}

export function useCompare() {
    const context = useContext(CompareContext);
    if (context === undefined) {
        throw new Error('useCompare must be used within a CompareProvider');
    }
    return context;
}
