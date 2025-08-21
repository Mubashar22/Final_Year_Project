import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { message } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Simple rule-based responses for testing
    const lowerMessage = message.toLowerCase();
    let response = '';

    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      response = 'Hello! Welcome to RMS. I\'m here to help you with all your rental management needs. How can I assist you today?';
    } else if (lowerMessage.includes('rent') || lowerMessage.includes('property')) {
      response = 'I can help you with rental properties! We have various options available including houses, apartments, and commercial spaces in Faisalabad. Would you like to know about available properties, rental processes, or payment options?';
    } else if (lowerMessage.includes('payment') || lowerMessage.includes('pay')) {
      response = 'For payments, we support multiple methods including bank transfers, online payments, and cash. Rent is typically due monthly. Would you like more details about payment schedules or methods?';
    } else if (lowerMessage.includes('owner') || lowerMessage.includes('landlord')) {
      response = 'As a property owner, you can list your properties, manage tenants, track payments, and communicate with renters through our platform. What specific aspect would you like to know more about?';
    } else if (lowerMessage.includes('tenant') || lowerMessage.includes('renter')) {
      response = 'As a tenant, you can search for properties, apply for rentals, make payments, and communicate with property owners. Are you looking for a specific type of property or location?';
    } else if (lowerMessage.includes('help') || lowerMessage.includes('support')) {
      response = 'I\'m here to help! I can assist you with:\n\n🏠 Finding rental properties\n💰 Payment processes\n📋 Property management\n🤝 Tenant-owner communication\n📍 Properties in Faisalabad\n\nWhat would you like to know more about?';
    } else if (lowerMessage.includes('location') || lowerMessage.includes('faisalabad')) {
      response = 'We specialize in rental properties throughout Faisalabad, including popular areas like Civil Lines, Peoples Colony, Susan Road, and Jaranwala Road. Which area are you interested in?';
    } else {
      response = 'Thank you for your message! I\'m Rental Assistant, and I\'m here to help with rental management. I can assist you with finding properties, payment information, tenant services, and property management. What specific information are you looking for?';
    }

    return NextResponse.json({
      response: response
    });

  } catch (error) {
    console.error('Chatbot test API error:', error);
    return NextResponse.json({
      response: 'Hello! I\'m your Rental assistant. How can I help you with your rental needs today?'
    });
  }
}
