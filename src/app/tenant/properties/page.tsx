'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { FaHome, FaHeart, FaRegHeart, FaMapMarkerAlt, FaRupeeSign, FaSearch, FaFilter, FaArrowLeft, FaEnvelope, FaPhone, FaEye } from 'react-icons/fa';
import ImageCarousel from '@/app/components/ImageCarousel';

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
    type Favorite = { id: string };
    const favoriteIds = new Set((favorites as Favorite[]).map((f) => f.id));

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

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading properties...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2126&q=80')`
        }}
      />
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 via-purple-900/15 to-indigo-900/20 backdrop-blur-sm" />
      
      {/* Floating Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-20 h-20 bg-blue-400/20 rounded-full opacity-40 animate-pulse" />
        <div className="absolute bottom-20 right-10 w-24 h-24 bg-purple-400/20 rounded-full opacity-40 animate-pulse delay-1000" />
        <div className="absolute top-1/3 right-20 w-16 h-16 bg-teal-400/20 rounded-full opacity-40 animate-pulse delay-500" />
        <div className="absolute bottom-1/3 left-20 w-18 h-18 bg-indigo-400/20 rounded-full opacity-40 animate-pulse delay-700" />
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="bg-white/90 backdrop-blur-md shadow-lg border-b border-white/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center space-x-4">
                <Link 
                  href="/tenant/dashboard"
                  className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors duration-300 bg-white/50 backdrop-blur-sm rounded-full px-4 py-2 hover:bg-white/70"
                >
                  <span className="text-sm">
                  <FaArrowLeft />
                  </span>
                  <span className="text-sm font-medium">Back to Dashboard</span>
                </Link>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <span className="text-white text-xl"><FaHome size={24} /></span>
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      Available Properties
                    </h1>
                    <p className="text-gray-600 text-sm">Find your perfect rental home</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-xl border border-white/20 p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search Bar */}
              <div className="flex-1 relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"><FaSearch size={20} /></span>
                <input
                  type="text"
                  placeholder="Search properties by title or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm transition-all duration-300"
                />
              </div>
              
              {/* Filter Dropdown */}
              <div className="relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 z-10"><FaFilter size={20} /></span>
                <select
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                  className="pl-12 pr-8 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm appearance-none cursor-pointer min-w-[200px] transition-all duration-300"
                >
                  <option value="ALL">All Property Types</option>
                  <option value="HOUSE">House</option>
                  <option value="APARTMENT">Apartment</option>
                  <option value="COMMERCIAL">Commercial</option>
                  <option value="LAND">Land</option>
                </select>
              </div>
            </div>
          </div>

          {/* Properties Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProperties.map((property) => (
              <div
                key={property.id}
                className="bg-white/90 backdrop-blur-md rounded-3xl shadow-xl border border-white/20 overflow-hidden hover:shadow-2xl hover:scale-105 transition-all duration-300 group"
              >
                {/* Property Image */}
                <div className="relative h-56 overflow-hidden">
                  <ImageCarousel 
                    images={property.images || []}
                    title={property.title}
                    height="h-56"
                    className="rounded-t-3xl"
                  />
                  
                  {/* Favorite Button */}
                  <button
                    onClick={() => handleFavoriteToggle(property.id)}
                    className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all duration-300"
                  >
                    {property.isFavorite ? (
                      <span className="text-red-500 text-lg"><FaHeart size={20} /></span>
                    ) : (
                      <span className="text-gray-600 text-lg hover:text-red-500"><FaRegHeart size={20} /></span>
                    )}
                  </button>

                  {/* Availability Badge */}
                  <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm ${
                    property.isAvailable 
                      ? 'bg-green-500/90 text-white' 
                      : 'bg-red-500/90 text-white'
                  }`}>
                    {property.isAvailable ? 'Available' : 'Rented'}
                  </div>
                </div>

                {/* Property Details */}
                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
                      {property.title}
                    </h3>
                    <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                      {property.type}
                    </span>
                  </div>
                  
                  <div className="flex items-center text-gray-600 mb-3">
                    <span className="text-sm mr-2 text-blue-500"><FaMapMarkerAlt size={16} /></span>
                    <span className="text-sm">{property.location}</span>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {property.description}
                  </p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <span className="text-green-600 text-lg mr-1"><FaRupeeSign size={20} /></span>
                      <span className="text-2xl font-bold text-gray-900">
                        {property.amount.toLocaleString()}
                      </span>
                      <span className="text-gray-500 text-sm ml-1">/month</span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {property.area} sq ft
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <Link
                      href={`/tenant/properties/${property.id}`}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-2xl font-semibold text-center hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                    >
                      <span className="text-sm"><FaEye size={16} /></span>
                      <span>View Details</span>
                    </Link>
                    
                    {property.isAvailable && (
                      <button
                        onClick={() => handleRentProperty(property.id)}
                        className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-4 rounded-2xl font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl"
                      >
                        Rent Now
                      </button>
                    )}
                  </div>

                  {/* Contact Owner Button */}
                  <button
                    onClick={() => handleContactOwner(property)}
                    className="w-full mt-3 bg-white border-2 border-blue-200 text-blue-600 py-2 px-4 rounded-2xl font-medium hover:bg-blue-50 hover:border-blue-300 transition-all duration-300 flex items-center justify-center space-x-2"
                  >
                    <span className="text-sm"><FaEnvelope size={16} /></span>
                    <span>Contact Owner</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* No Properties Found */}
          {filteredProperties.length === 0 && (
            <div className="text-center py-16">
              <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-xl border border-white/20 p-12 max-w-md mx-auto">
                <span className="text-6xl text-gray-400 mx-auto mb-4"><FaHome size={48} /></span>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">No Properties Found</h3>
                <p className="text-gray-600">
                  {searchTerm || propertyType !== 'ALL' 
                    ? 'Try adjusting your search criteria' 
                    : 'No properties are currently available'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Contact Modal */}
        {showContactModal && selectedProperty && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20 p-8 max-w-md w-full transform animate-in zoom-in-95 duration-300">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <span className="text-white text-2xl"><FaEnvelope size={24} /></span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Contact Property Owner
                </h3>
                <p className="text-gray-600 text-sm">
                  Send a message to <span className="font-semibold text-blue-600">{selectedProperty.owner.name}</span> about <span className="font-semibold">{selectedProperty.title}</span>
                </p>
              </div>
              
              {/* Owner Info */}
              <div className="bg-blue-50/80 backdrop-blur-sm rounded-2xl p-4 mb-6">
                <div className="flex items-center space-x-3 mb-2">
                  <span className="text-blue-600"><FaPhone size={20} /></span>
                  <span className="text-gray-700">{selectedProperty.owner.phoneNumber}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-blue-600"><FaEnvelope size={20} /></span>
                  <span className="text-gray-700">{selectedProperty.owner.email}</span>
                </div>
              </div>

              <form onSubmit={handleSendMessage}>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message here..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm resize-none transition-all duration-300"
                  rows={4}
                  required
                />
                <div className="mt-6 flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowContactModal(false);
                      setSelectedProperty(null);
                      setMessage('');
                    }}
                    className="flex-1 px-6 py-3 text-gray-700 bg-gray-100 rounded-2xl font-semibold hover:bg-gray-200 transition-all duration-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl"
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