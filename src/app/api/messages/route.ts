import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { propertyId, receiverId, message } = body;

    if (!propertyId || !receiverId || !message) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify the property exists
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      include: { owner: true },
    });

    if (!property) {
      return NextResponse.json(
        { message: 'Property not found' },
        { status: 404 }
      );
    }

    // Verify the receiver exists
    const receiver = await prisma.user.findUnique({
      where: { id: receiverId },
    });

    if (!receiver) {
      return NextResponse.json(
        { message: 'Receiver not found' },
        { status: 404 }
      );
    }

    // Create a new message
    const newMessage = await prisma.message.create({
      data: {
        content: message,
        property: {
          connect: { id: propertyId },
        },
        sender: {
          connect: { id: session.user.id },
        },
        receiver: {
          connect: { id: receiverId },
        },
      },
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

    return NextResponse.json(newMessage);
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { message: 'Failed to send message' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: session.user.id },
          { receiverId: session.user.id },
        ],
      },
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
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { message: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
} 