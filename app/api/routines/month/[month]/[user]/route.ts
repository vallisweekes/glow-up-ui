import { NextResponse } from 'next/server';
import type { User } from '@/types/routine';
import { getMonthlyRoutines } from '@/lib/bff-store';
import { getUserByName } from '@/lib/prisma-service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function isValidMonth(month: string): boolean {
  // Check format YYYY-MM
  const regex = /^\d{4}-\d{2}$/;
  return regex.test(month);
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ month: string; user: string }> }
) {
  const { month, user } = await params;
  
  if (!month || !user) {
    return NextResponse.json({ error: 'month and user required' }, { status: 400 });
  }
  
  if (!isValidMonth(month)) {
    return NextResponse.json({ error: 'invalid month format (expected YYYY-MM)' }, { status: 400 });
  }
  
  // Get user from database
  const dbUser = await getUserByName(user);
  if (!dbUser) {
    return NextResponse.json({ error: 'user not found in database' }, { status: 404 });
  }
  
  const routines = await getMonthlyRoutines(month, dbUser.id);
  return NextResponse.json({ routines });
}
