import React, { useState, useEffect } from 'react';
import { 
  Bot, 
  Cpu, 
  Zap, 
  Shield, 
  Truck, 
  AlertCircle, 
  CheckCircle2, 
  Activity, 
  PieChart, 
  LayoutDashboard,
  Brain,
  Network,
  Radio,
  Command,
  Unlock,
  Lock
} from 'lucide-react';

export default function AIAgentCenter() {
  const [logs, setLogs] = useState([
    { id: 1, agent: 'SITA', action: 'Congestion Analyzed', detail: 'Pattern detected: Textile hub overflow shifting to bypass.', time: '11:45 PM', type: 'warning' },
    { id: 2, agent: 'LogiFlow', action: 'Route Optimized', detail: 'Primary freight lane redirected to Station Road exit.', time: '11:48 PM', type: 'info' },
    { id: 3, agent: 'Guardian', action: 'AI Verification', detail: 'Scanning Area Zone-4 for parking anomalies...', time: '11:50 PM', type: 'success' }
  ]);

  const [activeTab, setActiveTab] = useState('overview');
  const [manualOverride, setManualOverride] = useState(false);
  const [efficiency, setEfficiency] = useState(94);
  const [uptime, setUptime] = useState('00:00:00');

  const [agents, setAgents] = useState({
    sita: { 
      name: 'S.I.T.A.', 
      role: 'Traffic Orchestrator', 
      status: 'Optimal', 
      load: 32, 
      color: 'blue',
      icon: Bot,
      thoughts: 'Prioritizing green-wave for Emergency Vehicle EV-402...'
    },
    logiflow: { 
      name: 'LogiFlow', 
      role: 'Logistics Coordinator', 
      status: 'High Load', 
      load: 78, 
      color: 'purple',
      icon: Truck,
      thoughts: 'Textile exports backlog detected; adjusting buffer zones.'
    },
    guardian: { 
      name: 'Guardian', 
      role: 'Public Safety Agent', 
      status: 'Standby', 
      load: 5, 
      color: 'rose',
      icon: Shield,
      thoughts: 'Scanning CCTV feeds for non-helmet violations...'
    }
  });

  // System Uptime Clock
  useEffect(() => {
    const startTime = Date.now();
    const timer = setInterval(() => {
      const diff = Date.now() - startTime;
      const hours = Math.floor(diff / 3600000).toString().padStart(2, '0');
      const mins = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0');
      const secs = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');
      setUptime(`${hours}:${mins}:${secs}`);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Live Simulation
  useEffect(() => {
    const interval = setInterval(() => {
      // Randomly update agent loads
      setAgents(prev => ({
        ...prev,
        sita: { ...prev.sita, load: Math.min(100, Math.max(10, prev.sita.load + (Math.random() * 10 - 5))) },
        logiflow: { ...prev.logiflow, load: Math.min(100, Math.max(10, prev.logiflow.load + (Math.random() * 14 - 7))) }
      }));

      // Add a new log
      const agentKeys = ['sita', 'logiflow', 'guardian'];
      const actions = ['Neural Scan', 'Policy Update', 'Conflict Resolved', 'Buffer Adjusted'];
      const selectedAgent = agents[agentKeys[Math.floor(Math.random() * 3)]];
      
      const newLog = {
        id: Date.now(),
        agent: selectedAgent.name,
        action: actions[Math.floor(Math.random() * actions.length)],
        detail: selectedAgent.thoughts,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        type: Math.random() > 0.8 ? 'warning' : 'info'
      };

      setLogs(prev => [newLog, ...prev.slice(0, 11)]);
      setEfficiency(prev => Math.min(100, Math.max(90, prev + (Math.random() * 2 - 1))));
    }, 4000);

    return () => clearInterval(interval);
  }, [agents]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-12">
      {/* Dynamic Header */}
      <div className="bg-[#0F172A] text-white p-8 rounded-b-[3rem] shadow-2xl relative overflow-hidden mb-10">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-blue-500/10 to-transparent opacity-50"></div>
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-blue-600/20 rounded-full blur-[100px]"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-blue-600/20 text-blue-400 text-[10px] font-black px-3 py-1 rounded-full border border-blue-500/30 uppercase tracking-widest">
                System Core v4.2.0
              </span>
              <span className="text-slate-600">|</span>
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                 <Radio className="w-3 h-3 animate-pulse" />
                 LIVE: SOLAPUR CENTRAL NERVOUS SYSTEM
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
              AI Agent <span className="text-blue-500">Command Center</span>
            </h1>
            <p className="text-slate-400 mt-4 font-medium max-w-xl text-lg">
              Autonomous multi-agent orchestration layer for textile logistics, traffic flow, and public safety verification.
            </p>
          </div>

          <div className="flex gap-4">
            <div className="bg-slate-800/50 backdrop-blur-md p-6 rounded-3xl border border-slate-700 w-40 text-center">
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">City Efficiency</p>
              <p className="text-3xl font-black text-blue-400">{efficiency.toFixed(1)}%</p>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-md p-6 rounded-3xl border border-slate-700 w-40 text-center">
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">Core Uptime</p>
              <p className="text-3xl font-black text-white font-mono">{uptime}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 space-y-10">
        
        {/* Navigation & Controls */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="bg-white p-1.5 rounded-2xl shadow-sm border border-slate-200 flex gap-1">
            {['overview', 'neural-network', 'decision-logs'].map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                  activeTab === tab 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                }`}
              >
                {tab.replace('-', ' ')}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4">
             <button 
               onClick={() => setManualOverride(!manualOverride)}
               className={`flex items-center gap-3 px-8 py-3 rounded-2xl font-black text-sm transition-all border-2 ${
                 manualOverride 
                   ? 'bg-amber-50 border-amber-500 text-amber-700' 
                   : 'bg-white border-slate-200 text-slate-700 hover:border-blue-500'
               }`}
             >
               {manualOverride ? <Unlock className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
               {manualOverride ? 'MANUAL OVERRIDE ENABLED' : 'SECURE AUTO-PILOT'}
             </button>
             <button className="bg-blue-600 text-white p-3 rounded-2xl shadow-xl hover:scale-105 transition-transform active:scale-95">
                <LayoutDashboard className="w-6 h-6" />
             </button>
          </div>
        </div>

        {activeTab === 'overview' && (
          <>
            {/* Agent Consciousness Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {Object.entries(agents).map(([key, agent]) => (
                <div 
                  key={key} 
                  className={`group bg-white rounded-[2.5rem] p-8 shadow-xl hover:shadow-2xl transition-all duration-500 border border-slate-100 relative overflow-hidden ${
                    manualOverride ? 'opacity-70 grayscale-[0.5]' : ''
                  }`}
                >
                  {/* Decorative Gradient Background */}
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-${agent.color}-500/5 blur-[50px] group-hover:bg-${agent.color}-500/10 transition-all`}></div>
                  
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-8">
                      <div className={`p-5 rounded-3xl bg-${agent.color}-50 text-${agent.color}-600 shadow-inner group-hover:scale-110 transition-transform duration-500`}>
                        <agent.icon className="w-8 h-8" />
                      </div>
                      <div className="text-right">
                        <p className={`text-[10px] font-black uppercase tracking-widest text-${agent.color}-500 mb-1`}>{agent.status}</p>
                        <div className="flex items-center justify-end gap-2">
                           <Activity className={`w-4 h-4 text-${agent.color}-400`} />
                           <span className="text-2xl font-black text-slate-800">{agent.load.toFixed(0)}%</span>
                        </div>
                      </div>
                    </div>

                    <h3 className="text-2xl font-black text-slate-800 mb-1">{agent.name}</h3>
                    <p className="text-sm font-bold text-slate-400 mb-6">{agent.role}</p>

                    {/* Animated Progress Bar */}
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-8">
                      <div 
                        className={`h-full bg-${agent.color}-500 rounded-full transition-all duration-1000`}
                        style={{ width: `${agent.load}%` }}
                      ></div>
                    </div>

                    <div className={`bg-${agent.color}-50/50 rounded-2xl p-5 border border-${agent.color}-100 group-hover:bg-${agent.color}-50 transition-colors`}>
                      <div className="flex items-center gap-2 mb-2">
                        <Brain className={`w-3 h-3 text-${agent.color}-600`} />
                        <span className={`text-[10px] font-black uppercase tracking-tighter text-${agent.color}-600`}>Neural Thought Process</span>
                      </div>
                      <p className="text-sm italic text-slate-600 leading-relaxed font-medium">
                        "{agent.thoughts}"
                      </p>
                    </div>
                  </div>
                  
                  {/* Footer Stats */}
                  <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                     <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Active Requests: {Math.floor(Math.random() * 50) + 10}</span>
                     <button className={`text-${agent.color}-600 text-[10px] font-black uppercase tracking-widest flex items-center gap-1 group-hover:translate-x-1 transition-transform`}>
                        Expand Memory <CheckCircle2 className="w-3 h-3" />
                     </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Interaction Layer: Multi-Agent Logic Logs */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              
              {/* Live Neural Logs */}
              <div className="lg:col-span-8 bg-[#0F172A] rounded-[3rem] shadow-2xl overflow-hidden border border-slate-800 relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-50 pointer-events-none"></div>
                <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50 relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="flex gap-1.5">
                      <div className="w-3.5 h-3.5 rounded-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.4)]"></div>
                      <div className="w-3.5 h-3.5 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.4)]"></div>
                      <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]"></div>
                    </div>
                    <div className="h-6 w-px bg-slate-700 ml-2"></div>
                    <span className="text-[10px] font-black font-mono text-slate-400 uppercase tracking-[0.3em]">solapur_os_v4.log</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                    <span className="text-[10px] font-black font-mono text-emerald-400 tracking-widest">ENCRYPTED FEED ACTIVE</span>
                  </div>
                </div>

                <div className="p-8 font-mono text-sm space-y-5 max-h-[500px] overflow-y-auto custom-scrollbar relative z-10">
                  {logs.map((log) => (
                    <div 
                      key={log.id} 
                      className="flex flex-col md:flex-row md:items-center gap-4 group/item hover:bg-white/5 p-3 rounded-2xl transition-all animate-in slide-in-from-left-4 duration-500"
                    >
                      <span className="text-slate-600 text-[11px] font-bold md:w-32">[{log.time}]</span>
                      <div className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border shrink-0 ${
                        log.agent === 'S.I.T.A.' ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' : 
                        log.agent === 'LogiFlow' ? 'bg-purple-500/10 border-purple-500/30 text-purple-400' :
                        'bg-rose-500/10 border-rose-500/30 text-rose-400'
                      }`}>
                        {log.agent}
                      </div>
                      <div className="flex-1">
                        <span className="text-slate-200 font-bold mr-2">— {log.action}:</span>
                        <span className="text-slate-500 group-hover/item:text-slate-300 transition-colors">{log.detail}</span>
                      </div>
                      <div className="hidden md:block">
                        {log.type === 'warning' ? (
                          <AlertCircle className="w-4 h-4 text-amber-500 opacity-50" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 opacity-50" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Multi-Agent Decision Matrix */}
              <div className="lg:col-span-4 bg-white rounded-[3rem] p-10 shadow-xl border border-slate-100 flex flex-col items-center text-center">
                <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-[2rem] flex items-center justify-center mb-8 shadow-inner">
                   <Network className="w-12 h-12" />
                </div>
                <h3 className="text-2xl font-black text-slate-800 mb-4">Neural Coordination</h3>
                <p className="text-sm font-bold text-slate-400 mb-10 leading-relaxed">
                  Agents aren't just observing; they are **negotiating**. S.I.T.A. verifies with LogiFlow before adjusting signals for freight trucks to ensure a zero-congestion loop.
                </p>

                <div className="w-full space-y-6">
                   <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 bg-white text-emerald-500 rounded-lg flex items-center justify-center shadow-sm">
                            <Activity className="w-4 h-4" />
                         </div>
                         <span className="text-xs font-black text-slate-700 uppercase tracking-tight">Consensus Level</span>
                      </div>
                      <span className="text-sm font-black text-emerald-600">99.8%</span>
                   </div>
                   <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 bg-white text-blue-500 rounded-lg flex items-center justify-center shadow-sm">
                            <PieChart className="w-4 h-4" />
                         </div>
                         <span className="text-xs font-black text-slate-700 uppercase tracking-tight">Decision Rate</span>
                      </div>
                      <span className="text-sm font-black text-blue-600">42/sec</span>
                   </div>
                   <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 bg-white text-purple-500 rounded-lg flex items-center justify-center shadow-sm">
                            <Command className="w-4 h-4" />
                         </div>
                         <span className="text-xs font-black text-slate-700 uppercase tracking-tight">System Authority</span>
                      </div>
                      <span className="text-sm font-black text-purple-600">LVL-7</span>
                   </div>
                </div>

                <div className="mt-12 w-full">
                   <button className="w-full bg-[#0F172A] text-white rounded-2xl py-5 font-black text-sm tracking-[0.2em] uppercase shadow-2xl hover:bg-blue-600 transition-all transform active:scale-95 group">
                      Initialize Neural Sweep
                      <Cpu className="w-4 h-4 inline-block ml-3 group-hover:rotate-90 transition-transform" />
                   </button>
                </div>
              </div>

            </div>
          </>
        )}

      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #1e293b;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #334155;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #475569;
        }
      `}</style>
    </div>
  );
}
