import { NextResponse } from 'next/server';
import type { User } from '@/types/routine';
import { getMonthlyRoutines } from '@/lib/bff-store';

const VALID_USERS: User[] = ['Vallis', 'Kashina'];

function isValidUser(user: string): user is User {
  return VALID_USERS.includes(user as User);
}

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
  
  if (!isValidUser(user)) {
    return NextResponse.json({ error: 'invalid user (expected Vallis or Kashina)' }, { status: 400 });
  }
  
  const routines = getMonthlyRoutines(month, user);
  return NextResponse.json({ routines });
}
