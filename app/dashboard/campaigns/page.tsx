'use client';

import { useState, useCallback } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Shield, MapPin, Play, Pause, Trash2, Eye, RefreshCw, Radio, AlertCircle, Clock } from 'lucide-react';
import { Campaign, FlaggedTweet } from '@/lib/types/campaign';
import { LOCATIONS } from '@/lib/locations';
import { CampaignCreateDialog } from '@/components/dashboard/CampaignCreateDialog';
import { CampaignDetailView } from '@/components/dashboard/CampaignDetailView';
import { generateSimulatedCampaignData } from '@/lib/simulation';

// Map a Convex doc to the Campaign UI type
function toUICampaign(doc: any): Campaign {
    return {
        id: doc._id as string,
        name: doc.name,
        description: doc.description || '',
        status: doc.status,
        keywords: doc.keywords,
        hashtags: doc.hashtags,
        monitoredLocations: doc.monitoredLocations,
        totalMatches: doc.totalMatches,
        flaggedTweets: [],
        snapshots: [],
        alertThreshold: doc.alertThreshold,
        alertEnabled: doc.alertEnabled,
        scanInterval: doc.scanInterval ?? 12,
        lastScannedAt: doc.lastScannedAt ? new Date(doc.lastScannedAt).toISOString() : undefined,
        createdAt: new Date(doc._creationTime).toISOString(),
        updatedAt: new Date(doc._creationTime).toISOString(),
    };
}

// Map a Convex flaggedTweet doc to UI FlaggedTweet type
function toUIFlaggedTweet(doc: any): FlaggedTweet {
    return {
        id: doc._id as string,
        text: doc.text,
        authorId: doc.authorHandle,
        authorBio: doc.authorBio,
        authorLocation: doc.authorLocation,
        createdAt: doc.createdAt,
        metrics: { likes: doc.likes, retweets: doc.retweets, replies: doc.replies },
        hateSpeechScore: doc.hateSpeechScore,
        categories: doc.categories,
        estimatedAge: undefined,
    };
}

function formatLastScanned(isoOrMs: string | number | undefined): string {
    if (!isoOrMs) return 'Never scanned';
    const d = typeof isoOrMs === 'number' ? new Date(isoOrMs) : new Date(isoOrMs);
    const diffMs = Date.now() - d.getTime();
    const diffH = Math.floor(diffMs / 3600000);
    const diffM = Math.floor(diffMs / 60000);
    if (diffM < 1) return 'Just now';
    if (diffM < 60) return `${diffM}m ago`;
    if (diffH < 24) return `${diffH}h ago`;
    return `${Math.floor(diffH / 24)}d ago`;
}

