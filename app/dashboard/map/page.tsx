'use client';

import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useTrendStore } from '@/lib/store';
import { Radio } from 'lucide-react';
import { cn } from '@/lib/utils';

// TrendMap must be loaded client-side only (Leaflet uses browser APIs)
const TrendMap = dynamic(() => import('@/components/map/TrendMap'), { ssr: false });

export default function MapPage() {
    const { selectedLocation, dataMode, setCategory } = useTrendStore();

    // Always show all trends on the full-screen map
    useEffect(() => { setCategory('all'); }, [setCategory]);

    return (
        <div className="flex flex-col h-full gap-4">
            {/* Page Header */}
            <div className="flex items-center justify-between flex-shrink-0">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Live Trend Map</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        Real-time social signals visualised across {selectedLocation.name}
                    </p>
                </div>
                <div className={cn(
                    'px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md border flex items-center gap-2',
                    dataMode === 'live'
                        ? 'bg-green-500/20 text-green-400 border-green-500/30'
                        : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                )}>
                    <Radio className={cn('w-3 h-3', dataMode === 'live' ? 'text-green-400 animate-pulse' : 'text-amber-400')} />
                    {dataMode === 'live' ? 'LIVE DATA' : 'SIMULATION'}
                </div>
            </div>

            {/* Full-height Map */}
            <div className="flex-1 min-h-0 rounded-xl overflow-hidden border border-white/10">
                <TrendMap />
            </div>
        </div>
    );
}
