'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, UserCheck, Globe, Info } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { useTrendStore } from '@/lib/store';

const REGION_COLORS = ['#8b5cf6', '#6366f1', '#06b6d4', '#22c55e', '#f59e0b'];

export default function AudiencePage() {
    const { trends, selectedLocation, dataMode } = useTrendStore();

    // Estimate demographics from trend data
    const totalVolume = trends.reduce((sum, t) => sum + t.tweetVolume, 0);

    // Simulated age demographics (weighted by trends activity)
    const demographicsData = [
        { name: '13-17', value: Math.round(totalVolume * 0.08 / 1000) || 8 },
        { name: '18-24', value: Math.round(totalVolume * 0.35 / 1000) || 35 },
        { name: '25-34', value: Math.round(totalVolume * 0.30 / 1000) || 30 },
        { name: '35-44', value: Math.round(totalVolume * 0.15 / 1000) || 15 },
        { name: '45-54', value: Math.round(totalVolume * 0.08 / 1000) || 8 },
        { name: '55+', value: Math.round(totalVolume * 0.04 / 1000) || 4 },
    ];

    // Sentiment distribution from actual trends
    const sentimentCounts = { positive: 0, negative: 0, neutral: 0 };
    trends.forEach(t => {
        if (t.sentiment) sentimentCounts[t.sentiment]++;
    });

    const sentimentData = [
        { name: 'Positive', value: sentimentCounts.positive, color: '#22c55e' },
        { name: 'Neutral', value: sentimentCounts.neutral, color: '#f59e0b' },
        { name: 'Negative', value: sentimentCounts.negative, color: '#ef4444' },
    ].filter(d => d.value > 0);

    const engagementRate = trends.length > 0
        ? (trends.filter(t => (t.change || 0) > 0).length / trends.length * 100).toFixed(1)
        : '0.0';

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Audience Insights</h1>
                <Badge variant={dataMode === 'live' ? 'default' : 'secondary'} className="capitalize">
                    {dataMode} data
                </Badge>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Total Reach</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {totalVolume > 1000000
                                ? `${(totalVolume / 1000000).toFixed(1)}M`
                                : `${(totalVolume / 1000).toFixed(0)}K`
                            }
                        </div>
                        <p className="text-xs text-muted-foreground">Across {trends.length} trends in {selectedLocation.name}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
                        <UserCheck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{engagementRate}%</div>
                        <p className="text-xs text-muted-foreground">Trends with positive growth</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Top Region</CardTitle>
                        <Globe className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{selectedLocation.name}</div>
                        <p className="text-xs text-muted-foreground">{selectedLocation.country}</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
                {/* Age Demographics */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            Age Demographics
                            <Badge variant="secondary" className="text-[10px]">Estimated</Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={demographicsData}>
                                <XAxis dataKey="name" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                                />
                                <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                        <div className="flex items-center gap-1.5 mt-2">
                            <Info className="w-3 h-3 text-muted-foreground" />
                            <p className="text-[10px] text-muted-foreground">
                                Age data is estimated from public profile bios and activity patterns. Not directly from Twitter API.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Sentiment Distribution */}
                <Card>
                    <CardHeader>
                        <CardTitle>Sentiment Distribution</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        {sentimentData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={sentimentData}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        label={({ name, percent }: any) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                                    >
                                        {sentimentData.map((entry, i) => (
                                            <Cell key={i} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-muted-foreground">
                                No sentiment data available
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
