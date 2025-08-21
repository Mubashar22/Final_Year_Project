/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/authOptions';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  request: Request,
  context: any
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

  const imageId = context.params.id;

    // Get the image and verify ownership
    const image = await prisma.image.findUnique({
      where: { id: imageId },
      include: {
        property: true,
      },
    });

    if (!image) {
      return new NextResponse('Image not found', { status: 404 });
    }

    // Verify that the user owns the property
    if (image.property.ownerId !== session.user.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Delete the image
    await prisma.image.delete({
      where: { id: imageId },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting property image:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 