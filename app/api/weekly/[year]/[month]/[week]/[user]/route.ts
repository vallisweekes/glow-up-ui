import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
import type { User, WeeklyCheckIn } from '@/types/routine';
import { getWeeklyCheckIn, saveWeeklyCheckIn } from '@/lib/bff-store';
import { getUserByName } from '@/lib/prisma-service';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ year: string; month: string; week: string; user: string }> }
) {
  const { year, month, week, user } = await params;
  
  if (!year || !month || !week || !user) {
    return NextResponse.json({ error: 'year, month, week, and user required' }, { status: 400 });
  }
  
  const weekNum = parseInt(week, 10);
  const yearNum = parseInt(year, 10);
  
  if (isNaN(weekNum) || weekNum < 1 || weekNum > 52) {
    return NextResponse.json({ error: 'invalid week number' }, { status: 400 });
  }
  
  if (isNaN(yearNum)) {
    return NextResponse.json({ error: 'invalid year' }, { status: 400 });
  }
  
  // Get user from database
  const dbUser = await getUserByName(user);
  if (!dbUser) {
    return NextResponse.json({ error: 'user not found in database' }, { status: 404 });
  }
  
  const checkIn = await getWeeklyCheckIn(yearNum, month, weekNum, dbUser.id);
  
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

  // Get user from database
  const dbUser = await getUserByName(user);
  if (!dbUser) {
    return NextResponse.json({ error: 'user not found in database' }, { status: 404 });
  }

  const savedCheckIn = await saveWeeklyCheckIn(payload, dbUser.id);
  
  return NextResponse.json(savedCheckIn);
}
