import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export default function App() {
  const [activeTab, setActiveTab] = useState('analytics'); // 'analytics' | 'profile' | 'admin'
  const [userRole, setUserRole] = useState('SUPER_ADMIN'); // 'USER' | 'ADMIN' | 'SUPER_ADMIN'
  const [selectedRegionKey, setSelectedRegionKey] = useState('lahad_datu');
  
  // Interactive Simulation State
  const [urbanExpansionRate, setUrbanExpansionRate] = useState(0); 

  // ADMIN STATE
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const [riskThreshold, setRiskThreshold] = useState(80);

  // USER MANAGEMENT STATE (HANYA SUPER ADMIN)
  const [usersList, setUsersList] = useState([
    { id: 1, name: "Ahmad Zaki", email: "zaki@plan.gov.my", role: "ADMIN", status: "Active" },
    { id: 2, name: "Dr. Siti Aminah", email: "siti@utm.my", role: "USER", status: "Pending" }
  ]);

  // Database mock
  const database = {
    selayang: { name: "Selayang", state: "Selangor", coords: [3.2379, 101.6640], zoom: 13, baseRisk: 75 },
    kuantan: { name: "Kuantan", state: "Pahang", coords: [3.8077, 103.3260], zoom: 13, baseRisk: 68 },
    lahad_datu: { name: "Lahad Datu", state: "Sabah", coords: [5.0268, 118.3270], zoom: 12, baseRisk: 82 }
  };

  const current = database[selectedRegionKey];
  const calculatedRiskScore = Math.min(100, Math.round(current.baseRisk + (urbanExpansionRate * 1.2)));

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedFile(file);
      setUploadStatus('Memproses dan mengesahkan struktur data spatial...');
      setTimeout(() => {
        setUploadStatus(`Berjaya! Data spatial '${file.name}' telah diimport ke dalam pangkalan data.`);
      }, 1500);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            UrbanWatch <span className="text-emerald-400">AI</span>
          </h1>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold border ${
            userRole === 'SUPER_ADMIN' 
              ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' 
              : userRole === 'ADMIN' 
              ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' 
              : 'bg-slate-800 text-slate-300 border-slate-700'
          }`}>
            {userRole === 'SUPER_ADMIN' ? '👑 SUPER ADMIN' : userRole === 'ADMIN' ? '⚡ ADMIN BIASA' : '👤 USER BIASA'}
          </span>
        </div>

        {/* Role Switcher Demo */}
        <div className="flex items-center gap-3">
          <select 
            value={userRole} 
            onChange={(e) => {
              const role = e.target.value;
              setUserRole(role);
              if (role === 'USER' && activeTab === 'admin') setActiveTab('analytics');
            }}
            className="bg-slate-800 text-xs font-bold text-amber-400 px-2.5 py-1.5 rounded-lg border border-slate-700 focus:outline-none"
          >
            <option value="SUPER_ADMIN">Peranan: Super Admin</option>
            <option value="ADMIN">Peranan: Admin Biasa</option>
            <option value="USER">Peranan: Pengguna Biasa</option>
          </select>

          <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg border border-slate-700">
            <button 
              onClick={() => setActiveTab('analytics')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition ${activeTab === 'analytics' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-300'}`}
            >
              Peta
            </button>
            <button 
              onClick={() => setActiveTab('profile')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition ${activeTab === 'profile' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-300'}`}
            >
              Profil
            </button>
            {(userRole === 'ADMIN' || userRole === 'SUPER_ADMIN') && (
              <button 
                onClick={() => setActiveTab('admin')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition ${
                  activeTab === 'admin' 
                    ? userRole === 'SUPER_ADMIN' ? 'bg-purple-500 text-slate-950 font-bold' : 'bg-amber-500 text-slate-950 font-bold' 
                    : 'text-amber-400'
                }`}
              >
                Panel Admin
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Analytics Map View */}
      {activeTab === 'analytics' && (
        <main className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="space-y-6 lg:col-span-1">
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4">
              <label className="text-xs text-slate-400 block font-semibold">Pilih Daerah Analysis:</label>
              <select 
                value={selectedRegionKey}
                onChange={(e) => setSelectedRegionKey(e.target.value)}
                className="w-full bg-slate-800 text-sm font-semibold text-emerald-400 px-3 py-2 rounded-lg border border-slate-700"
              >
                <option value="lahad_datu">Lahad Datu (Sabah)</option>
                <option value="selayang">Selayang (Selangor)</option>
                <option value="kuantan">Kuantan (Pahang)</option>
              </select>

              <div className="space-y-3 pt-2 border-t border-slate-800">
                <div className="flex justify-between items-center">
                  <h2 className="text-xs font-bold uppercase text-emerald-400">Simulasi Pembandaran</h2>
                  <span className="text-xs font-mono font-bold text-amber-400">+{urbanExpansionRate}%</span>
                </div>
                <input 
                  type="range" min="0" max="25" value={urbanExpansionRate}
                  onChange={(e) => setUrbanExpansionRate(e.target.value)}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                />
                <div className="flex justify-between text-xs pt-1">
                  <span className="text-slate-400">Skor Indeks Risiko:</span>
                  <span className="font-bold text-red-400">{calculatedRiskScore} / 100</span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3 bg-slate-900 rounded-xl border border-slate-800 overflow-hidden relative min-h-[480px]">
            <MapContainer key={selectedRegionKey} center={current.coords} zoom={current.zoom} className="w-full h-full min-h-[480px]">
              <TileLayer url="https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}" />
              <TileLayer url="https://mt1.google.com/vt/lyrs=h&x={x}&y={y}&z={z}" />
              <Circle center={current.coords} radius={1000 + (urbanExpansionRate * 80)} pathOptions={{ color: 'red', fillColor: 'red', fillOpacity: 0.35 }} />
              <Marker position={current.coords}><Popup>{current.name}</Popup></Marker>
            </MapContainer>
          </div>
        </main>
      )}

      {/* User Profile View */}
      {activeTab === 'profile' && (
        <main className="flex-1 p-6 max-w-5xl mx-auto w-full space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500 flex items-center justify-center text-emerald-400 font-bold">
              AZ
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Ahmad Zaki</h2>
              <p className="text-xs text-slate-400">Pegawai Perancang Bandar • PLANMalaysia</p>
            </div>
          </div>
        </main>
      )}

      {/* ADMIN PANEL VIEW (DIAGNOSED FOR ADMIN & SUPER ADMIN) */}
      {activeTab === 'admin' && (userRole === 'ADMIN' || userRole === 'SUPER_ADMIN') && (
        <main className="flex-1 p-6 max-w-6xl mx-auto w-full space-y-6">
          
          <div className="border-b border-slate-800 pb-4 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                ⚙️ Dashboard Pengurusan {userRole === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin'}
              </h2>
              <p className="text-xs text-slate-400">Kawalan pentadbiran pangkalan data GIS dan kebenaran sistem.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* 1. Spatial File Upload Panel (ADMIN & SUPER ADMIN) */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-4">
              <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider">
                1. Muat Naik Data Spatial Baharu
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Format disokong: <code className="text-emerald-400">.json</code>, <code className="text-emerald-400">.geojson</code>, atau <code className="text-emerald-400">.zip</code> (Shapefile SHP).
              </p>

              <div className="border-2 border-dashed border-slate-700 rounded-xl p-6 text-center space-y-3 bg-slate-950/40 cursor-pointer">
                <input type="file" accept=".json,.geojson,.zip,.shp" onChange={handleFileUpload} className="hidden" id="admin-file-input" />
                <label htmlFor="admin-file-input" className="cursor-pointer space-y-2 block">
                  <div className="text-2xl">📁</div>
                  <p className="text-xs text-slate-300 font-semibold">Klik untuk memilih fail data spatial</p>
                </label>
              </div>

              {uploadedFile && (
                <div className="text-xs bg-slate-800 p-3 rounded-lg border border-slate-700 space-y-1">
                  <p className="font-bold text-slate-200">Fail: {uploadedFile.name}</p>
                  {uploadStatus && <p className="text-emerald-400 pt-1 font-semibold">{uploadStatus}</p>}
                </div>
              )}
            </div>

            {/* 2. SUPER ADMIN ONLY: User Management & System Config */}
            <div className={`p-6 rounded-xl space-y-4 border ${
              userRole === 'SUPER_ADMIN' ? 'bg-slate-900 border-purple-500/40' : 'bg-slate-900/40 border-slate-800 opacity-60'
            }`}>
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-purple-400 uppercase tracking-wider">
                  2. Pengurusan Pengguna & Peranan
                </h3>
                {userRole !== 'SUPER_ADMIN' && (
                  <span className="text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded border border-red-500/30">Hanya Super Admin</span>
                )}
              </div>

              {userRole === 'SUPER_ADMIN' ? (
                <div className="space-y-3 text-xs">
                  <p className="text-slate-400">Senarai Pengguna & Kebenaran Role:</p>
                  <div className="space-y-2">
                    {usersList.map(u => (
                      <div key={u.id} className="bg-slate-800 p-2.5 rounded-lg flex justify-between items-center">
                        <div>
                          <p className="font-bold text-slate-200">{u.name}</p>
                          <p className="text-[10px] text-slate-400">{u.email}</p>
                        </div>
                        <select 
                          value={u.role}
                          onChange={(e) => {
                            const updated = usersList.map(x => x.id === u.id ? {...x, role: e.target.value} : x);
                            setUsersList(updated);
                          }}
                          className="bg-slate-900 text-emerald-400 font-bold px-2 py-1 rounded border border-slate-700"
                        >
                          <option value="USER">USER</option>
                          <option value="ADMIN">ADMIN</option>
                          <option value="SUPER_ADMIN">SUPER ADMIN</option>
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic py-6 text-center">
                  Akses ditutup. Anda memerlukan kebenaran Super Admin untuk mengurus peranan pengguna lain.
                </p>
              )}
            </div>

          </div>

          {/* 3. SUPER ADMIN ONLY: Database Connection & System Audit */}
          {userRole === 'SUPER_ADMIN' && (
            <div className="bg-slate-900 border border-purple-500/30 p-6 rounded-xl space-y-3">
              <h3 className="text-sm font-bold text-purple-400 uppercase tracking-wider">
                3. Tetapan Pangkalan Data Supabase & Log Audit
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700 space-y-1">
                  <p className="text-slate-400">URL Supabase Host:</p>
                  <code className="text-emerald-400 font-mono">https://xyzcompany.supabase.co</code>
                </div>
                <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700 space-y-1">
                  <p className="text-slate-400">Status Database PostgreSQL:</p>
                  <span className="text-emerald-400 font-mono font-bold">STABLE / CONNECTED</span>
                </div>
              </div>
            </div>
          )}

        </main>
      )}

    </div>
  );
}
