import { NextResponse } from 'next/server';
import { getUserByName, getMonthlyRoutines } from '@/lib/prisma-service';
import { generateInsights } from '@/lib/insights';
import { getCachedInsights, setCachedInsights } from '@/lib/insightsCache';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ month: string; user: string }> }
) {
  const { month, user } = await params;

  if (!month || !user) {
    return NextResponse.json({ error: 'month and user required' }, { status: 400 });
  }

  // Basic month format check YYYY-MM
  if (!/^\d{4}-\d{2}$/.test(month)) {
    return NextResponse.json({ error: 'invalid month format (expected YYYY-MM)' }, { status: 400 });
  }

  const dbUser = await getUserByName(user);
  if (!dbUser) {
    return NextResponse.json({ error: 'user not found in database' }, { status: 404 });
  }

  // Try cache
  const cached = getCachedInsights(dbUser.id, month);
  if (cached) {
    return NextResponse.json({ insights: cached, cached: true });
  }

  // Compute and cache
  const routines = await getMonthlyRoutines(month, dbUser.id);
  const insights = generateInsights(routines);
  setCachedInsights(dbUser.id, month, insights);

  return NextResponse.json({ insights, cached: false });
}
