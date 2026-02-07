import { NextResponse } from 'next/server';
import type { User } from '@/types/routine';

// This is a placeholder; in the actual BFF, we'd query the routineStore from the parent route.
// For now, return empty array as the store is not shared across modules.
export async function GET(
  _req: Request,
  { params }: { params: { month: string; user: string } }
) {
  const { month, user } = params;
  if (!month || !user) return NextResponse.json({ error: 'month and user required' }, { status: 400 });
  
  // TODO: Filter routineStore by month prefix and user when implementing DB
  const routines = [];
  return NextResponse.json({ routines });
}
