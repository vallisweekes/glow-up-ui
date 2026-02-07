import { NextResponse } from 'next/server';
import type { DailyRoutine, User } from '@/types/routine';

// In-memory store (BFF mock). Replace with DB later.
const routineStore: Map<string, DailyRoutine> = new Map();

function getKey(date: string, user: User): string {
  return `${date}-${user}`;
}

export async function GET(
  _req: Request,
  { params }: { params: { date: string; user: string } }
) {
  const { date, user } = params;
  if (!date || !user) return NextResponse.json({ error: 'date and user required' }, { status: 400 });
  
  const key = getKey(date, user as User);
  const routine = routineStore.get(key) ?? null;
  return NextResponse.json({ routine });
}

export async function PUT(
  req: Request,
  { params }: { params: { date: string; user: string } }
) {
  const { date, user } = params;
  if (!date || !user) return NextResponse.json({ error: 'date and user required' }, { status: 400 });

  let payload: DailyRoutine;
  try {
    payload = (await req.json()) as DailyRoutine;
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 });
  }

  if (!payload || payload.date !== date || payload.user !== user) {
    return NextResponse.json({ error: 'payload mismatch' }, { status: 400 });
  }

  const key = getKey(date, user as User);
  routineStore.set(key, payload);
  return NextResponse.json(payload);
}
