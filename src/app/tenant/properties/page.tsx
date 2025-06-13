'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

interface Property {
  id: string;
  title: string;
  description: string;
  type: string;
  area: number;
  amount: number;
  location: string;
  isAvailable: boolean;
  images: { id: string; url: string }[];
  owner: {
    id: string;
    name: string;
    email: string;
    phoneNumber: string;
  };
  isFavorite?: boolean;
}

export default function PropertiesPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [propertyType, setPropertyType] = useState('ALL');
  const [showContactModal, setShowContactModal] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated') {
      fetchProperties();
    }
  }, [status, router]);

  const fetchProperties = async () => {
    try {
      const response = await fetch('/api/properties');
      const data = await response.json();

      if (session) {
        // Fetch user's favorites
        const favoritesResponse = await fetch('/api/tenant/favorites');
        const favorites = await favoritesResponse.json();
        const favoriteIds = new Set(favorites.map((f: any) => f.id));

        // Mark properties as favorite
        data.forEach((property: Property) => {
          property.isFavorite = favoriteIds.has(property.id);
        });
      }

      setProperties(data);
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFavoriteToggle = async (propertyId: string) => {
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    try {
      const property = properties.find(p => p.id === propertyId);
      if (!property) return;

      if (property.isFavorite) {
        // Remove from favorites
        const response = await fetch(`/api/favorites/${propertyId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to remove from favorites');
        }
      } else {
        // Add to favorites
        const response = await fetch('/api/favorites', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ propertyId }),
        });

        if (!response.ok) {
          throw new Error('Failed to add to favorites');
        }
      }

      // Update local state
      setProperties(properties.map(p => 
        p.id === propertyId ? { ...p, isFavorite: !p.isFavorite } : p
      ));

      // Show success message
      alert(property.isFavorite ? 'Removed from favorites!' : 'Added to favorites!');
    } catch (error) {
      console.error('Error toggling favorite:', error);
      alert('Failed to update favorites. Please try again.');
    }
  };

  const handleRentProperty = async (propertyId: string) => {
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    // Redirect to payment page
    router.push(`/tenant/payment?propertyId=${propertyId}`);
  };

  const handleContactOwner = async (property: Property) => {
    setSelectedProperty(property);
    setShowContactModal(true);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProperty || !message.trim()) return;

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          propertyId: selectedProperty.id,
          receiverId: selectedProperty.owner.id,
          message: message.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      setMessage('');
      setShowContactModal(false);
      setSelectedProperty(null);
      alert('Message sent successfully!');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    }
  };

  const filteredProperties = properties.filter(property => {
    const matchesSearch = property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = propertyType === 'ALL' || property.type === propertyType;
    return matchesSearch && matchesType && property.isAvailable;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-lg shadow-sm">
                  <div className="h-48 bg-gray-200 rounded mb-4"></div>
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
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Available Properties</h1>
          <Link
            href="/tenant/dashboard"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Back to Dashboard
          </Link>
        </div>

        {/* Filters */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <input
              type="text"
              placeholder="Search by title or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <select
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Types</option>
              <option value="HOUSE">House</option>
              <option value="APARTMENT">Apartment</option>
              <option value="COMMERCIAL">Commercial</option>
              <option value="FLAT">Flat</option>
              <option value="PLOT">Plot</option>
            </select>
          </div>
        </div>

        {/* Properties Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((property) => (
            <div key={property.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
              {property.images[0] && (
                <img
                  src={property.images[0].url}
                  alt={property.title}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-medium text-gray-900">{property.title}</h3>
                  <button
                    onClick={() => handleFavoriteToggle(property.id)}
                    className={`text-2xl transition-colors duration-200 cursor-pointer hover:scale-110 ${
                      property.isFavorite ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
                    }`}
                  >
                    {property.isFavorite ? '♥' : '♡'}
                  </button>
                </div>
                <p className="text-sm text-gray-500 mt-1">{property.location}</p>
                <p className="text-lg font-semibold text-gray-900 mt-2">
                  Rs. {property.amount.toLocaleString()}/month
                </p>
                <div className="mt-4 flex justify-between items-center">
                  <Link
                    href={`/tenant/properties/${property.id}`}
                    className="text-blue-600 hover:text-blue-500 text-sm font-medium cursor-pointer"
                  >
                    View Details →
                  </Link>
                  <div className="flex gap-2">
                    {property.isAvailable && (
                      <button
                        onClick={() => handleRentProperty(property.id)}
                        className="text-green-600 hover:text-green-500 text-sm font-medium cursor-pointer hover:underline"
                      >
                        Rent Now
                      </button>
                    )}
                  <button
                    onClick={() => handleContactOwner(property)}
                      className="text-blue-600 hover:text-blue-500 text-sm font-medium cursor-pointer hover:underline"
                  >
                    Contact Owner
                  </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Contact Modal */}
        {showContactModal && selectedProperty && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Contact Property Owner
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Send a message to {selectedProperty.owner.name} about {selectedProperty.title}
              </p>
              <form onSubmit={handleSendMessage}>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message here..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  required
                />
                <div className="mt-4 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowContactModal(false);
                      setSelectedProperty(null);
                      setMessage('');
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                  >
                    Send Message
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 