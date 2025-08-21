'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface Property {
  id: string;
  title: string;
  description: string;
  type: string;
  area: number;
  amount: number;
  location: string;
  createdAt: string;
  owner: {
    id: string;
    name: string;
    phoneNumber: string;
  };
  images: { id: string; url: string }[];
  isFavorite?: boolean;
}

import { Suspense } from 'react';

function TenantPageInner() {
  const router = useRouter();
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [filters, setFilters] = useState({
    type: searchParams.get('type') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    location: searchParams.get('location') || '',
  });
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const queryParams = new URLSearchParams();
        if (filters.type) queryParams.set('type', filters.type);
        if (filters.minPrice) queryParams.set('minPrice', filters.minPrice);
        if (filters.maxPrice) queryParams.set('maxPrice', filters.maxPrice);
        if (filters.location) queryParams.set('location', filters.location);

        const response = await fetch(`/api/properties?${queryParams.toString()}`);
        const data = await response.json();

        if (session) {
          // Fetch user's favorites
          const favoritesResponse = await fetch('/api/favorites');
          const favorites = await favoritesResponse.json();
          type Favorite = { property: { id: string } };
          const favoriteIds = new Set((favorites as Favorite[]).map((f) => f.property.id));

          // Mark properties as favorite
          (data as Property[]).forEach((property) => {
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

    fetchProperties();
  }, [filters, session]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    
    // Update URL with new filters
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(name, value);
    } else {
      params.delete(name);
    }
    router.push(`/tenant?${params.toString()}`);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value);
  };

  const handleViewModeChange = (mode: 'grid' | 'list') => {
    setViewMode(mode);
  };

  const sortProperties = (properties: Property[]) => {
    return [...properties].sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return a.amount - b.amount;
        case 'price-desc':
          return b.amount - a.amount;
        case 'area-asc':
          return a.area - b.area;
        case 'area-desc':
          return b.area - a.area;
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
  };

  const filteredAndSortedProperties = sortProperties(properties);

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
        type Favorite = { id: string; property: { id: string } };
        const favorite = await fetch('/api/favorites').then(res => res.json())
          .then((favorites: Favorite[]) => favorites.find((f) => f.property.id === propertyId));

        if (favorite) {
          await fetch(`/api/favorites/${favorite.id}`, {
            method: 'DELETE',
          });
        }
      } else {
        // Add to favorites
        await fetch('/api/favorites', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ propertyId }),
        });
      }

      // Update local state
      setProperties(properties.map(p => 
        p.id === propertyId ? { ...p, isFavorite: !p.isFavorite } : p
      ));
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session || !selectedProperty) return;

    setSending(true);
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: message,
          propertyId: selectedProperty.id,
          receiverId: selectedProperty.owner.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      setMessage('');
      setSelectedProperty(null);
      router.push('/messages');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">Available Properties</h1>
          <div className="flex space-x-4">
            <select
              value={sortBy}
              onChange={handleSortChange}
              className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="newest">Newest First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="area-asc">Area: Small to Large</option>
              <option value="area-desc">Area: Large to Small</option>
            </select>
            <div className="flex rounded-md shadow-sm">
              <button
                onClick={() => handleViewModeChange('grid')}
                className={`px-3 py-2 rounded-l-md ${
                  viewMode === 'grid'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Grid
              </button>
              <button
                onClick={() => handleViewModeChange('list')}
                className={`px-3 py-2 rounded-r-md ${
                  viewMode === 'list'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                List
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
            <select
              name="type"
              value={filters.type}
              onChange={handleFilterChange}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              <option value="HOUSE">House</option>
              <option value="APARTMENT">Apartment</option>
              <option value="FLAT">Flat</option>
              <option value="PLOT">Plot</option>
              <option value="COMMERCIAL">Commercial</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Min Price</label>
            <input
              type="number"
              name="minPrice"
              value={filters.minPrice}
              onChange={handleFilterChange}
              placeholder="Min Price"
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Max Price</label>
            <input
              type="number"
              name="maxPrice"
              value={filters.maxPrice}
              onChange={handleFilterChange}
              placeholder="Max Price"
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input
              type="text"
              name="location"
              value={filters.location}
              onChange={handleFilterChange}
              placeholder="Search location"
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-2 text-gray-600">Loading properties...</p>
        </div>
      ) : filteredAndSortedProperties.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600">No properties found matching your criteria.</p>
        </div>
      ) : (
        <div className={viewMode === 'grid' ? 'grid md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-6'}>
          {filteredAndSortedProperties.map((property) => (
            <div
              key={property.id}
              className={`bg-white rounded-lg shadow-md overflow-hidden ${
                viewMode === 'list' ? 'flex' : ''
              }`}
            >
              {property.images.length > 0 && (
                <div className={viewMode === 'list' ? 'w-1/3' : 'w-full'}>
                  <img
                    src={property.images[0].url}
                    alt={property.title}
                    className="w-full h-48 object-cover"
                  />
                </div>
              )}
              <div className={`p-6 ${viewMode === 'list' ? 'w-2/3' : ''}`}>
                <div className="flex justify-between items-start mb-2">
                  <h2 className="text-xl font-semibold text-gray-800">{property.title}</h2>
                  <button
                    onClick={() => handleFavoriteToggle(property.id)}
                    className={`text-2xl ${
                      property.isFavorite ? 'text-red-500' : 'text-gray-400'
                    } hover:text-red-500 transition-colors`}
                  >
                    ♥
                  </button>
                </div>
                <p className="text-gray-600 mb-4">{property.description}</p>
                
                <div className="space-y-2 mb-4">
                  <p className="text-sm text-gray-500">
                    <span className="font-medium">Type:</span> {property.type}
                  </p>
                  <p className="text-sm text-gray-500">
                    <span className="font-medium">Area:</span> {property.area} sq ft
                  </p>
                  <p className="text-sm text-gray-500">
                    <span className="font-medium">Location:</span> {property.location}
                  </p>
                  <p className="text-lg font-semibold text-blue-600">
                    Rs. {property.amount.toLocaleString()}/month
                  </p>
                </div>

                <div className="border-t pt-4">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Owner:</span> {property.owner.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Contact:</span> {property.owner.phoneNumber}
                  </p>
                </div>

                <button
                  onClick={() => setSelectedProperty(property)}
                  className="w-full mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  Contact Owner
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Contact Form Modal */}
      {selectedProperty && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-semibold mb-4">Contact Property Owner</h2>
            <p className="text-gray-600 mb-4">
              Send a message to {selectedProperty.owner.name} about {selectedProperty.title}
            </p>
            <form onSubmit={handleSendMessage} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  rows={4}
                  placeholder="Enter your message here..."
                  required
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedProperty(null);
                    setMessage('');
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sending}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {sending ? 'Sending...' : 'Send Message'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TenantPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-xl">Loading tenant dashboard...</div>}>
      <TenantPageInner />
    </Suspense>
  );
}