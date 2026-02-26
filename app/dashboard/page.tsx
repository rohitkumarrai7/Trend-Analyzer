'use client';

import dynamic from 'next/dynamic';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { TrendList } from '@/components/dashboard/TrendList';
import { Card } from '@/components/ui/card';

// Dynamically import map to avoid SSR issues
const TrendMap = dynamic(() => import('@/components/map/TrendMap'), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full min-h-[500px] flex items-center justify-center bg-surface/50 border border-white/10 rounded-xl">
            <div className="animate-spin h-8 w-8 border-4 border-primary rounded-full border-t-transparent"></div>
        </div>
    ),
});

export default function DashboardPage() {
    return (
        <div className="space-y-6 max-w-[1600px] mx-auto">
            {/* 1. Key Metrics */}
            <StatsCards />

            {/* 2. Main Content Grid */}
            <div className="grid lg:grid-cols-12 gap-6 h-[800px]">
                {/* Map Section (8 cols) */}
                <div className="lg:col-span-8 h-full min-h-[500px]">
                    <div className="h-full rounded-xl overflow-hidden shadow-2xl shadow-black/50 border border-white/10 relative">
                        <TrendMap />
                    </div>
                </div>

                {/* Trend List Section (4 cols) */}
                <div className="lg:col-span-4 h-full overflow-hidden">
                    <TrendList />
                </div>
            </div>
        </div>
    );
}