export default function CampaignsPage() {
    const rawCampaigns    = useQuery(api.campaigns.list);
    const createCampaign  = useMutation(api.campaigns.create);
    const removeCampaign  = useMutation(api.campaigns.remove);
    const updateStatus    = useMutation(api.campaigns.updateStatus);
    const updateInterval  = useMutation(api.campaigns.updateScanInterval);
    const recordScan      = useMutation(api.campaigns.recordScan);
    const storeTweets     = useMutation(api.flaggedTweets.storeBatch);

    const campaigns = rawCampaigns?.map(toUICampaign) ?? [];
    const loading   = rawCampaigns === undefined;

    const [showCreate, setShowCreate]             = useState(false);
    const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
    const [scanLoading, setScanLoading]           = useState(false);
    const [scanStatus, setScanStatus]             = useState<{ source: string; totalSearched: number; flagged: number } | null>(null);
    const [scanError, setScanError]               = useState<string | null>(null);

    // Load persisted flagged tweets from Convex for the selected campaign
    const storedTweets = useQuery(
        api.flaggedTweets.listForCampaign,
        selectedCampaign ? { campaignId: selectedCampaign.id } : 'skip'
    );

    const handleCreate = async (data: any) => {
        try {
            await createCampaign({
                name: data.name,
                description: data.description,
                keywords: data.keywords,
                hashtags: data.hashtags || [],
                monitoredLocations: data.monitoredLocations,
                alertThreshold: data.alertThreshold,
                scanInterval: data.scanInterval ?? 12,
            });
        } catch (err) {
            console.error('Failed to create campaign:', err);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await removeCampaign({ id: id as Id<'campaigns'> });
            if (selectedCampaign?.id === id) setSelectedCampaign(null);
        } catch (err) {
            console.error('Failed to delete campaign:', err);
        }
    };

    const handleToggleStatus = async (campaign: Campaign) => {
        try {
            await updateStatus({
                id: campaign.id as Id<'campaigns'>,
                status: campaign.status === 'active' ? 'paused' : 'active',
            });
        } catch (err) {
            console.error('Failed to toggle campaign:', err);
        }
    };

    const handleIntervalChange = async (campaign: Campaign, hours: number) => {
        try {
            await updateInterval({ id: campaign.id as Id<'campaigns'>, scanInterval: hours });
        } catch (err) {
            console.error('Failed to update scan interval:', err);
        }
    };

    // Trigger a manual scan via the API route, then persist results to Convex
    const handleScan = useCallback(async (campaign: Campaign) => {
        setScanLoading(true);
        setScanStatus(null);
        setScanError(null);

        try {
            const res = await fetch('/api/campaigns/scan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ keywords: campaign.keywords, hashtags: campaign.hashtags }),
            });
            const data = await res.json();

            if (data.flaggedTweets && data.flaggedTweets.length > 0) {
                // Persist to Convex so they survive navigation
                await storeTweets({
                    campaignId: campaign.id,
                    tweets: data.flaggedTweets.map((t: FlaggedTweet) => ({
                        tweetId: t.id,
                        text: t.text,
                        authorHandle: t.authorId || 'unknown',
                        authorLocation: t.authorLocation,
                        authorBio: t.authorBio,
                        createdAt: t.createdAt || new Date().toISOString(),
                        hateSpeechScore: t.hateSpeechScore,
                        categories: t.categories,
                        likes: t.metrics?.likes ?? 0,
                        retweets: t.metrics?.retweets ?? 0,
                        replies: t.metrics?.replies ?? 0,
                        source: data.source || 'twitter_guest',
                    })),
                }).catch(() => {});

                // Update campaign totalMatches + lastScannedAt
                await recordScan({
                    id: campaign.id as Id<'campaigns'>,
                    matchCount: data.flaggedTweets.length,
                }).catch(() => {});
            }

            setScanStatus({
                source: data.source || 'unknown',
                totalSearched: data.totalSearched || 0,
                flagged: data.flaggedTweets?.length || 0,
            });
        } catch (err) {
            setScanError('Scan failed — Twitter guest API may be rate limited. Try again in a minute.');
        } finally {
            setScanLoading(false);
        }
    }, [storeTweets, recordScan]);

    const handleViewCampaign = useCallback((campaign: Campaign) => {
        setSelectedCampaign(campaign);
        setScanStatus(null);
        setScanError(null);
        // Auto-trigger scan on open
        handleScan(campaign);
    }, [handleScan]);

    // ── Detail view ────────────────────────────────────────────────────────────
    if (selectedCampaign) {
        const snapshot = generateSimulatedCampaignData(selectedCampaign);
        // Use persisted Convex tweets (real + from previous scans)
        const flaggedTweets: FlaggedTweet[] = (storedTweets ?? []).map(toUIFlaggedTweet);

        return (
            <div className="space-y-6">
                {/* Scan status banner */}
                <div className={`flex items-center gap-3 px-4 py-2.5 rounded-lg border text-sm ${
                    scanLoading
                        ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300'
                        : scanError
                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                        : scanStatus
                        ? 'bg-green-500/10 border-green-500/30 text-green-300'
                        : 'bg-white/5 border-white/10 text-muted-foreground'
                }`}>
                    {scanLoading ? (
                        <><RefreshCw className="w-4 h-4 animate-spin" /> Scanning X/Twitter for campaign keywords (last 48h)...</>
                    ) : scanError ? (
                        <><AlertCircle className="w-4 h-4" /> {scanError}</>
                    ) : scanStatus ? (
                        <><Radio className="w-4 h-4" />
                            Scan complete — {scanStatus.totalSearched} tweets searched, {scanStatus.flagged} new flagged · {scanStatus.source}
                            {flaggedTweets.length > scanStatus.flagged && ` · ${flaggedTweets.length} total stored`}
                        </>
                    ) : (
                        <><Clock className="w-4 h-4" /> Showing {flaggedTweets.length} stored flagged tweets · Next auto-scan in ~{selectedCampaign.scanInterval}h</>
                    )}
                </div>

                <CampaignDetailView
                    campaign={selectedCampaign}
                    snapshot={snapshot}
                    flaggedTweets={flaggedTweets}
                    onBack={() => { setSelectedCampaign(null); setScanStatus(null); setScanError(null); }}
                    onRescan={() => handleScan(selectedCampaign)}
                    scanLoading={scanLoading}
                />
            </div>
        );
    }

    // ── Campaign list ──────────────────────────────────────────────────────────
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Shield className="w-6 h-6 text-orange-400" />
                        Campaign Monitor
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Real tweets from X.com · Emotion-based hate speech detection · Auto-scheduled scans
                    </p>
                </div>
                <Button
                    onClick={() => setShowCreate(true)}
                    className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                >
                    <Plus className="w-4 h-4 mr-2" /> New Campaign
                </Button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                </div>
            ) : campaigns.length === 0 ? (
                <Card className="bg-surface/50 border-white/10 border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-16">
                        <Shield className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
                        <h3 className="text-lg font-semibold mb-2">No campaigns yet</h3>
                        <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
                            Create a campaign to monitor hate speech on X/Twitter. Keywords like
                            &quot;India Pakistan bot&quot;, &quot;islamophobia&quot; or any terms.
                            Scans run every 12h or 24h automatically via Convex cloud.
                        </p>
                        <Button onClick={() => setShowCreate(true)} variant="outline">
                            <Plus className="w-4 h-4 mr-2" /> Create Your First Campaign
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {campaigns.map((campaign: Campaign) => {
                        const locNames = campaign.monitoredLocations
                            .map((w: number) => LOCATIONS.find(l => l.woeid === w)?.name || '')
                            .filter(Boolean)
                            .slice(0, 3);

                        return (
                            <Card key={campaign.id} className="bg-surface/50 border-white/10 hover:border-white/20 transition-colors">
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between">
                                        <CardTitle className="text-base">{campaign.name}</CardTitle>
                                        <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
                                            {campaign.status}
                                        </Badge>
                                    </div>
                                    {campaign.description && (
                                        <p className="text-xs text-muted-foreground line-clamp-2">{campaign.description}</p>
                                    )}
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex flex-wrap gap-1.5">
                                        {campaign.keywords.slice(0, 4).map((kw: string) => (
                                            <span key={kw} className="bg-orange-500/10 text-orange-400 text-[10px] px-2 py-0.5 rounded-full border border-orange-500/20">
                                                {kw}
                                            </span>
                                        ))}
                                        {campaign.keywords.length > 4 && (
                                            <span className="text-[10px] text-muted-foreground">+{campaign.keywords.length - 4} more</span>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                        <MapPin className="w-3 h-3" />
                                        {locNames.join(', ')}
                                        {campaign.monitoredLocations.length > 3 && ` +${campaign.monitoredLocations.length - 3}`}
                                    </div>

                                    <div className="grid grid-cols-3 gap-2">
                                        <div className="bg-black/20 rounded px-2 py-1.5 text-center">
                                            <div className="text-[10px] text-muted-foreground">Flags</div>
                                            <div className="text-sm font-bold">{campaign.totalMatches}</div>
                                        </div>
                                        <div className="bg-black/20 rounded px-2 py-1.5 text-center">
                                            <div className="text-[10px] text-muted-foreground">Threshold</div>
                                            <div className="text-sm font-bold">{campaign.alertThreshold}/hr</div>
                                        </div>
                                        <div className="bg-black/20 rounded px-2 py-1.5 text-center col-span-1">
                                            <div className="text-[10px] text-muted-foreground">Last scan</div>
                                            <div className="text-[10px] font-medium text-muted-foreground">{formatLastScanned(campaign.lastScannedAt)}</div>
                                        </div>
                                    </div>

                                    {/* Scan interval selector */}
                                    <div className="flex items-center gap-1.5">
                                        <Clock className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                                        <span className="text-[10px] text-muted-foreground">Auto-scan every:</span>
                                        {[12, 24].map(h => (
                                            <button
                                                key={h}
                                                onClick={() => handleIntervalChange(campaign, h)}
                                                className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${
                                                    (campaign.scanInterval ?? 12) === h
                                                        ? 'bg-primary/20 text-primary border-primary/30'
                                                        : 'text-muted-foreground border-transparent hover:bg-white/5'
                                                }`}
                                            >
                                                {h}h
                                            </button>
                                        ))}
                                    </div>

                                    <div className="flex items-center gap-2 pt-1">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="flex-1 text-xs"
                                            onClick={() => handleViewCampaign(campaign)}
                                        >
                                            <Eye className="w-3 h-3 mr-1" /> View & Scan
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => handleToggleStatus(campaign)}
                                            className="text-xs"
                                        >
                                            {campaign.status === 'active'
                                                ? <><Pause className="w-3 h-3 mr-1" /> Pause</>
                                                : <><Play className="w-3 h-3 mr-1" /> Resume</>
                                            }
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => handleDelete(campaign.id)}
                                            className="text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}

            <CampaignCreateDialog
                isOpen={showCreate}
                onClose={() => setShowCreate(false)}
                onSubmit={handleCreate}
            />
        </div>
    );
}
