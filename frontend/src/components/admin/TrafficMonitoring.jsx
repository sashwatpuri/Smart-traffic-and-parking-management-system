import React from 'react';

export default function TrafficMonitoring() {
  return (
    <div className="bg-[#F8FAFC] min-h-screen p-6 font-sans text-[#0F172A]">
      
      {/* Alert Strip */}
      <div className="flex flex-col gap-3 mb-6 relative z-10">
        <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border-l-4 border-[#EF4444]">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
              <svg className="w-4 h-4 text-[#EF4444]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            </div>
            <div>
              <p className="font-semibold text-[#0F172A]">Violation: Illegal U-Turn detected limit</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide bg-gray-100 px-2 py-0.5 rounded">Station Road</span>
                <span className="text-xs text-gray-400">Just now</span>
              </div>
            </div>
          </div>
          <button className="text-gray-400 hover:text-gray-600 p-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border-l-4 border-[#F59E0B]">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
              <svg className="w-4 h-4 text-[#F59E0B]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <div>
              <p className="font-semibold text-[#0F172A]">Congestion Warning: Heavy backlog building</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide bg-gray-100 px-2 py-0.5 rounded">Market Central</span>
                <span className="text-xs text-gray-400">4 mins ago</span>
              </div>
            </div>
          </div>
          <button className="text-gray-400 hover:text-gray-600 p-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
      </div>

      {/* 2-Column Layout */}
      <div className="flex flex-col lg:flex-row gap-6 mb-6">
        
        {/* Left Column (60%) - Video Feed */}
        <div className="lg:w-[60%] flex flex-col">
          <div className="bg-[#1E293B] rounded-lg shadow-md h-full min-h-[400px] flex items-center justify-center relative overflow-hidden group border border-slate-700">
            {/* Top Left Label */}
            <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-[#0F172A]/80 backdrop-blur-sm px-3 py-1.5 rounded-md border border-slate-600">
              <div className="w-2.5 h-2.5 rounded-full bg-[#EF4444] animate-pulse"></div>
              <span className="text-white text-sm font-semibold tracking-wide">Zone 3: Vijapur Road</span>
            </div>

            {/* Center Camera Icon Placeholder */}
            <div className="text-slate-500 flex flex-col items-center">
              <svg className="w-16 h-16 mb-2 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
            </div>

            {/* Simulating vehicle bounding boxes (Detection Overlay) */}
            <div className="absolute inset-0 pointer-events-none opacity-40">
               <div className="absolute top-1/4 left-1/4 w-12 h-12 border-2 border-[#10B981] rounded"></div>
               <div className="absolute top-1/3 right-1/4 w-16 h-10 border-2 border-[#10B981] rounded"></div>
               <div className="absolute bottom-1/3 left-1/3 w-14 h-14 border-2 border-[#10B981] rounded"></div>
            </div>

            {/* Bottom Overlay Texts */}
            <div className="absolute bottom-4 left-4 z-10">
               <span className="font-mono text-xs text-white bg-black/60 px-2 py-1 rounded">CAM-VJP-003-A</span>
            </div>
            <div className="absolute bottom-4 right-4 z-10">
               <div className="font-mono text-xl font-bold text-[#10B981] bg-black/60 px-3 py-1 rounded border border-[#10B981]/50 shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                 0:45
               </div>
            </div>
          </div>
        </div>

        {/* Right Column (40%) - Stat Cards */}
        <div className="lg:w-[40%] flex flex-col justify-between gap-4">
          
          {/* Card 1 */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center justify-between flex-1">
             <div>
               <p className="text-sm text-gray-500 font-medium tracking-wide">Current Vehicle Count</p>
               <h2 className="text-5xl font-bold text-[#0F172A] mt-2 tabular-nums">1,482</h2>
             </div>
             <div className="flex items-center text-[#10B981] bg-green-50 px-3 py-1.5 rounded-full border border-green-100">
                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
                <span className="font-bold text-sm">+12%</span>
             </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center justify-between flex-1">
             <div>
               <p className="text-sm text-gray-500 font-medium tracking-wide">Congestion Level</p>
               <h2 className="text-3xl font-bold text-[#0F172A] mt-2">Medium</h2>
             </div>
             <div className="bg-[#F59E0B]/10 text-[#F59E0B] px-4 py-2 rounded-full font-bold tracking-widest text-sm border border-[#F59E0B]/20">
                MEDIUM
             </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center justify-between flex-1">
             <div>
               <p className="text-sm text-gray-500 font-medium tracking-wide">Active Signal Timer</p>
               <h2 className="text-4xl font-bold text-[#0F172A] mt-2 tabular-nums">0:45</h2>
               <div className="mt-3 inline-flex items-center px-2.5 py-1 rounded text-xs font-bold bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30">
                 <svg className="w-3 h-3 mr-1.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"></path></svg>
                 AI Signal Active
               </div>
             </div>
             <div className="w-20 h-20 rounded-full border-[6px] border-[#10B981] flex items-center justify-center shadow-sm">
               <span className="text-[#10B981] font-black text-xl tracking-wider">ON</span>
             </div>
          </div>
        </div>

      </div>

      {/* Bottom Horizontal Row of 4 Zone Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Zone 1 */}
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-6">
             <h4 className="font-bold text-[#0F172A] text-lg">Zone 1</h4>
             <span className="px-2 py-1 bg-[#10B981]/15 text-[#10B981] rounded text-xs font-bold tracking-wider">LOW</span>
          </div>
          <div className="flex justify-between items-end">
             <div className="flex flex-col">
               <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">Vehicles</span>
               <span className="text-3xl font-bold text-[#0F172A] tabular-nums mt-1">342</span>
             </div>
             {/* Chart */}
             <div className="flex items-end gap-1.5 h-12 w-28">
               <div className="w-full bg-[#10B981] rounded-t" style={{height: '40px'}}></div>
               <div className="w-full bg-[#10B981]/40 rounded-t" style={{height: '25px'}}></div>
               <div className="w-full bg-[#10B981]/40 rounded-t" style={{height: '30px'}}></div>
               <div className="w-full bg-[#10B981]/40 rounded-t" style={{height: '15px'}}></div>
               <div className="w-full bg-[#10B981]/40 rounded-t" style={{height: '20px'}}></div>
             </div>
          </div>
        </div>

        {/* Zone 2 */}
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-6">
             <h4 className="font-bold text-[#0F172A] text-lg">Zone 2</h4>
             <span className="px-2 py-1 bg-[#F59E0B]/15 text-[#F59E0B] rounded text-xs font-bold tracking-wider">MEDIUM</span>
          </div>
          <div className="flex justify-between items-end">
             <div className="flex flex-col">
               <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">Vehicles</span>
               <span className="text-3xl font-bold text-[#0F172A] tabular-nums mt-1">890</span>
             </div>
             {/* Chart */}
             <div className="flex items-end gap-1.5 h-12 w-28">
               <div className="w-full bg-[#F59E0B]/40 rounded-t" style={{height: '28px'}}></div>
               <div className="w-full bg-[#F59E0B] rounded-t" style={{height: '40px'}}></div>
               <div className="w-full bg-[#F59E0B]/40 rounded-t" style={{height: '35px'}}></div>
               <div className="w-full bg-[#F59E0B]/40 rounded-t" style={{height: '40px'}}></div>
               <div className="w-full bg-[#F59E0B]/40 rounded-t" style={{height: '15px'}}></div>
             </div>
          </div>
        </div>

        {/* Zone 3 */}
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-6">
             <h4 className="font-bold text-[#0F172A] text-lg">Zone 3</h4>
             <span className="px-2 py-1 bg-[#F59E0B]/15 text-[#F59E0B] rounded text-xs font-bold tracking-wider">MEDIUM</span>
          </div>
          <div className="flex justify-between items-end">
             <div className="flex flex-col">
               <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">Vehicles</span>
               <span className="text-3xl font-bold text-[#0F172A] tabular-nums mt-1">756</span>
             </div>
             {/* Chart */}
             <div className="flex items-end gap-1.5 h-12 w-28">
               <div className="w-full bg-[#F59E0B]/40 rounded-t" style={{height: '35px'}}></div>
               <div className="w-full bg-[#F59E0B]/40 rounded-t" style={{height: '40px'}}></div>
               <div className="w-full bg-[#F59E0B]/40 rounded-t" style={{height: '38px'}}></div>
               <div className="w-full bg-[#F59E0B]/40 rounded-t" style={{height: '30px'}}></div>
               <div className="w-full bg-[#F59E0B] rounded-t" style={{height: '42px'}}></div>
             </div>
          </div>
        </div>

        {/* Zone 4 */}
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-6">
             <h4 className="font-bold text-[#0F172A] text-lg">Zone 4</h4>
             <span className="px-2 py-1 bg-[#EF4444]/15 text-[#EF4444] rounded text-xs font-bold tracking-wider">HIGH</span>
          </div>
          <div className="flex justify-between items-end">
             <div className="flex flex-col">
               <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">Vehicles</span>
               <span className="text-3xl font-bold text-[#0F172A] tabular-nums mt-1">1,204</span>
             </div>
             {/* Chart */}
             <div className="flex items-end gap-1.5 h-12 w-28">
               <div className="w-full bg-[#EF4444]/40 rounded-t" style={{height: '40px'}}></div>
               <div className="w-full bg-[#EF4444]/40 rounded-t" style={{height: '48px'}}></div>
               <div className="w-full bg-[#EF4444] rounded-t" style={{height: '55px'}}></div>
               <div className="w-full bg-[#EF4444]/40 rounded-t" style={{height: '45px'}}></div>
               <div className="w-full bg-[#EF4444] rounded-t" style={{height: '38px'}}></div>
             </div>
          </div>
        </div>

      </div>

    </div>
  );
}
