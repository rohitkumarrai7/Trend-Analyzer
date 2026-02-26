import { Location, LOCATIONS, DEFAULT_LOCATION } from './locations';

export interface TrendingTopic {
  name: string;
  tweet_volume: number;
  query: string;
  url: string;
}

export enum TrendCategory {
  EMERGENCY = 'emergency',
  POLITICS = 'politics',
  ENVIRONMENT = 'environment',
  ENTERTAINMENT = 'entertainment',
  SPORTS = 'sports',
  TECHNOLOGY = 'technology',
  HATE_SPEECH = 'hate_speech',
  OTHER = 'other'
}

export interface TrendingData {
  id: string;
  hashtag: string;
  title: string;
  tweetVolume: number;
  category: TrendCategory;
  description: string;
  url: string;
  lat: number;
  lng: number;
  weight: number;
  timestamp: Date;
  change?: number;
  sentiment?: 'positive' | 'negative' | 'neutral';
}

// Realistic trend templates by category
const TREND_TEMPLATES = {
  [TrendCategory.EMERGENCY]: [
    { prefix: '#', topics: ['Breaking', 'Alert', 'Emergency', 'SafetyFirst', 'StaySafe', 'Update'] },
  ],
  [TrendCategory.POLITICS]: [
    { prefix: '#', topics: ['Election2026', 'Government', 'Parliament', 'Policy', 'Budget2026', 'Reform'] },
  ],
  [TrendCategory.ENVIRONMENT]: [
    { prefix: '#', topics: ['ClimateAction', 'AirQuality', 'GreenEnergy', 'Sustainability', 'SaveEarth', 'EcoFriendly'] },
  ],
  [TrendCategory.ENTERTAINMENT]: [
    { prefix: '#', topics: ['NewRelease', 'Trending', 'Viral', 'MustWatch', 'StreamingNow', 'BoxOffice'] },
  ],
  [TrendCategory.SPORTS]: [
    { prefix: '#', topics: ['GameDay', 'Championship', 'Victory', 'Finals', 'MatchDay', 'TeamSpirit'] },
  ],
  [TrendCategory.TECHNOLOGY]: [
    { prefix: '#', topics: ['AI', 'TechNews', 'Innovation', 'Startup', 'Digital', 'FutureTech'] },
  ],
  [TrendCategory.HATE_SPEECH]: [
    { prefix: '#', topics: ['StopHate', 'FightRacism', 'NoToHate', 'HateCrimeAlert', 'BiasReport'] },
  ],
  [TrendCategory.OTHER]: [
    { prefix: '#', topics: ['Trending', 'Viral', 'MustSee', 'BreakingNews', 'Update', 'Latest'] },
  ],
};

// Location-specific trending topics
const LOCATION_TRENDS: Record<string, string[]> = {
  'Delhi': ['DelhiTraffic', 'DelhiAQI', 'DelhiMetro', 'DelhiWeather', 'DelhiFood', 'DelhiEvents'],
  'Mumbai': ['MumbaiRains', 'MumbaiLocal', 'Bollywood', 'MumbaiStreetFood', 'MarineDrive', 'Gateway'],
  'Bangalore': ['BangaloreTech', 'NammaMetro', 'StartupCity', 'ITHub', 'BangaloreTraffic', 'Koramangala'],
  'New York': ['NYC', 'Broadway', 'Manhattan', 'TimesSquare', 'WallStreet', 'NYCSubway'],
  'London': ['LondonLife', 'BigBen', 'WestEnd', 'TubeUpdate', 'PremierLeague', 'RoyalFamily'],
  'Tokyo': ['Tokyo2026', 'Shibuya', 'Anime', 'JapanTravel', 'TokyoFood', 'CherryBlossom'],
  'Singapore': ['SGLife', 'MarinaBay', 'HawkerFood', 'MRTsg', 'GardensByTheBay', 'SGWeather'],
  'Dubai': ['DubaiLife', 'BurjKhalifa', 'DubaiMall', 'DesertSafari', 'DubaiFashion', 'UAENews'],
  'Sydney': ['SydneyLife', 'OperaHouse', 'BondiBeach', 'AussieLife', 'SydneyFood', 'HarbourBridge'],
};

const categorizeHashtag = (hashtag: string): TrendCategory => {
  const tag = hashtag.toLowerCase();

  if (tag.match(/(emergency|accident|fire|alert|police|crime|breaking|safety)/)) {
    return TrendCategory.EMERGENCY;
  } else if (tag.match(/(pollution|climate|weather|aqi|environment|green|eco|air)/)) {
    return TrendCategory.ENVIRONMENT;
  } else if (tag.match(/(election|government|parliament|policy|budget|minister|politics|reform)/)) {
    return TrendCategory.POLITICS;
  } else if (tag.match(/(movie|film|music|entertainment|bollywood|hollywood|streaming|release)/)) {
    return TrendCategory.ENTERTAINMENT;
  } else if (tag.match(/(cricket|ipl|sport|game|match|football|nba|championship|finals)/)) {
    return TrendCategory.SPORTS;
  } else if (tag.match(/(tech|digital|startup|ai|mobile|innovation|software|app)/)) {
    return TrendCategory.TECHNOLOGY;
  } else if (tag.match(/(hate|racist|racism|bigot|discrimination|supremac|bias|slur)/)) {
    return TrendCategory.HATE_SPEECH;
  }
  return TrendCategory.OTHER;
};

