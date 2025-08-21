import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// This endpoint can be called by a cron job or scheduled task
export async function POST() {
  try {
    // Get all active rentals
    const activeRentals = await prisma.rental.findMany({
      where: {
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

    const today = new Date();
    const remindersSent = [];

    for (const rental of activeRentals) {
      // Calculate next payment due date (assuming monthly rent)
      const startDate = new Date(rental.startDate);
      const currentMonth = today.getMonth();
      const currentYear = today.getFullYear();
      
      // Next payment due on same day of next month
      const nextPaymentDate = new Date(currentYear, currentMonth + 1, startDate.getDate());
      
      // Send reminder 7 days before due date
      const reminderDate = new Date(nextPaymentDate.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      // Check if today is the reminder date
      if (today.toDateString() === reminderDate.toDateString()) {
        // Check if reminder already sent today
        const existingReminder = await prisma.notification.findFirst({
          where: {
            userId: rental.tenantId,
            type: 'RENT_REMINDER',
            createdAt: {
              gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
              lt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
            }
          }
        });

        if (!existingReminder) {

          // Create reminder notifications (lint: suppress unused vars)
          /* eslint-disable @typescript-eslint/no-unused-vars */
          const tenantNotification = await prisma.notification.create({
            data: {
              userId: rental.tenantId,
              message: `Reminder: Your rent payment for ${rental.property.title} is due on ${nextPaymentDate.toLocaleDateString()}. Amount: PKR ${rental.property.amount}`,
              type: 'RENT_REMINDER'
            }
          });
          const ownerNotification = await prisma.notification.create({
            data: {
              userId: rental.property.ownerId,
              message: `Automatic rent reminder sent to ${rental.tenant.name} for property: ${rental.property.title}`,
              type: 'RENT_REMINDER_SENT'
            }
          });
          /* eslint-enable @typescript-eslint/no-unused-vars */

          remindersSent.push({
            rentalId: rental.id,
            propertyTitle: rental.property.title,
            tenantName: rental.tenant.name,
            ownerName: rental.property.owner.name,
            dueDate: nextPaymentDate,
            amount: rental.property.amount
          });
        }
      }
    }

    return NextResponse.json({
      message: `Automatic reminders processed successfully`,
      remindersSent: remindersSent.length,
      details: remindersSent
    });

  } catch (error) {
    console.error('Auto reminder API error:', error);
    return NextResponse.json(
      { error: 'Failed to process automatic reminders' },
      { status: 500 }
    );
  }
}

// GET endpoint to check upcoming reminders
export async function GET() {
  try {
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    const activeRentals = await prisma.rental.findMany({
      where: {
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

    const upcomingReminders = [];

    for (const rental of activeRentals) {
      const startDate = new Date(rental.startDate);
      const currentMonth = today.getMonth();
      const currentYear = today.getFullYear();
      
      const nextPaymentDate = new Date(currentYear, currentMonth + 1, startDate.getDate());
      const reminderDate = new Date(nextPaymentDate.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      if (reminderDate >= today && reminderDate <= nextWeek) {
        upcomingReminders.push({
          rentalId: rental.id,
          propertyTitle: rental.property.title,
          tenantName: rental.tenant.name,
          ownerName: rental.property.owner.name,
          reminderDate: reminderDate,
          dueDate: nextPaymentDate,
          amount: rental.property.amount
        });
      }
    }

    return NextResponse.json({
      upcomingReminders: upcomingReminders.length,
      details: upcomingReminders
    });

  } catch (error) {
    console.error('Get upcoming reminders API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch upcoming reminders' },
      { status: 500 }
    );
  }
}
