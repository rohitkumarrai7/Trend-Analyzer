'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Shield, MapPin, AlertTriangle, Play, Pause, Trash2, Eye } from 'lucide-react';
import { Campaign } from '@/lib/types/campaign';
import { LOCATIONS } from '@/lib/locations';
import { CampaignCreateDialog } from '@/components/dashboard/CampaignCreateDialog';
import { CampaignDetailView } from '@/components/dashboard/CampaignDetailView';
import { generateSimulatedCampaignData, generateSimulatedFlaggedTweets } from '@/lib/simulation';

export default function CampaignsPage() {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [showCreate, setShowCreate] = useState(false);
    const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchCampaigns = async () => {
        try {
            const res = await fetch('/api/campaigns');
            const data = await res.json();
            setCampaigns(data.campaigns || []);
        } catch {
            setCampaigns([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchCampaigns(); }, []);

    const handleCreate = async (data: any) => {
        try {
            await fetch('/api/campaigns', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            fetchCampaigns();
        } catch (err) {
            console.error('Failed to create campaign:', err);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await fetch(`/api/campaigns?id=${id}`, { method: 'DELETE' });
            fetchCampaigns();
            if (selectedCampaign?.id === id) setSelectedCampaign(null);
        } catch (err) {
            console.error('Failed to delete campaign:', err);
        }
    };

    const handleToggleStatus = async (campaign: Campaign) => {
        try {
            await fetch('/api/campaigns', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: campaign.id,
                    status: campaign.status === 'active' ? 'paused' : 'active',
                }),
            });
            fetchCampaigns();
        } catch (err) {
            console.error('Failed to toggle campaign:', err);
        }
    };

    // Show detail view if a campaign is selected
    if (selectedCampaign) {
        const snapshot = generateSimulatedCampaignData(selectedCampaign);
        const flaggedTweets = generateSimulatedFlaggedTweets(selectedCampaign, 15);
        return (
            <CampaignDetailView
                campaign={selectedCampaign}
                snapshot={snapshot}
                flaggedTweets={flaggedTweets}
                onBack={() => setSelectedCampaign(null)}
            />
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Shield className="w-6 h-6 text-orange-400" />
                        Campaign Monitor
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Track hate speech and harmful content across locations
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
                            Create a campaign to start monitoring hate speech and harmful content on Twitter/X in specific locations.
                        </p>
                        <Button onClick={() => setShowCreate(true)} variant="outline">
                            <Plus className="w-4 h-4 mr-2" /> Create Your First Campaign
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {campaigns.map(campaign => {
                        const locNames = campaign.monitoredLocations
                            .map(w => LOCATIONS.find(l => l.woeid === w)?.name || '')
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
                                    {/* Keywords */}
                                    <div className="flex flex-wrap gap-1.5">
                                        {campaign.keywords.slice(0, 4).map(kw => (
                                            <span key={kw} className="bg-orange-500/10 text-orange-400 text-[10px] px-2 py-0.5 rounded-full border border-orange-500/20">
                                                {kw}
                                            </span>
                                        ))}
                                        {campaign.keywords.length > 4 && (
                                            <span className="text-[10px] text-muted-foreground">+{campaign.keywords.length - 4} more</span>
                                        )}
                                    </div>

                                    {/* Locations */}
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                        <MapPin className="w-3 h-3" />
                                        {locNames.join(', ')}
                                        {campaign.monitoredLocations.length > 3 && ` +${campaign.monitoredLocations.length - 3}`}
                                    </div>

                                    {/* Stats */}
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="bg-black/20 rounded px-2 py-1.5 text-center">
                                            <div className="text-[10px] text-muted-foreground">Flags</div>
                                            <div className="text-sm font-bold">{campaign.totalMatches}</div>
                                        </div>
                                        <div className="bg-black/20 rounded px-2 py-1.5 text-center">
                                            <div className="text-[10px] text-muted-foreground">Threshold</div>
                                            <div className="text-sm font-bold">{campaign.alertThreshold}/hr</div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2 pt-1">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="flex-1 text-xs"
                                            onClick={() => setSelectedCampaign(campaign)}
                                        >
                                            <Eye className="w-3 h-3 mr-1" /> View
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
