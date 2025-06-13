import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Find the favorite by property ID and user ID
    const favorite = await prisma.favorite.findFirst({
      where: {
        propertyId: params.id,
        userId: session.user.id,
      },
    });

    if (!favorite) {
      return NextResponse.json(
        { message: 'Favorite not found' },
        { status: 404 }
      );
    }

    // Delete the favorite
    await prisma.favorite.delete({
      where: { id: favorite.id },
    });

    return NextResponse.json({ message: 'Favorite removed successfully' });
  } catch (error) {
    console.error('Error removing favorite:', error);
    return NextResponse.json(
      { message: 'Failed to remove favorite' },
      { status: 500 }
    );
  }
} 