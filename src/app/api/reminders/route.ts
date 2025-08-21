import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
  const { rentalId } = await request.json(); // removed unused 'type' variable

    if (!rentalId) {
      return NextResponse.json(
        { error: 'Rental ID is required' },
        { status: 400 }
      );
    }

    // Get rental details
    const rental = await prisma.rental.findUnique({
      where: { id: rentalId },
      include: {
        property: {
          include: {
            owner: true
          }
        },
        tenant: true
      }
    });

    if (!rental) {
      return NextResponse.json(
        { error: 'Rental not found' },
        { status: 404 }
      );
    }

    // Create reminder notifications for both tenant and owner
    const tenantNotification = await prisma.notification.create({
      data: {
        userId: rental.tenantId,
        message: `Reminder: Your rent payment for ${rental.property.title} is due soon. Amount: PKR ${rental.property.amount}`,
        type: 'RENT_REMINDER'
      }
    });

    const ownerNotification = await prisma.notification.create({
      data: {
        userId: rental.property.ownerId,
        message: `Rent payment reminder sent to tenant for property: ${rental.property.title}`,
        type: 'RENT_REMINDER_SENT'
      }
    });

    return NextResponse.json({
      message: 'Reminder notifications sent successfully',
      tenantNotification,
      ownerNotification
    });

  } catch (error) {
    console.error('Reminder API error:', error);
    return NextResponse.json(
      { error: 'Failed to send reminder notifications' },
      { status: 500 }
    );
  }
}

// GET endpoint to fetch pending reminders
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get active rentals that might need reminders
    const activeRentals = await prisma.rental.findMany({
      where: {
        OR: [
          { tenantId: userId },
          { property: { ownerId: userId } }
        ],
        status: 'ACTIVE'
      },
      include: {
        property: {
          include: {
            owner: true
          }
        },
        tenant: true
      }
    });

    // Check which rentals need reminders (example: rent due in next 7 days)
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    const remindersNeeded = activeRentals.filter(rental => {
      // Calculate next payment due date (assuming monthly rent)
      const startDate = new Date(rental.startDate);
      const currentMonth = today.getMonth();
      const currentYear = today.getFullYear();
      
      // Next payment due on same day of next month
      const nextPaymentDate = new Date(currentYear, currentMonth + 1, startDate.getDate());
      
      return nextPaymentDate <= nextWeek && nextPaymentDate > today;
    });

    return NextResponse.json({
      remindersNeeded: remindersNeeded.length,
      rentals: remindersNeeded
    });

  } catch (error) {
    console.error('Get reminders API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reminders' },
      { status: 500 }
    );
  }
}
