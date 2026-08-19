import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, LayerGroup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export default function App() {
  const [selectedRegionKey, setSelectedRegionKey] = useState('lahad_datu');
  
  // Interactive State for Analysis & Simulation
  const [urbanExpansionRate, setUrbanExpansionRate] = useState(0); // Slider %
  const [showRiskLayer, setShowRiskLayer] = useState(true);
  const [showBufferLayer, setShowBufferLayer] = useState(true);
  const [selectedWarning, setSelectedWarning] = useState(null);

  // Database attributes mock
  const database = {
    selayang: {
      name: "Selayang",
      state: "Selangor",
      coords: [3.2379, 101.6640],
      zoom: 13,
      baseArea: 19880,
      baseRisk: 75,
      landUse: [
        { category: "Perumahan & Komersial", pct: 42.5, type: "urban" },
        { category: "Hutan Simpan & Cerun", pct: 36.0, type: "green" },
        { category: "Infrastruktur & Lapang", pct: 21.5, type: "infra" }
      ],
      warnings: [
        { id: 1, type: "CRITICAL", title: "Cerun Bukit Bandar Baru Selayang", desc: "Risiko Hakisan Cerun & Pembangunan Tepu", mitigation: "Mewajibkan Laporan EIA & Larangan Terowong Cerun >25-darjah" },
        { id: 2, type: "HIGH", title: "Zon Infill Batu Caves", desc: "Pencerobohan Kawasan Penampan Industri", mitigation: "Mewujudkan Zon Penampan Hijau Minimum 50 Meter" }
      ]
    },
    kuantan: {
      name: "Kuantan",
      state: "Pahang",
      coords: [3.8077, 103.3260],
      zoom: 13,
      baseArea: 22140,
      baseRisk: 68,
      landUse: [
        { category: "Industri & Pelabuhan (MCKIP)", pct: 28.0, type: "urban" },
        { category: "Perumahan Bandar", pct: 34.0, type: "urban" },
        { category: "Badan Air & Pesisir Pantai", pct: 38.0, type: "green" }
      ],
      warnings: [
        { id: 3, type: "CRITICAL", title: "Zon Pesisir Pantai Beserah", desc: "Risiko Hakisan Pantai & Limpahan Banjir", mitigation: "Pembinaan Benteng Pemecah Ombak & Pengawalan Pembangunan Pesisir" },
        { id: 4, type: "MEDIUM", title: "Kawasan Perindustrian Gebeng", desc: "Kualiti Pelepasan & Zon Penampan Perumahan", mitigation: "Pengawasan Udara Real-time & Tetapan Zon Penampan Kilang" }
      ]
    },
    lahad_datu: {
      name: "Lahad Datu",
      state: "Sabah",
      coords: [5.0268, 118.3270],
      zoom: 12,
      baseArea: 73220,
      baseRisk: 82,
      landUse: [
        { category: "Pertanian & Kelapa Sawit", pct: 58.0, type: "agri" },
        { category: "Hutan Bakau & Simpanan", pct: 32.0, type: "green" },
        { category: "Bandar & Penempatan", pct: 10.0, type: "urban" }
      ],
      warnings: [
        { id: 5, type: "CRITICAL", title: "Muara Teluk Darvel", desc: "Pengurangan Liputan Bakau & Pencerobohan Zon Pesisir", mitigation: "Pewartaan Perlindungan Bakau & Program Penanaman Semula Bakau" },
        { id: 6, type: "HIGH", title: "Sempadan Hutan Simpan Silam", desc: "Perkembangan Pertanian Terhadap Zon Penampan", mitigation: "Pemasangan Sempadan Digital GIS & Tindakan Penguatkuasaan Hutan" }
      ]
    }
  };

  const current = database[selectedRegionKey];

  // Dynamic Land Use Analysis Calculation based on Simulation Slider
  const simulatedUrban = Math.min(100, (current.landUse.find(l => l.type === 'urban')?.pct || 10) + Number(urbanExpansionRate));
  const simulatedGreen = Math.max(0, (current.landUse.find(l => l.type === 'green')?.pct || 30) - Number(urbanExpansionRate));
  const calculatedRiskScore = Math.min(100, Math.round(current.baseRisk + (urbanExpansionRate * 1.2)));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            UrbanWatch <span className="text-emerald-400">AI</span>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono">ANALYTICS ENGINE</span>
          </h1>
          <p className="text-xs text-slate-400">Spatial Land Use Pressure & Predictive Risk Simulator</p>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-xs text-slate-400">Pilih Daerah Analysis:</label>
          <select 
            value={selectedRegionKey}
            onChange={(e) => {
              setSelectedRegionKey(e.target.value);
              setUrbanExpansionRate(0);
              setSelectedWarning(null);
            }}
            className="bg-slate-800 text-sm font-semibold text-emerald-400 px-3 py-1.5 rounded-lg border border-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="lahad_datu">Lahad Datu (Sabah)</option>
            <option value="selayang">Selayang (Selangor)</option>
            <option value="kuantan">Kuantan (Pahang)</option>
          </select>
        </div>
      </header>

      {/* Main Grid Content */}
      <main className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Interactive Control & Analysis Panel */}
        <div className="space-y-6 lg:col-span-1">
          
          {/* SIMULATION TOOL */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-400">Simulasi Pembandaran</h2>
              <span className="text-xs font-mono font-bold text-amber-400">+{urbanExpansionRate}%</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Gunakan slider untuk mensimulasikan kesan penukaran tanah hijau/pertanian kepada kawasan tepubina:
            </p>
            
            <input 
              type="range" 
              min="0" 
              max="25" 
              value={urbanExpansionRate}
              onChange={(e) => setUrbanExpansionRate(e.target.value)}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
            />

            {/* Live Calculation Output */}
            <div className="pt-3 border-t border-slate-800 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Simulasi Zon Tepubina:</span>
                <span className="font-bold text-amber-400">{simulatedUrban.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Baki Zon Hijau/Semulajadi:</span>
                <span className="font-bold text-emerald-400">{simulatedGreen.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between text-xs pt-1">
                <span className="text-slate-400">Skor Indeks Risiko Simulasi:</span>
                <span className={`font-bold ${calculatedRiskScore > 80 ? 'text-red-400' : 'text-cyan-400'}`}>
                  {calculatedRiskScore} / 100
                </span>
              </div>
            </div>
          </div>

          {/* MAP LAYER TOGGLES */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">Penapis Lapisan Peta</h2>
            
            <label className="flex items-center gap-3 text-xs text-slate-300 cursor-pointer">
              <input 
                type="checkbox" 
                checked={showRiskLayer} 
                onChange={(e) => setShowRiskLayer(e.target.checked)}
                className="rounded bg-slate-800 border-slate-700 text-emerald-500 focus:ring-0"
              />
              Zon Risiko & Impak Cerun/Pesisir
            </label>

            <label className="flex items-center gap-3 text-xs text-slate-300 cursor-pointer">
              <input 
                type="checkbox" 
                checked={showBufferLayer} 
                onChange={(e) => setShowBufferLayer(e.target.checked)}
                className="rounded bg-slate-800 border-slate-700 text-emerald-500 focus:ring-0"
              />
              Zon Penampan Ekologi (Buffer)
            </label>
          </div>

        </div>

        {/* Center Interactive Map View */}
        <div className="lg:col-span-2 bg-slate-900 rounded-xl border border-slate-800 overflow-hidden relative min-h-[480px] flex flex-col">
          
          <MapContainer 
            key={selectedRegionKey}
            center={current.coords} 
            zoom={current.zoom} 
            scrollWheelZoom={true}
            className="w-full h-full min-h-[480px] z-0"
          >
            <TileLayer
              url="https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
              attribution='&copy; Google Maps Satellite'
            />
            <TileLayer
              url="https://mt1.google.com/vt/lyrs=h&x={x}&y={y}&z={z}"
            />

            {/* Interactive Layer Group 1: Risk Circles */}
            {showRiskLayer && (
              <LayerGroup>
                <Circle 
                  center={current.coords} 
                  radius={1000 + (urbanExpansionRate * 80)} 
                  pathOptions={{ color: 'red', fillColor: 'red', fillOpacity: 0.35 + (urbanExpansionRate * 0.01) }} 
                />
              </LayerGroup>
            )}

            {/* Interactive Layer Group 2: Buffer Zones */}
            {showBufferLayer && (
              <LayerGroup>
                <Circle 
                  center={current.coords} 
                  radius={2000} 
                  pathOptions={{ color: '#10b981', fillColor: '#10b981', fillOpacity: 0.15, dashArray: '5, 10' }} 
                />
              </LayerGroup>
            )}

            <Marker position={current.coords}>
              <Popup>
                <div className="font-bold text-slate-900">{current.name}, {current.state}</div>
                <div className="text-xs text-red-600 font-semibold">Skor Risiko Terkini: {calculatedRiskScore}/100</div>
              </Popup>
            </Marker>
          </MapContainer>

          {/* Map Overlay Indicator */}
          <div className="absolute top-4 right-4 bg-slate-950/80 backdrop-blur border border-slate-800 px-3 py-2 rounded-lg z-[500] text-xs space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block"></span>
              <span className="text-slate-300">Zon Risiko Tinggi</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
              <span className="text-slate-300">Zon Penampan Ekologi</span>
            </div>
          </div>
        </div>

        {/* Right Panel: Detailed Spatial Warnings & Mitigations */}
        <div className="lg:col-span-1 space-y-4 flex flex-col justify-between">
          <div className="bg-slate-900/80 rounded-xl border border-slate-800 p-5 space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">Analisis Impak & Amaran</h2>
            
            <div className="space-y-3">
              {current.warnings.map((warn) => (
                <div 
                  key={warn.id} 
                  onClick={() => setSelectedWarning(warn)}
                  className={`p-3 rounded-lg border transition cursor-pointer ${
                    selectedWarning?.id === warn.id 
                      ? 'bg-slate-800 border-emerald-500 ring-1 ring-emerald-500' 
                      : 'bg-slate-800/40 border-slate-700/60 hover:border-slate-600'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${
                      warn.type === 'CRITICAL' 
                        ? 'bg-red-500/20 text-red-400 border-red-500/30' 
                        : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                    }`}>
                      {warn.type}
                    </span>
                    <span className="text-[10px] text-emerald-400">Klik untuk Mitigasi &rarr;</span>
                  </div>
                  <h3 className="text-xs font-semibold text-slate-100 mt-2">{warn.title}</h3>
                  <p className="text-[11px] text-slate-400 mt-1">{warn.desc}</p>
                </div>
              ))}
            </div>

            {/* Selected Item Detailed Mitigation Breakdown */}
            {selectedWarning && (
              <div className="mt-4 pt-4 border-t border-slate-800 bg-emerald-950/20 border-emerald-500/30 p-3 rounded-lg">
                <p className="text-[10px] font-bold text-emerald-400 uppercase">Cadangan Pelan Mitigasi Perancangan:</p>
                <p className="text-xs text-slate-200 mt-1 leading-relaxed">{selectedWarning.mitigation}</p>
              </div>
            )}
          </div>

          <div className="bg-slate-900/60 rounded-xl border border-slate-800 p-4 text-center">
            <p className="text-[10px] text-slate-500">UrbanWatch AI Interactive Analytics Platform</p>
          </div>
        </div>

      </main>
    </div>
  );
}
