import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export default function App() {
  const [activeTab, setActiveTab] = useState('analytics'); // 'analytics' | 'profile' | 'admin'
  
  // SSO & AUTH STATE
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null); // { name, email, role, avatarProvider }
  const [showSSOModal, setShowSSOModal] = useState(false);

  // Map / Simulation State
  const [selectedRegionKey, setSelectedRegionKey] = useState('lahad_datu');
  const [urbanExpansionRate, setUrbanExpansionRate] = useState(0); 

  // Admin State
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');

  // Mock User List for Super Admin Management
  const [usersList, setUsersList] = useState([
    { id: 1, name: "Ahmad Zaki", email: "zaki@plan.gov.my", role: "SUPER_ADMIN", status: "Active", provider: "MyGovUC SSO" },
    { id: 2, name: "Dr. Siti Aminah", email: "siti@utm.my", role: "USER", status: "Active", provider: "Google SSO" },
    { id: 3, name: "Perancang Sabah", email: "admin.sabah@sabah.gov.my", role: "ADMIN", status: "Active", provider: "Microsoft SSO" }
  ]);

  // Database mock
  const database = {
    selayang: { name: "Selayang", state: "Selangor", coords: [3.2379, 101.6640], zoom: 13, baseRisk: 75 },
    kuantan: { name: "Kuantan", state: "Pahang", coords: [3.8077, 103.3260], zoom: 13, baseRisk: 68 },
    lahad_datu: { name: "Lahad Datu", state: "Sabah", coords: [5.0268, 118.3270], zoom: 12, baseRisk: 82 }
  };

  const current = database[selectedRegionKey];
  const calculatedRiskScore = Math.min(100, Math.round(current.baseRisk + (urbanExpansionRate * 1.2)));

  // SIMULASI SSO LOG IN
  const handleSSOLogin = (provider, mockUserData) => {
    // Menyemak jika pengguna wujud dalam pangkalan data, jika tidak cipta akaun default 'USER'
    const existingUser = usersList.find(u => u.email === mockUserData.email);
    const roleAssigned = existingUser ? existingUser.role : mockUserData.defaultRole;

    const loggedInUser = {
      name: mockUserData.name,
      email: mockUserData.email,
      role: roleAssigned,
      provider: provider
    };

    setCurrentUser(loggedInUser);
    setIsAuthenticated(true);
    setShowSSOModal(false);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setActiveTab('analytics');
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedFile(file);
      setUploadStatus('Memproses dan mengesahkan struktur data spatial...');
      setTimeout(() => {
        setUploadStatus(`Berjaya! Data spatial '${file.name}' telah diimport.`);
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

          {isAuthenticated ? (
            <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-mono font-bold border ${
              currentUser?.role === 'SUPER_ADMIN' 
                ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' 
                : currentUser?.role === 'ADMIN' 
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' 
                : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
            }`}>
              {currentUser?.role === 'SUPER_ADMIN' ? '👑 SUPER ADMIN' : currentUser?.role === 'ADMIN' ? '⚡ ADMIN' : '👤 USER'}
            </span>
          ) : (
            <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-slate-700">
              MOD TETAMU (GUEST)
            </span>
          )}
        </div>

        {/* Navigation & Auth Button */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg border border-slate-700">
            <button 
              onClick={() => setActiveTab('analytics')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition ${activeTab === 'analytics' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-300'}`}
            >
              Peta
            </button>
            
            {isAuthenticated && (
              <button 
                onClick={() => setActiveTab('profile')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition ${activeTab === 'profile' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-300'}`}
              >
                Profil
              </button>
            )}

            {isAuthenticated && (currentUser?.role === 'ADMIN' || currentUser?.role === 'SUPER_ADMIN') && (
              <button 
                onClick={() => setActiveTab('admin')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition ${
                  activeTab === 'admin' 
                    ? currentUser?.role === 'SUPER_ADMIN' ? 'bg-purple-500 text-slate-950 font-bold' : 'bg-amber-500 text-slate-950 font-bold' 
                    : 'text-amber-400'
                }`}
              >
                Panel Admin
              </button>
            )}
          </div>

          {/* SSO Auth Action */}
          {isAuthenticated ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <div className="text-right text-xs">
                <p className="font-bold text-slate-200 leading-tight">{currentUser.name}</p>
                <p className="text-[10px] text-slate-400">{currentUser.provider}</p>
              </div>
              <button 
                onClick={handleLogout}
                className="bg-slate-800 hover:bg-red-500/20 hover:text-red-400 text-slate-300 border border-slate-700 text-xs px-2.5 py-1.5 rounded-lg transition"
              >
                Log Keluar
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setShowSSOModal(true)}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs px-3.5 py-1.5 rounded-lg shadow-lg shadow-emerald-500/10 transition"
            >
              Log Masuk SSO
            </button>
          )}
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
      {activeTab === 'profile' && isAuthenticated && (
        <main className="flex-1 p-6 max-w-4xl mx-auto w-full space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500 flex items-center justify-center text-emerald-400 font-bold text-xl">
                {currentUser.name.charAt(0)}
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">{currentUser.name}</h2>
                <p className="text-xs text-slate-400">{currentUser.email}</p>
                <p className="text-[10px] text-emerald-400 mt-1 font-mono">Didaftarkan Melalui: {currentUser.provider}</p>
              </div>
            </div>
            <span className="bg-slate-800 border border-slate-700 text-xs px-3 py-1 rounded-lg text-amber-400 font-bold">
              Role: {currentUser.role}
            </span>
          </div>
        </main>
      )}

      {/* Admin View */}
      {activeTab === 'admin' && isAuthenticated && (currentUser?.role === 'ADMIN' || currentUser?.role === 'SUPER_ADMIN') && (
        <main className="flex-1 p-6 max-w-6xl mx-auto w-full space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              ⚙️ Dashboard Pentadbiran ({currentUser.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin biasa'})
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-4">
              <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider">1. Import Fail Spatial (.JSON / .SHP)</h3>
              <div className="border-2 border-dashed border-slate-700 rounded-xl p-6 text-center bg-slate-950/40">
                <input type="file" accept=".json,.geojson,.zip" onChange={handleFileUpload} className="hidden" id="admin-file-input" />
                <label htmlFor="admin-file-input" className="cursor-pointer block space-y-2">
                  <div className="text-2xl">📁</div>
                  <p className="text-xs text-slate-300">Muat Naik Data Terkini Daerah</p>
                </label>
              </div>
              {uploadedFile && <p className="text-xs text-emerald-400 font-semibold">{uploadStatus}</p>}
            </div>

            {/* Super Admin Control */}
            <div className={`p-6 rounded-xl space-y-4 border ${currentUser?.role === 'SUPER_ADMIN' ? 'bg-slate-900 border-purple-500/40' : 'bg-slate-900/40 border-slate-800 opacity-50'}`}>
              <h3 className="text-sm font-bold text-purple-400 uppercase tracking-wider">2. Pengurusan Kebenaran Pengguna (SSO)</h3>
              {currentUser?.role === 'SUPER_ADMIN' ? (
                <div className="space-y-2 text-xs">
                  {usersList.map(u => (
                    <div key={u.id} className="bg-slate-800 p-2.5 rounded-lg flex justify-between items-center">
                      <div>
                        <p className="font-bold text-slate-200">{u.name}</p>
                        <p className="text-[10px] text-slate-400">{u.email} • <span className="text-emerald-400">{u.provider}</span></p>
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
              ) : (
                <p className="text-xs text-slate-500 italic py-6 text-center">Akses Kawalan Pengguna Terhad kepada Super Admin sahaja.</p>
              )}
            </div>
          </div>
        </main>
      )}

      {/* ========================================================================= */}
      {/* MODAL SSO LOGIN (SIMULATION FOR MYGOVUC / GOOGLE / AZURE AD) */}
      {/* ========================================================================= */}
      {showSSOModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-6 shadow-2xl relative">
            
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-white">Log Masuk SSO UrbanWatch</h3>
                <p className="text-xs text-slate-400">Pilih Akaun Organisasi / Kerajaan Anda</p>
              </div>
              <button onClick={() => setShowSSOModal(false)} className="text-slate-400 hover:text-white font-bold">✕</button>
            </div>

            {/* SSO Providers Options */}
            <div className="space-y-3">
              
              {/* Option 1: Super Admin Demo */}
              <button 
                onClick={() => handleSSOLogin('MyGovUC SSO', { name: "Ahmad Zaki", email: "zaki@plan.gov.my", defaultRole: "SUPER_ADMIN" })}
                className="w-full bg-purple-950/40 hover:bg-purple-900/50 border border-purple-500/40 hover:border-purple-500 p-3 rounded-xl flex items-center justify-between text-left transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-xs">🏛️</div>
                  <div>
                    <p className="text-xs font-bold text-purple-300">Log Masuk MyGovUC SSO</p>
                    <p className="text-[10px] text-slate-400">zaki@plan.gov.my</p>
                  </div>
                </div>
                <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded font-mono font-bold">SUPER ADMIN</span>
              </button>

              {/* Option 2: Admin Biasa Demo */}
              <button 
                onClick={() => handleSSOLogin('Microsoft Entra ID', { name: "Perancang Sabah", email: "admin.sabah@sabah.gov.my", defaultRole: "ADMIN" })}
                className="w-full bg-amber-950/40 hover:bg-amber-900/50 border border-amber-500/40 hover:border-amber-500 p-3 rounded-xl flex items-center justify-between text-left transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">🏢</div>
                  <div>
                    <p className="text-xs font-bold text-amber-300">Log Masuk Microsoft Azure AD</p>
                    <p className="text-[10px] text-slate-400">admin.sabah@sabah.gov.my</p>
                  </div>
                </div>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-mono font-bold">ADMIN BIASA</span>
              </button>

              {/* Option 3: Standard User Demo */}
              <button 
                onClick={() => handleSSOLogin('Google Workspace', { name: "Dr. Siti Aminah", email: "siti@utm.my", defaultRole: "USER" })}
                className="w-full bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-emerald-500/50 p-3 rounded-xl flex items-center justify-between text-left transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">🎓</div>
                  <div>
                    <p className="text-xs font-bold text-slate-200">Log Masuk Google Workspace</p>
                    <p className="text-[10px] text-slate-400">siti@utm.my</p>
                  </div>
                </div>
                <span className="text-[10px] bg-slate-700 text-slate-300 px-2 py-0.5 rounded font-mono font-bold">USER BIASA</span>
              </button>

            </div>

            <p className="text-[11px] text-slate-500 text-center leading-relaxed">
              Sistem menyemak kelayakan cap jari OAuth 2.0 & SAML secara automatik untuk kebenaran peranan pengguna.
            </p>

          </div>
        </div>
      )}

    </div>
  );
}
