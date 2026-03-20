import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { ParkingCircle, MapPin, Clock, XCircle } from 'lucide-react';

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get('/api/parking/my-bookings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const mockStr = localStorage.getItem('mockBookings');
      const mockData = mockStr ? JSON.parse(mockStr) : [];
      setBookings([...data, ...mockData]);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      // Fallback for demo
      const mockStr = localStorage.getItem('mockBookings');
      const mockData = mockStr ? JSON.parse(mockStr) : [];
      setBookings(mockData);
    }
  };

  const handleRelease = async (spotId) => {
    if (spotId.startsWith('Mock Slot') || spotId.startsWith('fake-')) {
       const mockStr = localStorage.getItem('mockBookings');
       if (mockStr) {
           let mocks = JSON.parse(mockStr);
           mocks = mocks.filter(b => b.spotId !== spotId);
           localStorage.setItem('mockBookings', JSON.stringify(mocks));
       }
       toast.success('Parking released successfully');
       fetchBookings();
       return;
    }
    
    try {
      const token = localStorage.getItem('token');
      await axios.post(`/api/parking/release/${spotId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Parking released successfully');
      fetchBookings();
    } catch (error) {
      toast.error('Failed to release parking');
    }
  };

  const getRemainingTime = (endTime) => {
    const now = new Date();
    const end = new Date(endTime);
    const diff = end - now;
    
    if (diff <= 0) return 'Expired';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-2">My Bookings</h2>
        <p className="text-gray-600">View and manage your parking reservations</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {bookings.map((booking) => (
          <div key={booking.spotId} className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <ParkingCircle className="w-8 h-8 text-blue-500 mr-3" />
                <div>
                  <h3 className="text-lg font-bold">{booking.spotId}</h3>
                  <p className="text-sm text-gray-600">{booking.zone}</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                {booking.status}
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-start">
                <MapPin className="w-5 h-5 text-gray-400 mr-2 mt-1" />
                <div>
                  <p className="text-sm text-gray-600">Location</p>
                  <p className="font-medium">{booking.location.name}</p>
                </div>
              </div>

              <div className="flex items-start">
                <Clock className="w-5 h-5 text-gray-400 mr-2 mt-1" />
                <div>
                  <p className="text-sm text-gray-600">Time Remaining</p>
                  <p className="font-medium text-green-600">
                    {getRemainingTime(booking.currentBooking.endTime)}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Vehicle:</span>
                  <span className="font-semibold">{booking.currentBooking.vehicleNumber}</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-600">Rate:</span>
                  <span>₹{booking.pricePerHour}/hr</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-600">Payment:</span>
                  <span
                    className={`font-semibold ${
                      booking.currentBooking.paymentStatus === 'paid' ? 'text-green-600' : 'text-orange-600'
                    }`}
                  >
                    {(booking.currentBooking.paymentStatus || 'pending').toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-600">Start:</span>
                  <span>{new Date(booking.currentBooking.startTime).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-600">End:</span>
                  <span>{new Date(booking.currentBooking.endTime).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleRelease(booking.spotId)}
              className="w-full mt-4 flex items-center justify-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              <XCircle className="w-5 h-5 mr-2" />
              Release Parking
            </button>
          </div>
        ))}
      </div>

      {bookings.length === 0 && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <ParkingCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No active bookings</p>
        </div>
      )}
    </div>
  );
}
