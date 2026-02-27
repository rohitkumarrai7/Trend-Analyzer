'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useUser, UserButton } from '@clerk/nextjs';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
    BarChart3,
    Globe,
    LayoutDashboard,
    Settings,
    Users,
    ChevronLeft,
    Bell,
    Shield,
} from 'lucide-react';
import { motion } from 'framer-motion';

const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard',  href: '/dashboard' },
    { icon: Globe,           label: 'Live Map',   href: '/dashboard/map' },
    { icon: BarChart3,       label: 'Analytics',  href: '/dashboard/analytics' },
    { icon: Shield,          label: 'Campaigns',  href: '/dashboard/campaigns' },
    { icon: Users,           label: 'Audience',   href: '/dashboard/audience' },
    { icon: Bell,            label: 'Alerts',     href: '/dashboard/alerts' },
    { icon: Settings,        label: 'Settings',   href: '/dashboard/settings' },
];

export function Sidebar() {
    const pathname  = usePathname();
    const { user }  = useUser();
    const [collapsed, setCollapsed] = React.useState(false);

    const displayName = user?.fullName || user?.username || 'User';
    const plan        = 'Free Plan';

    return (
        <motion.div
            initial={{ width: 240 }}
            animate={{ width: collapsed ? 80 : 240 }}
            className="h-screen bg-surface border-r border-white/10 flex-col relative hidden md:flex transition-all duration-300"
        >
            {/* Logo */}
            <div className="h-16 flex items-center px-4 border-b border-white/5">
                <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/20">
                        <Globe className="w-5 h-5 text-white" />
                    </div>
                    {!collapsed && (
                        <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="font-bold text-lg tracking-tight bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent"
                        >
                            TrendMap
                        </motion.span>
                    )}
                </div>
            </div>

            {/* Navigation */}
            <div className="flex-1 py-6 px-3 space-y-1 overflow-y-auto custom-scrollbar">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link key={item.href} href={item.href}>
                            <Button
                                variant={isActive ? 'secondary' : 'ghost'}
                                className={cn(
                                    'w-full justify-start gap-3 mb-1',
                                    collapsed ? 'justify-center px-2' : 'px-4',
                                    isActive && 'bg-white/10 text-white shadow-inner',
                                )}
                            >
                                <item.icon className={cn('h-5 w-5', isActive ? 'text-primary' : 'text-muted-foreground')} />
                                {!collapsed && <span>{item.label}</span>}
                            </Button>
                        </Link>
                    );
                })}
            </div>

            {/* Collapse toggle */}
            <button
                onClick={() => setCollapsed(!collapsed)}
                className="absolute -right-3 top-20 bg-surface border border-white/10 rounded-full p-1 text-muted-foreground hover:text-white transition-colors shadow-xl"
            >
                <ChevronLeft className={cn('w-4 h-4 transition-transform', collapsed && 'rotate-180')} />
            </button>

            {/* User profile — real data from Clerk */}
            <div className="p-4 border-t border-white/5 bg-black/20">
                <div className="flex items-center gap-3">
                    <UserButton appearance={{ elements: { avatarBox: 'w-9 h-9' } }} />
                    {!collapsed && (
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">{displayName}</div>
                            <div className="text-xs text-muted-foreground truncate">{plan}</div>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
