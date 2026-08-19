import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, LayerGroup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export default function App() {
  const [activeTab, setActiveTab] = useState('analytics'); // 'analytics' | 'profile'
  const [selectedRegionKey, setSelectedRegionKey] = useState('lahad_datu');
  
  // Interactive State for Analysis & Simulation
  const [urbanExpansionRate, setUrbanExpansionRate] = useState(0); 
  const [showRiskLayer, setShowRiskLayer] = useState(true);
  const [showBufferLayer, setShowBufferLayer] = useState(true);
  const [selectedWarning, setSelectedWarning] = useState(null);

  // USER PROFILE & SAVED REPORTS STATE
  const [userProfile, setUserProfile] = useState({
    name: "Ahmad Zaki",
    role: "Pegawai Perancang Bandar",
    agency: "Jabatan Perancangan Bandar & Desa (PLANMalaysia)",
    email: "zaki.plan@gov.my",
    bookmarks: ["Lahad Datu (Sabah)", "Selayang (Selangor)"]
  });

  const [savedReports, setSavedReports] = useState([
    {
      id: 1,
      title: "Simulasi Impak Pembandaran Lahad Datu",
      region: "Lahad Datu (Sabah)",
      date: "2026-08-15",
      expansionSimulated: "+15%",
      riskScore: 89,
      status: "Tinggi",
      notes: "Perlu pemantauan zon bakau di Teluk Darvel."
    }
  ]);

  // Database mock
  const database = {
    selayang: {
      name: "Selayang",
      state: "Selangor",
      coords: [3.2379, 101.6640],
      zoom: 13,
      baseRisk: 75,
      landUse: [
        { category: "Perumahan & Komersial", pct: 42.5, type: "urban" },
        { category: "Hutan Simpan & Cerun", pct: 36.0, type: "green" }
      ],
      warnings: [
        { id: 1, type: "CRITICAL", title: "Cerun Bukit Bandar Baru Selayang", desc: "Risiko Hakisan Cerun", mitigation: "Mewajibkan Laporan EIA & Larangan Terowong Cerun >25-darjah" }
      ]
    },
    kuantan: {
      name: "Kuantan",
      state: "Pahang",
      coords: [3.8077, 103.3260],
      zoom: 13,
      baseRisk: 68,
      landUse: [
        { category: "Industri & Pelabuhan", pct: 28.0, type: "urban" },
        { category: "Badan Air & Pesisir", pct: 38.0, type: "green" }
      ],
      warnings: [
        { id: 3, type: "CRITICAL", title: "Zon Pesisir Pantai Beserah", desc: "Risiko Hakisan Pantai", mitigation: "Pembinaan Benteng Pemecah Ombak" }
      ]
    },
    lahad_datu: {
      name: "Lahad Datu",
      state: "Sabah",
      coords: [5.0268, 118.3270],
      zoom: 12,
      baseRisk: 82,
      landUse: [
        { category: "Pertanian & Sawit", pct: 58.0, type: "agri" },
        { category: "Hutan Bakau & Simpanan", pct: 32.0, type: "green" },
        { category: "Bandar & Penempatan", pct: 10.0, type: "urban" }
      ],
      warnings: [
        { id: 5, type: "CRITICAL", title: "Muara Teluk Darvel", desc: "Pengurangan Liputan Bakau", mitigation: "Pewartaan Perlindungan Bakau & Penanaman Semula" }
      ]
    }
  };

  const current = database[selectedRegionKey];

  // Dynamic Land Use Analysis Calculations
  const simulatedUrban = Math.min(100, (current.landUse.find(l => l.type === 'urban')?.pct || 10) + Number(urbanExpansionRate));
  const simulatedGreen = Math.max(0, (current.landUse.find(l => l.type === 'green')?.pct || 30) - Number(urbanExpansionRate));
  const calculatedRiskScore = Math.min(100, Math.round(current.baseRisk + (urbanExpansionRate * 1.2)));

  // Function to save current simulation to user profile
  const handleSaveReport = () => {
    const newReport = {
      id: Date.now(),
      title: `Laporan Analisis ${current.name}`,
      region: `${current.name} (${current.state})`,
      date: new Date().toISOString().split('T')[0],
      expansionSimulated: `+${urbanExpansionRate}%`,
      riskScore: calculatedRiskScore,
      status: calculatedRiskScore > 80 ? "Sangat Tinggi" : "Sederhana",
      notes: `Simulasi zon tepubina diposisikan pada ${simulatedUrban.toFixed(1)}%.`
    };

    setSavedReports([newReport, ...savedReports]);
    alert(`Laporan analisis untuk ${current.name} telah berjaya disimpan ke dalam User Profile anda!`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            UrbanWatch <span className="text-emerald-400">AI</span>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono">ANALYTICS ENGINE</span>
          </h1>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 bg-slate-800 p-1 rounded-lg border border-slate-700">
          <button 
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-md transition ${
              activeTab === 'analytics' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'
            }`}
          >
            Peta & Analisis
          </button>
          <button 
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-md transition flex items-center gap-2 ${
              activeTab === 'profile' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'
            }`}
          >
            Profil Pengguna
            <span className="bg-slate-900 text-emerald-400 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
              {savedReports.length}
            </span>
          </button>
        </div>
      </header>

      {/* Main View rendering based on activeTab */}
      {activeTab === 'analytics' ? (
        <main className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Left Panel */}
          <div className="space-y-6 lg:col-span-1">
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4">
              <label className="text-xs text-slate-400 block font-semibold">Pilih Daerah Analysis:</label>
              <select 
                value={selectedRegionKey}
                onChange={(e) => {
                  setSelectedRegionKey(e.target.value);
                  setUrbanExpansionRate(0);
                }}
                className="w-full bg-slate-800 text-sm font-semibold text-emerald-400 px-3 py-2 rounded-lg border border-slate-700 focus:outline-none"
              >
                <option value="lahad_datu">Lahad Datu (Sabah)</option>
                <option value="selayang">Selayang (Selangor)</option>
                <option value="kuantan">Kuantan (Pahang)</option>
              </select>

              <div className="pt-2 border-t border-slate-800 space-y-3">
                <div className="flex justify-between items-center">
                  <h2 className="text-xs font-bold uppercase text-emerald-400">Simulasi Pembandaran</h2>
                  <span className="text-xs font-mono font-bold text-amber-400">+{urbanExpansionRate}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="25" 
                  value={urbanExpansionRate}
                  onChange={(e) => setUrbanExpansionRate(e.target.value)}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                />

                <div className="space-y-1 text-xs pt-2">
                  <div className="flex justify-between"><span className="text-slate-400">Zon Tepubina:</span><span className="font-bold text-amber-400">{simulatedUrban.toFixed(1)}%</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Baki Zon Hijau:</span><span className="font-bold text-emerald-400">{simulatedGreen.toFixed(1)}%</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Skor Indeks Risiko:</span><span className="font-bold text-red-400">{calculatedRiskScore} / 100</span></div>
                </div>

                {/* SAVE SIMULATION BUTTON */}
                <button 
                  onClick={handleSaveReport}
                  className="w-full mt-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs py-2 rounded-lg transition"
                >
                  Simpan Laporan Simulasi Ini
                </button>
              </div>
            </div>

            {/* Map Layers */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-2">
              <h2 className="text-xs font-bold uppercase text-slate-300">Penapis Lapisan GIS</h2>
              <label className="flex items-center gap-2 text-xs text-slate-300">
                <input type="checkbox" checked={showRiskLayer} onChange={(e) => setShowRiskLayer(e.target.checked)} />
                Zon Impak & Risiko
              </label>
              <label className="flex items-center gap-2 text-xs text-slate-300">
                <input type="checkbox" checked={showBufferLayer} onChange={(e) => setShowBufferLayer(e.target.checked)} />
                Zon Penampan Ekologi
              </label>
            </div>
          </div>

          {/* Map View */}
          <div className="lg:col-span-2 bg-slate-900 rounded-xl border border-slate-800 overflow-hidden relative min-h-[480px]">
            <MapContainer key={selectedRegionKey} center={current.coords} zoom={current.zoom} className="w-full h-full min-h-[480px] z-0">
              <TileLayer url="https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}" />
              <TileLayer url="https://mt1.google.com/vt/lyrs=h&x={x}&y={y}&z={z}" />
              {showRiskLayer && (
                <Circle center={current.coords} radius={1000 + (urbanExpansionRate * 80)} pathOptions={{ color: 'red', fillColor: 'red', fillOpacity: 0.35 }} />
              )}
              {showBufferLayer && (
                <Circle center={current.coords} radius={2000} pathOptions={{ color: '#10b981', fillColor: '#10b981', fillOpacity: 0.15, dashArray: '5, 10' }} />
              )}
              <Marker position={current.coords}><Popup>{current.name}</Popup></Marker>
            </MapContainer>
          </div>

          {/* Warnings & Mitigation */}
          <div className="lg:col-span-1 bg-slate-900 rounded-xl border border-slate-800 p-5 space-y-4">
            <h2 className="text-xs font-bold uppercase text-slate-200">Amaran Spatial & Mitigasi</h2>
            {current.warnings.map((warn) => (
              <div key={warn.id} onClick={() => setSelectedWarning(warn)} className="p-3 bg-slate-800/50 rounded-lg border border-slate-700 cursor-pointer hover:border-emerald-500">
                <span className="text-[9px] font-bold text-red-400 bg-red-500/20 px-2 py-0.5 rounded">{warn.type}</span>
                <h3 className="text-xs font-semibold text-slate-100 mt-1">{warn.title}</h3>
                <p className="text-[11px] text-slate-400">{warn.desc}</p>
              </div>
            ))}
            {selectedWarning && (
              <div className="p-3 bg-emerald-950/30 border border-emerald-500/40 rounded-lg">
                <p className="text-[10px] font-bold text-emerald-400">PELAN MITIGASI:</p>
                <p className="text-xs text-slate-200 mt-1">{selectedWarning.mitigation}</p>
              </div>
            )}
          </div>
        </main>
      ) : (
        
        /* USER PROFILE VIEW */
        <main className="flex-1 p-6 max-w-6xl mx-auto w-full space-y-6">
          
          {/* User Details Header Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-wrap justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500 flex items-center justify-center text-emerald-400 font-bold text-xl">
                AZ
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">{userProfile.name}</h2>
                <p className="text-xs text-emerald-400 font-medium">{userProfile.role}</p>
                <p className="text-xs text-slate-400">{userProfile.agency} • {userProfile.email}</p>
              </div>
            </div>

            <div className="flex gap-4 border-l border-slate-800 pl-6">
              <div>
                <p className="text-[10px] uppercase text-slate-400 font-semibold">Laporan Disimpan</p>
                <p className="text-xl font-bold text-emerald-400">{savedReports.length}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase text-slate-400 font-semibold">Lokasi Dipantau</p>
                <p className="text-xl font-bold text-amber-400">{userProfile.bookmarks.length}</p>
              </div>
            </div>
          </div>

          {/* Saved Reports Section */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Simpanan Laporan Analisis & Simulasi</h3>
              <span className="text-xs text-slate-400">Jumlah: {savedReports.length} Laporan</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {savedReports.map((report) => (
                <div key={report.id} className="bg-slate-800/40 border border-slate-700/70 p-4 rounded-xl space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] bg-slate-700 text-emerald-400 px-2 py-0.5 rounded font-mono">{report.date}</span>
                      <h4 className="font-bold text-sm text-slate-100 mt-1">{report.title}</h4>
                      <p className="text-xs text-slate-400">{report.region}</p>
                    </div>
                    <span className="text-xs font-bold text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-1 rounded">
                      Skor {report.riskScore}/100
                    </span>
                  </div>

                  <div className="text-xs bg-slate-900/60 p-2.5 rounded-lg text-slate-300 space-y-1">
                    <p><strong className="text-slate-400">Simulasi Pembandaran:</strong> {report.expansionSimulated}</p>
                    <p><strong className="text-slate-400">Nota Analisis:</strong> {report.notes}</p>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button 
                      onClick={() => alert(`Memuat turun laporan: ${report.title}`)}
                      className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 px-3 py-1.5 rounded-md font-semibold transition"
                    >
                      Export PDF
                    </button>
                    <button 
                      onClick={() => setSavedReports(savedReports.filter(r => r.id !== report.id))}
                      className="text-xs text-red-400 hover:bg-red-500/10 px-3 py-1.5 rounded-md transition"
                    >
                      Padam
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bookmarks Section */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Kawasan Pemantauan Utama (Bookmarks)</h3>
            <div className="flex flex-wrap gap-2">
              {userProfile.bookmarks.map((bm, index) => (
                <span key={index} className="bg-slate-800 border border-slate-700 text-slate-300 text-xs px-3 py-1.5 rounded-lg flex items-center gap-2">
                  📍 {bm}
                </span>
              ))}
            </div>
          </div>

        </main>
      )}

    </div>
  );
}
