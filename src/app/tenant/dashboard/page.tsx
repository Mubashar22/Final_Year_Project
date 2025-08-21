'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import ImageCarousel from '@/app/components/ImageCarousel';
import { FaHome, FaHeart, FaSearch, FaEnvelope, FaCog, FaSignOutAlt, FaMapMarkerAlt, FaDollarSign, FaTimes } from 'react-icons/fa';

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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading your dashboard...</p>
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
        <div className="absolute bottom-1/3 left-20 w-18 h-18 bg-green-400/20 rounded-full opacity-40 animate-pulse delay-700" />
      </div>

      {/* Header */}
      <div className="relative z-10 bg-white/90 backdrop-blur-xl border-b border-white/20 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl">
                <span className="text-white text-2xl">
                  <FaHome />
                </span>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Tenant Dashboard
                </h1>
                <p className="text-gray-600 text-sm">Welcome back, {session?.user?.name}!</p>
              </div>
            </div>
            <button
              onClick={() => signOut()}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <span className="text-sm">
                <FaSignOutAlt />
              </span>
              <span className="font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/20 hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center">
              <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white text-xl">
                  <FaHome />
                </span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Rented Properties</p>
                <p className="text-3xl font-bold text-gray-900">{rentedProperties.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/20 hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center">
              <div className="w-14 h-14 bg-gradient-to-r from-pink-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white text-xl">
                  <FaHeart />
                </span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Favorite Properties</p>
                <p className="text-3xl font-bold text-gray-900">{favoriteProperties.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/20 hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center">
              <div className="w-14 h-14 bg-gradient-to-r from-green-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white text-xl">
                  <FaDollarSign />
                </span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Rent</p>
                <p className="text-3xl font-bold text-gray-900">
                  PKR {rentedProperties.reduce((sum, property) => sum + property.amount, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Rented Properties Section */}
        <div className="mb-8">
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
            <div className="p-6 border-b border-gray-200/50">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <span className="mr-3 text-blue-600">
                  <FaHome />
                </span>
                My Rented Properties
              </h2>
            </div>
            <div className="p-6">
              {rentedProperties.length === 0 ? (
                <div className="text-center py-12">
                  <span className="mx-auto h-12 w-12 text-gray-400 mb-4">
                    <FaHome />
                  </span>
                  <p className="text-gray-500 text-lg">No rented properties yet</p>
                  <Link
                    href="/tenant/properties"
                    className="mt-4 inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    <span className="mr-2">
                      <FaSearch />
                    </span>
                    Browse Properties
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {rentedProperties.map((property) => (
                    <div key={property.id} className="bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-white/30">
                      {property.images.length > 0 && (
                        <ImageCarousel 
                          images={property.images} 
                          title={property.title}
                          height="h-48"
                          className="rounded-t-2xl"
                        />
                      )}
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 mb-2">{property.title}</h3>
                        <p className="text-gray-600 text-sm mb-2 flex items-center">
                          <span className="mr-1 text-gray-400">
                            <FaMapMarkerAlt />
                          </span>
                          {property.location}
                        </p>
                        <p className="text-blue-600 font-bold text-lg mb-4">
                          PKR {property.amount.toLocaleString()}/month
                        </p>
                        <button
                          onClick={() => handleUnrentProperty(property.id)}
                          className="w-full px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200 text-sm font-medium"
                        >
                          Unrent Property
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Favorite Properties Section */}
        <div className="mb-8">
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
            <div className="p-6 border-b border-gray-200/50">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <span className="mr-3 text-red-600">
                  <FaHeart />
                </span>
                Favorite Properties
              </h2>
            </div>
            <div className="p-6">
              {favoriteProperties.length === 0 ? (
                <div className="text-center py-12">
                  <span className="mx-auto h-12 w-12 text-gray-400 mb-4">
                    <FaHeart />
                  </span>
                  <p className="text-gray-500 text-lg">No favorite properties yet</p>
                  <Link
                    href="/tenant/properties"
                    className="mt-4 inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    <span className="mr-2">
                      <FaSearch />
                    </span>
                    Browse Properties
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {favoriteProperties.map((property) => (
                    <div key={property.id} className="bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-white/30">
                      {property.images.length > 0 && (
                        <ImageCarousel 
                          images={property.images} 
                          title={property.title}
                          height="h-48"
                          className="rounded-t-2xl"
                        />
                      )}
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 mb-2">{property.title}</h3>
                        <p className="text-gray-600 text-sm mb-2 flex items-center">
                          <span className="mr-1 text-gray-400">
                            <FaMapMarkerAlt />
                          </span>
                          {property.location}
                        </p>
                        <p className="text-blue-600 font-bold text-lg mb-4">
                          PKR {property.amount.toLocaleString()}/month
                        </p>
                        <button
                          onClick={() => handleUnfavoriteProperty(property.id)}
                          className="w-full px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200 text-sm font-medium"
                        >
                          Remove from Favorites
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/tenant/properties"
              className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-white/30 group"
            >
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4 group-hover:bg-blue-200 transition-colors duration-300">
                <span className="w-6 h-6 text-blue-600">
                  <FaSearch />
                </span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Browse Properties</h3>
              <p className="text-gray-600 text-sm">Find your perfect home or commercial space</p>
            </Link>

            <Link
              href="/messages"
              className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-white/30 group"
            >
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mb-4 group-hover:bg-green-200 transition-colors duration-300">
                <span className="w-6 h-6 text-green-600">
                  <FaEnvelope />
                </span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Messages</h3>
              <p className="text-gray-600 text-sm">Contact property owners and manage inquiries</p>
            </Link>

            <Link
              href="/tenant/payment"
              className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-white/30 group"
            >
              <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mb-4 group-hover:bg-purple-200 transition-colors duration-300">
                <span className="w-6 h-6 text-purple-600">
                  <FaDollarSign />
                </span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Payments</h3>
              <p className="text-gray-600 text-sm">Manage rent payments and history</p>
            </Link>

            <Link
              href="/tenant/settings"
              className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-white/30 group"
            >
              <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-lg mb-4 group-hover:bg-orange-200 transition-colors duration-300">
                <span className="w-6 h-6 text-orange-600">
                  <FaCog />
                </span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Settings</h3>
              <p className="text-gray-600 text-sm">Manage your account settings</p>
            </Link>
          </div>
        </div>
      </div>

      {/* Unrent Confirmation Modal */}
      {showUnrentConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-6 max-w-md w-full mx-4 shadow-2xl border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Confirm Unrent</h3>
              <button
                onClick={() => {
                  setShowUnrentConfirm(false);
                  setPropertyToUnrent(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <span className="w-5 h-5">
                  <FaTimes />
                </span>
              </button>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to unrent this property? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => {
                  setShowUnrentConfirm(false);
                  setPropertyToUnrent(null);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors duration-200 rounded-lg hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={confirmUnrent}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium shadow-lg hover:shadow-xl"
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