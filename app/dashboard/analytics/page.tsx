import { AnalyticsView } from '@/components/dashboard/AnalyticsView';

export default function AnalyticsPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
                <div className="text-sm text-muted-foreground">Real-time insights</div>
            </div>
            <AnalyticsView />
        </div>
    );
}
