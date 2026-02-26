import { NextRequest, NextResponse } from 'next/server';
import { campaignStore } from '@/lib/campaign-store';

export async function GET() {
  return NextResponse.json({ campaigns: campaignStore.getAll() });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.name || !body.keywords?.length || !body.monitoredLocations?.length) {
      return NextResponse.json(
        { error: 'name, keywords, and monitoredLocations are required' },
        { status: 400 }
      );
    }

    const campaign = campaignStore.create(body);
    return NextResponse.json({ campaign }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Campaign id is required' }, { status: 400 });
    }

    const updated = campaignStore.update(id, updates);
    if (!updated) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    return NextResponse.json({ campaign: updated });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Campaign id is required' }, { status: 400 });
  }

  const deleted = campaignStore.delete(id);
  if (!deleted) {
    return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
