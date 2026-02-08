import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
import type { User } from '@/types/routine';
import { getDailyRoutine, saveDailyRoutine } from '@/lib/bff-store';
import { getUserByName } from '@/lib/prisma-service';

function isValidDate(date: string): boolean {
  // Check format YYYY-MM-DD
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(date)) return false;
  const parsed = new Date(date);
  return !isNaN(parsed.getTime());
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
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 });
  }

  if (!payload || payload.date !== date || payload.user !== user) {
    return NextResponse.json({ error: 'payload date/user mismatch with URL params' }, { status: 400 });
  }

  const savedRoutine = await saveDailyRoutine(payload, dbUser.id);
  return NextResponse.json({ routine: savedRoutine });
}
