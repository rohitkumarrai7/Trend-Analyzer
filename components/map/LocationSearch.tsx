'use client';

import * as React from 'react';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { searchLocations, Location, POPULAR_LOCATIONS } from '@/lib/locations';
import { useTrendStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';

export function LocationSearch() {
    const [query, setQuery] = React.useState('');
    const [isOpen, setIsOpen] = React.useState(false);
    const [results, setResults] = React.useState<Location[]>([]);
    const { selectedLocation, setLocation } = useTrendStore();
    const wrapperRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        if (query.length > 1) {
            const hits = searchLocations(query);
            setResults(hits);
            setIsOpen(true);
        } else {
            setResults([]);
            setIsOpen(false);
        }
    }, [query]);

    // Close when clicking outside
    React.useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (location: Location) => {
        setLocation(location);
        setQuery('');
        setIsOpen(false);
    };

    return (
        <div className="relative w-full max-w-sm" ref={wrapperRef}>
            <div className="relative group">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                    <Search className="h-4 w-4" />
                </div>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={`Search city (current: ${selectedLocation.name})...`}
                    className="w-full h-10 pl-10 pr-4 rounded-xl bg-surface/80 border border-white/10 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all backdrop-blur-md"
                />
            </div>

            <AnimatePresence>
                {isOpen && results.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute top-12 left-0 right-0 z-50 bg-surface/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden"
                    >
                        <div className="p-2 space-y-1">
                            {results.map((loc) => (
                                <button
                                    key={loc.woeid}
                                    onClick={() => handleSelect(loc)}
                                    className="w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg hover:bg-primary/10 hover:text-primary transition-colors text-left"
                                >
                                    <span className="font-medium">{loc.name}</span>
                                    <span className="text-xs text-muted-foreground">{loc.country}</span>
                                </button>
                            ))}
                        </div>

                        {results.length > 0 && (
                            <div className="px-3 py-2 bg-black/20 text-xs text-muted-foreground border-t border-white/5">
                                {results.length} locations found
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export function QuickCitySelector() {
    const { selectedLocation, setLocation } = useTrendStore();

    return (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none no-scrollbar mask-gradient-r">
            {POPULAR_LOCATIONS.map((loc) => (
                <button
                    key={loc.woeid}
                    onClick={() => setLocation(loc)}
                    className={cn(
                        "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all border",
                        selectedLocation.woeid === loc.woeid
                            ? "bg-primary text-white border-primary shadow-lg shadow-primary/25"
                            : "bg-surface/50 text-muted-foreground border-white/10 hover:bg-surface hover:text-foreground hover:border-white/20"
                    )}
                >
                    {loc.name}
                </button>
            ))}
        </div>
    );
}
