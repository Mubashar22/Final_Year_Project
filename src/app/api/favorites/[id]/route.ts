
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/authOptions';
import { prisma } from '@/lib/prisma';


// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function DELETE(
  request: Request,
  context: /* eslint-disable-line @typescript-eslint/no-explicit-any */ any
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
        propertyId: context.params.id,
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