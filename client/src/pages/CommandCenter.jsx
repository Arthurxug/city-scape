import React, { useEffect, useState } from 'react';
import { Activity, AlertTriangle, Radio, TrendingUp, Wind, Zap, Navigation } from 'lucide-react';
import ConflictDetector from '../components/ConflictDetector';

export default function CommandCenter() {
  const [aircraftData, setAircraftData] = useState([]);
  const [selectedAircraft, setSelectedAircraft] = useState(null);
  const [weatherAlerts, setWeatherAlerts] = useState([]);
  const [sectorData, setSectorData] = useState({});
  const [radarSweep, setRadarSweep] = useState(0);

  // Generate aircraft data
  useEffect(() => {
    const aircraft = [
      { id: 'AC001', callsign: 'SKY101', aircraft: 'B777', origin: 'JFK', destination: 'LHR', altitude: 35000, speed: 480, heading: 45, fuel: 65, status: 'cruise' },
      { id: 'AC002', callsign: 'JET202', aircraft: 'A350', origin: 'ORD', destination: 'CDG', altitude: 28000, speed: 510, heading: 180, fuel: 72, status: 'cruise' },
      { id: 'AC003', callsign: 'AIR303', aircraft: 'B787', origin: 'LAX', destination: 'NRT', altitude: 32000, speed: 490, heading: 270, fuel: 58, status: 'cruise' },
      { id: 'AC004', callsign: 'CARGO04', aircraft: 'B747F', origin: 'ANC', destination: 'PDX', altitude: 25000, speed: 420, heading: 90, fuel: 45, status: 'approach' },
      { id: 'AC005', callsign: 'MED505', aircraft: 'CL604', origin: 'BOS', destination: 'MIA', altitude: 10000, speed: 280, heading: 135, fuel: 25, status: 'landing' },
      { id: 'AC006', callsign: 'EXEC06', aircraft: 'G650', origin: 'MIA', destination: 'DEN', altitude: 21000, speed: 450, heading: 315, fuel: 52, status: 'cruise' },
    ];

    aircraft.forEach((ac) => {
      const angle = Math.random() * 360 * (Math.PI / 180);
      const radius = Math.random() * 0.4 + 0.1;
      ac.x = 50 + Math.cos(angle) * radius * 40;
      ac.y = 50 + Math.sin(angle) * radius * 40;
    });

    setAircraftData(aircraft);

    setSectorData({
      totalCapacity: 25,
      currentLoad: 18,
      avgAltitude: 27400,
      avgSpeed: 440,
    });

    setWeatherAlerts([
      { id: 1, type: 'thunderstorm', location: 'Sector 3', severity: 'high', message: 'Severe thunderstorms developing near 34°N 81°W' },
      { id: 2, type: 'wind', location: 'Sector 1', severity: 'medium', message: 'Wind shear reported at 8,000 ft' },
      { id: 3, type: 'visibility', location: 'Sector 2', severity: 'low', message: 'Reduced visibility due to fog' },
    ]);
  }, []);

  // Animate radar
  useEffect(() => {
    const sweepInterval = setInterval(() => {
      setRadarSweep((prev) => (prev + 6) % 360);
    }, 50);
    return () => clearInterval(sweepInterval);
  }, []);

  const statusColorMap = {
    cruise: '#4CAF7D',
    approach: '#C8A96E',
    landing: '#E05252',
  };

  const severityColor = {
    high: '#E05252',
    medium: '#C8A96E',
    low: '#4CAF7D',
  };

  return (
    <div className="p-6 max-w-full mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shadow-lg shadow-emerald-500/50"></div>
            <h1 className="font-display font-black text-3xl text-text-primary">Operations Center</h1>
          </div>
          <p className="font-mono text-sm text-text-muted">Comprehensive airspace management and real-time monitoring</p>
        </div>
        <div className="flex items-center gap-2 bg-bg-elevated border border-gold/20 rounded px-4 py-2">
          <Activity size={16} className="text-gold" />
          <span className="font-mono text-sm">{aircraftData.length} Aircraft Tracked</span>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Main Radar */}
        <div className="lg:col-span-3 card p-6 border-gold/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Navigation size={16} className="text-gold" />
              <p className="label">Primary Radar — Sector Operations</p>
            </div>
            <div className="text-xs font-mono text-text-muted">Range: 100 NM</div>
          </div>

          {/* Radar Display */}
          <div className="relative aspect-square bg-gradient-to-br from-bg-elevated to-bg-base rounded border border-gold/10 p-4 mb-4">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              {/* Grid circles */}
              {[0.2, 0.4, 0.6, 0.8].map((scale) => (
                <circle
                  key={scale}
                  cx="50"
                  cy="50"
                  r={scale * 40}
                  fill="none"
                  stroke="#C8A96E"
                  strokeWidth="0.3"
                  opacity="0.2"
                />
              ))}

              {/* Compass */}
              <g opacity="0.4">
                <line x1="50" y1="8" x2="50" y2="15" stroke="#C8A96E" strokeWidth="0.8" />
                <line x1="50" y1="85" x2="50" y2="92" stroke="#C8A96E" strokeWidth="0.8" />
                <line x1="8" y1="50" x2="15" y2="50" stroke="#C8A96E" strokeWidth="0.8" />
                <line x1="85" y1="50" x2="92" y2="50" stroke="#C8A96E" strokeWidth="0.8" />
                <text x="50" y="8" textAnchor="middle" fontSize="2.5" fill="#C8A96E" opacity="0.7">N</text>
              </g>

              {/* Radar sweep */}
              <g opacity="0.2">
                <path
                  d={`M 50 50 L ${50 + 40 * Math.cos((radarSweep - 90) * (Math.PI / 180))} ${
                    50 + 40 * Math.sin((radarSweep - 90) * (Math.PI / 180))
                  } A 40 40 0 0 1 ${50 + 40 * Math.cos((radarSweep - 90 + 40) * (Math.PI / 180))} ${
                    50 + 40 * Math.sin((radarSweep - 90 + 40) * (Math.PI / 180))
                  } Z`}
                  fill="#C8A96E"
                />
              </g>

              {/* Aircraft */}
              {aircraftData.map((ac) => (
                <g
                  key={ac.id}
                  onClick={() => setSelectedAircraft(ac)}
                  style={{ cursor: 'pointer' }}
                  opacity={selectedAircraft?.id === ac.id ? 1 : 0.8}
                >
                  <circle
                    cx={ac.x}
                    cy={ac.y}
                    r="1.5"
                    fill={statusColorMap[ac.status]}
                    opacity="0.95"
                  />
                  <line
                    x1={ac.x}
                    y1={ac.y}
                    x2={ac.x - Math.cos((ac.heading) * (Math.PI / 180)) * 3}
                    y2={ac.y - Math.sin((ac.heading) * (Math.PI / 180)) * 3}
                    stroke={statusColorMap[ac.status]}
                    strokeWidth="0.8"
                    opacity="0.7"
                  />
                  {selectedAircraft?.id === ac.id && (
                    <circle cx={ac.x} cy={ac.y} r="2.5" fill="none" stroke={statusColorMap[ac.status]} strokeWidth="0.5" opacity="0.5" />
                  )}
                </g>
              ))}
            </svg>
          </div>

          {/* Aircraft List */}
          <div className="space-y-2 max-h-40 overflow-y-auto">
            <p className="label text-[10px] px-2">Aircraft Index</p>
            {aircraftData.map((ac) => (
              <div
                key={ac.id}
                onClick={() => setSelectedAircraft(ac)}
                className={`p-2 rounded cursor-pointer transition-all text-xs font-mono ${
                  selectedAircraft?.id === ac.id
                    ? 'bg-gold/10 border border-gold/40'
                    : 'bg-bg-elevated border border-white/5 hover:border-white/10'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-gold font-semibold">{ac.callsign}</span>
                  <span style={{ color: statusColorMap[ac.status] }} className="text-[10px] uppercase">
                    {ac.status}
                  </span>
                </div>
                <div className="text-text-muted mt-1 text-[10px]">
                  FL{Math.floor(ac.altitude / 100).toString().padStart(3, '0')} | {ac.speed}kt | Hdg {ac.heading}°
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel */}
        <div className="lg:col-span-2 space-y-4">
          {/* Sector Status */}
          <div className="card p-4">
            <p className="label mb-3">Sector Status</p>
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-text-muted">Capacity Load</span>
                  <span className="font-mono font-semibold text-gold">
                    {sectorData.currentLoad}/{sectorData.totalCapacity}
                  </span>
                </div>
                <div className="w-full bg-bg-elevated rounded h-2 overflow-hidden border border-white/5">
                  <div
                    className="bg-gold h-full transition-all"
                    style={{ width: `${(sectorData.currentLoad / sectorData.totalCapacity) * 100}%` }}
                  ></div>
                </div>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-white/5">
                <span className="text-xs text-text-muted">Avg Altitude</span>
                <span className="font-mono font-semibold text-text-primary">
                  FL{Math.floor(sectorData.avgAltitude / 100).toString().padStart(3, '0')}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-muted">Avg Speed</span>
                <span className="font-mono font-semibold text-text-primary">{sectorData.avgSpeed}kt</span>
              </div>
            </div>
          </div>

          {/* Selected Aircraft Details */}
          {selectedAircraft && (
            <div className="card p-4 border-gold/20">
              <p className="label mb-3 text-gold">{selectedAircraft.callsign}</p>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-text-muted">Aircraft Type</span>
                  <span className="font-mono">{selectedAircraft.aircraft}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-muted">Origin → Dest</span>
                  <span className="font-mono">{selectedAircraft.origin} → {selectedAircraft.destination}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-muted">Altitude</span>
                  <span className="font-mono text-emerald-400">FL{Math.floor(selectedAircraft.altitude / 100).toString().padStart(3, '0')}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-muted">Speed</span>
                  <span className="font-mono">{selectedAircraft.speed}kt</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-muted">Fuel</span>
                  <span className="font-mono text-emerald-400">{selectedAircraft.fuel}%</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-white/5 mt-2">
                  <span className="text-text-muted">Status</span>
                  <span className="font-mono" style={{ color: statusColorMap[selectedAircraft.status] }}>
                    {selectedAircraft.status.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Weather Alerts */}
          <div className="card p-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle size={14} className="text-gold" />
              <p className="label">Weather Alerts</p>
              <span className="text-xs font-mono text-text-muted ml-auto">{weatherAlerts.length}</span>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {weatherAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="p-2 rounded border text-xs"
                  style={{
                    borderColor: severityColor[alert.severity] + '40',
                    backgroundColor: severityColor[alert.severity] + '05',
                  }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono font-semibold" style={{ color: severityColor[alert.severity] }}>
                      {alert.type.toUpperCase()}
                    </span>
                    <span className="text-text-faint text-[10px]">{alert.location}</span>
                  </div>
                  <p className="text-text-muted">{alert.message}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Control Actions */}
          <div className="card p-4 space-y-2">
            <button className="w-full btn-primary text-xs flex items-center justify-center gap-2 py-2">
              <Radio size={12} /> Priority Alert
            </button>
            <button className="w-full btn-secondary text-xs flex items-center justify-center gap-2 py-2">
              <Zap size={12} /> Escalate
            </button>
          </div>
        </div>
      </div>

      {/* Conflict Detection Panel */}
      <div className="mt-6">
        <ConflictDetector />
      </div>
    </div>
  );
}
