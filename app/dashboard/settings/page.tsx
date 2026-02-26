'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ApiKeyDialog } from '@/components/dashboard/ApiKeyDialog';
import { useTrendStore } from '@/lib/store';
import { Shield, Key, Bell, Globe, Cpu, CheckCircle, XCircle, ExternalLink } from 'lucide-react';

export default function SettingsPage() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const { apiKey, dataMode, apiTier, setApiTier, setDataMode } = useTrendStore();
    const [apiStatus, setApiStatus] = useState<any>(null);

    useEffect(() => {
        fetch('/api/status')
            .then(res => res.json())
            .then(data => {
                setApiStatus(data);
                if (data.twitter?.tier) setApiTier(data.twitter.tier);
            })
            .catch(() => {});
    }, [setApiTier]);

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>

            {/* API Configuration */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Key className="w-5 h-5 text-primary" />
                        <CardTitle>Twitter/X API Configuration</CardTitle>
                    </div>
                    <CardDescription>Manage your connection to Twitter/X API v2.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Server-side key status */}
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                        <div>
                            <div className="font-medium flex items-center gap-2">
                                Server API Key
                                {apiStatus?.twitter?.configured ? (
                                    <CheckCircle className="w-4 h-4 text-green-400" />
                                ) : (
                                    <XCircle className="w-4 h-4 text-red-400" />
                                )}
                            </div>
                            <div className={`text-sm ${apiStatus?.twitter?.configured ? 'text-green-400' : 'text-yellow-400'}`}>
                                {apiStatus?.twitter?.configured ? 'Configured in .env.local' : 'Not configured — set TWITTER_BEARER_TOKEN in .env.local'}
                            </div>
                        </div>
                        <Badge variant="secondary" className="capitalize">
                            {apiStatus?.twitter?.tier || 'free'} tier
                        </Badge>
                    </div>

                    {/* Client-side key (backward compat) */}
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                        <div>
                            <div className="font-medium">Browser API Key</div>
                            <div className={`text-sm ${apiKey ? 'text-green-400' : 'text-muted-foreground'}`}>
                                {apiKey ? 'Connected via browser' : 'Not set (optional)'}
                            </div>
                        </div>
                        <Button onClick={() => setIsDialogOpen(true)} variant="outline" size="sm">
                            {apiKey ? 'Update Key' : 'Connect API'}
                        </Button>
                    </div>

                    {/* Tier capabilities */}
                    {apiStatus?.twitter?.capabilities && (
                        <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                            <div className="font-medium mb-3">Tier Capabilities</div>
                            <div className="grid grid-cols-2 gap-2">
                                {Object.entries(apiStatus.twitter.capabilities).map(([key, value]) => (
                                    <div key={key} className="flex items-center gap-2 text-sm">
                                        {value ? (
                                            <CheckCircle className="w-3.5 h-3.5 text-green-400" />
                                        ) : (
                                            <XCircle className="w-3.5 h-3.5 text-red-400/50" />
                                        )}
                                        <span className={value ? 'text-foreground' : 'text-muted-foreground'}>
                                            {key.replace(/([A-Z])/g, ' $1').replace(/^can /, '').trim()}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            <a
                                href="https://developer.twitter.com/en/portal/products"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-indigo-400 hover:text-indigo-300 mt-3 inline-flex items-center gap-1"
                            >
                                Upgrade your API tier <ExternalLink className="w-3 h-3" />
                            </a>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* LLM Configuration */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Cpu className="w-5 h-5 text-primary" />
                        <CardTitle>AI Analysis (LLM)</CardTitle>
                    </div>
                    <CardDescription>Configure AI-powered hate speech analysis for campaigns.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                        <div>
                            <div className="font-medium flex items-center gap-2">
                                LLM Provider
                                {apiStatus?.llm?.configured ? (
                                    <CheckCircle className="w-4 h-4 text-green-400" />
                                ) : (
                                    <XCircle className="w-4 h-4 text-muted-foreground" />
                                )}
                            </div>
                            <div className="text-sm text-muted-foreground">
                                {apiStatus?.llm?.configured
                                    ? `${apiStatus.llm.provider} configured`
                                    : 'Set LLM_PROVIDER and LLM_API_KEY in .env.local for AI analysis'
                                }
                            </div>
                        </div>
                        <Badge variant="secondary">
                            {apiStatus?.llm?.configured ? 'Active' : 'Dictionary Only'}
                        </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-3">
                        Without an LLM, campaigns use keyword-based detection. Add an OpenAI or Anthropic API key for more nuanced hate speech analysis.
                    </p>
                </CardContent>
            </Card>

            {/* Data Mode */}
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
                        Data mode is automatically determined by your API tier. Free tier uses simulation; Basic+ tier fetches real data.
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

            <ApiKeyDialog isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} />
        </div>
    );
}
