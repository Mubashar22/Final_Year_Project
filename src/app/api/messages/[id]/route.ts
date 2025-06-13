import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// PATCH (update) message
export async function PATCH(
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

    const message = await prisma.message.findUnique({
      where: { id: params.id },
    });

    if (!message) {
      return NextResponse.json(
        { message: 'Message not found' },
        { status: 404 }
      );
    }

    // Only allow the sender to edit their message
    if (message.senderId !== session.user.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { content } = body;

    if (!content) {
      return NextResponse.json(
        { message: 'Content is required' },
        { status: 400 }
      );
    }

    const updatedMessage = await prisma.message.update({
      where: { id: params.id },
      data: { content },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true,
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true,
          },
        },
        property: {
          select: {
            id: true,
            title: true,
            location: true,
          },
        },
      },
    });

    return NextResponse.json(updatedMessage);
  } catch (error) {
    console.error('Error updating message:', error);
    return NextResponse.json(
      { message: 'Failed to update message' },
      { status: 500 }
    );
  }
}

// DELETE message
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

    const message = await prisma.message.findUnique({
      where: { id: params.id },
    });

    if (!message) {
      return NextResponse.json(
        { message: 'Message not found' },
        { status: 404 }
      );
    }

    // Allow both sender and receiver to delete the message
    if (message.senderId !== session.user.id && message.receiverId !== session.user.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    await prisma.message.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Error deleting message:', error);
    return NextResponse.json(
      { message: 'Failed to delete message' },
      { status: 500 }
    );
  }
} 