'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, Globe, Cpu, CheckCircle, XCircle, X } from 'lucide-react';
import { useTrendStore } from '@/lib/store';

export default function SettingsPage() {
    const { dataMode } = useTrendStore();
    const [status, setStatus] = useState<any>(null);

    useEffect(() => {
        fetch('/api/status')
            .then(res => res.json())
            .then(data => setStatus(data))
            .catch(() => {});
    }, []);

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>

            {/* Twitter data source */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <X className="w-5 h-5 text-sky-400" />
                        <CardTitle>Twitter/X Data Source</CardTitle>
                    </div>
                    <CardDescription>
                        Uses Twitter's own guest token API — the same method twitter.com uses for
                        unauthenticated browsing. No API key, no account, no cost.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                        <div>
                            <div className="font-medium flex items-center gap-2">
                                Guest Token API
                                {status === null ? null : status?.twitter?.working ? (
                                    <CheckCircle className="w-4 h-4 text-green-400" />
                                ) : (
                                    <XCircle className="w-4 h-4 text-red-400" />
                                )}
                            </div>
                            <div className={`text-sm ${status?.twitter?.working ? 'text-green-400' : 'text-yellow-400'}`}>
                                {status === null ? 'Checking...' : status?.twitter?.note}
                            </div>
                        </div>
                        <Badge variant={status?.twitter?.working ? 'default' : 'secondary'}>
                            {status === null ? '...' : status?.twitter?.working ? 'Live' : 'Fallback'}
                        </Badge>
                    </div>

                    <div className="p-3 bg-sky-500/5 border border-sky-500/20 rounded-lg text-xs text-sky-200/80 space-y-1">
                        <div className="font-medium text-sky-300">How it works — zero setup</div>
                        <ul className="list-disc list-inside space-y-0.5">
                            <li>Twitter issues short-lived guest tokens for unauthenticated browsing</li>
                            <li>We call the same internal search API that twitter.com uses</li>
                            <li>Tokens auto-refresh every 3 hours — fully automatic</li>
                            <li>Twitter cannot block this without breaking their own embed widgets</li>
                        </ul>
                    </div>

                    <div className="text-xs text-muted-foreground">
                        Active source:{' '}
                        <span className="font-medium text-foreground">
                            {status?.activeSource === 'twitter_guest'
                                ? 'Twitter Guest API (real tweets — authentic)'
                                : 'Simulation (guest API will auto-retry)'}
                        </span>
                    </div>
                </CardContent>
            </Card>

            {/* LLM */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Cpu className="w-5 h-5 text-primary" />
                        <CardTitle>AI Hate Speech Analysis</CardTitle>
                    </div>
                    <CardDescription>Emotion-based LLM analysis for campaign scans.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                        <div>
                            <div className="font-medium flex items-center gap-2">
                                LLM Provider
                                {status?.llm?.configured ? (
                                    <CheckCircle className="w-4 h-4 text-green-400" />
                                ) : (
                                    <XCircle className="w-4 h-4 text-muted-foreground" />
                                )}
                            </div>
                            <div className="text-sm text-muted-foreground">
                                {status?.llm?.configured
                                    ? `${status.llm.provider} · ${status.llm.model}`
                                    : 'Set LLM_PROVIDER + LLM_API_KEY in .env.local'}
                            </div>
                        </div>
                        <Badge variant={status?.llm?.configured ? 'default' : 'secondary'}>
                            {status?.llm?.configured ? 'Active' : 'Dictionary Only'}
                        </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-3">
                        OpenRouter free tier (<code className="bg-black/30 px-1 rounded">arcee-ai/trinity-large-preview:free</code>)
                        works at zero cost. Without it, campaign scans fall back to keyword-based detection.
                    </p>
                </CardContent>
            </Card>

            {/* Data mode */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Globe className="w-5 h-5 text-primary" />
                        <CardTitle>Data Mode</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                        <div>
                            <div className="font-medium">Current Mode</div>
                            <div className={`text-sm ${dataMode === 'live' ? 'text-green-400' : 'text-amber-400'}`}>
                                {dataMode === 'live' ? 'Live Twitter Data' : 'Simulation Mode'}
                            </div>
                        </div>
                        <Badge variant={dataMode === 'live' ? 'default' : 'secondary'} className="capitalize">
                            {dataMode}
                        </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-3">
                        Switches to live automatically when the Twitter guest API is reachable.
                    </p>
                </CardContent>
            </Card>

            {/* Notifications */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Bell className="w-5 h-5 text-primary" />
                        <CardTitle>Notifications & Alerts</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between opacity-50 pointer-events-none">
                        <div>
                            <div className="font-medium">Trend Alerts</div>
                            <div className="text-sm text-muted-foreground">Get notified when a topic hits 10k+ volume</div>
                        </div>
                        <div className="h-6 w-11 bg-white/10 rounded-full relative">
                            <div className="absolute top-1 left-1 w-4 h-4 bg-white/50 rounded-full" />
                        </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-4">* Email alerts coming soon</p>
                </CardContent>
            </Card>
        </div>
    );
}
