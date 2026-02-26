'use client';

import { useState } from 'react';
import { Search, Bell, Menu, Key } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LocationSearch } from '@/components/map/LocationSearch';
import { QuickCitySelector } from '@/components/map/LocationSearch';
import { ApiKeyDialog } from '@/components/dashboard/ApiKeyDialog';
import { useTrendStore } from '@/lib/store';

export function Header() {
    const [isKeyDialogOpen, setIsKeyDialogOpen] = useState(false);
    const { apiKey } = useTrendStore();

    return (
        <>
            <header className="h-16 bg-surface/50 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-6 sticky top-0 z-40">
                <div className="flex items-center gap-4 flex-1">
                    <Button variant="ghost" size="icon" className="md:hidden">
                        <Menu className="h-5 w-5" />
                    </Button>

                    {/* Location Search Bar */}
                    <div className="hidden md:flex items-center gap-4 max-w-2xl flex-1">
                        <LocationSearch />
                        <div className="h-6 w-px bg-white/10" />
                        <QuickCitySelector />
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" className="relative group">
                        <Bell className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                        <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    </Button>

                    <Button
                        size="sm"
                        variant={apiKey ? "outline" : "default"}
                        className={apiKey ? "border-primary/50 text-primary hover:bg-primary/10" : "bg-gradient-to-r from-indigo-500 to-purple-600 border-0"}
                        onClick={() => setIsKeyDialogOpen(true)}
                    >
                        <Key className="w-4 h-4 mr-2" />
                        {apiKey ? 'API Connected' : 'Connect API'}
                    </Button>
                </div>
            </header>

            <ApiKeyDialog isOpen={isKeyDialogOpen} onClose={() => setIsKeyDialogOpen(false)} />
        </>
    );
}
