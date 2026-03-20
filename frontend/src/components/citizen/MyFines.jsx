import React, { useState, useEffect } from 'react';
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
      <div className="max-w-[900px] mx-auto w-full">
        
        {/* Page Heading */}
        <h2 className="text-2xl font-bold text-[#0F172A] mb-6">My Fines & Violations</h2>

        {/* Summary Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
          <div>
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Total Outstanding</p>
            <h3 className="text-4xl font-bold text-[#EF4444] mt-1 tabular-nums">₹{totalOutstanding.toFixed(2)}</h3>
          </div>
          {totalOutstanding > 0 && (
            <button className="bg-[#0F172A] text-white px-8 py-3 rounded-md font-bold text-sm hover:bg-slate-800 transition-colors shadow-sm whitespace-nowrap">
              Pay All Fines
            </button>
          )}
        </div>

        {/* Fines Table Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase tracking-wider text-xs">
                <tr>
                  <th className="px-6 py-4 font-medium">Fine ID</th>
                  <th className="px-6 py-4 font-medium">Violation Type</th>
                  <th className="px-6 py-4 font-medium">Location</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Amount</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {fines.map((fine) => {
                  const isPending = fine.status === 'pending';
                  
                  return (
                    <tr 
                      key={fine._id} 
                      className={`transition-colors ${isPending ? 'bg-red-50/40 hover:bg-red-50/60' : 'bg-gray-50 hover:bg-gray-100'}`}
                    >
                      <td className={`px-6 py-5 font-semibold ${isPending ? 'text-[#0F172A]' : 'text-gray-500'}`}>
                        {fine.fineId}
                      </td>
                      <td className={`px-6 py-5 ${isPending ? 'text-[#0F172A]' : 'text-gray-500'}`}>
                        {fine.violationType}
                      </td>
                      <td className={`px-6 py-5 ${isPending ? 'text-gray-600' : 'text-gray-400'}`}>
                        {fine.location}
                      </td>
                      <td className={`px-6 py-5 ${isPending ? 'text-gray-600' : 'text-gray-400'}`}>
                        {new Date(fine.issuedAt).toLocaleDateString()}
                      </td>
                      <td className={`px-6 py-5 font-bold ${isPending ? 'text-[#0F172A]' : 'text-gray-400'} tabular-nums`}>
                        ₹{fine.amount}
                      </td>
                      <td className="px-6 py-5">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${
                          isPending ? 'bg-red-100 text-[#EF4444]' : 'bg-green-100 text-[#10B981]'
                        }`}>
                          {fine.status}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        {isPending ? (
                          <button 
                            onClick={() => handlePay(fine._id)}
                            className="bg-[#F59E0B] text-white px-4 py-1.5 rounded-md font-semibold text-sm hover:bg-amber-600 transition-colors shadow-sm">
                            Pay Now
                          </button>
                        ) : (
                          <button className="border border-gray-300 text-gray-500 px-4 py-1.5 rounded-md font-semibold text-sm hover:bg-gray-200 transition-colors">
                            Receipt
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
                {fines.length === 0 && (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                      No fines found.
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
