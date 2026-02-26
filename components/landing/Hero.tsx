'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, Globe, Zap, Key } from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const MapPreview = dynamic(() => import('@/components/map/TrendMap'), { ssr: false });

export function Hero() {
    return (
        <div className="relative min-h-screen flex flex-col justify-center overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-background to-background z-0" />
            <div className="absolute top-[20%] right-[10%] w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[10%] left-[10%] w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="container mx-auto px-4 pt-20 pb-16 relative z-10 grid lg:grid-cols-2 gap-12 items-center">
                {/* Text Content */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="space-y-8"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
                        <span className="flex h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                        <span className="text-sm font-medium text-green-400">Open Source Intelligence</span>
                    </div>

                    <h1 className="text-5xl lg:text-7xl font-bold tracking-tight leading-none bg-gradient-to-r from-white via-white/90 to-white/50 bg-clip-text text-transparent">
                        Global Trends. <br />
                        <span className="text-gradient">Your Data.</span>
                    </h1>

                    <p className="text-xl text-muted-foreground max-w-xl leading-relaxed">
                        A powerful, open-source dashboard for visualizing social media trends.
                        Bring your own Twitter API key for live data, or explore our simulated global map.
                    </p>

                    <div className="flex flex-wrap items-center gap-4">
                        <Link href="/dashboard">
                            <Button size="xl" className="group rounded-full text-lg px-8">
                                Launch Dashboard
                                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </Link>
                        <Button size="xl" variant="outline" className="rounded-full px-8 border-white/10 hover:bg-white/5 gap-2">
                            <Key className="w-4 h-4" /> Feature Request
                        </Button>
                    </div>

                    <div className="flex items-center gap-8 pt-8 border-t border-white/5">
                        {[
                            { label: 'Open Source', value: '100%' },
                            { label: 'Cities Supported', value: '50+' },
                            { label: 'Setup Time', value: '< 1m' }
                        ].map((stat) => (
                            <div key={stat.label}>
                                <div className="text-2xl font-bold text-white">{stat.value}</div>
                                <div className="text-sm text-muted-foreground">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* 3D Map Preview */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, rotateX: 20 }}
                    animate={{ opacity: 1, scale: 1, rotateX: 0 }}
                    transition={{ duration: 1, delay: 0.2 }}
                    className="relative h-[600px] w-full"
                >
                    <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 rounded-3xl blur-2xl transform rotate-3" />
                    <div className="relative h-full w-full bg-surface/50 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl ring-1 ring-white/10">
                        {/* Header Mimic */}
                        <div className="absolute top-0 left-0 right-0 h-12 bg-black/40 border-b border-white/5 z-20 flex items-center px-4 gap-2">
                            <div className="flex gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-red-500/50" />
                                <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                                <div className="w-3 h-3 rounded-full bg-green-500/50" />
                            </div>
                            <div className="ml-4 flex-1 max-w-[200px] h-6 bg-white/5 rounded-full" />
                        </div>

                        {/* Map Component */}
                        <div className="w-full h-full pt-12 grayscale-[20%] hover:grayscale-0 transition-all duration-700">
                            <MapPreview />
                        </div>

                        {/* Floating Cards */}
                        <motion.div
                            animate={{ y: [0, -20, 0] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute bottom-8 left-8 p-4 bg-surface/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-xl z-30 max-w-xs"
                        >
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-red-500/20 rounded-lg">
                                    <Zap className="h-5 w-5 text-red-500" />
                                </div>
                                <div>
                                    <div className="font-bold text-sm">#OpenSource</div>
                                    <div className="text-xs text-red-400">Trending Globally</div>
                                </div>
                            </div>
                            <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                                <div className="h-full bg-red-500 w-[85%]" />
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
