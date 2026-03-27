import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function MyFines() {
  const [fines, setFines] = useState([]);

  const fetchFines = async () => {
    try {
      const { data } = await axios.get('/api/fines');
      setFines(data);
    } catch (error) {
      toast.error('Failed to load fines');
    }
  };

  useEffect(() => {
    fetchFines();

    const socket = io('http://localhost:5000');
    
    // Listen for new fines that might belong to the current user
    socket.on('new-fine', () => {
       fetchFines();
    });

    return () => {
       socket.disconnect();
    };
  }, []);

  const handlePay = async (id) => {
    try {
      await axios.post(`/api/fines/${id}/pay`);
      toast.success('Fine paid successfully');
      fetchFines();
    } catch (error) {
      toast.error('Payment failed');
    }
  };

  const totalOutstanding = fines
    .filter(f => f.status === 'pending')
    .reduce((sum, f) => sum + Number(f.amount), 0);

  return (
    <div className="bg-[#F8FAFC] min-h-screen py-8 px-4 font-sans text-[#0F172A]">
      <div className="max-w-[1100px] mx-auto w-full">
        
        {/* Page Heading */}
        <h1 className="text-2xl font-black text-[#0F172A] mb-8 tracking-tight">My Fines & Violations</h1>

        {/* Summary High-Precision Card */}
        <div className="bg-white rounded-2xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] border border-gray-100 p-8 flex flex-col md:flex-row items-center justify-between gap-6 mb-10">
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Total Outstanding</p>
            <h3 className="text-5xl font-black text-[#EF4444] tabular-nums tracking-tighter">₹{totalOutstanding.toFixed(2)}</h3>
          </div>
          
          <button className={`bg-[#0F172A] text-white px-10 py-4 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 active:scale-95 ${totalOutstanding === 0 ? 'opacity-30 pointer-events-none' : ''}`}>
             Pay All Fines
          </button>
        </div>

        {/* Fines Table Container */}
        <div className="bg-white rounded-3xl shadow-[0_1px_10px_-2px_rgba(0,0,0,0.05)] border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-white border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]">
                <tr>
                  <th className="px-8 py-6">Fine ID</th>
                  <th className="px-8 py-6">Violation Type</th>
                  <th className="px-8 py-6">Location</th>
                  <th className="px-8 py-6">Date</th>
                  <th className="px-8 py-6">Amount</th>
                  <th className="px-8 py-6">Status</th>
                  <th className="px-8 py-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {fines.map((fine) => {
                  const isPending = fine.status === 'pending';
                  
                  return (
                    <tr 
                      key={fine._id} 
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-8 py-6 font-bold text-gray-500 text-xs">
                        {fine.fineId}
                      </td>
                      <td className="px-8 py-6 font-bold text-[#0F172A]">
                         {fine.violationType.replace(/_/g, ' ')}
                      </td>
                      <td className="px-8 py-6 text-gray-500 font-medium">
                        {fine.location?.name || fine.location?.address || 'N/A'}
                      </td>
                      <td className="px-8 py-6 text-gray-500 font-medium whitespace-nowrap">
                        {new Date(fine.issuedAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-8 py-6 font-black text-[#0F172A] tabular-nums">
                        ₹{fine.amount}
                      </td>
                      <td className="px-8 py-6">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                          isPending 
                          ? 'bg-red-50 text-red-500' 
                          : 'bg-green-50 text-green-500'
                        }`}>
                          {fine.status}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        {isPending ? (
                          <button 
                            onClick={() => handlePay(fine._id)}
                            className="text-[#F59E0B] font-black text-[10px] uppercase tracking-widest hover:text-amber-600 underline underline-offset-4 decoration-2">
                             Pay Now
                          </button>
                        ) : (
                          <span className="text-gray-300 font-black text-[10px] uppercase tracking-widest italic">Cleared</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
                {fines.length === 0 && (
                  <tr>
                    <td colSpan="7" className="px-8 py-20 text-center flex-col">
                      <div className="text-gray-300 font-black text-xs uppercase tracking-[0.2em]">No fines found.</div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
