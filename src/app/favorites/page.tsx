'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface Property {
  id: string;
  title: string;
  description: string;
  type: string;
  area: number;
  amount: number;
  location: string;
  isAvailable: boolean;
  owner: {
    name: string;
    phoneNumber: string;
  };
  images: { id: string; url: string }[];
}

interface Favorite {
  id: string;
  property: Property;
  createdAt: string;
}

export default function FavoritesPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session) {
      fetchFavorites();
    }
  }, [session]);

  const fetchFavorites = async () => {
    try {
      const response = await fetch('/api/favorites');
      const data = await response.json();
      setFavorites(data);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (favoriteId: string) => {
    try {
      const response = await fetch(`/api/favorites/${favoriteId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to remove favorite');
      }

      setFavorites(favorites.filter(fav => fav.id !== favoriteId));
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Please sign in to view your favorites</h1>
          <button
            onClick={() => router.push('/auth/signin')}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">My Favorite Properties</h1>

        {loading ? (
          <div className="text-center">Loading favorites...</div>
        ) : favorites.length === 0 ? (
          <div className="text-center text-gray-600">
            <p className="mb-4">You haven't added any properties to your favorites yet.</p>
            <button
              onClick={() => router.push('/tenant')}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
            >
              Browse Properties
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((favorite) => (
              <div key={favorite.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                {favorite.property.images.length > 0 && (
                  <img
                    src={favorite.property.images[0].url}
                    alt={favorite.property.title}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">{favorite.property.title}</h2>
                  <p className="text-gray-600 mb-4">{favorite.property.description}</p>
                  
                  <div className="space-y-2 mb-4">
                    <p className="text-sm text-gray-500">
                      <span className="font-medium">Type:</span> {favorite.property.type}
                    </p>
                    <p className="text-sm text-gray-500">
                      <span className="font-medium">Area:</span> {favorite.property.area} sq ft
                    </p>
                    <p className="text-sm text-gray-500">
                      <span className="font-medium">Location:</span> {favorite.property.location}
                    </p>
                    <p className="text-lg font-semibold text-blue-600">
                      Rs. {favorite.property.amount.toLocaleString()}/month
                    </p>
                  </div>

                  <div className="border-t pt-4">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Owner:</span> {favorite.property.owner.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Contact:</span> {favorite.property.owner.phoneNumber}
                    </p>
                  </div>

                  <div className="mt-4 flex justify-between items-center">
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      favorite.property.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {favorite.property.isAvailable ? 'Available' : 'Rented'}
                    </span>
                    <button
                      onClick={() => handleRemoveFavorite(favorite.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Remove from Favorites
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 