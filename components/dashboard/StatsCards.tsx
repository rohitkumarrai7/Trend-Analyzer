'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTrendStore } from '@/lib/store';
import { TrendingUp, Users, Activity, Zap, TrendingDown, Shield } from 'lucide-react';

export function StatsCards() {
    const { stats, hateSpeechStats } = useTrendStore();

    const items = [
        {
            title: 'Total Active Trends',
            value: stats.totalTrends,
            icon: TrendingUp,
            color: 'text-blue-400',
            description: 'Right now',
            change: '+12%',
            trend: 'up'
        },
        {
            title: 'Total Volume',
            value: (stats.totalVolume / 1000000).toFixed(1) + 'M',
            icon: Users,
            color: 'text-purple-400',
            description: 'Tweets / hr',
            change: '+5%',
            trend: 'up'
        },
        {
            title: 'Top Category',
            value: stats.topCategory,
            icon: Zap,
            color: 'text-yellow-400',
            description: 'Most active',
            isBadge: true
        },
        {
            title: 'Critical Alerts',
            value: stats.emergencyCount,
            icon: Activity,
            color: 'text-red-400',
            description: 'Emergency signals',
            change: stats.emergencyCount > 0 ? '+2' : '0',
            trend: stats.emergencyCount > 0 ? 'up' : 'neutral'
        },
        {
            title: 'Hate Speech Flags',
            value: hateSpeechStats.totalFlagged,
            icon: Shield,
            color: 'text-orange-400',
            description: 'Campaign alerts',
            change: hateSpeechStats.highSeverity > 0 ? `+${hateSpeechStats.highSeverity} high` : '0',
            trend: hateSpeechStats.highSeverity > 0 ? 'up' : 'neutral'
        }
    ];

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {items.map((item, index) => (
                <Card key={index} variant="glass" glow>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">{item.title}</CardTitle>
                        <item.icon className={`h-4 w-4 ${item.color}`} />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-foreground">
                            {item.isBadge ? (
                                <Badge variant={item.value as any} className="text-sm px-2 py-0.5 capitalize bg-white/5 border-white/10">
                                    {item.value}
                                </Badge>
                            ) : (
                                item.value
                            )}
                        </div>
                        <div className="flex items-center text-xs text-muted-foreground mt-1">
                            {item.change && (
                                <span className={item.trend === 'up' ? 'text-green-400 mr-1' : 'text-red-400 mr-1'}>
                                    {item.change}
                                </span>
                            )}
                            {item.description}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
