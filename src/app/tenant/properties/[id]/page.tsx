'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Image from 'next/image';

interface Property {
  id: string;
  title: string;
  description: string;
  location: string;
  amount: number;
  bedrooms: number;
  bathrooms: number;
  area: number;
  type: string;
  isAvailable: boolean;
  images: { id: string; url: string }[];
  owner: {
    id: string;
    name: string;
    email: string;
  };
}

export default function PropertyDetails({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRentModal, setShowRentModal] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [renting, setRenting] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated') {
      fetchPropertyDetails();
    }
  }, [status, router, params.id]);

  const fetchPropertyDetails = async () => {
    try {
      const response = await fetch(`/api/properties/${params.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch property details');
      }
      const data = await response.json();
      setProperty(data);
    } catch (error) {
      setError('Failed to load property details');
      console.error('Error fetching property:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRentProperty = async () => {
    if (!startDate) {
      alert('Please select a start date');
      return;
    }

    setRenting(true);
    try {
      const response = await fetch('/api/tenant/rented-properties', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          propertyId: params.id,
          startDate,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to rent property');
      }

      alert('Property rented successfully!');
      router.push('/tenant/dashboard');
    } catch (error) {
      console.error('Error renting property:', error);
      alert(error instanceof Error ? error.message : 'Failed to rent property. Please try again.');
    } finally {
      setRenting(false);
      setShowRentModal(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-200 rounded-lg w-1/4"></div>
            <div className="h-96 bg-gray-200 rounded-lg"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <p className="text-red-600 mb-4">{error || 'Property not found'}</p>
            <button
              onClick={() => router.back()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer shadow-md"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {/* Property Images */}
          <div className="relative">
            {/* Main Image */}
            <div className="relative h-96 w-full">
              {property.images[0] && (
                <Image
                  src={property.images[0].url}
                  alt={property.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1280px) 100vw, 1280px"
                  priority
                />
              )}
            </div>
            
            {/* Image Thumbnails */}
            {property.images.length > 1 && (
              <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50">
                {property.images.map((image, index) => (
                  <div
                    key={image.id}
                    className="relative h-24 w-full cursor-pointer hover:opacity-75 transition-opacity"
                    onClick={() => {
                      // Move this image to the first position
                      const newImages = [...property.images];
                      const [movedImage] = newImages.splice(index, 1);
                      newImages.unshift(movedImage);
                      setProperty({ ...property, images: newImages });
                    }}
                  >
                    <Image
                      src={image.url}
                      alt={`${property.title} - Image ${index + 1}`}
                      fill
                      className="object-cover rounded-lg"
                      sizes="(max-width: 768px) 25vw, 20vw"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Property Details */}
          <div className="p-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{property.title}</h1>
                <p className="text-gray-600">{property.location}</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-blue-600">
                  Rs. {property.amount.toLocaleString()}/month
                </p>
                {property.isAvailable ? (
                  <button
                    onClick={() => setShowRentModal(true)}
                    className="mt-4 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer shadow-md"
                  >
                    Rent Now
                  </button>
                ) : (
                  <span className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-gray-500">
                    Not Available
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Bedrooms</p>
                <p className="text-xl font-semibold text-gray-900">{property.bedrooms}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Bathrooms</p>
                <p className="text-xl font-semibold text-gray-900">{property.bathrooms}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Area</p>
                <p className="text-xl font-semibold text-gray-900">{property.area} sq ft</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Type</p>
                <p className="text-xl font-semibold text-gray-900">{property.type}</p>
              </div>
            </div>

            <div className="prose max-w-none">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Description</h2>
              <p className="text-gray-600">{property.description}</p>
            </div>

            <div className="mt-8 border-t border-gray-200 pt-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Owner Information</h2>
              <div className="bg-gray-50 p-6 rounded-lg">
                <p className="text-gray-900 font-medium">{property.owner.name}</p>
                <p className="text-gray-600">{property.owner.email}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rent Modal */}
      {showRentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Rent Property</h3>
            <div className="mb-4">
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                id="startDate"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => {
                  setShowRentModal(false);
                  setStartDate('');
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors duration-200"
                disabled={renting}
              >
                Cancel
              </button>
              <button
                onClick={handleRentProperty}
                disabled={renting}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {renting ? 'Renting...' : 'Confirm Rent'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 