import React, { useEffect, useState } from 'react';
import { AlertTriangle, Radio, TrendingUp, Lock, Power, Zap, Radar } from 'lucide-react';
import RealtimeMonitor from './RealtimeMonitor';

export default function CommandCenterCore() {
  const [aircraftPositions, setAircraftPositions] = useState([]);
  const [activeAlerts, setActiveAlerts] = useState([]);
  const [systemStatus, setSystemStatus] = useState('online');
  const [radarSweep, setRadarSweep] = useState(0);

  // Simulate real-time aircraft data
  useEffect(() => {
    const generateAircraft = () => {
      const aircraft = [];
      const basePositions = [
        { id: 'AC001', callsign: 'SKY101', altitude: 35000, heading: 045, speed: 480, status: 'cruise' },
        { id: 'AC002', callsign: 'JET202', altitude: 28000, heading: 180, speed: 510, status: 'cruise' },
        { id: 'AC003', callsign: 'AIR303', altitude: 32000, heading: 270, speed: 490, status: 'cruise' },
        { id: 'AC004', callsign: 'CARGO04', altitude: 25000, heading: 090, speed: 420, status: 'approach' },
        { id: 'AC005', callsign: 'MED505', altitude: 10000, heading: 135, speed: 280, status: 'landing' },
      ];

      aircraft.forEach((ac) => {
        const angle = (Math.random() * 360) * (Math.PI / 180);
        const radius = Math.random() * 0.4 + 0.1;
        ac.x = 50 + Math.cos(angle) * radius * 40;
        ac.y = 50 + Math.sin(angle) * radius * 40;
      });

      return aircraft;
    };

    setAircraftPositions(generateAircraft());

    const interval = setInterval(() => {
      setAircraftPositions((prev) =>
        prev.map((ac) => ({
          ...ac,
          x: ac.x + (Math.random() - 0.5) * 2,
          y: ac.y + (Math.random() - 0.5) * 2,
          altitude: ac.altitude + (Math.random() - 0.5) * 100,
        }))
      );
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Animate radar sweep
  useEffect(() => {
    const sweepInterval = setInterval(() => {
      setRadarSweep((prev) => (prev + 4) % 360);
    }, 50);
    return () => clearInterval(sweepInterval);
  }, []);

  // Simulate alerts
  useEffect(() => {
    const alerts = [
      { id: 1, type: 'warning', message: 'SKY101 approaching restricted airspace', time: new Date(Date.now() - 2 * 60000) },
      { id: 2, type: 'info', message: 'Weather system moving into sector 3', time: new Date(Date.now() - 5 * 60000) },
      { id: 3, type: 'critical', message: 'MED505 requesting emergency descent', time: new Date(Date.now() - 8 * 60000) },
    ];
    setActiveAlerts(alerts);
  }, []);

  const statusColors = {
    cruise: '#4CAF7D',
    approach: '#C8A96E',
    landing: '#E05252',
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header with System Status */}
      <div className="flex items-start justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shadow-lg shadow-emerald-500/50"></div>
            <h1 className="font-display font-black text-3xl text-text-primary">ATC Command Center</h1>
          </div>
          <p className="font-mono text-sm text-text-muted">Real-time airspace monitoring — Sector Operations</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="card p-4 border-emerald-500/30">
            <p className="label mb-1">System Status</p>
            <p className="text-emerald-400 font-semibold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Online
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Radar Display - Takes up most space */}
        <div className="lg:col-span-3 card p-6 border-gold/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Radar size={16} className="text-gold" />
              <p className="label">Primary Radar Display</p>
            </div>
            <p className="text-text-faint text-xs font-mono">Range: 60 NM</p>
          </div>

          {/* Radar SVG */}
          <div className="relative aspect-square bg-gradient-to-br from-bg-elevated to-bg-base rounded border border-gold/10 p-4">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              {/* Radar circles */}
              {[0.25, 0.5, 0.75].map((scale) => (
                <circle
                  key={scale}
                  cx="50"
                  cy="50"
                  r={scale * 40}
                  fill="none"
                  stroke="#C8A96E"
                  strokeWidth="0.5"
                  opacity="0.3"
                />
              ))}

              {/* Compass rose */}
              <g opacity="0.5">
                <line x1="50" y1="10" x2="50" y2="20" stroke="#C8A96E" strokeWidth="0.5" />
                <line x1="50" y1="80" x2="50" y2="90" stroke="#C8A96E" strokeWidth="0.5" />
                <line x1="10" y1="50" x2="20" y2="50" stroke="#C8A96E" strokeWidth="0.5" />
                <line x1="80" y1="50" x2="90" y2="50" stroke="#C8A96E" strokeWidth="0.5" />
                <text x="50" y="12" textAnchor="middle" fontSize="3" fill="#C8A96E" opacity="0.7">N</text>
              </g>

              {/* Radar sweep */}
              <g opacity="0.15">
                <path
                  d={`M 50 50 L ${50 + 40 * Math.cos((radarSweep - 90) * (Math.PI / 180))} ${
                    50 + 40 * Math.sin((radarSweep - 90) * (Math.PI / 180))
                  } A 40 40 0 0 1 ${50 + 40 * Math.cos((radarSweep - 90 + 30) * (Math.PI / 180))} ${
                    50 + 40 * Math.sin((radarSweep - 90 + 30) * (Math.PI / 180))
                  } Z`}
                  fill="url(#sweepGradient)"
                />
                <defs>
                  <radialGradient id="sweepGradient" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#C8A96E" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#C8A96E" stopOpacity="0" />
                  </radialGradient>
                </defs>
              </g>

              {/* Aircraft symbols */}
              {aircraftPositions.map((ac) => (
                <g key={ac.id}>
                  {/* Blip */}
                  <circle
                    cx={ac.x}
                    cy={ac.y}
                    r="1.2"
                    fill={statusColors[ac.status]}
                    opacity="0.9"
                  />
                  {/* Tail */}
                  <line
                    x1={ac.x}
                    y1={ac.y}
                    x2={ac.x - Math.cos((ac.heading) * (Math.PI / 180)) * 2}
                    y2={ac.y - Math.sin((ac.heading) * (Math.PI / 180)) * 2}
                    stroke={statusColors[ac.status]}
                    strokeWidth="0.8"
                    opacity="0.6"
                  />
                  {/* Data block hover tooltip */}
                  <title>{`${ac.callsign}: FL${Math.floor(ac.altitude / 100).toString().padStart(3, '0')} | ${ac.speed}kt`}</title>
                </g>
              ))}
            </svg>
          </div>

          {/* Aircraft List */}
          <div className="mt-4 pt-4 border-t border-white/5 space-y-2 max-h-32 overflow-y-auto">
            {aircraftPositions.map((ac) => (
              <div key={ac.id} className="flex items-center justify-between text-xs font-mono p-2 rounded bg-bg-elevated hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-2 flex-1">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: statusColors[ac.status] }}></div>
                  <span className="text-gold font-semibold min-w-fit">{ac.callsign}</span>
                  <span className="text-text-muted">| FL{Math.floor(ac.altitude / 100).toString().padStart(3, '0')}</span>
                  <span className="text-text-faint">| {ac.speed}kt</span>
                </div>
                <span className="text-text-muted text-[10px]">{ac.status.toUpperCase()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel - Alerts & Status */}
        <div className="space-y-4">
          {/* Active Alerts */}
          <div className="card p-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle size={14} className="text-gold" />
              <p className="label">Active Alerts</p>
              <span className="text-xs font-mono text-text-muted ml-auto">{activeAlerts.length}</span>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {activeAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-2 rounded text-xs border ${
                    alert.type === 'critical'
                      ? 'bg-red-500/5 border-red-500/30'
                      : alert.type === 'warning'
                      ? 'bg-yellow-500/5 border-yellow-500/30'
                      : 'bg-blue-500/5 border-blue-500/30'
                  }`}
                >
                  <p
                    className={`font-mono font-semibold ${
                      alert.type === 'critical'
                        ? 'text-red-400'
                        : alert.type === 'warning'
                        ? 'text-yellow-400'
                        : 'text-blue-400'
                    }`}
                  >
                    {alert.type.toUpperCase()}
                  </p>
                  <p className="text-text-muted mt-1">{alert.message}</p>
                  <p className="text-text-faint text-[10px] mt-1">
                    {Math.floor((Date.now() - alert.time) / 60000)}m ago
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* System Information */}
          <div className="card p-4 space-y-3">
            <p className="label mb-2">System Information</p>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-muted">Aircraft Tracked</span>
                <span className="font-mono font-semibold text-gold">{aircraftPositions.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-muted">Active Alerts</span>
                <span className="font-mono font-semibold text-gold">{activeAlerts.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-muted">Runway Status</span>
                <span className="font-mono font-semibold text-emerald-400">OPEN</span>
              </div>
            </div>
          </div>

          {/* Control Panel */}
          <div className="card p-4 space-y-3 border-gold/20">
            <p className="label mb-2">Control Panel</p>
            <button className="w-full btn-primary text-xs flex items-center justify-center gap-2">
              <Radio size={12} /> Emergency Broadcast
            </button>
            <button className="w-full btn-secondary text-xs flex items-center justify-center gap-2">
              <Zap size={12} /> Standby Mode
            </button>
          </div>
        </div>
      </div>

      {/* Real-time Monitoring Dashboard */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 px-2">
          <TrendingUp size={14} className="text-gold" />
          <p className="label">System Metrics</p>
        </div>
        <RealtimeMonitor />
      </div>

      {/* Operations Log */}
      <div className="card p-4">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp size={14} className="text-gold" />
          <p className="label">Operations Overview</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: 'Sector Load', value: '78%', color: '#C8A96E' },
            { label: 'Avg Separation', value: '5.2 NM', color: '#4CAF7D' },
            { label: 'Active Corridors', value: '12', color: '#4CAF7D' },
          ].map((stat, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded bg-bg-elevated border border-white/5">
              <span className="text-xs text-text-muted">{stat.label}</span>
              <span className="font-mono font-semibold" style={{ color: stat.color }}>
                {stat.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
