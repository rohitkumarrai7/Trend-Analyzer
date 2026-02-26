import { TrendCategory } from './api';
import { Location, LOCATIONS } from './locations';
import { Campaign, FlaggedTweet, CampaignSnapshot } from './types/campaign';

// Deterministic seeded random for consistent simulation per location/time
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

const LOCATION_TRENDS: Record<string, string[]> = {
  'Delhi': ['DelhiTraffic', 'DelhiAQI', 'DelhiMetro', 'DelhiWeather', 'DelhiFood', 'DelhiEvents', 'DelhiPolice', 'JNUProtests'],
  'Mumbai': ['MumbaiRains', 'MumbaiLocal', 'Bollywood', 'MumbaiStreetFood', 'MarineDrive', 'Gateway', 'AndheriTraffic'],
  'Bangalore': ['BangaloreTech', 'NammaMetro', 'StartupCity', 'ITHub', 'BangaloreTraffic', 'Koramangala', 'Whitefield'],
  'New York': ['NYC', 'Broadway', 'Manhattan', 'TimesSquare', 'WallStreet', 'NYCSubway', 'BrooklynVibes'],
  'London': ['LondonLife', 'BigBen', 'WestEnd', 'TubeUpdate', 'PremierLeague', 'RoyalFamily', 'Brexit'],
  'Tokyo': ['Tokyo2026', 'Shibuya', 'Anime', 'JapanTravel', 'TokyoFood', 'CherryBlossom', 'Harajuku'],
  'Singapore': ['SGLife', 'MarinaBay', 'HawkerFood', 'MRTsg', 'GardensByTheBay', 'SGWeather'],
  'Dubai': ['DubaiLife', 'BurjKhalifa', 'DubaiMall', 'DesertSafari', 'DubaiFashion', 'UAENews'],
  'Sydney': ['SydneyLife', 'OperaHouse', 'BondiBeach', 'AussieLife', 'SydneyFood', 'HarbourBridge'],
};

const CATEGORY_HASHTAGS: Record<string, string[]> = {
  emergency: ['Breaking', 'Alert', 'Emergency', 'SafetyFirst', 'StaySafe', 'CrimeAlert'],
  politics: ['Election2026', 'Government', 'Parliament', 'Policy', 'Budget2026', 'Reform'],
  environment: ['ClimateAction', 'AirQuality', 'GreenEnergy', 'Sustainability', 'SaveEarth'],
  entertainment: ['NewRelease', 'Trending', 'Viral', 'MustWatch', 'StreamingNow', 'BoxOffice'],
  sports: ['GameDay', 'Championship', 'Victory', 'Finals', 'MatchDay', 'TeamSpirit'],
  technology: ['AI', 'TechNews', 'Innovation', 'Startup', 'Digital', 'FutureTech'],
  hate_speech: ['StopHate', 'FightRacism', 'NoToHate', 'HateCrimeAlert', 'BiasReport'],
  other: ['Trending', 'Viral', 'MustSee', 'BreakingNews', 'Update', 'Latest'],
};

export function generateServerTrends(woeid: number, location: Location | null) {
  const hourSeed = Math.floor(Date.now() / (1000 * 60 * 60));
  const rand = seededRandom(woeid * 1000 + hourSeed);

  const locName = location?.name || 'Worldwide';
  const locationTags = LOCATION_TRENDS[locName] || LOCATION_TRENDS['Delhi'];
  const categories = Object.keys(CATEGORY_HASHTAGS);
  const trends: any[] = [];

  const trendCount = 8 + Math.floor(rand() * 5);

  for (let i = 0; i < trendCount; i++) {
    const isLocationSpecific = rand() > 0.4;
    const catIndex = Math.floor(rand() * categories.length);
    const category = categories[catIndex];

    let hashtag: string;
    if (isLocationSpecific && locationTags.length > 0) {
      hashtag = '#' + locationTags[Math.floor(rand() * locationTags.length)];
    } else {
      const tags = CATEGORY_HASHTAGS[category];
      hashtag = '#' + tags[Math.floor(rand() * tags.length)];
    }

    // Power-law distribution for volume
    const baseVolume = Math.pow(10, 3.5 + rand() * 2.5);
    const tweetVolume = Math.round(baseVolume);

    const baseLat = location?.lat || 20;
    const baseLng = location?.lng || 0;

    trends.push({
      id: `sim-${i}-${hourSeed}-${woeid}`,
      hashtag,
      title: hashtag.replace('#', '').replace(/([A-Z])/g, ' $1').trim(),
      tweetVolume,
      category: categorizeForSim(hashtag, category),
      description: `Trending with ${tweetVolume.toLocaleString()} tweets in ${locName}`,
      url: `https://twitter.com/search?q=${encodeURIComponent(hashtag)}`,
      lat: baseLat + (rand() - 0.5) * 0.15,
      lng: baseLng + (rand() - 0.5) * 0.15,
      weight: Math.log10(tweetVolume) / 6,
      timestamp: new Date().toISOString(),
      change: Math.round((rand() - 0.3) * 50),
      sentiment: (['positive', 'negative', 'neutral'] as const)[Math.floor(rand() * 3)],
    });
  }

  return trends.sort((a: any, b: any) => b.tweetVolume - a.tweetVolume);
}

