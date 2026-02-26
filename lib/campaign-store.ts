import { Campaign, CampaignCreateInput, CampaignSnapshot } from './types/campaign';

interface ICampaignStore {
  getAll(): Campaign[];
  getById(id: string): Campaign | undefined;
  create(input: CampaignCreateInput): Campaign;
  update(id: string, updates: Partial<Campaign>): Campaign | undefined;
  delete(id: string): boolean;
  addSnapshot(id: string, snapshot: CampaignSnapshot): void;
}

class InMemoryCampaignStore implements ICampaignStore {
  private campaigns: Map<string, Campaign> = new Map();

  getAll(): Campaign[] {
    return Array.from(this.campaigns.values());
  }

  getById(id: string): Campaign | undefined {
    return this.campaigns.get(id);
  }

  create(input: CampaignCreateInput): Campaign {
    const id = `campaign-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();
    const campaign: Campaign = {
      id,
      name: input.name,
      description: input.description || '',
      status: 'active',
      createdAt: now,
      updatedAt: now,
      keywords: input.keywords,
      hashtags: input.hashtags || [],
      monitoredLocations: input.monitoredLocations,
      totalMatches: 0,
      flaggedTweets: [],
      snapshots: [],
      alertThreshold: input.alertThreshold || 10,
      alertEnabled: true,
    };
    this.campaigns.set(id, campaign);
    return campaign;
  }

  update(id: string, updates: Partial<Campaign>): Campaign | undefined {
    const existing = this.campaigns.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...updates, updatedAt: new Date().toISOString() };
    this.campaigns.set(id, updated);
    return updated;
  }

  delete(id: string): boolean {
    return this.campaigns.delete(id);
  }

  addSnapshot(id: string, snapshot: CampaignSnapshot): void {
    const campaign = this.campaigns.get(id);
    if (campaign) {
      campaign.snapshots.push(snapshot);
      campaign.updatedAt = new Date().toISOString();
    }
  }
}

// Singleton — persists across API route invocations in the same server process
export const campaignStore = new InMemoryCampaignStore();
