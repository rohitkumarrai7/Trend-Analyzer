'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useTrendStore } from '@/lib/store';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Hash, TrendingUp, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function TrendList() {
    const { trends, selectedCategory, setCategory } = useTrendStore();

    const filteredTrends = React.useMemo(() => {
        if (selectedCategory === 'all') return trends;
        return trends.filter(t => t.category === selectedCategory);
    }, [trends, selectedCategory]);

    return (
        <Card variant="glass" className="h-[600px] flex flex-col">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-xl">Trending Topics</CardTitle>
                        <CardDescription>Targeted social signals</CardDescription>
                    </div>
                    <Button variant="ghost" size="icon">
                        <Filter className="h-4 w-4 text-muted-foreground" />
                    </Button>
                </div>

                {/* Category Filter Pills */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-2 scrollbar-none mask-gradient-r">
                    <button
                        onClick={() => setCategory('all')}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors border ${selectedCategory === 'all'
                                ? 'bg-white/10 text-white border-white/20'
                                : 'text-muted-foreground border-transparent hover:bg-white/5'
                            }`}
                    >
                        All
                    </button>
                    {['emergency', 'politics', 'sports', 'entertainment', 'technology'].map(cat => (
                        <button
                            key={cat}
                            onClick={() => setCategory(cat as any)}
                            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors border capitalize ${selectedCategory === cat
                                    ? 'bg-primary/20 text-primary border-primary/30 shadow-[0_0_10px_rgba(99,102,241,0.2)]'
                                    : 'text-muted-foreground border-transparent hover:bg-white/5'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </CardHeader>

            <CardContent className="flex-1 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                <AnimatePresence initial={false}>
                    {filteredTrends.map((trend, i) => (
                        <motion.div
                            key={trend.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ delay: i * 0.05 }}
                            className="group flex items-center justify-between p-3 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/10 transition-all cursor-pointer"
                            onClick={() => window.open(trend.url, '_blank')}
                        >
                            <div className="flex items-center gap-3">
                                <div className="text-xs font-mono text-muted-foreground w-4 text-center">
                                    {i + 1}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-foreground group-hover:text-primary transition-colors">
                                            {trend.hashtag}
                                        </span>
                                        {trend.tweetVolume > 100000 && (
                                            <TrendingUp className="h-3 w-3 text-red-400 animate-pulse" />
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <span className="flex items-center gap-1">
                                            {trend.tweetVolume.toLocaleString()} posts
                                        </span>
                                        <span>•</span>
                                        <span className={
                                            trend.sentiment === 'positive' ? 'text-green-400' :
                                                trend.sentiment === 'negative' ? 'text-red-400' : 'text-yellow-400'
                                        }>
                                            {trend.sentiment}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col items-end gap-1">
                                <Badge variant={trend.category} className="text-[10px] uppercase tracking-wider px-1.5 py-0.5">
                                    {trend.category}
                                </Badge>
                                {trend.change && (
                                    <span className={`text-[10px] font-medium ${trend.change > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                        {trend.change > 0 ? '+' : ''}{trend.change}%
                                    </span>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </CardContent>
        </Card>
    );
}
