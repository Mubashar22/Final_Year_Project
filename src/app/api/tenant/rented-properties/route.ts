import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/authOptions';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get all active rentals for the user
    const rentals = await prisma.rental.findMany({
      where: {
        tenantId: session.user.id,
        status: 'ACTIVE',
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
    const rentedProperties = rentals.map(rental => ({
      id: rental.property.id,
      title: rental.property.title,
      location: rental.property.location,
      amount: rental.property.amount,
      images: rental.property.images,
    }));

    return NextResponse.json(rentedProperties);
  } catch (error) {
    console.error('Error fetching rented properties:', error);
    return NextResponse.json(
      { message: 'Failed to fetch rented properties' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { propertyId, startDate } = await request.json();

    if (!propertyId || !startDate) {
      return NextResponse.json(
        { message: 'Property ID and start date are required' },
        { status: 400 }
      );
    }

    // Check if property exists and is available
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
    });

    if (!property) {
      return NextResponse.json(
        { message: 'Property not found' },
        { status: 404 }
      );
    }

    if (!property.isAvailable) {
      return NextResponse.json(
        { message: 'Property is not available for rent' },
        { status: 400 }
      );
    }

    // Check if user already has an active rental for this property
    const existingRental = await prisma.rental.findFirst({
      where: {
        propertyId,
        tenantId: session.user.id,
        status: 'ACTIVE',
      },
    });

    if (existingRental) {
      return NextResponse.json(
        { message: 'You already have an active rental for this property' },
        { status: 400 }
      );
    }

    // Create rental and update property availability in a transaction
    const rental = await prisma.$transaction(async (tx) => {
      // Create the rental
      const newRental = await tx.rental.create({
        data: {
          propertyId,
          tenantId: session.user.id,
          startDate: new Date(startDate),
          status: 'ACTIVE',
        },
      });

      // Update property availability
      await tx.property.update({
        where: { id: propertyId },
        data: { isAvailable: false },
      });

      return newRental;
    });

    return NextResponse.json({
      message: 'Property rented successfully',
      rental,
    });
  } catch (error) {
    console.error('Error renting property:', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json(
        { message: 'Database error occurred', error: error.message },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { message: 'Failed to rent property', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 