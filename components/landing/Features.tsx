'use client';

import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Globe, BarChart3, Zap, Shield, Smartphone, Share2 } from 'lucide-react';

const features = [
    {
        icon: Globe,
        title: "Global Coverage",
        description: "Track trends across 400+ cities and 195 countries in real-time.",
        color: "text-blue-400"
    },
    {
        icon: Zap,
        title: "Bring Your Own Key",
        description: "Connect your Twitter API key for live data, or use free simulated mode.",
        color: "text-yellow-400"
    },
    {
        icon: BarChart3,
        title: "Deep Analytics",
        description: "Analyze sentiment, volume growth, and demographic reach.",
        color: "text-purple-400"
    },
    {
        icon: Shield,
        title: "Open Source",
        description: "Transparent algorithms and secure data handling.",
        color: "text-green-400"
    },
    {
        icon: Smartphone,
        title: "Mobile First",
        description: "Fully responsive design that works perfectly on any device.",
        color: "text-pink-400"
    },
    {
        icon: Share2,
        title: "Easy Sharing",
        description: "Export reports and share live dashboards with one click.",
        color: "text-cyan-400"
    }
];

export function Features() {
    return (
        <div className="py-24 bg-black/20 relative overflow-hidden">
            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
                    <h2 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                        Everything you need to master trends
                    </h2>
                    <p className="text-lg text-muted-foreground">
                        Powerful tools designed for research and discovery. Free forever.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((feature, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            viewport={{ once: true }}
                        >
                            <Card variant="glass" className="h-full hover:-translate-y-1 transition-transform duration-300">
                                <CardHeader>
                                    <div className={`p-3 rounded-lg bg-white/5 w-fit mb-4 ${feature.color}`}>
                                        <feature.icon className="h-6 w-6" />
                                    </div>
                                    <CardTitle className="text-xl mb-2">{feature.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground leading-relaxed">
                                        {feature.description}
                                    </p>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
