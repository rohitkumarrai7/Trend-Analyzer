'use client';

import * as React from 'react';
import { X, Plus, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { LOCATIONS } from '@/lib/locations';
import { motion, AnimatePresence } from 'framer-motion';

interface CampaignCreateDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: {
        name: string;
        description: string;
        keywords: string[];
        hashtags: string[];
        monitoredLocations: number[];
        alertThreshold: number;
    }) => void;
}

export function CampaignCreateDialog({ isOpen, onClose, onSubmit }: CampaignCreateDialogProps) {
    const [name, setName] = React.useState('');
    const [description, setDescription] = React.useState('');
    const [keywordInput, setKeywordInput] = React.useState('');
    const [keywords, setKeywords] = React.useState<string[]>([]);
    const [hashtagInput, setHashtagInput] = React.useState('');
    const [hashtags, setHashtags] = React.useState<string[]>([]);
    const [selectedLocations, setSelectedLocations] = React.useState<number[]>([]);
    const [alertThreshold, setAlertThreshold] = React.useState(10);
    const [locationSearch, setLocationSearch] = React.useState('');

    const filteredLocations = LOCATIONS.filter(loc =>
        loc.woeid !== 1 &&
        (loc.name.toLowerCase().includes(locationSearch.toLowerCase()) ||
         loc.country.toLowerCase().includes(locationSearch.toLowerCase()))
    ).slice(0, 8);

    const addKeyword = () => {
        const trimmed = keywordInput.trim();
        if (trimmed && !keywords.includes(trimmed)) {
            setKeywords([...keywords, trimmed]);
            setKeywordInput('');
        }
    };

    const addHashtag = () => {
        let trimmed = hashtagInput.trim();
        if (!trimmed.startsWith('#')) trimmed = '#' + trimmed;
        if (trimmed.length > 1 && !hashtags.includes(trimmed)) {
            setHashtags([...hashtags, trimmed]);
            setHashtagInput('');
        }
    };

    const toggleLocation = (woeid: number) => {
        setSelectedLocations(prev =>
            prev.includes(woeid)
                ? prev.filter(w => w !== woeid)
                : [...prev, woeid]
        );
    };

    const handleSubmit = () => {
        if (!name || keywords.length === 0 || selectedLocations.length === 0) return;
        onSubmit({ name, description, keywords, hashtags, monitoredLocations: selectedLocations, alertThreshold });
        setName('');
        setDescription('');
        setKeywords([]);
        setHashtags([]);
        setSelectedLocations([]);
        setAlertThreshold(10);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    onClick={e => e.stopPropagation()}
                    className="w-full max-w-lg max-h-[85vh] overflow-y-auto custom-scrollbar"
                >
                    <Card className="bg-surface border-white/10 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold">Create Campaign</h2>
                            <button onClick={onClose} className="text-muted-foreground hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-5">
                            {/* Name */}
                            <div>
                                <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Campaign Name</label>
                                <Input
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    placeholder="e.g., Anti-Racism Monitor Delhi"
                                    className="bg-black/20 border-white/10"
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Description</label>
                                <Input
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    placeholder="Brief description of what this campaign monitors"
                                    className="bg-black/20 border-white/10"
                                />
                            </div>

                            {/* Keywords */}
                            <div>
                                <label className="text-sm font-medium text-muted-foreground mb-1.5 block">
                                    Keywords to Monitor <span className="text-red-400">*</span>
                                </label>
                                <div className="flex gap-2">
                                    <Input
                                        value={keywordInput}
                                        onChange={e => setKeywordInput(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                                        placeholder="Add keyword..."
                                        className="bg-black/20 border-white/10"
                                    />
                                    <Button onClick={addKeyword} size="sm" variant="outline"><Plus className="w-4 h-4" /></Button>
                                </div>
                                {keywords.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {keywords.map(kw => (
                                            <span key={kw} className="bg-orange-500/20 text-orange-400 text-xs px-2 py-1 rounded-full border border-orange-500/30 flex items-center gap-1">
                                                {kw}
                                                <button onClick={() => setKeywords(keywords.filter(k => k !== kw))}>
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Hashtags */}
                            <div>
                                <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Hashtags (optional)</label>
                                <div className="flex gap-2">
                                    <Input
                                        value={hashtagInput}
                                        onChange={e => setHashtagInput(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addHashtag())}
                                        placeholder="#StopHate"
                                        className="bg-black/20 border-white/10"
                                    />
                                    <Button onClick={addHashtag} size="sm" variant="outline"><Plus className="w-4 h-4" /></Button>
                                </div>
                                {hashtags.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {hashtags.map(ht => (
                                            <span key={ht} className="bg-indigo-500/20 text-indigo-400 text-xs px-2 py-1 rounded-full border border-indigo-500/30 flex items-center gap-1">
                                                {ht}
                                                <button onClick={() => setHashtags(hashtags.filter(h => h !== ht))}>
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Locations */}
                            <div>
                                <label className="text-sm font-medium text-muted-foreground mb-1.5 block">
                                    Monitored Locations <span className="text-red-400">*</span>
                                </label>
                                <Input
                                    value={locationSearch}
                                    onChange={e => setLocationSearch(e.target.value)}
                                    placeholder="Search cities..."
                                    className="bg-black/20 border-white/10 mb-2"
                                />
                                <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto custom-scrollbar">
                                    {filteredLocations.map(loc => (
                                        <button
                                            key={loc.woeid}
                                            onClick={() => toggleLocation(loc.woeid)}
                                            className={`text-xs px-2 py-1.5 rounded border text-left flex items-center gap-1.5 transition-colors ${
                                                selectedLocations.includes(loc.woeid)
                                                    ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300'
                                                    : 'bg-black/20 border-white/10 text-muted-foreground hover:border-white/20'
                                            }`}
                                        >
                                            <MapPin className="w-3 h-3 shrink-0" />
                                            {loc.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Alert Threshold */}
                            <div>
                                <label className="text-sm font-medium text-muted-foreground mb-1.5 block">
                                    Alert Threshold (matches/hour)
                                </label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="range"
                                        min="1"
                                        max="100"
                                        value={alertThreshold}
                                        onChange={e => setAlertThreshold(parseInt(e.target.value))}
                                        className="flex-1 accent-indigo-500"
                                    />
                                    <span className="text-sm font-mono text-white w-8 text-right">{alertThreshold}</span>
                                </div>
                            </div>

                            {/* Submit */}
                            <Button
                                onClick={handleSubmit}
                                disabled={!name || keywords.length === 0 || selectedLocations.length === 0}
                                className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                            >
                                Create Campaign
                            </Button>
                        </div>
                    </Card>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
