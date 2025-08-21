import { NextResponse } from 'next/server';

const GEMINI_API_KEY = 'AIzaSyDG3Df4wlhZl6w6VQigR6c6EgXsKgnWZII';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';

export async function POST(request: Request) {
  try {
    const { message } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    console.log('Received message:', message);

    // Create a context-aware prompt for the rental management system
    const systemPrompt = `You are RentFlow Assistant, a helpful AI chatbot for a rental management system in Faisalabad, Pakistan. 
    You help users with:
    - Finding properties for rent
    - Understanding rental processes
    - Answering questions about property management
    - Helping with tenant and owner inquiries
    - Providing information about rent payments
    - Assisting with property listings
    
    Keep responses helpful, concise, and friendly. Always respond in a conversational manner.
    
    User message: ${message}`;

    console.log('Making request to Gemini API...');

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: systemPrompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      }),
    });

    console.log('Gemini API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      
      // Return a helpful fallback response instead of error
      return NextResponse.json({
        response: `I'm here to help with your rental management needs! I can assist you with finding properties, understanding rental processes, payment information, and more. What would you like to know about?`
      });
    }

    const data = await response.json();
    console.log('Gemini API response:', JSON.stringify(data, null, 2));
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      console.error('Invalid response structure from Gemini API:', data);
      
      // Return a helpful fallback response
      return NextResponse.json({
        response: `I'm your RentFlow assistant! I can help you with property rentals, tenant management, payment processes, and more. How can I assist you today?`
      });
    }

    const botResponse = data.candidates[0].content.parts[0].text;
    console.log('Bot response:', botResponse);

    return NextResponse.json({
      response: botResponse
    });

  } catch (error) {
    console.error('Chatbot API error:', error);
    
    // Return a more helpful fallback response based on common queries
    return NextResponse.json({
      response: `Hello! I'm your RentFlow assistant. I can help you with:

🏠 Finding rental properties
💰 Understanding payment processes  
📋 Property management questions
🤝 Tenant and owner inquiries
📍 Properties in Faisalabad area

What would you like to know about?`
    });
  }
}
