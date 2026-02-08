import { NextRequest, NextResponse } from 'next/server';
import { getUserByName } from '@/lib/prisma-service';

export async function GET(
  req: NextRequest,
  { params }: { params: { name: string } }
) {
  try {
    const user = await getUserByName(decodeURIComponent(params.name));
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user by name:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}
