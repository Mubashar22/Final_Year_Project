'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { FaHome, FaArrowLeft, FaBed, FaBath, FaRulerCombined, FaMapMarkerAlt, FaRupeeSign, FaUser, FaEnvelope, FaCalendarAlt, FaCheckCircle } from 'react-icons/fa';
import ImageCarousel from '@/app/components/ImageCarousel';

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

export default function PropertyDetails({ params }: any) {
  const router = useRouter();
  const { status } = useSession();
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading property details...</p>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-xl border border-white/20 p-12 max-w-md mx-auto">
            <span style={{ fontSize: '3.75rem', color: '#9ca3af', display: 'block', margin: '0 auto 1rem auto' }}><FaHome size={96} /></span>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Property Not Found</h3>
            <p className="text-red-600 mb-6">{error || 'Property not found'}</p>
            <button
              onClick={() => router.back()}
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-6 rounded-2xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl"
            >
              Go Back
            </button>
          </div>
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
                <button 
                  onClick={() => router.back()}
                  className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors duration-300 bg-white/50 backdrop-blur-sm rounded-full px-4 py-2 hover:bg-white/70"
                >
                  <span style={{ fontSize: '0.875rem', display: 'inline-flex', alignItems: 'center' }}><FaArrowLeft size={14} /></span>
                  <span className="text-sm font-medium">Back</span>
                </button>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <span style={{ color: 'white', fontSize: '1.25rem', display: 'inline-flex', alignItems: 'center' }}><FaHome size={20} /></span>
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      Property Details
                    </h1>
                    <p className="text-gray-600 text-sm">Complete property information</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Property Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Property Info */}
            <div className="lg:col-span-2 space-y-8">
              {/* Property Images */}
              <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-xl border border-white/20 overflow-hidden">
                <div className="relative">
                  <ImageCarousel 
                    images={property.images || []}
                    title={property.title}
                    height="h-96"
                  />
                  <div className={`absolute top-4 left-4 px-4 py-2 rounded-full text-sm font-semibold backdrop-blur-sm ${
                    property.isAvailable 
                      ? 'bg-green-500/90 text-white' 
                      : 'bg-red-500/90 text-white'
                  }`}>
                    {property.isAvailable ? 'Available' : 'Not Available'}
                  </div>
                </div>
              </div>

              {/* Property Details */}
              <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-xl border border-white/20 p-8">
                <div className="mb-6">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">{property.title}</h2>
                  <div className="flex items-center text-gray-600 mb-4">
                    <span style={{ color: '#3b82f6', fontSize: '1rem', marginRight: '0.5rem', display: 'inline-flex', alignItems: 'center' }}><FaMapMarkerAlt size={16} /></span>
                    <span className="text-lg">{property.location}</span>
                  </div>
                  <div className="flex items-center">
                    <span style={{ color: '#16a34a', fontSize: '2rem', marginRight: '0.5rem', display: 'inline-flex', alignItems: 'center' }}><FaRupeeSign size={32} /></span>
                    <span className="text-4xl font-bold text-gray-900">
                      {property.amount.toLocaleString()}
                    </span>
                    <span className="text-gray-500 text-lg ml-2">/month</span>
                  </div>
                </div>

                {/* Property Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl text-center">
                    <span style={{ color: '#2563eb', fontSize: '2rem', display: 'block', margin: '0 auto 0.5rem auto' }}><FaBed size={32} /></span>
                    <p className="text-sm text-gray-600 mb-1">Bedrooms</p>
                    <p className="text-2xl font-bold text-gray-900">{property.bedrooms || 2}</p>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl text-center">
                    <span style={{ color: '#16a34a', fontSize: '2rem', display: 'block', margin: '0 auto 0.5rem auto' }}><FaBath size={32} /></span>
                    <p className="text-sm text-gray-600 mb-1">Bathrooms</p>
                    <p className="text-2xl font-bold text-gray-900">{property.bathrooms || 1}</p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl text-center">
                    <span style={{ color: '#7c3aed', fontSize: '2rem', display: 'block', margin: '0 auto 0.5rem auto' }}><FaRulerCombined size={32} /></span>
                    <p className="text-sm text-gray-600 mb-1">Area</p>
                    <p className="text-2xl font-bold text-gray-900">{property.area}</p>
                    <p className="text-xs text-gray-500">sq ft</p>
                  </div>
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-2xl text-center">
                    <span style={{ color: '#ea580c', fontSize: '2rem', display: 'block', margin: '0 auto 0.5rem auto' }}><FaHome size={32} /></span>
                    <p className="text-sm text-gray-600 mb-1">Type</p>
                    <p className="text-lg font-bold text-gray-900">{property.type}</p>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Description</h3>
                  <p className="text-gray-600 text-lg leading-relaxed">{property.description}</p>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Owner Information */}
              <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-xl border border-white/20 p-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <span style={{ color: '#2563eb', fontSize: '1rem', marginRight: '0.75rem', display: 'inline-flex', alignItems: 'center' }}><FaUser size={16} /></span>
                  Owner Information
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                      <span style={{ color: 'white', fontSize: '1rem', display: 'inline-flex', alignItems: 'center' }}><FaUser size={16} /></span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{property.owner?.name || 'Property Owner'}</p>
                      <p className="text-gray-600 text-sm">Property Owner</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 bg-blue-50/50 rounded-2xl p-3">
                    <span style={{ color: '#2563eb', fontSize: '1rem', display: 'inline-flex', alignItems: 'center' }}><FaEnvelope size={16} /></span>
                    <span className="text-gray-700">{property.owner?.email || 'Contact via platform'}</span>
                  </div>
                </div>
              </div>

              {/* Rent Action */}
              <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-xl border border-white/20 p-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Ready to Rent?</h3>
                
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-700 font-medium">Monthly Rent:</span>
                      <span className="text-2xl font-bold text-green-600">
                        PKR {property.amount.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {property.isAvailable ? (
                    <button
                      onClick={() => setShowRentModal(true)}
                      className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-4 px-6 rounded-2xl font-bold text-lg hover:from-green-700 hover:to-blue-700 transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                    >
                      <span style={{ fontSize: '1.25rem', display: 'inline-flex', alignItems: 'center' }}><FaCheckCircle size={20} /></span>
                      <span>Rent Now</span>
                    </button>
                  ) : (
                    <div className="w-full bg-gray-300 text-gray-600 py-4 px-6 rounded-2xl font-bold text-lg text-center">
                      Not Available
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Rent Modal */}
        {showRentModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20 p-8 max-w-md w-full transform animate-in zoom-in-95 duration-300">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <FaCalendarAlt color="white" size="2rem" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Rent Property
                </h3>
                <p className="text-gray-600 text-sm">
                  Select your preferred start date for <span className="font-semibold text-blue-600">{property.title}</span>
                </p>
              </div>
              
              <div className="mb-6">
                <label htmlFor="startDate" className="block text-sm font-semibold text-gray-700 mb-3">
                  Start Date
                </label>
                <input
                  type="date"
                  id="startDate"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm transition-all duration-300"
                  required
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowRentModal(false);
                    setStartDate('');
                  }}
                  className="flex-1 px-6 py-3 text-gray-700 bg-gray-100 rounded-2xl font-semibold hover:bg-gray-200 transition-all duration-300"
                  disabled={renting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleRentProperty}
                  disabled={renting}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-2xl font-semibold hover:from-green-700 hover:to-blue-700 transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {renting ? 'Processing...' : 'Confirm Rent'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}