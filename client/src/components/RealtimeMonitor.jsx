import React, { useEffect, useState } from 'react';
import { Activity, AlertCircle, CheckCircle, TrendingUp, Zap } from 'lucide-react';

export default function RealtimeMonitor() {
  const [metrics, setMetrics] = useState({
    systemHealth: 98,
    uptime: '99.7%',
    responseTime: 42,
    processedEvents: 15482,
    activeConnections: 247,
  });

  const [eventLog, setEventLog] = useState([]);

  // Generate random event log
  useEffect(() => {
    const eventTypes = [
      { type: 'connection', message: 'New aircraft connection established', icon: 'check' },
      { type: 'radar', message: 'Radar update received', icon: 'activity' },
      { type: 'alert', message: 'Weather alert issued for sector 3', icon: 'alert' },
      { type: 'command', message: 'Command executed successfully', icon: 'check' },
      { type: 'separation', message: 'Separation maintained', icon: 'check' },
    ];

    const newLog = Array.from({ length: 8 }, () => {
      const event = eventTypes[Math.floor(Math.random() * eventTypes.length)];
      const timeOffset = Math.floor(Math.random() * 60);
      return {
        id: Math.random(),
        ...event,
        timestamp: new Date(Date.now() - timeOffset * 1000),
      };
    }).sort((a, b) => b.timestamp - a.timestamp);

    setEventLog(newLog);
  }, []);

  // Update metrics periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics((prev) => ({
        ...prev,
        systemHealth: Math.max(90, Math.min(100, prev.systemHealth + (Math.random() - 0.5) * 2)),
        responseTime: Math.max(30, Math.min(100, prev.responseTime + (Math.random() - 0.5) * 10)),
        processedEvents: prev.processedEvents + Math.floor(Math.random() * 50),
        activeConnections: Math.max(200, Math.min(300, prev.activeConnections + Math.floor(Math.random() * 20 - 10))),
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const iconMap = {
    check: <CheckCircle size={12} className="text-emerald-400" />,
    activity: <Activity size={12} className="text-blue-400" />,
    alert: <AlertCircle size={12} className="text-yellow-400" />,
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
      {/* System Health */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="label text-[10px]">System Health</p>
          <Zap size={12} className="text-gold" />
        </div>
        <div className="relative aspect-square flex items-center justify-center mb-3">
          <svg className="w-full h-full" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="rgba(200, 169, 110, 0.1)"
              strokeWidth="8"
            />
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="#4CAF7D"
              strokeWidth="8"
              strokeDasharray={`${(metrics.systemHealth / 100) * 251.3} 251.3`}
              transform="rotate(-90 50 50)"
              strokeLinecap="round"
            />
            <text
              x="50"
              y="50"
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="20"
              fontWeight="bold"
              fill="#4CAF7D"
            >
              {Math.floor(metrics.systemHealth)}%
            </text>
          </svg>
        </div>
        <p className="text-xs text-text-muted text-center font-mono">Optimal</p>
      </div>

      {/* Uptime */}
      <div className="card p-4">
        <p className="label text-[10px] mb-3">Uptime</p>
        <p className="font-mono text-lg font-semibold text-emerald-400 mb-2">{metrics.uptime}</p>
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[10px] text-text-muted">
            <span>Last 7d</span>
            <span className="text-emerald-400">99.8%</span>
          </div>
          <div className="flex items-center justify-between text-[10px] text-text-muted">
            <span>Last 30d</span>
            <span className="text-emerald-400">99.6%</span>
          </div>
        </div>
      </div>

      {/* Response Time */}
      <div className="card p-4">
        <p className="label text-[10px] mb-3">Response Time</p>
        <div className="mb-3">
          <p className="font-mono text-xl font-semibold text-gold">{Math.floor(metrics.responseTime)}ms</p>
        </div>
        <div className="space-y-1">
          <div className="w-full bg-bg-elevated rounded h-1 overflow-hidden border border-white/5">
            <div
              className="bg-gold h-full transition-all duration-500"
              style={{ width: `${Math.min(100, (metrics.responseTime / 100) * 100)}%` }}
            ></div>
          </div>
          <p className="text-[10px] text-text-faint">Good performance</p>
        </div>
      </div>

      {/* Processed Events */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="label text-[10px]">Events</p>
          <TrendingUp size={12} className="text-blue-400" />
        </div>
        <p className="font-mono text-lg font-semibold text-blue-400 mb-2">
          {(metrics.processedEvents / 1000).toFixed(1)}K
        </p>
        <p className="text-[10px] text-text-muted">Processed today</p>
      </div>

      {/* Active Connections */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="label text-[10px]">Connections</p>
          <Activity size={12} className="text-emerald-400" />
        </div>
        <p className="font-mono text-lg font-semibold text-emerald-400 mb-2">{metrics.activeConnections}</p>
        <p className="text-[10px] text-text-muted">Active now</p>
      </div>
    </div>
  );
}
