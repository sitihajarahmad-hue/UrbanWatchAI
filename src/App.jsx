import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export default function App() {
  const [selectedRegionKey, setSelectedRegionKey] = useState('lahad_datu');

  // Database attributes mock (Supabase replica)
  const database = {
    selayang: {
      name: "Selayang",
      state: "Selangor",
      coords: [3.2379, 101.6640],
      zoom: 13,
      summary: { alert_zones: 18, hotspots: 7, area_ha: 19880, risk_score: 85 },
      landUse: [
        { category: "Perumahan & Komersial", pct: 42.5, color: "bg-amber-500" },
        { category: "Hutan Simpan & Cerun", pct: 36.0, color: "bg-emerald-500" },
        { category: "Infrastruktur & Lapang", pct: 21.5, color: "bg-indigo-500" }
      ],
      warnings: [
        { type: "CRITICAL", title: "Cerun Bukit Bandar Baru Selayang", desc: "Risiko Hakisan Cerun & Pembangunan Tepu" },
        { type: "HIGH", title: "Zon Infill Batu Caves", desc: "Pencerobohan Kawasan Penampan Industri" }
      ]
    },
    kuantan: {
      name: "Kuantan",
      state: "Pahang",
      coords: [3.8077, 103.3260],
      zoom: 13,
      summary: { alert_zones: 12, hotspots: 4, area_ha: 22140, risk_score: 74 },
      landUse: [
        { category: "Industri & Pelabuhan (MCKIP)", pct: 28.0, color: "bg-red-500" },
        { category: "Perumahan Bandar", pct: 34.0, color: "bg-amber-500" },
        { category: "Badan Air & Pesisir Pantai", pct: 38.0, color: "bg-cyan-500" }
      ],
      warnings: [
        { type: "CRITICAL", title: "Zon Pesisir Pantai Beserah", desc: "Risiko Hakisan Pantai & Limpahan Banjir" },
        { type: "MEDIUM", title: "Kawasan Perindustrian Gebeng", desc: "Kualiti Pelepasan & Zon Penampan Perumahan" }
      ]
    },
    lahad_datu: {
      name: "Lahad Datu",
      state: "Sabah",
      coords: [5.0268, 118.3270],
      zoom: 12,
      summary: { alert_zones: 24, hotspots: 9, area_ha: 73220, risk_score: 89 },
      landUse: [
        { category: "Pertanian & Kelapa Sawit", pct: 58.0, color: "bg-lime-500" },
        { category: "Hutan Bakau & Simpanan", pct: 32.0, color: "bg-emerald-500" },
        { category: "Bandar & Penempatan", pct: 10.0, color: "bg-amber-500" }
      ],
      warnings: [
        { type: "CRITICAL", title: "Muara Teluk Darvel", desc: "Pengurangan Liputan Bakau & Pencerobohan Zon Pesisir" },
        { type: "HIGH", title: "Sempadan Hutan Simpan Silam", desc: "Perkembangan Pertanian Terhadap Zon Penampan" }
      ]
    }
  };

  const current = database[selectedRegionKey];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            UrbanWatch <span className="text-emerald-400">AI</span>
          </h1>
          <p className="text-xs text-slate-400">Spatial Land Use Pressure & Early Warning Analytics</p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400">Pilih Daerah:</span>
          <select 
            value={selectedRegionKey}
            onChange={(e) => setSelectedRegionKey(e.target.value)}
            className="bg-slate-800 text-sm font-semibold text-emerald-400 px-3 py-1.5 rounded-lg border border-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="lahad_datu">Lahad Datu (Sabah)</option>
            <option value="selayang">Selayang (Selangor)</option>
            <option value="kuantan">Kuantan (Pahang)</option>
          </select>
        </div>
      </header>

      {/* Metrics Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 border-b border-slate-800 bg-slate-900/40">
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
          <p className="text-xs text-slate-400">Alert Zones</p>
          <p className="text-2xl font-bold text-amber-400">{current.summary.alert_zones}</p>
        </div>
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
          <p className="text-xs text-slate-400">High Pressure Hotspots</p>
          <p className="text-2xl font-bold text-red-400">{current.summary.hotspots}</p>
        </div>
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
          <p className="text-xs text-slate-400">Total Area Tracked</p>
          <p className="text-2xl font-bold text-emerald-400">{current.summary.area_ha.toLocaleString()} Ha</p>
        </div>
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
          <p className="text-xs text-slate-400">Land Pressure Score</p>
          <p className="text-2xl font-bold text-cyan-400">{current.summary.risk_score}/100</p>
        </div>
      </div>

      {/* Main Grid Content */}
      <main className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Map Canvas */}
        <div className="lg:col-span-2 bg-slate-900 rounded-xl border border-slate-800 overflow-hidden relative min-h-[450px]">
          <MapContainer 
            key={selectedRegionKey}
            center={current.coords} 
            zoom={current.zoom} 
            scrollWheelZoom={true}
            className="w-full h-full min-h-[450px] z-0"
          >
            <TileLayer
              url="https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
              attribution='&copy; Google Maps Satellite'
            />
            <TileLayer
              url="https://mt1.google.com/vt/lyrs=h&x={x}&y={y}&z={z}"
            />
            <Circle 
              center={current.coords} 
              radius={1200} 
              pathOptions={{ color: 'red', fillColor: 'red', fillOpacity: 0.3 }} 
            />
            <Marker position={current.coords}>
              <Popup>
                <div className="font-bold text-slate-900">{current.name}, {current.state}</div>
                <div className="text-xs text-red-600 font-semibold">Zon Amaran Guna Tanah Utama</div>
              </Popup>
            </Marker>
          </MapContainer>
        </div>

        {/* Right Panel: Breakdown & Warnings */}
        <div className="space-y-6 flex flex-col justify-between">
          
          {/* Taburan Guna Tanah */}
          <div className="bg-slate-900/80 rounded-xl border border-slate-800 p-5">
            <h2 className="text-sm font-bold text-slate-200 mb-3">Taburan Guna Tanah ({current.name})</h2>
            <div className="space-y-3">
              {current.landUse.map((item, idx) => (
                <div key={idx}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-300">{item.category}</span>
                    <span className="font-semibold text-slate-100">{item.pct}%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2">
                    <div className={`${item.color} h-2 rounded-full`} style={{ width: `${item.pct}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Amaran Berkeutamaan */}
          <div className="bg-slate-900/80 rounded-xl border border-slate-800 p-5 flex-1">
            <h2 className="text-sm font-bold text-slate-200 mb-3">Amaran Spatial Wilayah</h2>
            <div className="space-y-3">
              {current.warnings.map((warn, idx) => (
                <div key={idx} className="p-3 bg-slate-800/60 rounded-lg border border-slate-700/60">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                    warn.type === 'CRITICAL' 
                      ? 'bg-red-500/20 text-red-400 border-red-500/30' 
                      : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                  }`}>
                    {warn.type}
                  </span>
                  <h3 className="text-sm font-semibold text-slate-100 mt-1.5">{warn.title}</h3>
                  <p className="text-xs text-slate-400 mt-1">{warn.desc}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
