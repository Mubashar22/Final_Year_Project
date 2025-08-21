'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { FaBuilding, FaHome, FaUsers, FaDollarSign, FaPlus, FaEnvelope, FaCog, FaSignOutAlt, FaChartLine, FaKey } from 'react-icons/fa';

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
      
      type Property = { isAvailable: boolean; amount: number };
      const stats = {
        totalProperties: properties.length,
        availableProperties: (properties as Property[]).filter((p) => p.isAvailable).length,
        rentedProperties: (properties as Property[]).filter((p) => !p.isAvailable).length,
        totalRevenue: (properties as Property[]).reduce((sum, p) => sum + (p.isAvailable ? 0 : p.amount), 0),
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
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')`
        }}
      />
      
      {/* Floating Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-20 h-20 bg-purple-400/10 rounded-full opacity-40 animate-pulse" />
        <div className="absolute bottom-20 right-10 w-24 h-24 bg-blue-400/10 rounded-full opacity-40 animate-pulse delay-1000" />
        <div className="absolute top-1/3 right-20 w-16 h-16 bg-indigo-400/10 rounded-full opacity-40 animate-pulse delay-500" />
      </div>

      {/* Header */}
      <div className="relative z-10 bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white text-xl"><FaBuilding size={24} /></span>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Owner Dashboard
                </h1>
                <p className="text-gray-600 text-sm">Welcome back, {session?.user?.name}!</p>
              </div>
            </div>
            <button
              onClick={() => signOut()}
              className="flex items-center space-x-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors duration-200 shadow-lg hover:shadow-xl"
            >
              <span className="text-sm"><FaSignOutAlt size={16} /></span>
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Properties Card */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <span className="text-blue-600 text-xl"><FaBuilding size={24} /></span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Properties</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalProperties}</p>
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-gray-500">
              <span className="w-4 h-4 mr-2 inline-block align-middle"><FaChartLine size={16} /></span>
              All properties
            </div>
          </div>

          {/* Available Properties Card */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <span className="text-green-600 text-xl"><FaHome size={24} /></span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Available Properties</p>
                <p className="text-2xl font-bold text-gray-900">{stats.availableProperties}</p>
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-gray-500">
              <span className="w-4 h-4 mr-2 inline-block align-middle"><FaKey size={16} /></span>
              Ready to rent
            </div>
          </div>

          {/* Rented Properties Card */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <span className="text-orange-600 text-xl"><FaUsers size={24} /></span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Rented Properties</p>
                <p className="text-2xl font-bold text-gray-900">{stats.rentedProperties}</p>
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-gray-500">
              <span className="w-4 h-4 mr-2 inline-block align-middle"><FaUsers size={16} /></span>
              Currently rented
            </div>
          </div>

          {/* Total Revenue Card */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <span className="text-purple-600 text-xl"><FaDollarSign size={24} /></span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  Rs. {stats.totalRevenue.toLocaleString()}
                </p>
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-gray-500">
              <span className="w-4 h-4 mr-2 inline-block align-middle"><FaDollarSign size={16} /></span>
              Total earnings
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Quick Actions</h2>
            <Link
              href="/owner"
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl text-sm font-medium"
            >
              <span className="mr-2 inline-block align-middle"><FaPlus size={16} /></span>
              Add Property
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link
              href="/owner"
              className="bg-white/60 backdrop-blur-sm p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-white/30 group"
            >
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4 group-hover:bg-blue-200 transition-colors duration-300">
                <span className="w-6 h-6 text-blue-600 inline-block align-middle"><FaBuilding size={24} /></span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Manage Properties</h3>
              <p className="text-gray-600 text-sm">Add, edit, or remove your properties</p>
            </Link>

            <Link
              href="/messages"
              className="bg-white/60 backdrop-blur-sm p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-white/30 group"
            >
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mb-4 group-hover:bg-green-200 transition-colors duration-300">
                <span className="w-6 h-6 text-green-600 inline-block align-middle"><FaEnvelope size={24} /></span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Messages</h3>
              <p className="text-gray-600 text-sm">View and respond to tenant inquiries</p>
            </Link>

            <Link
              href="/owner/settings"
              className="bg-white/60 backdrop-blur-sm p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-white/30 group"
            >
              <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mb-4 group-hover:bg-purple-200 transition-colors duration-300">
                <span className="w-6 h-6 text-purple-600 inline-block align-middle"><FaCog size={24} /></span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Settings</h3>
              <p className="text-gray-600 text-sm">Manage your account settings</p>
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8 bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Activity</h2>
          <div className="space-y-4">
            <div className="flex items-center p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-white/30">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="w-5 h-5 text-blue-600 inline-block align-middle"><FaBuilding size={20} /></span>
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-900">Property management system updated</p>
                <p className="text-xs text-gray-500">2 hours ago</p>
              </div>
            </div>
            
            <div className="flex items-center p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-white/30">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <span className="w-5 h-5 text-green-600 inline-block align-middle"><FaEnvelope size={20} /></span>
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-900">New tenant inquiry received</p>
                <p className="text-xs text-gray-500">1 day ago</p>
              </div>
            </div>
            
            <div className="flex items-center p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-white/30">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="w-5 h-5 text-purple-600 inline-block align-middle"><FaDollarSign size={20} /></span>
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-900">Monthly rent payment received</p>
                <p className="text-xs text-gray-500">3 days ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}