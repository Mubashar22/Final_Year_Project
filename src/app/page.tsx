'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function Home() {
  const router = useRouter();

  const handleRoleSelect = (role: 'owner' | 'tenant') => {
    if (role === 'owner') {
      router.push('/auth/owner-login');
    } else {
      router.push('/auth/signin');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-10">
        <div className="text-center space-y-4">
          <h1 className="text-4xl py-[10px] font-extrabold sm:text-5xl sm:tracking-tight lg:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-green-600">
            Rental Management <br /> System
          </h1>
          <p className="mt-5 max-w-xl mx-auto text-xl text-gray-600 font-medium">
            Welcome to Faisalabad's Premier Rental Management Platform
          </p>
        </div>

        <div className="mt-20">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 max-w-4xl mx-auto">
            {/* Owner Card */}
            <div className="bg-white overflow-hidden shadow-lg rounded-xl transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
              <div className="px-6 py-8 sm:p-8">
                <div className="text-center">
                  <div className="mt-3 text-center sm:mt-5">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">
                      Property Owner
                    </h3>
                    <div className="mt-2">
                      <p className="text-base text-gray-600 leading-relaxed">
                        Manage your properties, handle tenants, and track rental payments
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-8">
                  <button
                    onClick={() => handleRoleSelect('owner')}
                    className="inline-flex justify-center w-full rounded-lg border border-transparent shadow-sm px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-base font-semibold text-white hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
                  >
                    Continue as Owner
                  </button>
                </div>
              </div>
            </div>

            {/* Tenant Card */}
            <div className="bg-white overflow-hidden shadow-lg rounded-xl transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
              <div className="px-6 py-8 sm:p-8">
                <div className="text-center">
                  <div className="mt-3 text-center sm:mt-5">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">
                      Tenant
                    </h3>
                    <div className="mt-2">
                      <p className="text-base text-gray-600 leading-relaxed">
                        Find your perfect home, manage your rental, and communicate with property owners
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-8">
                  <button
                    onClick={() => handleRoleSelect('tenant')}
                    className="inline-flex justify-center w-full rounded-lg border border-transparent shadow-sm px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-base font-semibold text-white hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
                  >
                    Continue as Tenant
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
