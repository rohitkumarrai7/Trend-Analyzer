'use client';

import { useEffect, useRef } from 'react';
import { useTrendStore } from '@/lib/store';
import { getNearbyLocations } from '@/lib/locations';

export function LocationInitializer() {
    const { setLocation, selectedLocation } = useTrendStore();
    const checkedRef = useRef(false);

    useEffect(() => {
        // Only check once per session
        if (checkedRef.current) return;
        checkedRef.current = true;

        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;

                    // Find closest supported location
                    const nearby = getNearbyLocations(latitude, longitude, 1);

                    if (nearby.length > 0) {
                        const closest = nearby[0];
                        // If closest is decently close (e.g. within 500km? No, just closest available)
                        // Or if we just want to default to their "country" or "city".
                        setLocation(closest);
                        console.log(`Auto-located to ${closest.name}`);
                    }
                },
                (error) => {
                    console.log('Geolocation denied or failed', error);
                }
            );
        }
    }, [setLocation]);

    return null;
}
