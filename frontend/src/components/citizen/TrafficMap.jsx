import React, { useState, useEffect, useMemo } from 'react';
import { 
  Navigation, 
  MapPin, 
  Search, 
  Menu, 
  Mic, 
  Layers, 
  Navigation2, 
  Share2, 
  Bookmark, 
  ChevronDown, 
  Crosshair, 
  Star,
  Clock,
  Car,
  MoreVertical,
  X,
  Coffee,
  Fuel,
  Hotel,
  UtensilsCrossed,
  Info
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const SolapurUltimateMap = ({ zones, activeZone, onZoneSelect }) => {
  const [mapType, setMapType] = useState('default'); // 'default' or 'satellite'
  const [navigationMode, setNavigationMode] = useState(false);

  // Expanded Massive Junction Network for Solapur
  const junctions = [
    { id: 'Siddheshwar Temple', x: 220, y: 180, name: 'Siddheshwar Temple', rating: '4.8', reviews: '25k', img: 'https://images.unsplash.com/photo-1548013146-72479768bada?q=80&w=600' },
    { id: 'Solapur Railway Station', x: 420, y: 120, name: 'Solapur Station', rating: '4.2', reviews: '18k', img: 'https://images.unsplash.com/photo-1532375810709-75b1da00537c?q=80&w=600' },
    { id: 'Navi Peth Market', x: 280, y: 280, name: 'Navi Peth', rating: '4.5', reviews: '9k', img: 'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?q=80&w=600' },
    { id: 'ST Stand (Central)', x: 140, y: 380, name: 'ST Stand', rating: '3.9', reviews: '11k', img: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?q=80&w=600' },
    { id: 'Hotgi Road (Soham Mall)', x: 520, y: 440, name: 'Soham Mall', rating: '4.4', reviews: '5k', img: 'https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?q=80&w=600' },
    { id: 'Bhuikot Fort Area', x: 80, y: 140, name: 'Bhuikot Fort', rating: '4.6', reviews: '4k', img: 'https://images.unsplash.com/photo-1590050752117-23a9d7f28a8a?q=80&w=600' },
    { id: 'Balives (Old Mill)', x: 380, y: 340, name: 'Balives', rating: '4.1', reviews: '2k', img: 'https://images.unsplash.com/photo-1582650625119-3a31f8fa2699?q=80&w=600' },
    { id: 'Kambar Lake', x: 100, y: 260, name: 'Kambar Lake', rating: '4.5', reviews: '3k', img: 'https://images.unsplash.com/photo-1439066615861-d1af74d74000?q=80&w=600' },
    { id: 'Pune Naka', x: 120, y: 40, name: 'Pune Naka', type: 'junction' },
    { id: 'Vijapur Naka', x: 540, y: 180, name: 'Vijapur Naka', type: 'junction' },
    { id: 'Indira Gandhi Stadium', x: 320, y: 200, name: 'IG Stadium', rating: '4.3', reviews: '1k' },
    { id: 'Clock Tower', x: 340, y: 60, name: 'Clock Tower', type: 'landmark' }
  ];

  const roads = [
    { from: 'Pune Naka', to: 'Clock Tower' },
    { from: 'Clock Tower', to: 'Solapur Railway Station' },
    { from: 'Solapur Railway Station', to: 'Vijapur Naka' },
    { from: 'Pune Naka', to: 'Bhuikot Fort Area' },
    { from: 'Bhuikot Fort Area', to: 'Siddheshwar Temple' },
    { from: 'Siddheshwar Temple', to: 'Indira Gandhi Stadium' },
    { from: 'Indira Gandhi Stadium', to: 'Navi Peth Market' },
    { from: 'Navi Peth Market', to: 'Balives (Old Mill)' },
    { from: 'Balives (Old Mill)', to: 'Hotgi Road (Soham Mall)' },
    { from: 'ST Stand (Central)', to: 'Navi Peth Market' },
    { from: 'Kambar Lake', to: 'ST Stand (Central)' },
    { from: 'Bhuikot Fort Area', to: 'Kambar Lake' }
  ];

  const getCongestionColor = (zoneName) => {
    const zone = zones.find(z => z.zone === zoneName);
    if (!zone) return mapType === 'satellite' ? '#22C55E' : '#4ADE80';
    if (zone.vehicles > 150) return '#EF4444';
    if (zone.vehicles > 80) return '#FACC15';
    return mapType === 'satellite' ? '#22C55E' : '#4ADE80';
  };

  const currentZoneData = junctions.find(j => j.id === activeZone);

  return (
    <div className="relative w-full h-[650px] md:h-[800px] bg-[#E8EAED] rounded-[3rem] overflow-hidden shadow-2xl border border-gray-200 group select-none">
      
      {/* 1. TOP UI: SEARCH & CATEGORIES */}
      <div className="absolute top-4 left-0 right-0 z-20 px-3 md:px-0 flex flex-col items-center gap-3">
         {/* Search Bar */}
         <div className="w-full md:w-[480px] bg-white rounded-full shadow-lg flex items-center px-5 h-12 md:h-14 border border-gray-100">
            <Menu className="w-5 h-5 text-gray-500 mr-3 cursor-pointer" />
            <input type="text" placeholder="Search Solapur Smart City..." className="bg-transparent border-none focus:outline-none flex-1 text-sm md:text-base font-medium text-gray-700" />
            <div className="flex items-center gap-3 md:gap-4 pl-3 border-l border-gray-100 ml-2">
               <Mic className="w-4 h-4 md:w-5 md:h-5 text-gray-400" />
               <Search className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
            </div>
         </div>

         {/* Category Chips (Mobile-Responsive Scroll) */}
         <div className="flex gap-2 overflow-x-auto w-full md:w-[700px] no-scrollbar px-4 pb-2 md:justify-center">
            {[
               { icon: UtensilsCrossed, label: 'Restaurants' },
               { icon: Coffee, label: 'Coffee' },
               { icon: Fuel, label: 'Gas' },
               { icon: Hotel, label: 'Hotels' },
               { icon: Info, label: 'Promotions' }
            ].map(cat => (
               <button key={cat.label} className="flex items-center gap-1.5 px-4 py-1.5 bg-white rounded-full shadow-sm border border-gray-100 whitespace-nowrap text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors shrink-0">
                  <cat.icon className="w-3.5 h-3.5 text-red-500" />
                  {cat.label}
               </button>
            ))}
         </div>
      </div>

      {/* 2. FLOATING MAP CONTROLS */}
      <div className="absolute top-40 right-4 md:right-6 flex flex-col gap-2 z-10">
         <button onClick={() => setMapType(mapType === 'default' ? 'satellite' : 'default')} className={`p-3 rounded-xl shadow-lg border transition-all active:scale-90 ${mapType === 'satellite' ? 'bg-[#1A73E8] text-white' : 'bg-white text-gray-600'}`}>
            <Layers className="w-5 h-5" />
         </button>
         <button onClick={() => setNavigationMode(!navigationMode)} className={`p-3 rounded-xl shadow-lg border transition-all active:scale-90 ${navigationMode ? 'bg-emerald-600 text-white' : 'bg-white text-gray-600'}`}>
            <Navigation2 className="w-5 h-5" />
         </button>
      </div>

      <div className="absolute bottom-64 md:bottom-28 right-4 md:right-6 z-10">
         <button className="w-12 h-12 bg-white rounded-full shadow-2xl flex items-center justify-center text-[#1A73E8] active:scale-90 transition-all border border-gray-100">
            <Crosshair className="w-6 h-6" />
         </button>
      </div>

      {/* 3. THE LIVE MAP RENDERING */}
      <div className={`w-full h-full transition-all duration-1000 ${mapType === 'satellite' ? 'bg-[#121417]' : 'bg-[#E8EAED]'}`}>
         <svg viewBox="0 0 600 500" className="w-full h-full p-10 md:p-20 pointer-events-auto">
            {/* Roads Expansion */}
            {roads.map((road, idx) => {
               const from = junctions.find(j => j.id === road.from);
               const to = junctions.find(j => j.id === road.to);
               const color = getCongestionColor(road.to);
               const speed = navigationMode ? '1.5s' : '4s';

               return (
                  <g key={idx}>
                     <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke={mapType === 'satellite' ? '#2D3748' : '#FFFFFF'} strokeWidth="16" strokeLinecap="round" />
                     <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke={color} strokeWidth="5" strokeLinecap="round" />
                     {navigationMode && (
                        <circle r="1.5" fill="white">
                           <animateMotion path={`M ${from.x},${from.y} L ${to.x},${to.y}`} dur={speed} repeatCount="indefinite" />
                        </circle>
                     )}
                  </g>
               );
            })}

            {/* Junction Pins */}
            {junctions.map((j) => {
               const isActive = activeZone === j.id;
               return (
                  <g key={j.id} onClick={() => onZoneSelect(j.id)} className="cursor-pointer group/pin">
                     <g transform={`translate(${j.x}, ${j.y})`}>
                        <path d="M0 0 L-6 -8 C-10 -14 -10 -22 0 -22 C10 -22 10 -14 6 -8 L0 0Z" fill={isActive ? '#1A73E8' : '#EA4335'} className="transition-all duration-300" />
                        <circle cx="0" cy="-14" r="3" fill="white" />
                        <text textAnchor="middle" y="12" fontSize="6" fontWeight="bold" fill={mapType === 'satellite' ? '#CBD5E0' : '#5F6368'}>
                           {j.name}
                        </text>
                     </g>
                  </g>
               );
            })}
         </svg>
      </div>

      {/* 4. MODULAR BOTTOM SHEET (PHONE RESPONSIVE) */}
      <div 
        className={`absolute bottom-0 left-0 right-0 bg-white shadow-[0_-10px_50px_rgba(0,0,0,0.15)] transition-all duration-500 ease-in-out z-30 rounded-t-[2.5rem] flex flex-col ${
           activeZone ? 'h-[360px] md:h-[340px]' : 'h-16 md:h-20'
        }`}
      >
         <div onClick={() => activeZone && onZoneSelect(null)} className="w-12 h-1 bg-gray-200 rounded-full mx-auto mt-4 mb-2 cursor-pointer transition-colors hover:bg-gray-300"></div>
         
         {!activeZone ? (
           <div className="flex items-center justify-between px-8 py-2 md:py-4">
              <span className="text-[10px] md:text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Select location for details</span>
              <ChevronDown className="w-4 h-4 text-gray-300 animate-bounce" />
           </div>
         ) : (
           <div className="flex-1 overflow-y-auto px-6 pb-6 md:pb-8 flex flex-col md:flex-row gap-6 relative">
              
              <div className="flex-1">
                 <div className="flex items-start justify-between mb-2">
                    <div>
                       <h2 className="text-2xl font-black text-gray-900 tracking-tight">{activeZone}</h2>
                       <div className="flex items-center gap-1.5 md:gap-2 mt-1">
                          <div className="flex text-yellow-400">
                             <Star className="w-3.5 h-3.5 fill-current" />
                             <span className="text-xs font-black text-gray-900 ml-1">{currentZoneData?.rating || '4.2'}</span>
                          </div>
                          <span className="text-xs text-gray-400 font-medium tracking-tight">({currentZoneData?.reviews || '840'} Reviews)</span>
                       </div>
                    </div>
                    <button className="p-3 bg-gray-50 rounded-full text-blue-600 hover:bg-blue-50 transition-colors">
                       <Bookmark className="w-6 h-6" />
                    </button>
                 </div>

                 <p className="text-xs text-gray-500 leading-relaxed max-w-sm mb-6">
                    Solapur is one of the important industrial hubs of Maharashtra. The area around {activeZone} is currently showing optimal traffic flow.
                 </p>

                 {/* Action Bar */}
                 <div className="flex flex-wrap gap-2 md:gap-3">
                    <button onClick={() => setNavigationMode(true)} className="flex items-center gap-2 px-6 py-3 bg-[#1A73E8] text-white rounded-full font-black text-xs md:text-sm shadow-xl shadow-blue-100 transform active:scale-95 transition-all">
                       <Navigation className="w-4 h-4 rotate-45" /> Routes
                    </button>
                    <button className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-100 text-gray-700 rounded-full font-black text-xs md:text-sm hover:bg-gray-50 transition-all">
                       <Navigation2 className="w-4 h-4" /> Start
                    </button>
                    <button className="p-3 bg-white border border-gray-100 text-gray-400 rounded-full hover:bg-gray-50 transition-all">
                       <Share2 className="w-5 h-5" />
                    </button>
                 </div>
              </div>

              {/* Photo Strip (Scrollable on Mobile) */}
              <div className="w-full md:w-64 h-32 md:h-full shrink-0 flex gap-2 md:block md:space-y-2 overflow-x-auto no-scrollbar">
                 <img 
                    src={currentZoneData?.img || "https://images.unsplash.com/photo-1548013146-72479768bada?q=80&w=600"} 
                    className="h-full md:h-32 w-48 md:w-full object-cover rounded-2xl shadow-sm border border-gray-100" 
                    alt="Landmark"
                 />
                 <img 
                    src="https://images.unsplash.com/photo-1567157577867-05ccb1388e66?q=80&w=600" 
                    className="h-full md:h-32 w-48 md:w-full object-cover rounded-2xl shadow-sm border border-gray-100 opacity-60 hidden md:block" 
                    alt="Area View"
                 />
              </div>
           </div>
         )}
      </div>

    </div>
  );
};

export default function TrafficMap() {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeZoneId, setActiveZoneId] = useState(null);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 4000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const { data } = await axios.get('/api/traffic/zones');
      setZones(data);
    } catch (e) {
      console.error('Sync failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 flex flex-col gap-6 max-w-[1500px] mx-auto pb-40">
       <div className="flex flex-col gap-1 px-2">
          <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em]">Smart Navigation OS</p>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter">Explore Solapur City</h1>
       </div>

       <SolapurUltimateMap 
          zones={zones} 
          activeZone={activeZoneId}
          onZoneSelect={(id) => setActiveZoneId(id)}
       />

       {/* Mobile Helper Info */}
       <div className="md:hidden p-4 bg-blue-50 rounded-2xl border border-blue-100 flex items-center gap-3">
          <Info className="w-5 h-5 text-blue-500" />
          <p className="text-[10px] font-bold text-blue-700 leading-tight">
             Tap any pin to view live arrival times and smart route bypasses across the city.
          </p>
       </div>

       <style jsx="true">{`
          .no-scrollbar::-webkit-scrollbar { display: none; }
          .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
       `}</style>
    </div>
  );
}
