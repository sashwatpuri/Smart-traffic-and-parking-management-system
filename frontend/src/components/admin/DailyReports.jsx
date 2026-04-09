import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FileText, 
  Download, 
  Calendar, 
  ChevronRight, 
  AlertCircle, 
  CheckCircle2, 
  TrendingUp, 
  MapPin, 
  IndianRupee,
  Clock,
  Filter,
  Activity,
  ParkingCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function DailyReports() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStats();
  }, [date]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/admin-reports/daily-stats?date=${date}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = () => {
    if (!data) return;

    const headers = ['Category', 'Type/ID', 'Amount', 'Status', 'Location'];
    const rows = [
      ...data.details.fines.map(f => ['E-Challan', f.id, f.amount, f.status, f.location || 'Solapur']),
      ...data.details.bookings.map(b => ['Parking', b.id, b.amount, b.status, b.spot]),
      ...data.details.roadIssues.map(i => ['Citizen Report', i.id, '-', i.status, i.location]),
      ...data.details.illegalParkings.map(p => ['Illegal Parking', p.id, '-', 'Detected', p.location])
    ];

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Solapur_Report_${date}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Report downloaded successfully');
  };

  if (loading && !data) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Daily <span className="text-blue-600">Reports</span></h2>
          <p className="text-slate-500 font-medium">Daily municipal statistics and downloadable data grids.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="date" 
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="pl-12 pr-6 py-3 bg-slate-50 border-none rounded-2xl font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 transition-all outline-none"
            />
          </div>
          <button 
            onClick={downloadCSV}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95"
          >
            <Download className="w-5 h-5" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Revenue', value: `₹${data?.stats.totalRevenue.toLocaleString() || 0}`, icon: IndianRupee, color: 'emerald', detail: `${data?.stats.finesRevenue} Fines + ${data?.stats.parkingRevenue} Parking` },
          { label: 'E-Challans', value: data?.stats.finesCount || 0, icon: FileText, color: 'blue', detail: 'Total violations issued' },
          { label: 'Illegal Parking', value: data?.stats.illegalParkingCount || 0, icon: AlertCircle, color: 'orange', detail: 'AI detection incidents' },
          { label: 'Citizen Reports', value: data?.stats.roadIssuesCount || 0, icon: Activity, color: 'purple', detail: 'Infrastructure issues filed' }
        ].map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-[2rem] border border-slate-50 hover:shadow-xl hover:shadow-slate-100 transition-all group overflow-hidden relative">
            <div className={`absolute top-0 right-0 w-24 h-24 bg-${stat.color}-50 rounded-full translate-x-10 -translate-y-10 group-hover:scale-150 transition-transform duration-500 opacity-50`}></div>
            <div className={`w-12 h-12 bg-${stat.color}-50 text-${stat.color}-600 rounded-2xl flex items-center justify-center mb-4 relative z-10`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <h4 className="text-slate-400 font-black text-[10px] uppercase tracking-widest mb-1 relative z-10">{stat.label}</h4>
            <p className="text-3xl font-black text-slate-900 relative z-10">{stat.value}</p>
            <p className="text-[10px] font-bold text-slate-500 mt-2 relative z-10">{stat.detail}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Area Revenue Breakdown */}
        <div className="lg:col-span-1 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-50">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Area Revenue</h3>
            <TrendingUp className="w-5 h-5 text-emerald-500" />
          </div>
          
          <div className="space-y-4">
            {data && Object.keys(data.areaStats).length > 0 ? Object.entries(data.areaStats).map(([area, stats]) => (
              <div key={area} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between group hover:bg-white hover:shadow-md transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-sm font-black text-slate-800">{area}</h5>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stats.bookings} bookings</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-emerald-600">₹{stats.revenue.toLocaleString()}</p>
                </div>
              </div>
            )) : (
              <div className="text-center py-12 text-slate-300 italic font-bold">No parking revenue data</div>
            )}
          </div>
        </div>

        {/* Detailed Logs Grid */}
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] shadow-sm border border-slate-50 overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex items-center justify-between">
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Daily Activity Log</h3>
            <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl">
              <Filter className="w-4 h-4 text-slate-400" />
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">All Records</span>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Category</th>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Reference</th>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Value</th>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {data && [
                  ...data.details.fines.map(f => ({ ...f, category: 'E-Challan', icon: FileText, color: 'blue' })),
                  ...data.details.bookings.map(b => ({ ...b, category: 'Parking', icon: ParkingCircle, color: 'emerald' })),
                  ...data.details.roadIssues.map(i => ({ ...i, category: 'Report', icon: Activity, color: 'purple' }))
                ].slice(0, 10).map((record, idx) => (
                  <tr key={idx} className="group hover:bg-slate-50/30 transition-all">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 bg-${record.color}-50 text-${record.color}-600 rounded-lg`}>
                          <record.icon className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-black text-slate-800 tracking-tight">{record.category}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <p className="text-xs font-bold text-slate-900">{record.id || record.plate}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">{record.type || 'Standard'}</p>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-xs font-black text-slate-800">{record.amount ? `₹${record.amount}` : '-'}</span>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                        record.status === 'paid' || record.status === 'completed' || record.status === 'solved'
                        ? 'bg-emerald-50 text-emerald-600'
                        : 'bg-orange-50 text-orange-600'
                      }`}>
                        {record.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {(!data || ([...data.details.fines, ...data.details.bookings, ...data.details.roadIssues].length === 0)) && (
              <div className="py-20 text-center text-slate-300 flex flex-col items-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-8 h-8 opacity-20" />
                </div>
                <p className="font-bold text-sm tracking-widest uppercase">No activity recorded for this period</p>
              </div>
            )}
          </div>
          
          <div className="p-6 bg-slate-50/30 text-center border-t border-slate-50">
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center justify-center gap-2">
                <Clock className="w-3 h-3" />
                Real-time data synchronization active
             </p>
          </div>
        </div>
      </div>

    </div>
  );
}
