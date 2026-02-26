'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, AlertTriangle, TrendingUp } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { useTrendStore } from '@/lib/store';

const CATEGORY_COLORS: Record<string, string> = {
    racial: '#ef4444',
    religious: '#f59e0b',
    gender: '#a855f7',
    sexual_orientation: '#06b6d4',
    xenophobic: '#f97316',
    disability: '#22c55e',
    other: '#64748b',
};

export function HateSpeechMetrics() {
    const { hateSpeechStats } = useTrendStore();

    const categoryData = Object.entries(hateSpeechStats.byCategory).map(([name, value]) => ({
        name,
        value,
    }));

    const totalFlagged = hateSpeechStats.totalFlagged;

    return (
        <Card className="bg-surface/50 border-white/10">
            <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                    <Shield className="w-4 h-4 text-orange-400" />
                    Hate Speech Monitor
                </CardTitle>
            </CardHeader>
            <CardContent>
                {totalFlagged === 0 ? (
                    <div className="text-center py-6">
                        <Shield className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                        <p className="text-sm text-muted-foreground">No active campaigns</p>
                        <p className="text-xs text-muted-foreground mt-1">Create a campaign to start monitoring</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {/* Summary */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-black/20 rounded-lg p-3 border border-white/5">
                                <div className="flex items-center gap-1.5 text-muted-foreground text-[10px] uppercase tracking-wider mb-1">
                                    <AlertTriangle className="w-3 h-3" /> Total Flagged
                                </div>
                                <div className="text-xl font-bold text-orange-400">{totalFlagged}</div>
                            </div>
                            <div className="bg-black/20 rounded-lg p-3 border border-white/5">
                                <div className="flex items-center gap-1.5 text-muted-foreground text-[10px] uppercase tracking-wider mb-1">
                                    <TrendingUp className="w-3 h-3" /> High Severity
                                </div>
                                <div className="text-xl font-bold text-red-400">{hateSpeechStats.highSeverity}</div>
                            </div>
                        </div>

                        {/* Category Breakdown */}
                        {categoryData.length > 0 && (
                            <ResponsiveContainer width="100%" height={160}>
                                <PieChart>
                                    <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={35} outerRadius={60} label={({ name }) => name}>
                                        {categoryData.map((entry, i) => (
                                            <Cell key={i} fill={CATEGORY_COLORS[entry.name] || '#64748b'} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }} />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
