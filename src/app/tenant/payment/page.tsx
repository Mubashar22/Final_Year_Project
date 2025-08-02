'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Image from 'next/image';

interface Property {
  id: string;
  title: string;
  location: string;
  amount: number;
  images: { id: string; url: string }[];
}

export default function PaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: status } = useSession();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [selectedCardType, setSelectedCardType] = useState<'visa' | 'mastercard' | ''>('');
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    accountNumber: '',
    phoneNumber: '',
  });
  const [phoneError, setPhoneError] = useState<string>('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated') {
      const propertyId = searchParams.get('propertyId');
      if (propertyId) {
        fetchPropertyDetails(propertyId);
      } else {
        router.push('/tenant/properties');
      }
    }
  }, [status, router, searchParams]);

  const fetchPropertyDetails = async (propertyId: string) => {
    try {
      const response = await fetch(`/api/properties/${propertyId}`);
      if (!response.ok) throw new Error('Failed to fetch property details');
      const data = await response.json();
      setProperty(data);
    } catch (error) {
      console.error('Error fetching property:', error);
      alert('Failed to fetch property details');
      router.push('/tenant/properties');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentMethodSelect = (method: string) => {
    setSelectedMethod(method);
    setSelectedCardType(''); // Reset card type when changing method
    setPaymentDetails({
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      accountNumber: '',
      phoneNumber: '',
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPaymentDetails(prev => ({
      ...prev,
      [name]: value
    }));
    if (name === 'phoneNumber') {
      if (value.trim() === '') {
        setPhoneError('');
      } else if (!/^03\d{9}$/.test(value.trim())) {
        setPhoneError('Please enter a valid 11-digit phone number starting with 03.');
      } else {
        setPhoneError('');
      }
    }
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!property) return;
    if (selectedMethod === 'card' && selectedCardType === '') {
      alert('Please select Visa or Mastercard.');
      return;
    }

    try {
      // First, create the rental record
      const rentalResponse = await fetch('/api/tenant/rented-properties', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ propertyId: property.id }),
      });

      if (!rentalResponse.ok) {
        throw new Error('Failed to create rental');
      }

      // Then, process the payment
      const paymentResponse = await fetch('/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          propertyId: property.id,
          amount: property.amount,
          paymentMethod: selectedMethod,
          paymentDetails,
          cardType: selectedMethod === 'card' ? selectedCardType : undefined,
        }),
      });

      if (!paymentResponse.ok) {
        throw new Error('Failed to process payment');
      }

      alert('Payment successful! Property has been rented.');
      router.push('/tenant/dashboard');
    } catch (error) {
      console.error('Error processing payment:', error);
      alert('Failed to process payment. Please try again.');
    }
  };

  const isFormValid = () => {
    if (selectedMethod === 'card') {
      return selectedCardType !== '' && paymentDetails.cardNumber.trim() !== '' && paymentDetails.expiryDate.trim() !== '' && paymentDetails.cvv.trim() !== '';
    } else if (selectedMethod === 'jazzcash' || selectedMethod === 'easypaisa') {
      return paymentDetails.phoneNumber.trim() !== '' && phoneError === '';
    }
    return false;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-3xl mx-auto">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="space-y-4">
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-900">Property not found</h1>
          <button
            onClick={() => router.push('/tenant/properties')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Back to Properties
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-extrabold text-blue-800 mb-10 text-center drop-shadow-sm tracking-tight">Payment Details</h1>

        {/* Property Summary */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-10 border border-blue-100">
          <h2 className="text-2xl font-semibold text-blue-700 mb-6">Property Summary</h2>
          <div className="flex items-start space-x-6">
            {property.images[0] && (
              <div className="relative w-36 h-28 rounded-xl overflow-hidden shadow-md border border-gray-200">
                <Image
                  src={property.images[0].url}
                  alt={property.title}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div>
              <h3 className="font-bold text-lg text-gray-900 mb-1">{property.title}</h3>
              <p className="text-gray-500 mb-2">{property.location}</p>
              <p className="text-2xl font-bold text-blue-600 mt-2">
                Rs. {property.amount.toLocaleString()}/month
              </p>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-blue-100 mb-10">
          <h2 className="text-2xl font-semibold text-blue-700 mb-8">Select Payment Method</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* JazzCash */}
            <div
              onClick={() => handlePaymentMethodSelect('jazzcash')}
              className={`relative cursor-pointer transition-all duration-200 border-2 ${
                selectedMethod === 'jazzcash' 
                  ? 'border-blue-600 ring-2 ring-blue-200 scale-105' 
                  : 'border-gray-200 hover:scale-105 hover:shadow-lg'
              } rounded-xl bg-gradient-to-br from-yellow-50 to-white p-4 flex items-center justify-center shadow-sm group`}
            >
              <Image
                src="/images/payment/JazzCash.png"
                alt="JazzCash"
                width={180}
                height={80}
                className="object-contain group-hover:scale-105 transition-transform duration-200"
              />
            </div>

            {/* EasyPaisa */}
            <div
              onClick={() => handlePaymentMethodSelect('easypaisa')}
              className={`relative cursor-pointer transition-all duration-200 border-2 ${
                selectedMethod === 'easypaisa' 
                  ? 'border-blue-600 ring-2 ring-blue-200 scale-105' 
                  : 'border-gray-200 hover:scale-105 hover:shadow-lg'
              } rounded-xl bg-gradient-to-br from-green-50 to-white p-4 flex items-center justify-center shadow-sm group`}
            >
              <Image
                src="/images/payment/easypesa.jpg"
                alt="EasyPaisa"
                width={180}
                height={80}
                className="object-contain group-hover:scale-105 transition-transform duration-200"
              />
            </div>

            {/* Credit/Debit Card */}
            <div
              onClick={() => handlePaymentMethodSelect('card')}
              className={`relative cursor-pointer transition-all duration-200 border-2 ${
                selectedMethod === 'card' 
                  ? 'border-blue-600 ring-2 ring-blue-200 scale-105' 
                  : 'border-gray-200 hover:scale-105 hover:shadow-lg'
              } rounded-xl bg-gradient-to-br from-gray-50 to-white p-4 flex flex-col items-center justify-center shadow-sm group`}
            >
              <div className="flex items-center justify-center space-x-4 mb-3">
                <Image
                  src="/images/payment/viasCard.jpg"
                  alt="Visa"
                  width={80}
                  height={40}
                  className={`object-contain border-2 rounded-lg cursor-pointer transition-all duration-200 ${selectedCardType === 'visa' ? 'border-blue-600 ring-2 ring-blue-200 scale-105' : 'border-gray-200 hover:border-blue-400'}`}
                  style={{ boxShadow: selectedCardType === 'visa' ? '0 0 0 2px #2563eb33' : undefined }}
                  onClick={e => { e.stopPropagation(); setSelectedCardType('visa'); }}
                />
                <Image
                  src="/images/payment/masterCard.png"
                  alt="Mastercard"
                  width={80}
                  height={40}
                  className={`object-contain border-2 rounded-lg cursor-pointer transition-all duration-200 ${selectedCardType === 'mastercard' ? 'border-blue-600 ring-2 ring-blue-200 scale-105' : 'border-gray-200 hover:border-blue-400'}`}
                  style={{ boxShadow: selectedCardType === 'mastercard' ? '0 0 0 2px #2563eb33' : undefined }}
                  onClick={e => { e.stopPropagation(); setSelectedCardType('mastercard'); }}
                />
              </div>
              <span className="text-xs text-gray-500">Select Visa or Mastercard</span>
            </div>
          </div>

          {/* Payment Form */}
          {selectedMethod && (
            <form onSubmit={handlePayment} className="space-y-8">
              {selectedMethod === 'card' && (
                <>
                  {/* Card type selection error */}
                  {selectedCardType === '' && (
                    <div className="text-red-500 text-sm mb-2 font-medium">Please select Visa or Mastercard.</div>
                  )}
                  <div>
                    <label className="block text-sm font-semibold text-blue-700 mb-2">
                      Card Number
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="cardNumber"
                        value={paymentDetails.cardNumber}
                        onChange={handleInputChange}
                        placeholder="1234 5678 9012 3456"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200"
                        required
                        disabled={selectedCardType === ''}
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex space-x-2">
                        {selectedCardType === 'visa' && (
                          <Image
                            src="/images/payment/viasCard.jpg"
                            alt="Visa"
                            width={30}
                            height={20}
                            className="object-contain"
                          />
                        )}
                        {selectedCardType === 'mastercard' && (
                          <Image
                            src="/images/payment/masterCard.png"
                            alt="Mastercard"
                            width={30}
                            height={20}
                            className="object-contain"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-blue-700 mb-2">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        name="expiryDate"
                        value={paymentDetails.expiryDate}
                        onChange={handleInputChange}
                        placeholder="MM/YY"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200"
                        required
                        disabled={selectedCardType === ''}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-blue-700 mb-2">
                        CVV
                      </label>
                      <input
                        type="text"
                        name="cvv"
                        value={paymentDetails.cvv}
                        onChange={handleInputChange}
                        placeholder="123"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200"
                        required
                        disabled={selectedCardType === ''}
                      />
                    </div>
                  </div>
                </>
              )}

              {(selectedMethod === 'jazzcash' || selectedMethod === 'easypaisa') && (
                <div>
                  <label className="block text-sm font-semibold text-blue-700 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={paymentDetails.phoneNumber}
                      onChange={handleInputChange}
                      placeholder="03XXXXXXXXX"
                      className={`w-full px-4 py-3 border ${phoneError ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200`}
                      required
                    />
                    {phoneError && <p className="mt-1 text-sm text-red-500 font-medium">{phoneError}</p>}
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <Image
                        src={selectedMethod === 'jazzcash' ? "/images/payment/JazzCash.png" : "/images/payment/easypesa.jpg"}
                        alt={selectedMethod}
                        width={30}
                        height={20}
                        className="object-contain"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-8">
                <button
                  type="submit"
                  disabled={!isFormValid()}
                  className={`w-full px-6 py-3 cursor-pointer bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl shadow-md hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition-all duration-200 font-semibold text-lg tracking-wide ${!isFormValid() ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  Pay Rs. {property.amount.toLocaleString()}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
} 