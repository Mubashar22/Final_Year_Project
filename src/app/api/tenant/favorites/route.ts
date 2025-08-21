import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/authOptions';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get all favorite properties for the user
    const favorites = await prisma.favorite.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        property: {
          include: {
            images: {
              select: {
                id: true,
                url: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Transform the data to match the expected format
    const favoriteProperties = favorites.map(favorite => ({
      id: favorite.property.id,
      title: favorite.property.title,
      location: favorite.property.location,
      amount: favorite.property.amount,
      images: favorite.property.images,
    }));

    return NextResponse.json(favoriteProperties);
  } catch (error) {
    console.error('Error fetching favorite properties:', error);
    return NextResponse.json(
      { message: 'Failed to fetch favorite properties' },
      { status: 500 }
    );
  }
} 