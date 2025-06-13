'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

interface PropertyStats {
  totalProperties: number;
  availableProperties: number;
  rentedProperties: number;
  totalRevenue: number;
}

export default function OwnerDashboard() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [stats, setStats] = useState<PropertyStats>({
    totalProperties: 0,
    availableProperties: 0,
    rentedProperties: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/owner-login');
    } else if (status === 'authenticated') {
      fetchPropertyStats();
    }
  }, [status, router]);

  const fetchPropertyStats = async () => {
    try {
      const response = await fetch('/api/owner/properties');
      const properties = await response.json();
      
      const stats = {
        totalProperties: properties.length,
        availableProperties: properties.filter((p: any) => p.isAvailable).length,
        rentedProperties: properties.filter((p: any) => !p.isAvailable).length,
        totalRevenue: properties.reduce((sum: number, p: any) => sum + (p.isAvailable ? 0 : p.amount), 0),
      };
      
      setStats(stats);
    } catch (error) {
      console.error('Error fetching property stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded-lg w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-xl shadow-md">
                  <div className="h-4 bg-gray-200 rounded-lg w-1/2 mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded-lg w-3/4"></div>
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
              Owner Dashboard
            </h1>
            <p className="mt-2 text-gray-600">Welcome back! Here's an overview of your properties.</p>
          </div>
          <Link
            href="/owner"
            className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-semibold rounded-lg text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer shadow-md"
          >
            Manage Properties
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Properties Card */}
          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            <h3 className="text-sm font-medium text-gray-500">Total Properties</h3>
            <p className="mt-2 text-3xl font-bold text-gray-900">{stats.totalProperties}</p>
            <div className="mt-4 flex items-center text-sm text-gray-500">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              All properties
            </div>
          </div>

          {/* Available Properties Card */}
          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            <h3 className="text-sm font-medium text-gray-500">Available Properties</h3>
            <p className="mt-2 text-3xl font-bold text-green-600">{stats.availableProperties}</p>
            <div className="mt-4 flex items-center text-sm text-gray-500">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              Ready to rent
            </div>
          </div>

          {/* Rented Properties Card */}
          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            <h3 className="text-sm font-medium text-gray-500">Rented Properties</h3>
            <p className="mt-2 text-3xl font-bold text-blue-600">{stats.rentedProperties}</p>
            <div className="mt-4 flex items-center text-sm text-gray-500">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Currently rented
            </div>
          </div>

          {/* Total Revenue Card */}
          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            <h3 className="text-sm font-medium text-gray-500">Total Revenue</h3>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              Rs. {stats.totalRevenue.toLocaleString()}
            </p>
            <div className="mt-4 flex items-center text-sm text-gray-500">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Total earnings
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link
              href="/owner"
              className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-200">Manage Properties</h3>
                <svg className="w-6 h-6 text-gray-400 group-hover:text-blue-600 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Add, edit, or remove your properties
              </p>
            </Link>

            <Link
              href="/messages"
              className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-200">Messages</h3>
                <svg className="w-6 h-6 text-gray-400 group-hover:text-blue-600 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                View and respond to tenant inquiries
              </p>
            </Link>

            <Link
              href="/owner/settings"
              className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-200">Settings</h3>
                <svg className="w-6 h-6 text-gray-400 group-hover:text-blue-600 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Manage your account settings
              </p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 