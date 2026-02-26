'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Campaign, FlaggedTweet, CampaignSnapshot } from '@/lib/types/campaign';
import { LOCATIONS } from '@/lib/locations';
import { ArrowLeft, AlertTriangle, MapPin, Users, TrendingUp, Clock } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const COLORS = ['#ef4444', '#f59e0b', '#a855f7', '#06b6d4', '#64748b'];

interface CampaignDetailViewProps {
    campaign: Campaign;
    snapshot: CampaignSnapshot | null;
    flaggedTweets: FlaggedTweet[];
    onBack: () => void;
}

export function CampaignDetailView({ campaign, snapshot, flaggedTweets, onBack }: CampaignDetailViewProps) {
    const categoryData = snapshot
        ? Object.entries(snapshot.matchesByCategory).map(([name, value]) => ({ name, value }))
        : [];

    const locationData = snapshot
        ? Object.entries(snapshot.matchesByLocation).map(([woeid, count]) => {
            const loc = LOCATIONS.find(l => l.woeid === parseInt(woeid));
            return { name: loc?.name || woeid, count };
        }).sort((a, b) => b.count - a.count)
        : [];

    // Aggregate age demographics from flagged tweets
    const ageCounts: Record<string, number> = {};
    flaggedTweets.forEach(t => {
        const age = t.estimatedAge || 'unknown';
        ageCounts[age] = (ageCounts[age] || 0) + 1;
    });
    const ageData = Object.entries(ageCounts)
        .filter(([k]) => k !== 'unknown')
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => a.name.localeCompare(b.name));

    // Mock timeline from snapshots
    const timelineData = campaign.snapshots.length > 0
        ? campaign.snapshots.map((s, i) => ({
            time: `${i}h ago`,
            matches: s.totalMatches,
            score: Math.round(s.averageHateScore * 100),
        }))
        : Array.from({ length: 12 }, (_, i) => ({
            time: `${11 - i}h`,
            matches: Math.floor(Math.random() * 40 + 10),
            score: Math.floor(Math.random() * 40 + 20),
        }));

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={onBack}>
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold">{campaign.name}</h1>
                    <p className="text-sm text-muted-foreground">{campaign.description}</p>
                </div>
                <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
                    {campaign.status}
                </Badge>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-surface/50 border-white/10">
                    <CardContent className="pt-4 pb-4">
                        <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                            <AlertTriangle className="w-3.5 h-3.5" /> Total Flags
                        </div>
                        <div className="text-2xl font-bold">{snapshot?.totalMatches || campaign.totalMatches}</div>
                    </CardContent>
                </Card>
                <Card className="bg-surface/50 border-white/10">
                    <CardContent className="pt-4 pb-4">
                        <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                            <TrendingUp className="w-3.5 h-3.5" /> Avg Score
                        </div>
                        <div className="text-2xl font-bold text-orange-400">
                            {snapshot ? (snapshot.averageHateScore * 100).toFixed(0) : '0'}%
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-surface/50 border-white/10">
                    <CardContent className="pt-4 pb-4">
                        <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                            <MapPin className="w-3.5 h-3.5" /> Locations
                        </div>
                        <div className="text-2xl font-bold">{campaign.monitoredLocations.length}</div>
                    </CardContent>
                </Card>
                <Card className="bg-surface/50 border-white/10">
                    <CardContent className="pt-4 pb-4">
                        <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                            <Clock className="w-3.5 h-3.5" /> Keywords
                        </div>
                        <div className="text-2xl font-bold">{campaign.keywords.length}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Hate Speech by Category */}
                <Card className="bg-surface/50 border-white/10">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm">By Category</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                                <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name }) => name}>
                                    {categoryData.map((_, i) => (
                                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Location Hotspots */}
                <Card className="bg-surface/50 border-white/10">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Location Hotspots</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={locationData} layout="vertical">
                                <XAxis type="number" hide />
                                <YAxis type="category" dataKey="name" width={80} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                                <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
                                <Bar dataKey="count" fill="#f97316" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Age Demographics */}
                <Card className="bg-surface/50 border-white/10">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                            <Users className="w-4 h-4" /> Age Demographics
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={ageData}>
                                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                                <YAxis hide />
                                <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
                                <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                        <p className="text-[10px] text-muted-foreground mt-1">Estimated from public profile bios</p>
                    </CardContent>
                </Card>
            </div>

            {/* Timeline */}
            <Card className="bg-surface/50 border-white/10">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Flagged Content Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={180}>
                        <AreaChart data={timelineData}>
                            <defs>
                                <linearGradient id="flagGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="time" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                            <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
                            <Area type="monotone" dataKey="matches" stroke="#f97316" fill="url(#flagGradient)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Flagged Tweets List */}
            <Card className="bg-surface/50 border-white/10">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Flagged Content ({flaggedTweets.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar">
                        {flaggedTweets.map(tweet => (
                            <div key={tweet.id} className="bg-black/20 rounded-lg p-3 border border-white/5">
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <Badge variant={tweet.hateSpeechScore > 0.7 ? 'emergency' : tweet.hateSpeechScore > 0.4 ? 'politics' : 'secondary'}>
                                            {tweet.hateSpeechScore > 0.7 ? 'High' : tweet.hateSpeechScore > 0.4 ? 'Medium' : 'Low'}
                                        </Badge>
                                        {tweet.categories.map(cat => (
                                            <span key={cat} className="text-[10px] text-muted-foreground bg-white/5 px-1.5 py-0.5 rounded">
                                                {cat}
                                            </span>
                                        ))}
                                    </div>
                                    <span className="text-[10px] text-muted-foreground">
                                        Score: {(tweet.hateSpeechScore * 100).toFixed(0)}%
                                    </span>
                                </div>
                                <p className="text-sm text-foreground/80 mb-2">{tweet.text}</p>
                                <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
                                    {tweet.authorLocation && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{tweet.authorLocation}</span>}
                                    {tweet.estimatedAge && <span className="flex items-center gap-1"><Users className="w-3 h-3" />Age: {tweet.estimatedAge}</span>}
                                    <span>{tweet.metrics.likes} likes</span>
                                    <span>{tweet.metrics.retweets} RTs</span>
                                </div>
                            </div>
                        ))}
                        {flaggedTweets.length === 0 && (
                            <div className="text-center text-muted-foreground py-8">
                                No flagged content yet. Campaign is monitoring...
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
