/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/authOptions';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function DELETE(
  request: Request,
  context: any
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      console.error('Unauthorized: No session or user ID found');
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

  const propertyId = context.params.id;
    console.log('Attempting to unrent property:', { propertyId, userId: session.user.id });

    // Find the active rental for this property and user
    const rental = await prisma.rental.findFirst({
      where: {
        propertyId: propertyId,
        tenantId: session.user.id,
        status: 'ACTIVE',
      },
    });

    if (!rental) {
      console.error('No active rental found:', { propertyId, userId: session.user.id });
      return NextResponse.json(
        { message: 'No active rental found for this property' },
        { status: 404 }
      );
    }

    console.log('Found active rental:', rental);

    try {
      // Update rental status and property availability in a transaction
      await prisma.$transaction([
        prisma.rental.update({
          where: { id: rental.id },
          data: { 
            status: 'CANCELLED',
            endDate: new Date() // Add end date when unrenting
          },
        }),
        prisma.property.update({
          where: { id: propertyId },
          data: { isAvailable: true },
        }),
      ]);

      console.log('Successfully unrented property:', { propertyId, rentalId: rental.id });
      return NextResponse.json({ 
        message: 'Property unrented successfully',
        rentalId: rental.id,
        propertyId: propertyId
      });
    } catch (transactionError) {
      console.error('Transaction failed:', transactionError);
      throw transactionError;
    }
  } catch (error) {
    console.error('Error unrenting property:', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json(
        { message: 'Database error occurred', error: error.message },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { message: 'Failed to unrent property', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 