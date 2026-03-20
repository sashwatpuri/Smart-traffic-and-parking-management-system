import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function ParkingBooking({ user }) {
  const [selectedZone, setSelectedZone] = useState('');
  const [spots, setSpots] = useState([]);
  const [duration, setDuration] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSpots();
  }, []);

  const fetchSpots = async () => {
    try {
      const { data } = await axios.get('/api/parking/spots');
      setSpots(data);
    } catch (error) {
      toast.error('Failed to load parking spots');
    }
  };

  const zonesMap = spots.reduce((acc, spot) => {
    if (!acc[spot.zone]) acc[spot.zone] = { id: spot.zone, name: spot.zone, location: `${spot.zone} Area`, price: `₹${spot.pricePerHour}/hr`, pricePerHour: spot.pricePerHour, totalSlots: 0, occupiedSlots: 0, availableSpots: [] };
    acc[spot.zone].totalSlots++;
    if (spot.status !== 'available') {
      acc[spot.zone].occupiedSlots++;
    } else {
      acc[spot.zone].availableSpots.push(spot);
    }
    return acc;
  }, {});

  const zones = Object.values(zonesMap).map(zone => ({
    ...zone,
    status: zone.totalSlots === zone.occupiedSlots ? 'Full' : 'Available'
  }));

  const handleBook = async () => {
    if (!selectedZone) return;
    const zoneData = zonesMap[selectedZone];
    if (zoneData.availableSpots.length === 0) {
      toast.error('No spots available in this zone');
      return;
    }
    
    // Pick the first available spot
    const spotToBook = zoneData.availableSpots[0];
    setLoading(true);
    try {
      await axios.post('/api/parking/book', {
        spotId: spotToBook.spotId,
        vehicleNumber: user?.vehicleNumber || 'UNKNOWN',
        duration: duration
      });
      toast.success('Parking booked securely!');
      fetchSpots();
      setSelectedZone('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  const renderProgressBar = (occupied, total) => {
    const percentage = (occupied / total) * 100 || 0;
    const color = percentage > 90 ? 'bg-[#EF4444]' : percentage > 70 ? 'bg-[#F59E0B]' : 'bg-[#10B981]';
    return (
      <div className="w-full bg-gray-200 rounded-full h-2 mt-2 mb-1">
        <div className={`${color} h-2 rounded-full`} style={{ width: `${percentage}%` }}></div>
      </div>
    );
  };

  const activeZone = zones.find(z => z.id === selectedZone);
  const totalCost = activeZone ? activeZone.pricePerHour * duration : 0;

  return (
    <div className="bg-[#F8FAFC] min-h-screen py-8 px-4 font-sans text-[#0F172A]">
      <div className="max-w-[900px] mx-auto w-full">
        
        {/* Search Bar */}
        <div className="flex bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden mb-4">
          <div className="pl-4 pr-2 flex items-center justify-center text-gray-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
          </div>
          <input 
            type="text" 
            placeholder="Search area or landmark..." 
            className="flex-1 py-3 px-2 text-sm focus:outline-none text-[#0F172A] placeholder-gray-400"
          />
          <button className="bg-[#0F172A] text-white px-6 py-3 font-semibold text-sm hover:bg-slate-800 transition-colors">
            Search
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            </div>
            <select className="pl-10 pr-4 py-3 w-full bg-white border border-gray-200 rounded-md shadow-sm text-sm text-[#0F172A] appearance-none focus:outline-none focus:ring-1 focus:ring-[#0F172A]">
               <option>Today</option>
            </select>
          </div>
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <select 
              className="pl-10 pr-4 py-3 w-full bg-white border border-gray-200 rounded-md shadow-sm text-sm text-[#0F172A] appearance-none focus:outline-none focus:ring-1 focus:ring-[#0F172A]"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
            >
               <option value={1}>1 Hour</option>
               <option value={2}>2 Hours</option>
               <option value={4}>4 Hours</option>
               <option value={8}>8 Hours</option>
            </select>
          </div>
        </div>

        {/* Section Heading */}
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-xl font-bold text-[#0F172A]">Available Parking Zones</h2>
        </div>

        {/* Grid Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
          {zones.map((zone) => {
            const isSelected = selectedZone === zone.id;
            const isFull = zone.status === 'Full';

            return (
              <div 
                key={zone.id} 
                className={`relative flex flex-col justify-between bg-white rounded-lg p-5 cursor-pointer border-2 transition-all ${
                  isSelected ? 'border-[#0F172A] bg-slate-50 shadow-md' : 'border-transparent shadow-sm hover:border-gray-200'
                } ${isFull ? 'opacity-75 cursor-not-allowed' : ''}`}
                onClick={() => !isFull && setSelectedZone(zone.id)}
              >
                <div>
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-[#0F172A] text-lg leading-tight">{zone.name}</h3>
                    <div className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                      isFull ? 'bg-red-100 text-[#EF4444]' : 'bg-green-100 text-[#10B981]'
                    }`}>
                      {zone.status}
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mb-4">{zone.location}</p>
                  
                  <div className="text-2xl font-bold text-[#0F172A] mb-4">
                    {zone.price}
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-gray-500">
                       <span>Occupancy</span>
                       <span>{zone.occupiedSlots} / {zone.totalSlots}</span>
                    </div>
                    {renderProgressBar(zone.occupiedSlots, zone.totalSlots)}
                  </div>
                </div>

                {isSelected && !isFull && (
                   <button 
                     onClick={(e) => { e.stopPropagation(); setSelectedZone(zone.id); }} 
                     className="mt-5 w-full bg-[#0F172A] text-white py-2.5 rounded-md font-semibold text-sm hover:bg-slate-800 transition-colors">
                     Selected
                   </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Summary Footer */}
        {activeZone && (
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex-1 w-full">
              <h3 className="text-lg font-bold text-[#0F172A] mb-1">Booking Summary</h3>
              <p className="text-sm text-gray-600">
                You are booking <span className="font-semibold text-[#0F172A]">{activeZone.name}</span> for <span className="font-semibold text-[#0F172A]">{duration} Hour{duration > 1 ? 's' : ''}</span>.
              </p>
            </div>
            <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
              <div className="text-right">
                <p className="text-sm text-gray-500 font-medium">Total Cost</p>
                <p className="text-2xl font-bold text-[#0F172A]">₹{totalCost.toFixed(2)}</p>
              </div>
              <button 
                onClick={handleBook}
                disabled={loading}
                className="bg-[#0F172A] text-white px-8 py-3 rounded-md font-bold text-sm hover:bg-slate-800 transition-colors shadow-sm disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Proceed to Payment'}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