export const getCategoryColor = (category: TrendCategory): string => {
  switch (category) {
    case TrendCategory.EMERGENCY:
      return '#ef4444';
    case TrendCategory.ENVIRONMENT:
      return '#22c55e';
    case TrendCategory.POLITICS:
      return '#f59e0b';
    case TrendCategory.ENTERTAINMENT:
      return '#a855f7';
    case TrendCategory.SPORTS:
      return '#06b6d4';
    case TrendCategory.TECHNOLOGY:
      return '#3b82f6';
    case TrendCategory.HATE_SPEECH:
      return '#f97316';
    default:
      return '#64748b';
  }
};

// Generate realistic mock trends for a location (client-side fallback)
export const generateTrendsForLocation = (location: Location): TrendingData[] => {
  const locationTags = LOCATION_TRENDS[location.name] || LOCATION_TRENDS['Delhi'];
  const categories = Object.values(TrendCategory);
  const trends: TrendingData[] = [];

  const trendCount = 8 + Math.floor(Math.random() * 5);

  for (let i = 0; i < trendCount; i++) {
    const isLocationSpecific = Math.random() > 0.4;
    const category = categories[Math.floor(Math.random() * categories.length)];

    let hashtag: string;
    if (isLocationSpecific && locationTags.length > 0) {
      hashtag = '#' + locationTags[Math.floor(Math.random() * locationTags.length)];
    } else {
      const templates = TREND_TEMPLATES[category];
      const template = templates[Math.floor(Math.random() * templates.length)];
      hashtag = template.prefix + template.topics[Math.floor(Math.random() * template.topics.length)];
    }

    const baseVolume = 10000 + Math.random() * 490000;
    const tweetVolume = Math.round(baseVolume);

    const spreadLat = (Math.random() - 0.5) * 0.15;
    const spreadLng = (Math.random() - 0.5) * 0.15;

    trends.push({
      id: `trend-${i}-${Date.now()}`,
      hashtag,
      title: hashtag.replace('#', '').replace(/([A-Z])/g, ' $1').trim(),
      tweetVolume,
      category: categorizeHashtag(hashtag),
      description: `Trending with ${tweetVolume.toLocaleString()} tweets in ${location.name}`,
      url: `https://twitter.com/search?q=${encodeURIComponent(hashtag)}`,
      lat: location.lat + spreadLat,
      lng: location.lng + spreadLng,
      weight: Math.log10(tweetVolume) / 6,
      timestamp: new Date(),
      change: Math.round((Math.random() - 0.3) * 50),
      sentiment: ['positive', 'negative', 'neutral'][Math.floor(Math.random() * 3)] as any,
    });
  }

  return trends.sort((a, b) => b.tweetVolume - a.tweetVolume);
};

// Fetch trends from server API (keys are server-side now)
export const fetchTrends = async (woeid: number = 1): Promise<{
  trends: TrendingData[];
  meta: { source: string; tier: string; woeid: number };
}> => {
  try {
    const res = await fetch(`/api/trends?id=${woeid}`);
    if (!res.ok) throw new Error(`API returned ${res.status}`);
    const json = await res.json();

    return {
      trends: (json.data || []).map((t: any) => ({
        ...t,
        timestamp: new Date(t.timestamp),
      })),
      meta: json.meta || { source: 'unknown', tier: 'free', woeid },
    };
  } catch (error) {
    console.error('Failed to fetch trends:', error);
    const location = LOCATIONS.find(loc => loc.woeid === woeid) || DEFAULT_LOCATION;
    return {
      trends: generateTrendsForLocation(location),
      meta: { source: 'client_fallback', tier: 'unknown', woeid },
    };
  }
};

// Get trend statistics
export interface TrendStats {
  totalTrends: number;
  totalVolume: number;
  topCategory: TrendCategory;
  avgVolume: number;
  emergencyCount: number;
  growthRate: number;
}

export const calculateTrendStats = (trends: TrendingData[]): TrendStats => {
  if (trends.length === 0) {
    return {
      totalTrends: 0,
      totalVolume: 0,
      topCategory: TrendCategory.OTHER,
      avgVolume: 0,
      emergencyCount: 0,
      growthRate: 0,
    };
  }

  const totalVolume = trends.reduce((sum, t) => sum + t.tweetVolume, 0);
  const categoryCount: Record<TrendCategory, number> = {} as any;
  let emergencyCount = 0;

  trends.forEach(t => {
    categoryCount[t.category] = (categoryCount[t.category] || 0) + 1;
    if (t.category === TrendCategory.EMERGENCY) emergencyCount++;
  });

  const topCategory = Object.entries(categoryCount)
    .sort(([, a], [, b]) => b - a)[0]?.[0] as TrendCategory || TrendCategory.OTHER;

  return {
    totalTrends: trends.length,
    totalVolume,
    topCategory,
    avgVolume: Math.round(totalVolume / trends.length),
    emergencyCount,
    growthRate: Math.round((Math.random() - 0.3) * 30),
  };
};

export { LOCATIONS, DEFAULT_LOCATION } from './locations';
