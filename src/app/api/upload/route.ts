import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/authOptions';
import { cloudinary } from '@/lib/cloudinary';
import { prisma } from '@/lib/prisma';

// Maximum file size (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Allowed file types
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const propertyId = formData.get('propertyId') as string;

    if (!file || !propertyId) {
      return NextResponse.json(
        { error: 'File and propertyId are required' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size must be less than 5MB' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Only JPEG, PNG, and WebP images are allowed' },
        { status: 400 }
      );
    }

    // Verify property ownership
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      include: {
        images: true
      }
    });

    if (!property || property.ownerId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if property already has 5 images
    if (property.images.length >= 5) {
      return NextResponse.json(
        { error: 'Maximum 5 images allowed per property' },
        { status: 400 }
      );
    }

    try {
      // Convert file to base64
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const base64String = buffer.toString('base64');
      const dataURI = `data:${file.type};base64,${base64String}`;

      // Upload to Cloudinary with error handling
      const result = await cloudinary.uploader.upload(dataURI, {
        folder: 'rental-properties',
        resource_type: 'auto',
        allowed_formats: ['jpg', 'png', 'webp'],
        transformation: [
          { width: 1200, height: 800, crop: 'fill' },
          { quality: 'auto' }
        ]
      });

      if (!result.secure_url) {
        throw new Error('Failed to get secure URL from Cloudinary');
      }

      // Save image URL to database
      const image = await prisma.image.create({
        data: {
          url: result.secure_url,
          propertyId,
        },
      });

      return NextResponse.json(image);
    } catch (uploadError) {
      console.error('Error uploading to Cloudinary:', uploadError);
      return NextResponse.json(
        { error: 'Failed to upload image to cloud storage' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in upload route:', error);
    return NextResponse.json(
      { error: 'Failed to process image upload' },
      { status: 500 }
    );
  }
} 