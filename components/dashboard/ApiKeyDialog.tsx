'use client';

import * as React from 'react';
import { X, Key, Check, AlertTriangle, ExternalLink, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useTrendStore } from '@/lib/store';
import { motion, AnimatePresence } from 'framer-motion';

interface ApiKeyDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

export function ApiKeyDialog({ isOpen, onClose }: ApiKeyDialogProps) {
    const { apiKey, setApiKey } = useTrendStore();
    const [inputValue, setInputValue] = React.useState(apiKey || '');
    const [isSaved, setIsSaved] = React.useState(false);

    const handleSave = () => {
        setApiKey(inputValue);
        setIsSaved(true);
        setTimeout(() => {
            setIsSaved(false);
            onClose();
        }, 1000);
    };

    const handleClear = () => {
        setApiKey(null);
        setInputValue('');
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md p-4"
                    >
                        <Card className="bg-surface/90 border-white/10 shadow-2xl backdrop-blur-xl relative overflow-hidden">
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 text-muted-foreground hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <div className="p-6 space-y-6">
                                <div className="text-center space-y-2">
                                    <div className="mx-auto w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                                        <Key className="w-6 h-6 text-primary" />
                                    </div>

                                    <h2 className="text-2xl font-bold">Connect Twitter API</h2>
                                    <p className="text-sm text-muted-foreground">
                                        To access real-time data, you need a <strong>Bearer Token</strong>.
                                    </p>

                                    <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-4 text-left space-y-2">
                                        <h3 className="text-xs font-bold text-indigo-300 uppercase flex items-center gap-2">
                                            <HelpCircle className="w-3 h-3" /> How to get a key:
                                        </h3>
                                        <ol className="text-xs text-muted-foreground list-decimal pl-4 space-y-1">
                                            <li>Go to <a href="https://developer.twitter.com/en/portal/dashboard" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline inline-flex items-center">Twitter Developer Portal <ExternalLink className="w-3 h-3 ml-1" /></a>.</li>
                                            <li>Create a new Project & App (Free Tier works).</li>
                                            <li>Copy the <strong>Bearer Token</strong> from "Keys and Tokens".</li>
                                            <li>Paste it below to unlock real data.</li>
                                        </ol>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium uppercase text-muted-foreground">Bearer Token</label>
                                        <Input
                                            placeholder="AAAAAAAAAAAAAAAAAAAA..."
                                            value={inputValue}
                                            onChange={(e) => setInputValue(e.target.value)}
                                            type="password"
                                            className="bg-black/20 border-white/10 font-mono text-sm"
                                        />
                                    </div>

                                    {!inputValue && (
                                        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 flex items-start gap-3">
                                            <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0" />
                                            <div className="text-xs text-yellow-200/80">
                                                Without a key, the dashboard runs in <strong>Simulation Mode</strong> using realistic mock data based on location.
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex gap-3 pt-2">
                                        <Button
                                            variant="outline"
                                            className="flex-1"
                                            onClick={handleClear}
                                        >
                                            Use Simulation
                                        </Button>
                                        <Button
                                            className={`flex-1 ${isSaved ? 'bg-green-500 hover:bg-green-600' : ''}`}
                                            onClick={handleSave}
                                            disabled={!inputValue}
                                        >
                                            {isSaved ? <Check className="w-4 h-4 mr-2" /> : null}
                                            {isSaved ? 'Saved!' : 'Save Key'}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
