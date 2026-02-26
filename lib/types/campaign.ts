export interface Campaign {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'paused' | 'completed';
  createdAt: string;
  updatedAt: string;
  keywords: string[];
  hashtags: string[];
  monitoredLocations: number[]; // WOEIDs
  totalMatches: number;
  flaggedTweets: FlaggedTweet[];
  snapshots: CampaignSnapshot[];
  alertThreshold: number;
  alertEnabled: boolean;
}

export interface FlaggedTweet {
  id: string;
  text: string;
  authorId: string;
  authorBio?: string;
  authorLocation?: string;
  createdAt: string;
  metrics: {
    likes: number;
    retweets: number;
    replies: number;
  };
  hateSpeechScore: number;
  categories: string[];
  estimatedAge?: string;
  locationWoeid?: number;
}

export interface CampaignSnapshot {
  timestamp: string;
  totalMatches: number;
  matchesByLocation: Record<number, number>;
  matchesByCategory: Record<string, number>;
  averageHateScore: number;
  topKeywords: { word: string; count: number }[];
}

export interface CampaignCreateInput {
  name: string;
  description?: string;
  keywords: string[];
  hashtags?: string[];
  monitoredLocations: number[];
  alertThreshold?: number;
}
