import { NextResponse } from 'next/server';
import { getDailyRoutine, saveDailyRoutine } from '@/lib/bff-store';
import { getUserByName } from '@/lib/prisma-service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function isValidDate(date: string): boolean {
  // Check format YYYY-MM-DD
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(date)) return false;
  const parsed = new Date(date);
  return !isNaN(parsed.getTime());
}

function extractParamsFromUrl(url: string): { date?: string; user?: string } {
  try {
    const u = new URL(url);
    const parts = u.pathname.split('/').filter(Boolean); // ['', 'api', 'routines', ':date', ':user']
    const idx = parts.findIndex((p) => p === 'api');
    if (idx >= 0 && parts[idx + 1] === 'routines') {
      const date = parts[idx + 2];
      const user = parts[idx + 3];
      return { date, user };
    }
  } catch {
    // ignore
  }
  return {};
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ date: string; user: string }> }
) {
  const { date, user } = await params;
  
  if (!date || !user) {
    return NextResponse.json({ error: 'date and user required' }, { status: 400 });
  }
  
  if (!isValidDate(date)) {
    return NextResponse.json({ error: 'invalid date format (expected YYYY-MM-DD)' }, { status: 400 });
  }
  
  // Get user from database
  const dbUser = await getUserByName(user);
  if (!dbUser) {
    return NextResponse.json({ error: 'user not found in database' }, { status: 404 });
  }
  
  const routine = await getDailyRoutine(date, dbUser.id);
  return NextResponse.json({ routine });
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ date: string; user: string }> }
) {
  const { date, user } = await params;
  
  if (!date || !user) {
    return NextResponse.json({ error: 'date and user required' }, { status: 400 });
  }
  
  if (!isValidDate(date)) {
    return NextResponse.json({ error: 'invalid date format (expected YYYY-MM-DD)' }, { status: 400 });
  }

  // Get user from database
  const dbUser = await getUserByName(user);
  if (!dbUser) {
    return NextResponse.json({ error: 'user not found in database' }, { status: 404 });
  }

  let payload;
  try {
    payload = await req.json();
  } catch (e) {
    console.error('[API] Invalid JSON payload for PUT /api/routines', e);
    return NextResponse.json({ error: 'invalid json' }, { status: 400 });
  }

  if (!payload || payload.date !== date || payload.user !== user) {
    return NextResponse.json({ error: 'payload date/user mismatch with URL params' }, { status: 400 });
  }

  try {
    const savedRoutine = await saveDailyRoutine(payload, dbUser.id);
    return NextResponse.json({ routine: savedRoutine });
  } catch (e: any) {
    console.error('[API] Failed to save daily routine:', e?.message || e);
    return NextResponse.json({ error: 'failed to save routine' }, { status: 500 });
  }
}
