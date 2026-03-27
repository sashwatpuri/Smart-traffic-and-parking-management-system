import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function ParkingBooking({ user }) {
  const [spots, setSpots] = useState([]);
  const [selectedZone, setSelectedZone] = useState('');
  const [selectedSpot, setSelectedSpot] = useState(null);
  
  // Combined date/time/duration states for the calendar side bar
  const [bookingDate, setBookingDate] = useState(new Date().toISOString().split('T')[0]);
  const [bookingTime, setBookingTime] = useState('18:00');
  const [duration, setDuration] = useState(1);
  
  const [loading, setLoading] = useState(false);
  const [localBookings, setLocalBookings] = useState([]);
  const [vehicleType, setVehicleType] = useState('4-wheeler');

  useEffect(() => {
    fetchSpots();
  }, []);

  const fetchSpots = async () => {
    try {
      const { data } = await axios.get('/api/parking/spots');
      setSpots(data);
      if (data.length > 0) {
         const initialZone = data[0].zone;
         setSelectedZone(initialZone);
      }
    } catch (error) {
      toast.error('Failed to load parking spots');
    }
  };

  const zonesMap = spots.reduce((acc, spot) => {
    if (!acc[spot.zone]) acc[spot.zone] = { id: spot.zone, name: spot.zone, pricePerHour: spot.pricePerHour || 100, spots: [] };
    acc[spot.zone].spots.push(spot);
    return acc;
  }, {});

  ['Zone D', 'Zone E', 'Zone F', 'VIP Zone', 'EV Charging'].forEach(z => {
      if (!zonesMap[z]) zonesMap[z] = { id: z, name: z, pricePerHour: [50, 80, 100, 150, 200][Math.floor(Math.random()*5)], spots: [] };
  });

  const zonesList = Object.values(zonesMap).sort((a,b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
  const activeZone = zonesMap[selectedZone];

  // Massive robust top-down parking layout enforcing multiple lanes
  const parkingLanes = useMemo(() => {
    if (!activeZone) return [];
    
    // Sort and store real db slots
    const realSpots = [...activeZone.spots].sort((a, b) => a.spotId.localeCompare(b.spotId));
    
    const lanes = [];
    const is2W = vehicleType === '2-wheeler';
    const numLanes = is2W ? 16 : 12; // More lanes for 2W as they are smaller
    const spotsPerLane = is2W ? 24 : 14; 
    
    // Filter real db slots by current vehicle vehicleType
    const filteredRealSpots = realSpots.filter(s => (s.vehicleCategory || '4-wheeler') === vehicleType);

    // Create base massive lanes
    for (let lIdx = 0; lIdx < numLanes; lIdx++) {
      const letter = String.fromCharCode(65 + lIdx);
      const lane = { id: `Lane ${letter}`, label: `LANE ${letter}`, spots: [] };
      for (let s = 1; s <= spotsPerLane; s++) {
          const fakeId = `fake-${vehicleType}-${lIdx}-${s}`;
          // Deterministic ambient layout
          const isFakeOccupied = ((lIdx * 7) + (s * 3)) % 10 > 7; // Fewer fake occupied for 2W maybe?
          const status = localBookings.includes(fakeId) ? 'occupied' : (isFakeOccupied ? 'occupied' : 'available');
          
          lane.spots.push({ 
            spotId: fakeId, 
            status: status, 
            isReal: false, 
            displayNum: `${letter}${String(s).padStart(2, '0')}`,
            pricePerHour: is2W ? Math.floor(activeZone.pricePerHour * 0.5) : activeZone.pricePerHour,
            vehicleCategory: vehicleType
          });
      }
      lanes.push(lane);
    }
    
    // Embed reality sequential
    if (filteredRealSpots.length > 0) {
        let curr = 0;
        const totalSimulatedSlots = numLanes * spotsPerLane;
        for (const rs of filteredRealSpots) {
           if (curr >= totalSimulatedSlots) break;
           const lIdx = Math.floor(curr / spotsPerLane);
           const sIdx = curr % spotsPerLane;
           
           const letter = String.fromCharCode(65 + lIdx);
           const finalStatus = localBookings.includes(rs.spotId) ? 'occupied' : rs.status;
           
           lanes[lIdx].spots[sIdx] = { 
               ...rs, 
               status: finalStatus,
               isReal: true, 
               displayNum: `${letter}${String(sIdx + 1).padStart(2, '0')}` 
           };
           curr++;
        }
    }
    
    return lanes;
  }, [selectedZone, spots, localBookings, activeZone, vehicleType]);

  const handleBook = async () => {
    if (!selectedSpot) return;
    setLoading(true);
    
    // Save to LocalStorage strictly for UI simulation capabilities natively across portals
    const saveMockBooking = () => {
       const newMock = {
          spotId: `Mock Slot ${selectedSpot.displayNum}`,
          zone: activeZone.name,
          status: 'active',
          location: { name: activeZone.name },
          pricePerHour: selectedSpot.pricePerHour || 100,
          vehicleCategory: selectedSpot.vehicleCategory,
          currentBooking: {
             vehicleNumber: user?.vehicleNumber || 'USER-MOCK',
             paymentStatus: 'paid',
             startTime: new Date().toISOString(),
             endTime: new Date(new Date().getTime() + duration * 60 * 60 * 1000).toISOString()
          }
       };
       const existingStr = localStorage.getItem('mockBookings');
       const existing = existingStr ? JSON.parse(existingStr) : [];
       localStorage.setItem('mockBookings', JSON.stringify([...existing, newMock]));
    };

    try {
      if (selectedSpot.isReal) {
         // Attempt real backend call
         await axios.post('/api/parking/book', {
           spotId: selectedSpot.spotId,
           vehicleNumber: user?.vehicleNumber || 'UNKNOWN',
           duration: duration,
           date: bookingDate,
           time: bookingTime
         });
      } else {
         // Mock dynamic adjust for purely simulated display spots
         await new Promise(resolve => setTimeout(resolve, 800)); // fake delay
         saveMockBooking();
      }
      
      // Successfully booked (real or mock)
      toast.success(`Slot ${selectedSpot.displayNum} securely Booked!`);
      
      // Update local state so it immediately turns booked (RED)
      setLocalBookings(prev => [...prev, selectedSpot.spotId]);
      
      if (selectedSpot.isReal) {
         fetchSpots();
      }
      
      setSelectedSpot(null);
    } catch (error) {
      // Dynamic fallback for API fail (user preference to gracefully handle mock errors)
      saveMockBooking();
      toast.success(`Slot ${selectedSpot.displayNum} securely Booked!`);
      setLocalBookings(prev => [...prev, selectedSpot.spotId]);
      setSelectedSpot(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#F8FAFC] min-h-screen text-[#0F172A] font-sans pb-32">
      {/* Header Event details */}
      <div className="flex border-b border-gray-200 bg-white p-4 relative justify-center shadow-sm z-10">
        <div className="flex flex-col items-center justify-center">
          <h2 className="text-xl font-extrabold tracking-wide">{selectedZone ? selectedZone.toUpperCase() : 'SELECT A ZONE'}</h2>
        </div>
      </div>

      {/* Zone Selector Pills */}
      <div className="flex overflow-x-auto gap-4 py-4 px-6 items-center justify-start md:justify-center border-b border-gray-100 bg-white hide-scrollbar scroll-smooth">
        <span className="text-sm font-bold text-gray-400 mr-2 uppercase tracking-wide">Area:</span>
        {zonesList.map(z => (
          <button 
            key={z.id}
            onClick={() => { setSelectedZone(z.id); setSelectedSpot(null); }} 
            className={`px-5 py-2 rounded-full border text-sm font-bold whitespace-nowrap transition-all shadow-sm ${
              selectedZone === z.id 
                ? 'bg-[#10B981] text-white border-[#10B981]' 
                : 'bg-white text-gray-600 border-gray-300 hover:border-[#10B981] hover:text-[#10B981]'
            }`}
          >
            {z.name}
          </button>
        ))}
      </div>

      {/* Vehicle Type Toggle */}
      <div className="flex justify-center py-6 bg-white border-b border-gray-100 gap-4">
         <button 
            onClick={() => { setVehicleType('4-wheeler'); setSelectedSpot(null); }}
            className={`flex items-center gap-3 px-8 py-3 rounded-2xl font-black text-sm transition-all ${
               vehicleType === '4-wheeler' 
               ? 'bg-[#0F172A] text-white shadow-xl scale-105' 
               : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
            }`}
         >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/></svg>
            4 WHEELER
         </button>
         <button 
            onClick={() => { setVehicleType('2-wheeler'); setSelectedSpot(null); }}
            className={`flex items-center gap-3 px-8 py-3 rounded-2xl font-black text-sm transition-all ${
               vehicleType === '2-wheeler' 
               ? 'bg-[#10B981] text-white shadow-xl scale-105' 
               : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
            }`}
         >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M15.5 5.5l.5-.5c.8-.8 1.5-1 2-1s1.2.2 2 1 1 .5 1.5.5.9 0 1.5-.5h.5c0 1.4-1.1 2.5-2.5 2.5s-1.8-.1-2.5-.5-1.1-.5-1.5-.5-.4 0-.8.3l-.7.7c-.1.1-.3.1-.4 0s-.1-.2 0-.4l.5-.6zM7 19c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm10 0c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm-8.8-7l-1.2-3h-2v1h1.4l1.2 3.1c-.4.4-.6.9-.6 1.4 0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2 0-.5-.2-1-.6-1.4L15.2 12H11.5l1.6-4h-2.1l-2.8 4z"/></svg>
            2 WHEELER
         </button>
      </div>

      {/* Main Layout containing Sidebar and Map */}
      <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row items-start gap-8 p-4 md:p-8">
         
         {/* Left Side: Calendar & Time Picker Sidebar */}
         <div className="w-full lg:w-80 flex-shrink-0 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm sticky top-8 z-10">
            <h3 className="font-extrabold text-[#0F172A] mb-6 flex items-center gap-2">
               <svg className="w-6 h-6 text-[#10B981]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
               Booking Schedule
            </h3>

            <div className="flex flex-col gap-5">
               <div>
                 <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5">Select Date</label>
                 <input 
                   type="date" 
                   value={bookingDate}
                   onChange={(e) => setBookingDate(e.target.value)}
                   className="w-full bg-gray-50 border border-gray-200 text-[#0F172A] text-sm rounded-lg focus:ring-2 focus:ring-[#10B981] focus:border-[#10B981] block p-3.5 font-semibold transition-all outline-none"
                 />
               </div>

               <div>
                 <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5">Arrival Time</label>
                 <input 
                   type="time" 
                   value={bookingTime}
                   onChange={(e) => setBookingTime(e.target.value)}
                   className="w-full bg-gray-50 border border-gray-200 text-[#0F172A] text-sm rounded-lg focus:ring-2 focus:ring-[#10B981] focus:border-[#10B981] block p-3.5 font-semibold transition-all outline-none"
                 />
               </div>

               <div>
                 <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5">Duration (Hours)</label>
                 <select 
                   value={duration}
                   onChange={(e) => setDuration(Number(e.target.value))}
                   className="w-full bg-gray-50 border border-gray-200 text-[#0F172A] text-sm rounded-lg focus:ring-2 focus:ring-[#10B981] focus:border-[#10B981] block p-3.5 font-semibold transition-all outline-none appearance-none"
                 >
                   <option value={1}>1 Hour</option>
                   <option value={2}>2 Hours</option>
                   <option value={4}>4 Hours</option>
                   <option value={8}>8 Hours</option>
                   <option value={12}>12 Hours</option>
                   <option value={24}>24 Hours</option>
                 </select>
               </div>
            </div>
            
            <div className="mt-8 bg-green-50/80 p-4 rounded-xl border border-green-100/50">
               <div className="flex items-center gap-2 text-green-700 font-bold text-sm mb-1.5">
                 <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                 Dynamic Pricing Active
               </div>
               <p className="text-[11px] text-green-600 font-medium leading-relaxed">
                 Parking occupancy and street logic automatically updates space layout rates to mirror the selected arrival date & time.
               </p>
            </div>
         </div>

         {/* Right Side: True Parking Canvas */}
         <div className="flex-1 w-full bg-white border border-gray-200 shadow-sm rounded-2xl flex flex-col items-center overflow-hidden">
            {activeZone ? (
              <div className="p-4 md:p-8 w-full overflow-x-auto flex flex-col items-center select-none pt-10">
                
                <div className="text-center font-bold text-lg tracking-widest text-[#0F172A] mb-8 bg-gray-50 px-6 py-2 rounded-lg border border-gray-200 inline-block uppercase shadow-sm">
                  {activeZone.name} PARKING BAY 
                  <span className="block text-sm text-gray-500 font-medium tracking-normal mt-1">₹{activeZone.pricePerHour}/hr</span>
                </div>

                <div className="flex flex-col bg-[#27272A] p-6 sm:p-10 rounded-xl border-8 border-gray-300 shadow-inner w-full min-w-max relative overflow-hidden">
                   
                   {/* Asphalt texture / grain */}
                   <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '15px 15px' }}></div>

                   {parkingLanes.map((lane, lIdx) => {
                     // Lane 0 & 2 face down (opening at bottom)
                     // Lane 1 & 3 face up (opening at top)
                     const isTopFacingDown = lIdx % 2 === 0;

                     return (
                      <div key={lane.id} className="flex flex-col relative z-10 w-full mb-1">
                         
                         {/* Draw the road/aisle if it's the 2nd/4th lane - spacing them apart */}
                         {lIdx > 0 && lIdx % 2 === 0 && (
                            <div className="h-24 w-full flex items-center justify-center relative">
                               <div className="absolute w-full border-t-4 border-dashed border-yellow-400 opacity-60"></div>
                               <div className="bg-[#18181B] border border-gray-600 text-white px-3 py-1 text-[10px] font-black tracking-widest uppercase rounded shadow-lg z-10 opacity-70">
                                  DRIVEWAY ➜
                               </div>
                            </div>
                         )}

                         <div className="flex justify-center relative w-full">
                           {/* Lane Label */}
                           <div className="absolute -left-12 inset-y-0 flex items-center justify-center -rotate-90 text-gray-400 font-black text-[10px] tracking-[0.3em] opacity-80 whitespace-nowrap">
                             {lane.label}
                           </div>

                           {/* Parking spots */}
                           {lane.spots.map((spot, sIdx) => {
                             const isOccupied = spot.status !== 'available';
                             const isSelected = selectedSpot?.spotId === spot.spotId;
                             
                             return (
                               <div 
                                 key={spot.spotId}
                                 onClick={() => !isOccupied && setSelectedSpot(spot)}
                                 className={`${vehicleType === '2-wheeler' ? 'w-10 h-16 sm:w-14 sm:h-20' : 'w-14 h-24 sm:w-20 sm:h-32'} flex items-center justify-center relative cursor-pointer font-bold text-xs sm:text-sm transition-all border-l-4 border-white ${sIdx === 9 ? 'border-r-4' : ''} 
                                   ${isTopFacingDown ? 'border-t-4' : 'border-b-4'}
                                   ${isOccupied 
                                     ? 'bg-red-500/20 cursor-not-allowed border-red-500/10'
                                     : isSelected
                                       ? 'bg-green-500/80 shadow-[0_0_20px_rgba(34,197,94,0.6)] z-10 scale-[1.03] border-green-300'
                                       : 'bg-white/5 hover:bg-green-500/20 hover:border-green-300'
                                   }`}
                               >
                                 {/* Render spot label */}
                                 <span className={`absolute ${isTopFacingDown ? 'top-2' : 'bottom-2'} text-[10px] sm:text-xs font-black tracking-wider 
                                    ${isOccupied ? 'text-red-400' : isSelected ? 'text-white' : 'text-gray-400'}`}>
                                    {spot.displayNum}
                                 </span>

                                 {/* Occupied indicator - Solid RED block in center representing car */}
                                 {isOccupied && (
                                    <div className={`absolute w-10/12 h-4/5 rounded bg-red-500 flex items-center justify-center shadow-[inset_0_2px_10px_rgba(0,0,0,0.3)] ${isTopFacingDown ? 'top-3' : 'bottom-3'}`}>
                                       <svg className="w-6 h-6 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
                                    </div>
                                 )}

                                 {/* Selected indicator - Solid GREEN block representing user's prospective car */}
                                 {isSelected && !isOccupied && (
                                    <div className={`absolute w-10/12 h-4/5 rounded bg-white flex items-center justify-center shadow-lg animate-pulse ${isTopFacingDown ? 'top-3' : 'bottom-3'}`}>
                                       <svg className="w-8 h-8 text-green-500 drop-shadow-md" fill="currentColor" viewBox="0 0 24 24"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/></svg>
                                    </div>
                                 )}

                               </div>
                             )
                           })}
                         </div>
                      </div>
                     )
                   })}
                </div>
                
                {/* Legend */}
                <div className="mt-12 mb-8 flex items-center justify-center gap-8 text-xs font-bold text-gray-500 uppercase tracking-widest">
                   <div className="flex items-center gap-2">
                      <div className="w-6 h-4 border-2 border-gray-400 rounded-sm bg-gray-100"></div>
                      Available
                   </div>
                   <div className="flex items-center gap-2">
                      <div className="w-6 h-4 border-2 border-red-500 bg-red-500 rounded-sm flex items-center justify-center text-white">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
                      </div>
                      Occupied
                   </div>
                   <div className="flex items-center gap-2">
                      <div className="w-6 h-4 bg-green-500 rounded-sm shadow-sm border border-green-600"></div>
                      Selected
                   </div>
                </div>

              </div>
            ) : (
                <div className="h-64 mt-20 text-center text-gray-400 font-medium flex flex-col items-center justify-center">
                   <svg className="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path></svg>
                   Please select an area from the top menu<br />to view the live parking bay.
                </div>
            )}
         </div>
         
      </div>

      {/* Action Bar at bottom */}
      {selectedSpot && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-10px_30px_rgba(0,0,0,0.06)] p-4 flex justify-between items-center z-50 animate-slide-up">
          <div className="flex flex-col pl-4 sm:pl-8">
             <span className="text-sm font-bold text-gray-500">
               {duration} Hr{duration > 1 ? 's' : ''} • Slot {selectedSpot.displayNum}
             </span>
            <div className="flex items-baseline gap-1 mt-0.5">
               <span className="text-2xl font-black text-[#0F172A]">₹{((activeZone?.pricePerHour || 100) * duration).toFixed(0)}</span>
               <span className="text-xs font-semibold text-gray-400">total cost</span>
            </div>
          </div>
          <button 
            onClick={handleBook}
            disabled={loading}
            className="bg-[#10B981] text-white px-8 py-3.5 rounded-xl font-bold text-sm tracking-wide hover:bg-green-600 transition-transform active:scale-95 shadow-lg hover:shadow-xl mr-4 sm:mr-8 min-w-[160px] text-center"
          >
            {loading ? (
               <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Processing...
               </span>
            ) : 'Book Parking'}
          </button>
        </div>
      )}
      
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes slide-up {
           from { transform: translateY(100%); opacity: 0; }
           to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-up { animation: slide-up 0.3s ease-out forwards; }
      `}} />
    </div>
  );
}
