'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { LocationId, LOCATIONS } from '@/lib/types';

interface LocationContextType {
    location: LocationId;
    locationName: string;
    setLocation: (id: LocationId) => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: ReactNode }) {
    const [location, setLocationState] = useState<LocationId>('bacoor');

    useEffect(() => {
        const saved = localStorage.getItem('selectedLocation') as LocationId | null;
        if (saved && LOCATIONS.some(l => l.id === saved)) {
            setLocationState(saved);
        }
    }, []);

    const setLocation = (id: LocationId) => {
        if (id !== location) {
            // Clear cart when switching locations since stock differs
            localStorage.removeItem('cart');
            window.dispatchEvent(new Event('location-changed'));
        }
        setLocationState(id);
        localStorage.setItem('selectedLocation', id);
    };

    const locationName = LOCATIONS.find(l => l.id === location)?.name || location;

    return (
        <LocationContext.Provider value={{ location, locationName, setLocation }}>
            {children}
        </LocationContext.Provider>
    );
}

export function useLocation() {
    const context = useContext(LocationContext);
    if (!context) {
        throw new Error('useLocation must be used within a LocationProvider');
    }
    return context;
}
