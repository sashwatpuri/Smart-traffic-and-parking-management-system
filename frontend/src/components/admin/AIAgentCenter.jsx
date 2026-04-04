import React, { useState, useEffect } from 'react';
import { Bot, Cpu, Zap, Shield, MessageSquare, Truck, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function AIAgentCenter() {
  const [logs, setLogs] = useState([
    { id: 1, agent: 'SITA', action: 'Congestion Predicted', detail: 'Heavy build-up at Soham Mall Junction expected in 15 mins.', time: '11:45 AM', type: 'warning' },
    { id: 2, agent: 'Logistics-Agent', action: 'Entry Permit Issued', detail: 'Truck MH-13-AX-4522 granted entry to Textile Zone B.', time: '11:48 AM', type: 'info' },
    { id: 3, agent: 'Violation-Agent', action: 'Citizen Report Verified', detail: 'Encroachment at Bhuikot Fort confirmed via AI Vision Scaling.', time: '11:50 AM', type: 'success' }
  ]);

  const [activeAgents, setActiveAgents] = useState({
    sita: { status: 'Optimal', load: '32%', thoughts: 'Normalizing traffic flow at City Pride...' },
    logistics: { status: 'High Demand', load: '78%', thoughts: 'Batching textile truck entries for off-peak...' },
    incident: { status: 'Standby', load: '5%', thoughts: 'Monitoring all feeds for anomalies...' }
  });

  // Simulate live agent activity
  useEffect(() => {
    const interval = setInterval(() => {
      const agents = ['SITA', 'Logistics-Agent', 'Violation-Agent', 'Emergency-Agent'];
      const actions = ['Route Optimized', 'Load Balanced', 'Pattern Detected', 'Signal Adjusted'];
      const details = [
        'Adjusting green wave for Station Road.',
        'Textile hub traffic redirected to bypass.',
        'High pedestrians detected near Siddheshwar Temple.',
        'Manual override suppressed; AI recovered flow.'
      ];
      
      const newLog = {
        id: Date.now(),
        agent: agents[Math.floor(Math.random() * agents.length)],
        action: actions[Math.floor(Math.random() * actions.length)],
        detail: details[Math.floor(Math.random() * details.length)],
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: Math.random() > 0.3 ? 'info' : 'warning'
      };

      setLogs(prev => [newLog, ...prev.slice(0, 9)]);
      
      // Update thoughts
      setActiveAgents(prev => ({
        ...prev,
        sita: { ...prev.sita, thoughts: details[Math.floor(Math.random() * details.length)] }
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">AI Agent Command Center</h2>
          <p className="text-gray-500">Autonomous city management & multi-agent coordination</p>
        </div>
        <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg border border-blue-100">
          <Zap className="w-4 h-4 text-blue-600 fill-blue-600" />
          <span className="text-sm font-bold text-blue-700">AGENTIC SYSTEM ACTIVE</span>
        </div>
      </div>

      {/* Agents Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* SITA Agent */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-blue-300 transition-all border-l-4 border-l-blue-500">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Bot className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-800">S.I.T.A.</h3>
              <p className="text-xs text-gray-400">Solapur Intelligent Traffic Agent</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Status:</span>
              <span className="text-green-600 font-bold">{activeAgents.sita.status}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">System Load:</span>
              <span className="font-mono">{activeAgents.sita.load}</span>
            </div>
            <div className="pt-3 border-t border-gray-50">
              <p className="text-xs font-bold text-blue-600 uppercase mb-1">Current Logic:</p>
              <p className="text-sm italic text-gray-600">"{activeAgents.sita.thoughts}"</p>
            </div>
          </div>
        </div>

        {/* Logistics Agent */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-purple-300 transition-all border-l-4 border-l-purple-500">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-purple-100 rounded-xl">
              <Truck className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-800">LogiFlow Solapur</h3>
              <p className="text-xs text-gray-400">Textile Logistics Coordinator</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Status:</span>
              <span className="text-purple-600 font-bold">{activeAgents.logistics.status}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Permits Active:</span>
              <span className="font-mono">14 Pending / 42 Active</span>
            </div>
            <div className="pt-3 border-t border-gray-50">
              <p className="text-xs font-bold text-purple-600 uppercase mb-1">Current Logic:</p>
              <p className="text-sm italic text-gray-600">"{activeAgents.logistics.thoughts}"</p>
            </div>
          </div>
        </div>

        {/* Incident Agent */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-rose-300 transition-all border-l-4 border-l-rose-500">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-rose-100 rounded-xl">
              <Shield className="w-6 h-6 text-rose-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-800">Guardian Agent</h3>
              <p className="text-xs text-gray-400">Incident & Encroachment Response</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Status:</span>
              <span className="text-blue-600 font-bold">{activeAgents.incident.status}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Violations Filtered:</span>
              <span className="font-mono">18 today</span>
            </div>
            <div className="pt-3 border-t border-gray-50">
              <p className="text-xs font-bold text-rose-600 uppercase mb-1">Current Logic:</p>
              <p className="text-sm italic text-gray-600">"{activeAgents.incident.thoughts}"</p>
            </div>
          </div>
        </div>
      </div>

      {/* Agent Activity Terminal */}
      <div className="bg-[#0F172A] rounded-2xl shadow-xl overflow-hidden border border-slate-800">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
            </div>
            <span className="ml-4 text-xs font-mono text-slate-400">multi-agent-system-logs.sh</span>
          </div>
          <div className="text-xs font-mono text-blue-400">LIVE CONNECTION ACTIVE</div>
        </div>
        <div className="p-6 font-mono text-sm space-y-4 max-h-[400px] overflow-y-auto overflow-x-auto">
          {logs.map((log) => (
            <div key={log.id} className="flex flex-col sm:flex-row gap-2 sm:gap-4 animate-in fade-in slide-in-from-left-2 transition-all text-xs sm:text-sm">
              <span className="text-slate-500 whitespace-nowrap">[{log.time}]</span>
              <span className={`font-bold whitespace-nowrap min-w-[120px] ${
                log.agent === 'SITA' ? 'text-blue-400' : 
                log.agent === 'Logistics-Agent' ? 'text-purple-400' :
                log.agent === 'Violation-Agent' ? 'text-rose-400' : 'text-emerald-400'
              }`}>
                {log.agent}
              </span>
              <span className="text-slate-200 font-bold whitespace-nowrap">— {log.action}:</span>
              <span className="text-slate-400">{log.detail}</span>
              {log.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-500 ml-auto" />}
              {log.type === 'warning' && <AlertCircle className="w-4 h-4 text-amber-500 ml-auto" />}
            </div>
          ))}
        </div>
      </div>

      {/* USP Section for Hackathon */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 rounded-2xl text-white shadow-lg overflow-hidden relative">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Cpu className="w-48 h-48 rotate-12" />
        </div>
        <div className="relative z-10">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Bot className="w-6 h-6" />
            Why this is Unique for Solapur?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20">
              <h4 className="font-bold text-blue-200 mb-1">Cross-Agent Verification</h4>
              <p className="text-sm text-gray-100">Multiple agents audit each other's decisions (e.g., SITA verifies with Logistics before adjusting signal for heavy trucks).</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20">
              <h4 className="font-bold text-blue-200 mb-1">Textile Economy Integration</h4>
              <p className="text-sm text-gray-100">Specially designed logistics agent to prevent city congestion while ensuring Solapur's textile exports remain on schedule.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
