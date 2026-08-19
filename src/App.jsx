import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export default function App() {
  const [activeTab, setActiveTab] = useState('analytics'); // 'analytics' | 'profile' | 'admin'
  
  // SSO & AUTH STATE - Bermula sebagai Guest (false)
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  
  const [showSSOModal, setShowSSOModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  // FORM TUKAR PASSWORD STATE
  const [passwordForm, setPasswordForm] = useState({ current: '', newPass: '', confirmPass: '' });
  const [passwordStatus, setPasswordStatus] = useState('');

  // MAP & SIMULATION STATE
  const [selectedRegionKey, setSelectedRegionKey] = useState('lahad_datu');
  const [urbanExpansionRate, setUrbanExpansionRate] = useState(0); 

  // ADMIN STATE: SPATIAL DATA LIST (CRUD)
  const [spatialDataList, setSpatialDataList] = useState([
    { id: 'DAT-001', region: 'Lahad Datu (Sabah)', filename: 'lahad_datu_boundary_2026.geojson', size: '4.2 MB', uploadedBy: 'admin.sabah@sabah.gov.my', date: '2026-03-12', status: 'Verified' },
    { id: 'DAT-002', region: 'Selayang (Selangor)', filename: 'selayang_zone_planner_v2.shp', size: '12.8 MB', uploadedBy: 'zaki@plan.gov.my', date: '2026-02-18', status: 'Verified' },
    { id: 'DAT-003', region: 'Kuantan (Pahang)', filename: 'kuantan_coastal_risk_2026.json', size: '3.1 MB', uploadedBy: 'siti@utm.my', date: '2026-01-05', status: 'Pending Review' }
  ]);

  // EDIT MODAL STATE
  const [editingData, setEditingData] = useState(null);

  // UPLOAD FILE STATE
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');

  // MOCK USER LIST FOR SUPER ADMIN MANAGEMENT
  const [usersList, setUsersList] = useState([
    { id: 1, name: "Ahmad Zaki", email: "zaki@plan.gov.my", role: "SUPER_ADMIN", status: "Active", provider: "MyGovUC SSO" },
    { id: 2, name: "Perancang Sabah", email: "admin.sabah@sabah.gov.my", role: "ADMIN", status: "Active", provider: "Microsoft Azure AD" },
    { id: 3, name: "Dr. Siti Aminah", email: "siti@utm.my", role: "USER", status: "Active", provider: "Google SSO" }
  ]);

  // DATABASE MOCK
  const database = {
    selayang: { name: "Selayang", state: "Selangor", coords: [3.2379, 101.6640], zoom: 13, baseRisk: 75 },
    kuantan: { name: "Kuantan", state: "Pahang", coords: [3.8077, 103.3260], zoom: 13, baseRisk: 68 },
    lahad_datu: { name: "Lahad Datu", state: "Sabah", coords: [5.0268, 118.3270], zoom: 12, baseRisk: 82 }
  };

  const current = database[selectedRegionKey];
  const calculatedRiskScore = Math.min(100, Math.round(current.baseRisk + (urbanExpansionRate * 1.2)));

  // HANDLERS FOR SSO
  const handleSSOLogin = (provider, mockUserData) => {
    setCurrentUser({
      name: mockUserData.name,
      email: mockUserData.email,
      role: mockUserData.role,
      provider: provider
    });
    setIsAuthenticated(true);
    setShowSSOModal(false);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setShowUserMenu(false);
    setActiveTab('analytics');
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    if (passwordForm.newPass !== passwordForm.confirmPass) {
      setPasswordStatus('Pengesahan kata laluan tidak sepadan!');
      return;
    }
    setPasswordStatus('Kata laluan berjaya dikemaskini!');
    setTimeout(() => {
      setShowPasswordModal(false);
      setPasswordStatus('');
      setPasswordForm({ current: '', newPass: '', confirmPass: '' });
    }, 1200);
  };

  // UPLOAD FILE AND AUTO ADD TO LIST
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedFile(file);
      setUploadStatus('Memproses dan mengesahkan struktur data spatial...');
      setTimeout(() => {
        const newData = {
          id: `DAT-00${spatialDataList.length + 1}`,
          region: selectedRegionKey === 'lahad_datu' ? 'Lahad Datu (Sabah)' : selectedRegionKey === 'selayang' ? 'Selayang (Selangor)' : 'Kuantan (Pahang)',
          filename: file.name,
          size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
          uploadedBy: currentUser?.email || 'Admin',
          date: new Date().toISOString().split('T')[0],
          status: 'Verified'
        };
        setSpatialDataList([newData, ...spatialDataList]);
        setUploadStatus(`Berjaya! Data spatial '${file.name}' telah diimport.`);
      }, 1500);
    }
  };

  // DELETE SPATIAL DATA
  const handleDeleteSpatialData = (id) => {
    if (window.confirm("Adakah anda pasti ingin memadam data spatial ini daripada pangkalan data?")) {
      setSpatialDataList(spatialDataList.filter(item => item.id !== id));
    }
  };

  // UPDATE SPATIAL DATA
  const handleSaveSpatialEdit = (e) => {
    e.preventDefault();
    setSpatialDataList(spatialDataList.map(item => item.id === editingData.id ? editingData : item));
    setEditingData(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans relative">
      
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex flex-wrap items-center justify-between gap-4 z-10">
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
            <span className="text-[10px] bg-slate-800 text-slate-400 px-2.5 py-0.5 rounded-full border border-slate-700 font-mono">
              🌐 TETAMU (GUEST)
            </span>
          )}
        </div>

        {/* Top Right Header Actions */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg border border-slate-700">
            <button 
              onClick={() => setActiveTab('analytics')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition ${activeTab === 'analytics' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-300'}`}
            >
              Peta
            </button>

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

          {!isAuthenticated && (
            <button 
              onClick={() => setShowSSOModal(true)}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs px-4 py-2 rounded-lg shadow-lg shadow-emerald-500/10 transition flex items-center gap-2"
            >
              <span>🔑</span> Log Masuk SSO
            </button>
          )}
        </div>
      </header>

      {/* Main Map View */}
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

      {/* Admin & Super Admin View */}
      {activeTab === 'admin' && isAuthenticated && (currentUser?.role === 'ADMIN' || currentUser?.role === 'SUPER_ADMIN') && (
        <main className="flex-1 p-6 max-w-6xl mx-auto w-full space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              ⚙️ Dashboard Pentadbiran ({currentUser.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin biasa'})
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Muat Naik Fail Spatial */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-4">
              <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider">1. Import Fail Spatial Baharu</h3>
              <div className="border-2 border-dashed border-slate-700 rounded-xl p-6 text-center bg-slate-950/40">
                <input type="file" accept=".json,.geojson,.zip" onChange={handleFileUpload} className="hidden" id="admin-file-input" />
                <label htmlFor="admin-file-input" className="cursor-pointer block space-y-2">
                  <div className="text-2xl">📁</div>
                  <p className="text-xs text-slate-300">Klik untuk muat naik fail GIS (.geojson / .shp)</p>
                </label>
              </div>
              {uploadedFile && <p className="text-xs text-emerald-400 font-semibold">{uploadStatus}</p>}
            </div>

            {/* Kawalan Role Pengguna (Super Admin Only) */}
            <div className={`p-6 rounded-xl space-y-4 border ${currentUser?.role === 'SUPER_ADMIN' ? 'bg-slate-900 border-purple-500/40' : 'bg-slate-900/40 border-slate-800 opacity-50'}`}>
              <h3 className="text-sm font-bold text-purple-400 uppercase tracking-wider">2. Kebenaran Pengguna SSO</h3>
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

          {/* JADUAL SENARAI DATA SPATIAL (SUPER ADMIN & ADMIN - KEMASKINI & PADAM) */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider">
                  3. Senarai Data Spatial Terkandung Dalam Pangkalan Data
                </h3>
                <p className="text-xs text-slate-400">Super Admin boleh mengemaskini butiran fail atau memadam data daripada pangkalan data.</p>
              </div>
              <span className="text-xs font-mono bg-slate-800 px-2.5 py-1 rounded border border-slate-700 text-slate-300">
                Jumlah Data: {spatialDataList.length}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase font-semibold">
                    <th className="py-3 px-3">ID Data</th>
                    <th className="py-3 px-3">Daerah / Wilayah</th>
                    <th className="py-3 px-3">Nama Fail</th>
                    <th className="py-3 px-3">Dimuat Naik Oleh</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-right">Tindakan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {spatialDataList.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-850/50 transition">
                      <td className="py-3 px-3 font-mono text-emerald-400 font-bold">{item.id}</td>
                      <td className="py-3 px-3 font-semibold text-slate-200">{item.region}</td>
                      <td className="py-3 px-3 text-slate-300 font-mono text-[11px]">{item.filename} <span className="text-slate-500">({item.size})</span></td>
                      <td className="py-3 px-3 text-slate-400">{item.uploadedBy}</td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.status === 'Verified' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right space-x-2">
                        {/* Kemaskini Button */}
                        <button 
                          onClick={() => setEditingData(item)}
                          className="bg-slate-800 hover:bg-slate-700 text-amber-400 font-semibold px-2.5 py-1 rounded border border-slate-700 transition"
                        >
                          ✏️ Edit
                        </button>
                        
                        {/* Padam Button (Hanya Super Admin Boleh Padam) */}
                        {currentUser?.role === 'SUPER_ADMIN' ? (
                          <button 
                            onClick={() => handleDeleteSpatialData(item.id)}
                            className="bg-red-500/10 hover:bg-red-500/20 text-red-400 font-semibold px-2.5 py-1 rounded border border-red-500/30 transition"
                          >
                            🗑️ Padam
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-600 italic">Padam Terhad</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </main>
      )}

      {/* FLOATING USER MENU BUTTON AT BOTTOM RIGHT */}
      {isAuthenticated && (
        <div className="fixed bottom-6 right-6 z-50">
          {showUserMenu && (
            <div className="mb-3 bg-slate-900 border border-slate-800 rounded-2xl p-2 w-56 shadow-2xl space-y-1 backdrop-blur-md">
              <div className="px-3 py-2 border-b border-slate-800">
                <p className="text-xs font-bold text-white truncate">{currentUser?.name}</p>
                <p className="text-[10px] text-slate-400 truncate">{currentUser?.email}</p>
              </div>

              <button 
                onClick={() => { setActiveTab('profile'); setShowUserMenu(false); }}
                className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl flex items-center gap-2.5 transition"
              >
                <span>👤</span> Lihat Profil Saya
              </button>

              <button 
                onClick={() => { setShowPasswordModal(true); setShowUserMenu(false); }}
                className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl flex items-center gap-2.5 transition"
              >
                <span>🔑</span> Tukar Kata Laluan
              </button>

              <button 
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 text-xs font-bold text-red-400 hover:bg-red-500/10 rounded-xl flex items-center gap-2.5 transition"
              >
                <span>🚪</span> Log Keluar (Sign Out)
              </button>
            </div>
          )}

          <button 
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="bg-slate-900 hover:bg-slate-800 text-white p-2.5 rounded-full border border-slate-700 shadow-2xl flex items-center gap-3 pr-4 transition active:scale-95"
          >
            <div className="w-9 h-9 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center font-bold text-emerald-400 text-sm">
              {currentUser?.name ? currentUser.name.charAt(0) : 'U'}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-bold leading-tight">{currentUser?.name}</p>
              <p className="text-[10px] text-slate-400 leading-tight">Tetapan Akaun</p>
            </div>
          </button>
        </div>
      )}

      {/* MODAL EDIT DATA SPATIAL */}
      {editingData && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white">✏️ Kemaskini Data Spatial ({editingData.id})</h3>
              <button onClick={() => setEditingData(null)} className="text-slate-400 hover:text-white font-bold text-sm">✕</button>
            </div>

            <form onSubmit={handleSaveSpatialEdit} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1 font-semibold">Nama Fail Spatial</label>
                <input 
                  type="text" required
                  value={editingData.filename}
                  onChange={(e) => setEditingData({...editingData, filename: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-700 text-xs px-3 py-2 rounded-lg text-white focus:outline-none focus:border-emerald-500 font-mono" 
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-semibold">Daerah / Region</label>
                <input 
                  type="text" required
                  value={editingData.region}
                  onChange={(e) => setEditingData({...editingData, region: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-700 text-xs px-3 py-2 rounded-lg text-white focus:outline-none focus:border-emerald-500" 
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-semibold">Status Data</label>
                <select 
                  value={editingData.status}
                  onChange={(e) => setEditingData({...editingData, status: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-700 text-xs px-3 py-2 rounded-lg text-emerald-400 font-bold focus:outline-none"
                >
                  <option value="Verified">Verified</option>
                  <option value="Pending Review">Pending Review</option>
                  <option value="Archived">Archived</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button type="button" onClick={() => setEditingData(null)} className="px-3 py-1.5 text-slate-400 hover:text-white">Batal</button>
                <button type="submit" className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-1.5 rounded-lg transition">Simpan Perubahan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL TUKAR KATA LALUAN */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">🔑 Tukar Kata Laluan</h3>
              <button onClick={() => setShowPasswordModal(false)} className="text-slate-400 hover:text-white font-bold text-sm">✕</button>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">Kata Laluan Sedia Ada</label>
                <input 
                  type="password" required
                  value={passwordForm.current}
                  onChange={(e) => setPasswordForm({...passwordForm, current: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-700 text-xs px-3 py-2 rounded-lg text-white focus:outline-none focus:border-emerald-500" 
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">Kata Laluan Baharu</label>
                <input 
                  type="password" required
                  value={passwordForm.newPass}
                  onChange={(e) => setPasswordForm({...passwordForm, newPass: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-700 text-xs px-3 py-2 rounded-lg text-white focus:outline-none focus:border-emerald-500" 
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">Sahkan Kata Laluan Baharu</label>
                <input 
                  type="password" required
                  value={passwordForm.confirmPass}
                  onChange={(e) => setPasswordForm({...passwordForm, confirmPass: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-700 text-xs px-3 py-2 rounded-lg text-white focus:outline-none focus:border-emerald-500" 
                />
              </div>

              {passwordStatus && (
                <p className={`text-[11px] font-semibold ${passwordStatus.includes('berjaya') ? 'text-emerald-400' : 'text-red-400'}`}>
                  {passwordStatus}
                </p>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowPasswordModal(false)} className="px-3 py-1.5 text-xs text-slate-400 hover:text-white">Batal</button>
                <button type="submit" className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs px-4 py-1.5 rounded-lg transition">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL PILIHAN AKAN SSO LOG MASUK */}
      {showSSOModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-6 shadow-2xl relative">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-white">Log Masuk SSO UrbanWatch</h3>
                <p className="text-xs text-slate-400">Pilih Akaun Untuk Simulasi Log Masuk</p>
              </div>
              <button onClick={() => setShowSSOModal(false)} className="text-slate-400 hover:text-white font-bold">✕</button>
            </div>

            <div className="space-y-3">
              {/* Option 1: Super Admin */}
              <button 
                onClick={() => handleSSOLogin('MyGovUC SSO', { name: "Ahmad Zaki", email: "zaki@plan.gov.my", role: "SUPER_ADMIN" })}
                className="w-full bg-purple-950/30 hover:bg-purple-900/50 border border-purple-500/40 p-3 rounded-xl flex items-center justify-between text-left transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-sm">🏛️</div>
                  <div>
                    <p className="text-xs font-bold text-purple-300 group-hover:text-purple-200">Log Masuk Sebagai Super Admin</p>
                    <p className="text-[10px] text-slate-400">zaki@plan.gov.my (MyGovUC SSO)</p>
                  </div>
                </div>
                <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded font-mono font-bold">SUPER ADMIN</span>
              </button>

              {/* Option 2: Admin */}
              <button 
                onClick={() => handleSSOLogin('Microsoft Azure AD', { name: "Perancang Sabah", email: "admin.sabah@sabah.gov.my", role: "ADMIN" })}
                className="w-full bg-amber-950/30 hover:bg-amber-900/50 border border-amber-500/40 p-3 rounded-xl flex items-center justify-between text-left transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-sm">🏢</div>
                  <div>
                    <p className="text-xs font-bold text-amber-300 group-hover:text-amber-200">Log Masuk Sebagai Admin Biasa</p>
                    <p className="text-[10px] text-slate-400">admin.sabah@sabah.gov.my (Microsoft AD)</p>
                  </div>
                </div>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-mono font-bold">ADMIN</span>
              </button>

              {/* Option 3: User Biasa */}
              <button 
                onClick={() => handleSSOLogin('Google SSO', { name: "Dr. Siti Aminah", email: "siti@utm.my", role: "USER" })}
                className="w-full bg-emerald-950/30 hover:bg-emerald-900/50 border border-emerald-500/40 p-3 rounded-xl flex items-center justify-between text-left transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm">🌐</div>
                  <div>
                    <p className="text-xs font-bold text-emerald-300 group-hover:text-emerald-200">Log Masuk Sebagai Pengguna Biasa</p>
                    <p className="text-[10px] text-slate-400">siti@utm.my (Google SSO)</p>
                  </div>
                </div>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono font-bold">USER</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
