import { create } from 'zustand';
import { TrendingData, TrendCategory, TrendStats, calculateTrendStats } from './api';
import { Location, DEFAULT_LOCATION } from './locations';
import { Campaign } from './types/campaign';

interface HateSpeechStats {
  totalFlagged: number;
  highSeverity: number;
  byCategory: Record<string, number>;
  byLocation: Record<string, number>;
  trend: number[];
}

interface TrendStore {
  // Data
  trends: TrendingData[];
  stats: TrendStats;
  selectedTrend: TrendingData | null;

  // State
  isLoading: boolean;
  lastUpdated: Date;

  // Selection
  selectedLocation: Location;
  selectedCategory: TrendCategory | 'all';

  // Credentials (kept for backward compat with ApiKeyDialog)
  apiKey: string | null;
  setApiKey: (key: string | null) => void;

  // Data source tracking
  dataMode: 'simulation' | 'live';
  apiTier: string;
  setDataMode: (mode: 'simulation' | 'live') => void;
  setApiTier: (tier: string) => void;

  // Campaign tracking
  campaigns: Campaign[];
  activeCampaignId: string | null;
  setCampaigns: (campaigns: Campaign[]) => void;
  setActiveCampaign: (id: string | null) => void;

  // Hate speech metrics
  hateSpeechStats: HateSpeechStats;
  setHateSpeechStats: (stats: HateSpeechStats) => void;

  // Actions
  setTrends: (trends: TrendingData[]) => void;
  selectTrend: (trend: TrendingData | null) => void;
  setLocation: (location: Location) => void;
  setCategory: (category: TrendCategory | 'all') => void;
  setLoading: (loading: boolean) => void;
}

export const useTrendStore = create<TrendStore>((set) => ({
  trends: [],
  stats: {
    totalTrends: 0,
    totalVolume: 0,
    topCategory: TrendCategory.OTHER,
    avgVolume: 0,
    emergencyCount: 0,
    growthRate: 0,
  },
  selectedTrend: null,

  isLoading: true,
  lastUpdated: new Date(),

  selectedLocation: DEFAULT_LOCATION,
  selectedCategory: 'all',

  apiKey: null,
  setApiKey: (key) => set({ apiKey: key }),

  dataMode: 'simulation',
  apiTier: 'free',
  setDataMode: (mode) => set({ dataMode: mode }),
  setApiTier: (tier) => set({ apiTier: tier }),

  campaigns: [],
  activeCampaignId: null,
  setCampaigns: (campaigns) => set({ campaigns }),
  setActiveCampaign: (id) => set({ activeCampaignId: id }),

  hateSpeechStats: {
    totalFlagged: 0,
    highSeverity: 0,
    byCategory: {},
    byLocation: {},
    trend: [],
  },
  setHateSpeechStats: (stats) => set({ hateSpeechStats: stats }),

  setTrends: (trends) =>
    set(() => ({
      trends,
      stats: calculateTrendStats(trends),
      lastUpdated: new Date(),
      isLoading: false
    })),

  selectTrend: (trend) => set({ selectedTrend: trend }),

  setLocation: (location) => set({ selectedLocation: location, isLoading: true }),

  setCategory: (category) => set({ selectedCategory: category }),

  setLoading: (loading) => set({ isLoading: loading }),
}));
