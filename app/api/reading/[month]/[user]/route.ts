import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { getUserByName } from '@/lib/prisma-service';
import { getMonthlyReading, saveMonthlyReading } from '@/lib/bff-store';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ month: string; user: string }> }
) {
  const { month, user } = await params;
  
  if (!month || !user) {
    return NextResponse.json({ error: 'month and user required' }, { status: 400 });
  }
  
  // Get user from database
  const dbUser = await getUserByName(user);
  if (!dbUser) {
    return NextResponse.json({ error: 'user not found in database' }, { status: 404 });
  }
  
  const reading = await getMonthlyReading(month, dbUser.id);
  return NextResponse.json({ reading });
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ month: string; user: string }> }
) {
  const { month, user } = await params;
  
  if (!month || !user) {
    return NextResponse.json({ error: 'month and user required' }, { status: 400 });
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

  if (!payload || payload.month !== month) {
    return NextResponse.json({ error: 'payload month mismatch with URL params' }, { status: 400 });
  }

  const savedReading = await saveMonthlyReading(payload, dbUser.id);
  return NextResponse.json({ reading: savedReading });
}
