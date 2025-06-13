'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';

interface RentedProperty {
  id: string;
  title: string;
  location: string;
  amount: number;
  images: { id: string; url: string }[];
}

interface FavoriteProperty {
  id: string;
  title: string;
  location: string;
  amount: number;
  images: { id: string; url: string }[];
}

export default function TenantDashboard() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [rentedProperties, setRentedProperties] = useState<RentedProperty[]>([]);
  const [favoriteProperties, setFavoriteProperties] = useState<FavoriteProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUnrentConfirm, setShowUnrentConfirm] = useState(false);
  const [propertyToUnrent, setPropertyToUnrent] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated') {
      fetchTenantData();
    }
  }, [status, router]);

  const fetchTenantData = async () => {
    try {
      // Fetch rented properties
      const rentedResponse = await fetch('/api/tenant/rented-properties');
      const rentedData = await rentedResponse.json();
      setRentedProperties(rentedData);

      // Fetch favorite properties
      const favoritesResponse = await fetch('/api/tenant/favorites');
      const favoritesData = await favoritesResponse.json();
      setFavoriteProperties(favoritesData);
    } catch (error) {
      console.error('Error fetching tenant data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnrentProperty = async (propertyId: string) => {
    setPropertyToUnrent(propertyId);
    setShowUnrentConfirm(true);
  };

  const confirmUnrent = async () => {
    if (!propertyToUnrent) return;

    try {
      const response = await fetch(`/api/tenant/rented-properties/${propertyToUnrent}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to unrent property');
      }

      // Update local state
      setRentedProperties(rentedProperties.filter(p => p.id !== propertyToUnrent));
      alert('Property unrented successfully!');
    } catch (error) {
      console.error('Error unrenting property:', error);
      alert(error instanceof Error ? error.message : 'Failed to unrent property. Please try again.');
    } finally {
      setShowUnrentConfirm(false);
      setPropertyToUnrent(null);
    }
  };

  const handleUnfavoriteProperty = async (propertyId: string) => {
    try {
      const response = await fetch(`/api/favorites/${propertyId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to remove from favorites');
      }

      // Update local state
      setFavoriteProperties(favoriteProperties.filter(p => p.id !== propertyId));
      
      // Show success message
      alert('Property removed from favorites!');
    } catch (error) {
      console.error('Error removing from favorites:', error);
      alert('Failed to remove from favorites. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-200 rounded-lg w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-xl shadow-sm">
                  <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-800">
              Welcome Back
            </h1>
            <p className="mt-2 text-gray-600">Manage your rentals and favorites</p>
          </div>
          <Link
            href="/tenant/properties"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer shadow-md"
          >
            Browse Properties
          </Link>
        </div>

        {/* Rented Properties Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Your Rented Properties</h2>
          {rentedProperties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rentedProperties.map((property) => (
                <div key={property.id} className="bg-white rounded-xl shadow-sm overflow-hidden transform transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                  {property.images[0] && (
                    <div className="relative h-48 w-full">
                      <Image
                        src={property.images[0].url}
                        alt={property.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{property.title}</h3>
                    <p className="text-gray-600 mb-4">{property.location}</p>
                    <p className="text-2xl font-bold text-blue-600 mb-4">
                      Rs. {property.amount.toLocaleString()}/month
                    </p>
                    <div className="flex justify-between items-center">
                    <Link
                      href={`/tenant/properties/${property.id}`}
                      className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200 cursor-pointer"
                    >
                      View Details
                      <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                      <button
                        onClick={() => handleUnrentProperty(property.id)}
                        className="text-red-600 hover:text-red-700 font-medium transition-colors duration-200 cursor-pointer hover:underline"
                      >
                        Unrent Property
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <p className="text-gray-600 mb-4">You haven't rented any properties yet.</p>
              <Link
                href="/tenant/properties"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer shadow-md"
              >
                Browse Properties
              </Link>
            </div>
          )}
        </div>

        {/* Favorite Properties Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Favorite Properties</h2>
          {favoriteProperties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favoriteProperties.map((property) => (
                <div key={property.id} className="bg-white rounded-xl shadow-sm overflow-hidden transform transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                  {property.images[0] && (
                    <div className="relative h-48 w-full">
                      <Image
                        src={property.images[0].url}
                        alt={property.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{property.title}</h3>
                    <p className="text-gray-600 mb-4">{property.location}</p>
                    <p className="text-2xl font-bold text-blue-600 mb-4">
                      Rs. {property.amount.toLocaleString()}/month
                    </p>
                    <div className="flex justify-between items-center">
                    <Link
                      href={`/tenant/properties/${property.id}`}
                      className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200 cursor-pointer"
                    >
                      View Details
                      <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                      <button
                        onClick={() => handleUnfavoriteProperty(property.id)}
                        className="text-red-600 hover:text-red-700 font-medium transition-colors duration-200 cursor-pointer hover:underline"
                      >
                        Remove from Favorites
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <p className="text-gray-600 mb-4">You haven't added any properties to your favorites yet.</p>
              <Link
                href="/tenant/properties"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer shadow-md"
              >
                Browse Properties
              </Link>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link
              href="/tenant/properties"
              className="bg-white p-6 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
            >
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Browse Properties</h3>
              <p className="text-gray-600">
                Find your perfect home or commercial space
              </p>
            </Link>

            <Link
              href="/messages"
              className="bg-white p-6 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
            >
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Messages</h3>
              <p className="text-gray-600">
                Contact property owners and manage inquiries
              </p>
            </Link>

            <Link
              href="/tenant/settings"
              className="bg-white p-6 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
            >
              <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Settings</h3>
              <p className="text-gray-600">
                Manage your account settings
              </p>
            </Link>
          </div>
        </div>
      </div>

      {/* Unrent Confirmation Modal */}
      {showUnrentConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirm Unrent</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to unrent this property? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => {
                  setShowUnrentConfirm(false);
                  setPropertyToUnrent(null);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 cursor-pointer font-medium transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={confirmUnrent}
                className="px-4 py-2 bg-red-600 text-white rounded-lg cursor-pointer hover:bg-red-700 transition-colors duration-200"
              >
                Confirm Unrent
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 