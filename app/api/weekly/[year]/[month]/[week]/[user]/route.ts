import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
import type { User, WeeklyCheckIn } from '@/types/routine';
import { getWeeklyCheckIn, saveWeeklyCheckIn } from '@/lib/bff-store';

const VALID_USERS: User[] = ['Vallis', 'Kashina'];

function isValidUser(user: string): user is User {
  return VALID_USERS.includes(user as User);
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ year: string; month: string; week: string; user: string }> }
) {
  const { year, month, week, user } = await params;
  
  if (!year || !month || !week || !user) {
    return NextResponse.json({ error: 'year, month, week, and user required' }, { status: 400 });
  }
  
  if (!isValidUser(user)) {
    return NextResponse.json({ error: 'invalid user (expected Vallis or Kashina)' }, { status: 400 });
  }
  
  const weekNum = parseInt(week, 10);
  const yearNum = parseInt(year, 10);
  
  if (isNaN(weekNum) || weekNum < 1 || weekNum > 52) {
    return NextResponse.json({ error: 'invalid week number' }, { status: 400 });
  }
  
  if (isNaN(yearNum)) {
    return NextResponse.json({ error: 'invalid year' }, { status: 400 });
  }
  
  const checkIn = await getWeeklyCheckIn(yearNum, month, weekNum, user);
  
  return NextResponse.json({ checkIn });
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ year: string; month: string; week: string; user: string }> }
) {
  const { year, month, week, user } = await params;
  
  if (!year || !month || !week || !user) {
    return NextResponse.json({ error: 'year, month, week, and user required' }, { status: 400 });
  }
  
  if (!isValidUser(user)) {
    return NextResponse.json({ error: 'invalid user (expected Vallis or Kashina)' }, { status: 400 });
  }
  
  const weekNum = parseInt(week, 10);
  const yearNum = parseInt(year, 10);
  
  if (isNaN(weekNum) || weekNum < 1 || weekNum > 52) {
    return NextResponse.json({ error: 'invalid week number' }, { status: 400 });
  }
  
  if (isNaN(yearNum)) {
    return NextResponse.json({ error: 'invalid year' }, { status: 400 });
  }

  let payload: WeeklyCheckIn;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 });
  }

  if (!payload || payload.user !== user || payload.weekNumber !== weekNum || payload.year !== yearNum) {
    return NextResponse.json({ error: 'payload mismatch with URL params' }, { status: 400 });
  }

  const savedCheckIn = await saveWeeklyCheckIn(payload);
  
  return NextResponse.json(savedCheckIn);
}
