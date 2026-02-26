'use client';

import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useTrendStore } from '@/lib/store';
import { useMemo } from 'react';
import { Shield } from 'lucide-react';
import { TrendCategory, getCategoryColor } from '@/lib/api';

const generateHistory = (baseVolume: number) => {
    return Array.from({ length: 12 }, (_, i) => ({
        time: `${i * 2}:00`,
        volume: Math.max(0, baseVolume * (0.5 + Math.random()))
    }));
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#f97316'];

export function AnalyticsView() {
    const { trends, stats, hateSpeechStats } = useTrendStore();

    const categoryData = useMemo(() => {
        const counts: Record<string, number> = {};
        trends.forEach(t => {
            counts[t.category] = (counts[t.category] || 0) + 1;
        });
        return Object.entries(counts).map(([name, value]) => ({
            name,
            value,
            fill: getCategoryColor(name as TrendCategory),
        }));
    }, [trends]);

    const historyData = useMemo(() => {
        return generateHistory(stats.avgVolume);
    }, [stats.avgVolume]);

    const sentimentData = useMemo(() => {
        const counts = { positive: 0, neutral: 0, negative: 0 };
        trends.forEach(t => {
            if (t.sentiment) counts[t.sentiment]++;
        });
        return [
            { name: 'Positive', value: counts.positive, color: '#4ade80' },
            { name: 'Neutral', value: counts.neutral, color: '#facc15' },
            { name: 'Negative', value: counts.negative, color: '#f87171' },
        ];
    }, [trends]);

    // Hate speech category data from store
    const hateCategoryData = useMemo(() => {
        return Object.entries(hateSpeechStats.byCategory).map(([name, value]) => ({ name, value }));
    }, [hateSpeechStats]);

    // Hate speech trend data
    const hateTrendData = useMemo(() => {
        return hateSpeechStats.trend.map((value, i) => ({
            time: `${i}h`,
            flags: value,
        }));
    }, [hateSpeechStats]);

    if (trends.length === 0) {
        return (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
                No data available to analyze.
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="grid md:grid-cols-2 gap-6">
                {/* Category Distribution */}
                <Card variant="glass">
                    <CardHeader>
                        <CardTitle className="text-sm font-medium uppercase tracking-wide text-muted-foreground">Category Distribution</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={categoryData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {categoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill || COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Sentiment Analysis */}
                <Card variant="glass">
                    <CardHeader>
                        <CardTitle className="text-sm font-medium uppercase tracking-wide text-muted-foreground">Sentiment Analysis</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={sentimentData}>
                                <XAxis dataKey="name" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                                />
                                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                    {sentimentData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Volume History */}
            <Card variant="default" className="border-white/5 bg-black/20">
                <CardHeader>
                    <CardTitle className="text-sm font-medium uppercase tracking-wide text-muted-foreground">24h Volume Prediction</CardTitle>
                </CardHeader>
                <CardContent className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={historyData}>
                            <defs>
                                <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="time" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                            <Area type="monotone" dataKey="volume" stroke="#8884d8" fillOpacity={1} fill="url(#colorVolume)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Hate Speech Analytics Section */}
            {(hateCategoryData.length > 0 || hateTrendData.length > 0) && (
                <div className="space-y-4">
                    <h3 className="text-sm font-medium uppercase tracking-wide text-muted-foreground flex items-center gap-2">
                        <Shield className="w-4 h-4 text-orange-400" /> Hate Speech Analytics
                    </h3>
                    <div className="grid md:grid-cols-2 gap-6">
                        {hateCategoryData.length > 0 && (
                            <Card variant="glass">
                                <CardHeader>
                                    <CardTitle className="text-sm">Hate Speech by Category</CardTitle>
                                </CardHeader>
                                <CardContent className="h-[200px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={hateCategoryData}>
                                            <XAxis dataKey="name" stroke="#666" fontSize={10} tickLine={false} axisLine={false} />
                                            <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                                            <Bar dataKey="value" fill="#f97316" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        )}
                        {hateTrendData.length > 0 && (
                            <Card variant="glass">
                                <CardHeader>
                                    <CardTitle className="text-sm">Flagged Content Over Time</CardTitle>
                                </CardHeader>
                                <CardContent className="h-[200px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={hateTrendData}>
                                            <defs>
                                                <linearGradient id="hateGradient" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <XAxis dataKey="time" stroke="#666" fontSize={10} tickLine={false} axisLine={false} />
                                            <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                                            <Area type="monotone" dataKey="flags" stroke="#f97316" fill="url(#hateGradient)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
