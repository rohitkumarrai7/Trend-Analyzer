import { Sidebar } from '@/components/dashboard/Sidebar';
import { Header } from '@/components/dashboard/Header';
import { LocationInitializer } from '@/components/dashboard/LocationInitializer';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen bg-background text-foreground overflow-hidden">
            <LocationInitializer />
            <Sidebar />
            <div className="flex-1 flex flex-col h-full overflow-hidden">
                <Header />
                <main className="flex-1 overflow-auto p-4 md:p-6 bg-black/5">
                    {children}
                </main>
            </div>
        </div>
    );
}
