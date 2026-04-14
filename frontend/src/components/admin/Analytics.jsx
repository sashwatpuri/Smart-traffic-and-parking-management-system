import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell 
} from 'recharts';
import { 
  TrendingUp, Activity, AlertCircle, Users, Car, CreditCard, 
  Clock, Map, Download, Filter, RefreshCcw, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { io } from 'socket.io-client';

export default function Analytics() {
  const [signals, setSignals] = useState([]);
  const [fines, setFines] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();

    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';
    const socket = io(backendUrl);

    socket.on('admin_challan_generated', fetchData);
    socket.on('admin_payment_received', fetchData);
    socket.on('parking_availability_updated', fetchData);

    return () => {
      socket.off('admin_challan_generated');
      socket.off('admin_payment_received');
      socket.off('parking_availability_updated');
      socket.disconnect();
    };
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const [signalsRes, finesRes] = await Promise.all([
        axios.get('/api/traffic/signals', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('/api/fines', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setSignals(signalsRes.data);
      setFines(finesRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setLoading(false);
    }
  };

  const trafficData = signals.map(s => ({
    name: s.signalId,
    vehicles: s.vehicleCount,
    congestion: s.congestionLevel === 'high' ? 3 : s.congestionLevel === 'medium' ? 2 : 1,
    efficiency: Math.floor(Math.random() * 20) + 70 // Mocked efficiency %
  }));

  const fineStats = {
    total: fines.length,
    pending: fines.filter(f => f.status === 'pending').length,
    paid: fines.filter(f => f.status === 'paid').length,
    revenue: fines.filter(f => f.status === 'paid').reduce((sum, f) => sum + f.amount, 0),
    avgFine: fines.length > 0 ? Math.floor(fines.reduce((sum, f) => sum + f.amount, 0) / fines.length) : 0
  };

  const violationTypeData = [
    { name: 'Illegal Parking', value: Math.floor(Math.random() * 40) + 20, color: '#3b82f6' },
    { name: 'Overspeeding', value: Math.floor(Math.random() * 30) + 10, color: '#ef4444' },
    { name: 'Red Light', value: Math.floor(Math.random() * 20) + 5, color: '#f59e0b' },
    { name: 'Helmet', value: Math.floor(Math.random() * 10) + 5, color: '#8b5cf6' }
  ];

  const COLORS = ['#3b82f6', '#ef4444', '#f59e0b', '#8b5cf6'];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-2xl border border-white/20 select-none">
          <p className="text-sm font-black text-slate-900 uppercase tracking-widest mb-2 px-1">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center gap-3 py-1">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></div>
              <p className="text-xs font-bold text-gray-600">
                {entry.name}: <span className="text-slate-900 font-black">{entry.value}</span>
              </p>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const handleExport = () => {
    const headers = ['Signal ID', 'Vehicle Count', 'Congestion Level', 'Efficiency %'];
    const rows = trafficData.map(d => [d.name, d.vehicles, d.congestion === 3 ? 'High' : d.congestion === 2 ? 'Medium' : 'Low', d.efficiency]);
    
    // Add fine stats to the end of CSV
    rows.push([]);
    rows.push(['--- FINES SUMMARY ---']);
    rows.push(['Total Fines', fineStats.total]);
    rows.push(['Pending Fines', fineStats.pending]);
    rows.push(['Revenue Collected', `₹${fineStats.revenue}`]);
    rows.push(['Avg Fine Amount', `₹${fineStats.avgFine}`]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Solapur_Traffic_Analytics_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20 select-none animate-in fade-in duration-700">
      
      {/* 🚀 PREMIUM HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse shadow-[0_0_8px_#2563eb]"></div>
            <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em]">System Intelligence v2.0</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter leading-none">
            Analytics <span className="text-blue-600">Engine</span>
          </h1>
          <p className="text-sm md:text-lg font-bold text-gray-400 mt-3 max-w-xl">
            Real-time multi-dimensional traffic and enforcement data stream for Solapur Smart Grid.
          </p>
        </div>

        <div className="flex items-center gap-3 self-end md:self-center">
            <button key="refresh" onClick={fetchData} className="p-4 bg-white rounded-2xl shadow-sm border border-gray-100 hover:bg-blue-50 hover:text-blue-600 transition-all text-gray-500 group relative">
                <RefreshCcw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-black px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Refresh Data</span>
            </button>
            <button 
                onClick={handleExport}
                className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-slate-200 border border-slate-700/50"
            >
                <div className="w-8 h-8 bg-white/10 rounded-xl flex items-center justify-center border border-white/10">
                    <Download className="w-4 h-4" />
                </div>
                Export Master Data
            </button>
        </div>
      </div>

      {/* 📊 KPI GRID - GLASS MORPHISM STYLE */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {[
          { icon: Activity, label: 'Traffic Load', val: signals.length, sub: 'Active Signals', color: 'blue' },
          { icon: CreditCard, label: 'Total Revenue', val: `₹${fineStats.revenue.toLocaleString()}`, sub: `+12% vs last month`, color: 'emerald', trend: 'up' },
          { icon: Clock, label: 'Pending Fines', val: fineStats.pending, sub: 'Requires Follow-up', color: 'orange' },
          { icon: AlertCircle, label: 'Unpaid Tickets', val: fineStats.total, sub: 'Lifetime count', color: 'purple' }
        ].map((card, i) => (
          <div key={i} className="group relative bg-white rounded-[2rem] p-8 shadow-[0_10px_40px_rgba(0,0,0,0.02)] border border-gray-50 hover:border-blue-100 hover:shadow-[0_20px_50px_rgba(37,99,235,0.05)] transition-all duration-500 overflow-hidden">
            <div className={`absolute -right-6 -top-6 w-32 h-32 bg-${card.color}-50 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700`}></div>
            <div className="relative z-10">
              <div className={`w-12 h-12 bg-${card.color}-50 rounded-2xl flex items-center justify-center text-${card.color}-600 mb-6 group-hover:scale-110 transition-transform`}>
                <card.icon className="w-6 h-6" />
              </div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{card.label}</p>
              <h3 className="text-3xl font-black text-slate-900 tracking-tighter mb-2">{card.val}</h3>
              <div className="flex items-center gap-2">
                 {card.trend === 'up' && <ArrowUpRight className="w-3 h-3 text-emerald-500" />}
                 <p className={`text-xs font-bold ${card.trend === 'up' ? 'text-emerald-500' : 'text-gray-400'}`}>{card.sub}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 📈 COMPREHENSIVE CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Traffic Volume Chart */}
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-8 md:p-10 shadow-[0_10px_40px_rgba(0,0,0,0.02)] border border-gray-50">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-xl font-black text-slate-900 tracking-tighter">Signal Load Distribution</h3>
              <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">Across SOLAPUR MUNICIPAL GRID</p>
            </div>
            <div className="flex gap-2">
                <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase tracking-widest">Active</span>
                <span className="px-3 py-1 bg-gray-50 text-gray-400 rounded-lg text-[10px] font-black uppercase tracking-widest">Weekly</span>
            </div>
          </div>
          
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trafficData}>
                <defs>
                  <linearGradient id="colorVehicles" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 800}}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 800}}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="vehicles" 
                  stroke="#3b82f6" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorVehicles)" 
                  animationDuration={2000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Violation Distribution (Pie Chart) */}
        <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-[0_10px_40px_rgba(0,0,0,0.02)] border border-gray-50 flex flex-col">
          <h3 className="text-xl font-black text-slate-900 tracking-tighter mb-2">Violation Clusters</h3>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-10">Detection source breakdown</p>
          
          <div className="flex-1 min-h-[250px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={violationTypeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={100}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                  animationDuration={1500}
                >
                  {violationTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} cornerRadius={10} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <p className="text-3xl font-black text-slate-900 leading-none">{fineStats.total}</p>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tickets</p>
            </div>
          </div>

          <div className="mt-8 space-y-3">
             {violationTypeData.map((item, i) => (
               <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></div>
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-tighter">{item.name}</span>
                  </div>
                  <span className="text-xs font-black text-slate-900">{item.value}%</span>
               </div>
             ))}
          </div>
        </div>

        {/* Efficiency Matrix - Line Chart */}
        <div className="lg:col-span-3 bg-white rounded-[2.5rem] p-8 md:p-10 shadow-[0_10px_40px_rgba(0,0,0,0.02)] border border-gray-50">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
            <div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tighter">Congestion & Efficiency Matrix</h3>
              <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">Predictive flow analysis vs bottleneck detection</p>
            </div>
            
            <div className="flex items-center gap-6 bg-gray-50/50 p-2 rounded-2xl px-6">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Congestion</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Efficiency %</span>
                </div>
            </div>
          </div>

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trafficData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 800}}
                  dy={10}
                />
                <YAxis 
                   axisLine={false} 
                   tickLine={false} 
                   tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 800}}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                    type="step" 
                    dataKey="congestion" 
                    stroke="#ef4444" 
                    strokeWidth={4} 
                    dot={{ r: 4, fill: '#ef4444', strokeWidth: 2, stroke: '#fff' }} 
                    activeDot={{ r: 8, strokeWidth: 0 }}
                    animationDuration={2500}
                />
                <Line 
                    type="monotone" 
                    dataKey="efficiency" 
                    stroke="#6366f1" 
                    strokeWidth={4} 
                    dot={{ r: 4, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }} 
                    activeDot={{ r: 8, strokeWidth: 0 }}
                    animationDuration={2500}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      <style jsx="true">{`
          @keyframes fade-in {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-in {
            animation: fade-in 0.8s ease-out forwards;
          }
      `}</style>

    </div>
  );
}
