'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Image from 'next/image';

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
}

interface FormData {
  title: string;
  description: string;
  type: string;
  area: string;
  amount: string;
  location: string;
}

export default function OwnerPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    type: 'HOUSE',
    area: '',
    amount: '',
    location: '',
  });
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editProperty, setEditProperty] = useState<Property | null>(null);
  const [existingImages, setExistingImages] = useState<{ id: string; url: string }[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/owner/login');
    } else if (status === 'authenticated' && session?.user?.role !== 'OWNER') {
      router.push('/'); // Redirect non-owners to home page
    } else if (status === 'authenticated') {
      fetchProperties();
    }
  }, [status, session, router]);

  const fetchProperties = async () => {
    try {
      const response = await fetch('/api/owner/properties');
      const data = await response.json();
      setProperties(data);
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      
      // Validate file types
      const invalidFiles = files.filter(file => 
        !['image/jpeg', 'image/png', 'image/webp'].includes(file.type)
      );
      
      if (invalidFiles.length > 0) {
        setError('Only JPEG, PNG, and WebP images are allowed');
        e.target.value = ''; // Clear the input
        return;
      }

      // Validate file sizes (5MB max)
      const oversizedFiles = files.filter(file => file.size > 5 * 1024 * 1024);
      if (oversizedFiles.length > 0) {
        setError('Each image must be less than 5MB');
        e.target.value = ''; // Clear the input
        return;
      }

      // Validate total number of images
      const totalImages = (editProperty ? existingImages.length : 0) + files.length;
      if (totalImages > 5) {
        setError('Maximum 5 images allowed per property');
        e.target.value = ''; // Clear the input
        return;
      }

      setSelectedImages(files);
      setError(''); // Clear any previous errors
    }
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError('Title is required');
      return false;
    }
    if (!formData.description.trim()) {
      setError('Description is required');
      return false;
    }
    if (!formData.area || parseFloat(formData.area) <= 0) {
      setError('Please enter a valid area');
      return false;
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError('Please enter a valid amount');
      return false;
    }
    if (!formData.location.trim()) {
      setError('Location is required');
      return false;
    }
    if (!editProperty && selectedImages.length === 0) {
      setError('Please select at least one image');
      return false;
    }
    return true;
  };

  const handleEditClick = (property: Property) => {
    setEditProperty(property);
    setExistingImages(property.images);
    setFormData({
      title: property.title,
      description: property.description,
      type: property.type,
      area: property.area.toString(),
      amount: property.amount.toString(),
      location: property.location,
    });
    setShowAddForm(true);
  };

  const handleImageDelete = async (imageId: string) => {
    try {
      const response = await fetch(`/api/owner/properties/images/${imageId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete image');
      }
      setExistingImages(existingImages.filter(img => img.id !== imageId));
    } catch (error) {
      console.error('Error deleting image:', error);
      setError('Failed to delete image. Please try again.');
    }
  };

  const handleDelete = async (propertyId: string) => {
    if (!window.confirm('Are you sure you want to delete this property?')) return;
    try {
      const response = await fetch(`/api/owner/properties/${propertyId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete property');
      }
      fetchProperties();
    } catch (error) {
      console.error('Error deleting property:', error);
      setError('Failed to delete property. Please try again.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) {
      return;
    }

    setUploading(true);

    try {
      let property;
      if (editProperty) {
        // Update property
        const response = await fetch(`/api/owner/properties/${editProperty.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to update property');
        }
        property = await response.json();

        // Upload new images if any
        if (selectedImages.length > 0) {
          for (const image of selectedImages) {
            const formData = new FormData();
            formData.append('file', image);
            formData.append('propertyId', property.id);

            const uploadResponse = await fetch('/api/upload', {
              method: 'POST',
              body: formData,
            });

            if (!uploadResponse.ok) {
              const errorData = await uploadResponse.json();
              throw new Error(errorData.error || 'Failed to upload image');
            }
          }
        }
      } else {
        // Create property
        const response = await fetch('/api/owner/properties', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to create property');
        }
        
        property = await response.json();

        // Upload images for new property
        if (selectedImages.length > 0) {
          const uploadErrors: string[] = [];
          
          for (const image of selectedImages) {
            try {
              const formData = new FormData();
              formData.append('file', image);
              formData.append('propertyId', property.id);

              const uploadResponse = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
              });

              if (!uploadResponse.ok) {
                const errorData = await uploadResponse.json();
                uploadErrors.push(errorData.error || 'Failed to upload image');
              }
            } catch (uploadError) {
              uploadErrors.push('Failed to upload image');
            }
          }

          if (uploadErrors.length > 0) {
            setError(`Property was created but some images failed to upload: ${uploadErrors.join(', ')}`);
          }
        }
      }

      // Reset form and refresh properties
      setFormData({
        title: '',
        description: '',
        type: 'HOUSE',
        area: '',
        amount: '',
        location: '',
      });
      setSelectedImages([]);
      setExistingImages([]);
      setEditProperty(null);
      setSuccess(editProperty ? 'Property updated successfully!' : 'Property added successfully!');
      await fetchProperties(); // Wait for properties to refresh
      setShowAddForm(false);
    } catch (error) {
      console.error('Error creating/updating property:', error);
      setError(error instanceof Error ? error.message : 'Failed to create/update property. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleStatusChange = async (propertyId: string, isAvailable: boolean) => {
    try {
      const response = await fetch(`/api/owner/properties/${propertyId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isAvailable }),
      });

      if (!response.ok) {
        throw new Error('Failed to update property status');
      }

      fetchProperties();
    } catch (error) {
      console.error('Error updating property status:', error);
    }
  };

  const handleImageClick = (propertyId: string, index: number) => {
    setSelectedImageIndex(prev => ({
      ...prev,
      [propertyId]: index
    }));
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session || session.user.role !== 'OWNER') {
    return null; // This will be handled by the useEffect redirect
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-800">
              My Properties
            </h1>
            <p className="mt-2 text-gray-600">Manage your property listings</p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-semibold rounded-lg text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer shadow-md"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Add New Property
          </button>
        </div>

        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">{editProperty ? 'Edit Property' : 'Add New Property'}</h2>
              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                  {error}
                </div>
              )}
              {success && (
                <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
                  {success}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                    placeholder="Enter property title"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                    rows={3}
                    placeholder="Describe your property"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                  >
                    <option value="HOUSE">House</option>
                    <option value="APARTMENT">Apartment</option>
                    <option value="FLAT">Flat</option>
                    <option value="PLOT">Plot</option>
                    <option value="COMMERCIAL">Commercial</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Area (sq ft)</label>
                  <input
                    type="number"
                    name="area"
                    value={formData.area}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                    placeholder="Enter area in square feet"
                    min="1"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Rent (Rs)</label>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                    placeholder="Enter monthly rent"
                    min="1"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                    placeholder="Enter property location"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Images</label>
                  {editProperty && existingImages.length > 0 && (
                    <div className="mt-2 grid grid-cols-3 gap-2">
                      {existingImages.map((image) => (
                        <div key={image.id} className="relative group aspect-square">
                          <Image
                            src={image.url}
                            alt="Property"
                            fill
                            className="object-cover rounded-lg transition duration-300 group-hover:opacity-75"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          />
                          <button
                            type="button"
                            onClick={() => handleImageDelete(image.id)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors duration-200 cursor-pointer opacity-0 group-hover:opacity-100"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                    required={!editProperty}
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Select multiple images of your property (max 5 images)
                  </p>
                </div>
                <div className="flex justify-end space-x-4 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      setError('');
                      setSuccess('');
                      setEditProperty(null);
                      setExistingImages([]);
                    }}
                    className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploading}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer shadow-md"
                  >
                    {uploading ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {editProperty ? 'Updating...' : 'Adding Property...'}
                      </span>
                    ) : (
                      editProperty ? 'Update Property' : 'Add Property'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading properties...</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <div key={property.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
                <div className="relative">
                  {property.images.length > 0 ? (
                    <>
                      <div className="relative h-48">
                        <Image
                          src={property.images[selectedImageIndex[property.id] || 0].url}
                          alt={property.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                        {property.images.length > 1 && (
                          <>
                            <button
                              onClick={() => handleImageClick(property.id, (selectedImageIndex[property.id] || 0) - 1)}
                              disabled={(selectedImageIndex[property.id] || 0) === 0}
                              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-opacity duration-200 disabled:opacity-30 cursor-pointer"
                            >
                              ←
                            </button>
                            <button
                              onClick={() => handleImageClick(property.id, (selectedImageIndex[property.id] || 0) + 1)}
                              disabled={(selectedImageIndex[property.id] || 0) === property.images.length - 1}
                              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-opacity duration-200 disabled:opacity-30 cursor-pointer"
                            >
                              →
                            </button>
                          </>
                        )}
                      </div>
                      {property.images.length > 1 && (
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-1">
                          {property.images.map((_, index) => (
                            <button
                              key={index}
                              onClick={() => handleImageClick(property.id, index)}
                              className={`w-2 h-2 rounded-full transition-all duration-200 cursor-pointer ${
                                (selectedImageIndex[property.id] || 0) === index
                                  ? 'bg-white scale-125'
                                  : 'bg-white bg-opacity-50 hover:bg-opacity-75'
                              }`}
                            />
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="h-48 bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400">No images available</span>
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <button
                      onClick={() => handleStatusChange(property.id, !property.isAvailable)}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors duration-200 cursor-pointer ${
                        property.isAvailable
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-red-100 text-red-800 hover:bg-red-200'
                      }`}
                    >
                      {property.isAvailable ? 'Available' : 'Rented'}
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{property.title}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">{property.description}</p>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-500">Type</p>
                      <p className="font-medium text-gray-900">{property.type}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Area</p>
                      <p className="font-medium text-gray-900">{property.area} sq ft</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Location</p>
                      <p className="font-medium text-gray-900">{property.location}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Monthly Rent</p>
                      <p className="font-medium text-gray-900">Rs. {property.amount.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => handleEditClick(property)}
                      className="px-4 py-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors duration-200 cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(property.id)}
                      className="px-4 py-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors duration-200 cursor-pointer"
                    >
                      Delete
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