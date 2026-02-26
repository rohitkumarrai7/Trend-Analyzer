'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, Bell, CheckCircle, Shield, TrendingUp, Radio } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTrendStore } from '@/lib/store';
import { Campaign } from '@/lib/types/campaign';

interface Alert {
    id: string;
    type: 'campaign' | 'volume' | 'system' | 'tier';
    severity: 'high' | 'medium' | 'low' | 'info';
    title: string;
    message: string;
    timestamp: string;
}

export default function AlertsPage() {
    const { stats, dataMode, apiTier, campaigns } = useTrendStore();
    const [alerts, setAlerts] = useState<Alert[]>([]);

    useEffect(() => {
        const generated: Alert[] = [];

        // Data mode alert
        if (dataMode === 'simulation') {
            generated.push({
                id: 'sim-mode',
                type: 'tier',
                severity: 'medium',
                title: 'Simulation Mode Active',
                message: 'You are viewing simulated data. Upgrade to Basic tier ($100/mo) to access real Twitter/X data.',
                timestamp: new Date().toISOString(),
            });
        }

        // API tier info
        if (apiTier === 'free') {
            generated.push({
                id: 'free-tier',
                type: 'tier',
                severity: 'low',
                title: 'Free Tier Limitations',
                message: 'Free tier cannot search tweets or get trends. Campaign monitoring uses simulated data until you upgrade.',
                timestamp: new Date().toISOString(),
            });
        }

        // Volume alerts from trends
        if (stats.totalTrends > 0 && stats.emergencyCount > 0) {
            generated.push({
                id: 'emergency-alert',
                type: 'volume',
                severity: 'high',
                title: `${stats.emergencyCount} Emergency Signal${stats.emergencyCount > 1 ? 's' : ''} Detected`,
                message: `Emergency-category trends detected in your selected location with high tweet volume.`,
                timestamp: new Date(Date.now() - 120000).toISOString(),
            });
        }

        if (stats.totalVolume > 1000000) {
            generated.push({
                id: 'high-volume',
                type: 'volume',
                severity: 'medium',
                title: 'High Volume Detected',
                message: `Total tweet volume exceeds 1M (${(stats.totalVolume / 1000000).toFixed(1)}M) in the current region.`,
                timestamp: new Date(Date.now() - 300000).toISOString(),
            });
        }

        // Campaign alerts
        campaigns.forEach(campaign => {
            if (campaign.status === 'active') {
                generated.push({
                    id: `campaign-${campaign.id}`,
                    type: 'campaign',
                    severity: 'medium',
                    title: `Campaign "${campaign.name}" Active`,
                    message: `Monitoring ${campaign.keywords.length} keywords across ${campaign.monitoredLocations.length} locations. ${campaign.totalMatches} matches so far.`,
                    timestamp: campaign.updatedAt,
                });
            }
        });

        // System alert
        generated.push({
            id: 'system-update',
            type: 'system',
            severity: 'info',
            title: 'System Online',
            message: 'Dashboard is running with all services operational. Data refreshes every 30 seconds.',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
        });

        setAlerts(generated);
    }, [stats, dataMode, apiTier, campaigns]);

    const getAlertIcon = (type: string, severity: string) => {
        if (type === 'campaign') return <Shield className="h-5 w-5 text-orange-400 mt-0.5" />;
        if (severity === 'high') return <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />;
        if (severity === 'medium') return <Bell className="h-5 w-5 text-yellow-500 mt-0.5" />;
        if (severity === 'info') return <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />;
        return <Radio className="h-5 w-5 text-blue-400 mt-0.5" />;
    };

    const getBorderColor = (severity: string) => {
        switch (severity) {
            case 'high': return 'border-l-red-500';
            case 'medium': return 'border-l-yellow-500';
            case 'low': return 'border-l-blue-500';
            default: return 'border-l-green-500';
        }
    };

    const timeAgo = (ts: string) => {
        const diff = Date.now() - new Date(ts).getTime();
        if (diff < 60000) return 'just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
        return `${Math.floor(diff / 86400000)}d ago`;
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Alerts</h1>
                <Badge variant="secondary">{alerts.length} active</Badge>
            </div>

            <div className="space-y-3">
                {alerts.map(alert => (
                    <Card key={alert.id} className={`border-l-4 ${getBorderColor(alert.severity)}`}>
                        <CardHeader className="py-4">
                            <div className="flex items-start gap-4">
                                {getAlertIcon(alert.type, alert.severity)}
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <CardTitle className="text-base">{alert.title}</CardTitle>
                                        <Badge variant="secondary" className="text-[10px] capitalize">{alert.type}</Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-1">{alert.message}</p>
                                </div>
                                <div className="text-xs text-muted-foreground whitespace-nowrap">{timeAgo(alert.timestamp)}</div>
                            </div>
                        </CardHeader>
                    </Card>
                ))}
            </div>
        </div>
    );
}
