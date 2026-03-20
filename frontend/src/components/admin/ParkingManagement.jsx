import React from 'react';

export default function ParkingManagement() {
  return (
    <div className="bg-[#F8FAFC] min-h-screen p-6 font-sans text-[#0F172A]">
      
      {/* Top Row: 4 Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Total Zones */}
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 font-medium tracking-wide">Total Zones</p>
            <h2 className="text-3xl font-bold mt-1 tabular-nums">14</h2>
          </div>
          <div className="w-10 h-10 rounded bg-slate-100 flex items-center justify-center text-slate-500">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
          </div>
        </div>

        {/* Occupied Slots */}
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 flex flex-col justify-center">
          <div className="flex justify-between items-end mb-2">
            <div>
              <p className="text-sm text-gray-500 font-medium tracking-wide">Occupied Slots</p>
              <h2 className="text-3xl font-bold mt-1 tabular-nums">842 <span className="text-lg text-gray-400 font-normal">/ 1,200</span></h2>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-[#EF4444] h-2 rounded-full" style={{ width: '70%' }}></div>
          </div>
        </div>

        {/* Illegal Parking Alerts */}
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 font-medium tracking-wide">Illegal Parking Alerts</p>
            <h2 className="text-3xl font-bold mt-1 tabular-nums">24</h2>
          </div>
          <div className="px-3 py-1 bg-red-100 text-[#EF4444] rounded-full text-xs font-bold tracking-wide">
            +6 NEW
          </div>
        </div>

        {/* Revenue Today */}
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 font-medium tracking-wide">Revenue Today</p>
            <h2 className="text-3xl font-bold mt-1 tabular-nums">₹42.5K</h2>
          </div>
          <div className="flex items-center text-[#10B981] bg-green-50 px-2.5 py-1 rounded-full border border-green-100">
             <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
             <span className="font-bold text-sm">8%</span>
          </div>
        </div>
      </div>

      {/* 2-Column Layout */}
      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Left Column (55%) - Map Grid */}
        <div className="lg:w-[55%] flex flex-col gap-4">
          <div className="flex gap-2 mb-2">
             <button className="px-4 py-1.5 rounded-full text-sm font-semibold bg-[#0F172A] text-white">Zone 1</button>
             <button className="px-4 py-1.5 rounded-full text-sm font-medium text-gray-500 bg-white border border-gray-200 hover:bg-gray-50 transition-colors">Zone 2</button>
             <button className="px-4 py-1.5 rounded-full text-sm font-medium text-gray-500 bg-white border border-gray-200 hover:bg-gray-50 transition-colors">Zone 3</button>
             <button className="px-4 py-1.5 rounded-full text-sm font-medium text-gray-500 bg-white border border-gray-200 hover:bg-gray-50 transition-colors">Zone 4</button>
          </div>

          <div className="flex-1 bg-[#1E293B] rounded-lg shadow-md p-6 flex flex-col justify-between border border-slate-700 min-h-[400px]">
            
            <div className="grid grid-cols-8 gap-3">
              {/* 3 rows of 8 parking slots */}
              {Array.from({length: 24}).map((_, i) => {
                let colorClass = "bg-[#10B981]"; // free
                if ([2, 4, 5, 9, 11, 14, 15, 18, 19, 21].includes(i)) colorClass = "bg-[#EF4444]"; // occupied
                if ([7, 12, 23].includes(i)) colorClass = "bg-[#F59E0B]"; // violation
                return (
                  <div key={i} className={`${colorClass} h-12 rounded border border-[#0F172A]/50 opacity-90 hover:opacity-100 cursor-pointer flex items-center justify-center transition-opacity shadow-sm`}>
                    <span className="text-[10px] text-white font-mono font-bold opacity-80">A{i+1}</span>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-8 flex gap-6 border-t border-slate-600 pt-5">
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 rounded bg-[#10B981]"></div>
                <span className="text-sm font-medium text-slate-300">Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 rounded bg-[#EF4444]"></div>
                <span className="text-sm font-medium text-slate-300">Occupied</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 rounded bg-[#F59E0B]"></div>
                <span className="text-sm font-medium text-slate-300">Violation Flagged</span>
              </div>
            </div>

          </div>
        </div>

        {/* Right Column (45%) */}
        <div className="lg:w-[45%] flex flex-col gap-6">
          
          {/* Top Half: Recent Activity Feed */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 flex-1">
            <h3 className="font-bold text-lg text-[#0F172A] mb-5">Recent Activity</h3>
            <div className="space-y-5">
              
              <div className="flex gap-4 items-start pb-4 border-b border-gray-50">
                <div className="w-3 h-3 rounded-full bg-[#10B981] mt-1 flex-shrink-0 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                <div className="flex-1">
                  <p className="text-sm text-[#0F172A]">Vehicle <span className="font-bold">MH-13-AB-4821</span> parked at Zone 1, Slot A3</p>
                  <div className="flex justify-between mt-1.5">
                    <span className="text-xs text-gray-400 font-medium">Just now</span>
                    <button className="text-xs font-bold text-[#0F172A] hover:text-[#10B981] uppercase tracking-wider transition-colors">View</button>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 items-start pb-4 border-b border-gray-50">
                <div className="w-3 h-3 rounded-full bg-[#EF4444] mt-1 flex-shrink-0 shadow-[0_0_8px_rgba(239,68,68,0.5)]"></div>
                <div className="flex-1">
                  <p className="text-sm text-[#0F172A]">Unauthorized parking detected at Zone 1, Slot A8</p>
                  <div className="flex justify-between mt-1.5">
                    <span className="text-xs text-gray-400 font-medium">2 mins ago</span>
                    <button className="text-xs font-bold text-[#0F172A] hover:text-[#10B981] uppercase tracking-wider transition-colors">View</button>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 items-start pb-4 border-b border-gray-50">
                <div className="w-3 h-3 rounded-full bg-[#F59E0B] mt-1 flex-shrink-0 shadow-[0_0_8px_rgba(245,158,11,0.5)]"></div>
                <div className="flex-1">
                  <p className="text-sm text-[#0F172A]">Vehicle <span className="font-bold">MH-12-PQ-9090</span> exited Zone 3</p>
                  <div className="flex justify-between mt-1.5">
                    <span className="text-xs text-gray-400 font-medium">5 mins ago</span>
                    <button className="text-xs font-bold text-[#0F172A] hover:text-[#10B981] uppercase tracking-wider transition-colors">View</button>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-3 h-3 rounded-full bg-[#10B981] mt-1 flex-shrink-0 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                <div className="flex-1">
                  <p className="text-sm text-[#0F172A]">Booking confirmed for <span className="font-bold">MH-13-CZ-1122</span></p>
                  <div className="flex justify-between mt-1.5">
                    <span className="text-xs text-gray-400 font-medium">12 mins ago</span>
                    <button className="text-xs font-bold text-[#0F172A] hover:text-[#10B981] uppercase tracking-wider transition-colors">View</button>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Bottom Half: Active Violations Table */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 flex-1">
            <h3 className="font-bold text-lg text-[#0F172A] mb-4">Active Violations</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-400 uppercase tracking-wider text-xs">
                    <th className="pb-3 font-semibold">Slot</th>
                    <th className="pb-3 font-semibold">Vehicle No.</th>
                    <th className="pb-3 font-semibold">Duration</th>
                    <th className="pb-3 font-semibold text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 align-middle">
                  <tr>
                    <td className="py-3.5 font-bold text-[#0F172A]">Z1-A8</td>
                    <td className="py-3.5 tabular-nums text-gray-600 font-medium font-mono">UNKNOWN</td>
                    <td className="py-3.5 text-[#0F172A] font-semibold">45m</td>
                    <td className="py-3.5 text-right">
                      <span className="px-2.5 py-1 bg-red-100 text-[#EF4444] rounded text-xs font-bold whitespace-nowrap">Alert Sent</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3.5 font-bold text-[#0F172A]">Z2-C4</td>
                    <td className="py-3.5 tabular-nums text-gray-600 font-medium font-mono">MH-13-KL-5531</td>
                    <td className="py-3.5 text-[#0F172A] font-semibold">1h 20m</td>
                    <td className="py-3.5 text-right">
                      <span className="px-2.5 py-1 bg-red-100 text-[#EF4444] rounded text-xs font-bold whitespace-nowrap">Alert Sent</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3.5 font-bold text-[#0F172A]">Z4-B2</td>
                    <td className="py-3.5 tabular-nums text-gray-600 font-medium font-mono">MH-02-EE-8800</td>
                    <td className="py-3.5 text-[#0F172A] font-semibold">12m</td>
                    <td className="py-3.5 text-right">
                      <span className="px-2.5 py-1 bg-[#F59E0B]/15 text-[#F59E0B] rounded text-xs font-bold whitespace-nowrap">Pending</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <button className="w-full mt-4 py-2 border border-gray-200 text-[#0F172A] rounded font-bold text-sm hover:bg-slate-50 transition-colors">
              View All Violations
            </button>
          </div>

        </div>
      </div>
      
    </div>
  );
}
