import { NextRequest, NextResponse } from 'next/server';
import { getUserById, updateUserPin } from '@/lib/prisma-service';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserById(params.id);
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { pin } = await req.json();
    
    if (!pin) {
      return NextResponse.json(
        { error: 'PIN is required' },
        { status: 400 }
      );
    }

    const user = await updateUserPin(params.id, pin);
    return NextResponse.json(user);
  } catch (error) {
    console.error('Error updating user PIN:', error);
    return NextResponse.json(
      { error: 'Failed to update user PIN' },
      { status: 500 }
    );
  }
}
