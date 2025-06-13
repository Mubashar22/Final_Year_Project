import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const property = await prisma.property.findUnique({
      where: { id: params.id },
      include: {
        images: {
          select: {
            id: true,
            url: true,
          },
        },
      },
    });

    if (!property) {
      return NextResponse.json(
        { message: 'Property not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(property);
  } catch (error) {
    console.error('Error fetching property:', error);
    return NextResponse.json(
      { message: 'Failed to fetch property' },
      { status: 500 }
    );
  }
} 