import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/authOptions';
/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from '@/lib/prisma';

// GET single property
export async function GET(
  request: Request,
    context: any
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

      const property = await prisma.property.findUnique({
        where: { id: context.params.id },
        include: {
        images: {
          select: {
            id: true,
            url: true,
          },
        },
      },
    });

    if (!property || property.ownerId !== session.user.id) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    return NextResponse.json(property);
  } catch (error) {
    console.error('Error fetching property:', error);
    return NextResponse.json(
      { error: 'Failed to fetch property' },
      { status: 500 }
    );
  }
}

// PATCH (update) property
export async function PATCH(
  request: Request,
    context: any
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

      const property = await prisma.property.findUnique({
        where: { id: context.params.id },
      });

    if (!property || property.ownerId !== session.user.id) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    const data = await request.json();
    const { title, description, type, area, amount, location } = data;

      const updatedProperty = await prisma.property.update({
        where: { id: context.params.id },
      data: {
        title,
        description,
        type,
        area: parseFloat(area),
        amount: parseFloat(amount),
        location,
      },
      include: {
        images: {
          select: {
            id: true,
            url: true,
          },
        },
      },
    });

    return NextResponse.json(updatedProperty);
  } catch (error) {
    console.error('Error updating property:', error);
    return NextResponse.json(
      { error: 'Failed to update property' },
      { status: 500 }
    );
  }
}

// DELETE property
export async function DELETE(
  request: Request,
  context: any
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const property = await prisma.property.findUnique({
      where: { id: context.params.id },
      include: {
        rentals: {
          where: {
            status: 'ACTIVE'
          }
        }
      }
    });

    if (!property || property.ownerId !== session.user.id) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    // Check if property has active rentals
    if (property.rentals.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete property with active rentals. Please cancel all active rentals first.' },
        { status: 400 }
      );
    }

    // Delete all related records first
    await prisma.$transaction([
      // Delete images
      prisma.image.deleteMany({
        where: { propertyId: context.params.id },
      }),
      // Delete favorites
      prisma.favorite.deleteMany({
        where: { propertyId: context.params.id },
      }),
      // Delete messages
      prisma.message.deleteMany({
        where: { propertyId: context.params.id },
      }),
      // Delete payments
      prisma.payment.deleteMany({
        where: { propertyId: context.params.id },
      }),
      // Delete rentals
      prisma.rental.deleteMany({
        where: { propertyId: context.params.id },
      }),
      // Finally delete the property
      prisma.property.delete({
        where: { id: context.params.id },
      }),
    ]);

  return NextResponse.json({ message: 'Property deleted successfully' });
  } catch (error) {
    console.error('Error deleting property:', error);
    return NextResponse.json(
      { error: 'Failed to delete property' },
      { status: 500 }
    );
  }
} 