function categorizeForSim(hashtag: string, fallbackCategory: string): string {
  const tag = hashtag.toLowerCase();
  if (tag.match(/(emergency|accident|fire|alert|police|crime|breaking|safety)/)) return 'emergency';
  if (tag.match(/(pollution|climate|weather|aqi|environment|green|eco|air)/)) return 'environment';
  if (tag.match(/(election|government|parliament|policy|budget|minister|politics|reform)/)) return 'politics';
  if (tag.match(/(movie|film|music|entertainment|bollywood|hollywood|streaming|release)/)) return 'entertainment';
  if (tag.match(/(cricket|ipl|sport|game|match|football|nba|championship|finals)/)) return 'sports';
  if (tag.match(/(tech|digital|startup|ai|mobile|innovation|software|app)/)) return 'technology';
  if (tag.match(/(hate|racist|racism|bias|discrimination|supremac)/)) return 'hate_speech';
  return fallbackCategory;
}

export function generateSimulatedCampaignData(campaign: Campaign): CampaignSnapshot {
  const rand = seededRandom(campaign.id.length * 100 + Math.floor(Date.now() / 60000));

  const matchesByLocation: Record<number, number> = {};
  for (const woeid of campaign.monitoredLocations) {
    matchesByLocation[woeid] = Math.floor(rand() * 50) + 5;
  }

  const matchesByCategory: Record<string, number> = {
    racial: Math.floor(rand() * 30) + 5,
    religious: Math.floor(rand() * 15) + 2,
    gender: Math.floor(rand() * 20) + 3,
    xenophobic: Math.floor(rand() * 10) + 1,
    other: Math.floor(rand() * 8),
  };

  return {
    timestamp: new Date().toISOString(),
    totalMatches: Object.values(matchesByLocation).reduce((a, b) => a + b, 0),
    matchesByLocation,
    matchesByCategory,
    averageHateScore: parseFloat((0.3 + rand() * 0.4).toFixed(2)),
    topKeywords: campaign.keywords.map(k => ({ word: k, count: Math.floor(rand() * 100) + 10 })),
  };
}

const SAMPLE_FLAGGED_TEXTS = [
  'This neighborhood has become dangerous since those people moved in #unsafe',
  'Why are we allowing this kind of immigration to continue? #borders',
  'Another incident of targeted harassment at the campus today #safety',
  'The rally promoted divisive rhetoric against minorities #report',
  'Online bullying campaign targeting community members continues #stophate',
  'Disturbing graffiti found near the community center #hatecrime',
  'Viral post spreading misinformation about ethnic group #factcheck',
  'Local business vandalized in apparent hate crime #justice',
  'Social media platform fails to remove reported hate content #accountability',
  'Community leaders call for unity against rising intolerance #together',
];

const SAMPLE_BIOS = [
  '22 | college student | loves memes | no cap',
  'Mom of 2 | Social worker | Fighting for justice',
  'Retired teacher | Grandma to 4 | Love gardening',
  'Tech bro | Startup founder | 28 | SF based',
  'Class of 2025 | Political science major',
  'Senior developer at FAANG | 10+ years experience',
  'Born in 1998 | Music lover | NYC',
  'Dad to 3 amazing kids | Coach | Community leader',
  'Aspiring journalist | University of Delhi',
  'Gen Z activist | They/them | Fighting bigotry',
];

export function generateSimulatedFlaggedTweets(campaign: Campaign, count: number = 10): FlaggedTweet[] {
  const rand = seededRandom(campaign.id.length * 50 + Math.floor(Date.now() / 300000));
  const tweets: FlaggedTweet[] = [];

  const categories = ['racial', 'religious', 'gender', 'xenophobic', 'other'];

  for (let i = 0; i < count; i++) {
    const textIndex = Math.floor(rand() * SAMPLE_FLAGGED_TEXTS.length);
    const bioIndex = Math.floor(rand() * SAMPLE_BIOS.length);
    const catIndex = Math.floor(rand() * categories.length);
    const locIndex = Math.floor(rand() * campaign.monitoredLocations.length);
    const ageBrackets = ['13-17', '18-24', '25-34', '35-44', '45-54', '55+'];

    tweets.push({
      id: `flag-${i}-${Date.now()}`,
      text: SAMPLE_FLAGGED_TEXTS[textIndex],
      authorId: `user-${Math.floor(rand() * 100000)}`,
      authorBio: SAMPLE_BIOS[bioIndex],
      authorLocation: LOCATIONS[Math.floor(rand() * LOCATIONS.length)]?.name || 'Unknown',
      createdAt: new Date(Date.now() - Math.floor(rand() * 86400000)).toISOString(),
      metrics: {
        likes: Math.floor(rand() * 500),
        retweets: Math.floor(rand() * 200),
        replies: Math.floor(rand() * 100),
      },
      hateSpeechScore: parseFloat((0.3 + rand() * 0.7).toFixed(2)),
      categories: [categories[catIndex]],
      estimatedAge: ageBrackets[Math.floor(rand() * ageBrackets.length)],
      locationWoeid: campaign.monitoredLocations[locIndex],
    });
  }

  return tweets.sort((a, b) => b.hateSpeechScore - a.hateSpeechScore);
}
