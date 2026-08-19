import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// DICTIONARY DWI BAHASA (BM / EN)
const translations = {
  BM: {
    title: "UrbanWatch",
    guest: "TETAMU",
    loginSSO: "Log Masuk SSO",
    backToMap: "Kembali ke Peta",
    logout: "Log Keluar",
    profile: "Profil Saya",
    changePass: "Tukar Kata Laluan",
    mapTab: "Peta Analysis",
    adminTab: "Panel Admin",
    selectRegion: "Pilih Daerah Analysis:",
    urbanSim: "Simulasi Pembandaran",
    riskScore: "Skor Indeks Risiko",
    ssoHeader: "Portal Log Masuk SSO System",
    ssoSub: "Sila pilih pembekal identiti SSO anda untuk meneruskan akses ke dalam sistem",
    loginAsSuperAdmin: "Log Masuk sebagai Super Admin",
    loginAsAdmin: "Log Masuk sebagai Admin Biasa",
    loginAsUser: "Log Masuk sebagai Pengguna Biasa",
    providerMyGov: "Akses Penuh Pentadbiran Sistem",
    providerAzure: "Pengurusan Data Spatial Daerah",
    providerGoogle: "Akses Paparan & Analisis Sahaja",
    adminTitle: "Dashboard Pentadbiran & Pengurusan Spatial",
    uploadTitle: "1. Import Fail Spatial Baharu",
    dragDrop: "Klik atau seret fail GIS (.geojson / .shp) di sini",
    userMgmtTitle: "2. Kebenaran Pengguna SSO",
    dataListTitle: "3. Senarai Data Spatial Dalam Pangkalan Data",
    dataId: "ID Data",
    region: "Daerah",
    filename: "Nama Fail",
    uploader: "Dimuat Naik Oleh",
    status: "Status",
    actions: "Tindakan",
    edit: "Edit",
    delete: "Padam",
    restricted: "Terhad",
    close: "Tutup",
    save: "Simpan",
    cancel: "Batal",
    currentPass: "Kata Laluan Sedia Ada",
    newPass: "Kata Laluan Baharu",
    confirmPass: "Sahkan Kata Laluan Baharu",
  },
  EN: {
    title: "UrbanWatch",
    guest: "GUEST",
    loginSSO: "SSO Login",
    backToMap: "Back to Map",
    logout: "Sign Out",
    profile: "My Profile",
    changePass: "Change Password",
    mapTab: "Analysis Map",
    adminTab: "Admin Panel",
    selectRegion: "Select Analysis Region:",
    urbanSim: "Urban Simulation",
    riskScore: "Risk Index Score",
    ssoHeader: "SSO System Login Portal",
    ssoSub: "Please select your SSO identity provider to proceed into the system",
    loginAsSuperAdmin: "Log in as Super Admin",
    loginAsAdmin: "Log in as Standard Admin",
    loginAsUser: "Log in as Standard User",
    providerMyGov: "Full System Administrative Access",
    providerAzure: "Regional Spatial Data Management",
    providerGoogle: "View & Analytics Access Only",
    adminTitle: "Administration & Spatial Data Dashboard",
    uploadTitle: "1. Import New Spatial File",
    dragDrop: "Click or drag GIS files (.geojson / .shp) here",
    userMgmtTitle: "2. SSO User Permissions",
    dataListTitle: "3. Spatial Datasets in Pangkalan Data",
    dataId: "Data ID",
    region: "Region",
    filename: "Filename",
    uploader: "Uploaded By",
    status: "Status",
    actions: "Actions",
    edit: "Edit",
    delete: "Delete",
    restricted: "Restricted",
    close: "Close",
    save: "Save",
    cancel: "Cancel",
    currentPass: "Current Password",
    newPass: "New Password",
    confirmPass: "Confirm New Password",
  }
};

export default function App() {
  // LANGUAGE STATE (BM / EN)
  const [lang, setLang] = useState('BM');
  const t = translations[lang];

  // PAGE VIEW STATE: 'map' | 'login' | 'profile' | 'admin'
  const [currentPage, setCurrentPage] = useState('map');

  // AUTH STATE
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // UI MODALS STATE
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [editingData, setEditingData] = useState(null);

  // FORM TUKAR PASSWORD
  const [passwordForm, setPasswordForm] = useState({ current: '', newPass: '', confirmPass: '' });
  const [passwordStatus, setPasswordStatus] = useState('');

  // MAP & SIMULATION STATE
  const [selectedRegionKey, setSelectedRegionKey] = useState('lahad_datu');
  const [urbanExpansionRate, setUrbanExpansionRate] = useState(0); 

  // MOCK SPATIAL DATA
  const [spatialDataList, setSpatialDataList] = useState([
    { id: 'DAT-001', region: 'Lahad Datu (Sabah)', filename: 'lahad_datu_boundary_2026.geojson', size: '4.2 MB', uploadedBy: 'admin.sabah@sabah.gov.my', date: '2026-03-12', status: 'Verified' },
    { id: 'DAT-002', region: 'Selayang (Selangor)', filename: 'selayang_zone_planner_v2.shp', size: '12.8 MB', uploadedBy: 'zaki@plan.gov.my', date: '2026-02-18', status: 'Verified' },
    { id: 'DAT-003', region: 'Kuantan (Pahang)', filename: 'kuantan_coastal_risk_2026.json', size: '3.1 MB', uploadedBy: 'siti@utm.my', date: '2026-01-05', status: 'Pending Review' }
  ]);

  // MOCK USER LIST (SUPER ADMIN)
  const [usersList, setUsersList] = useState([
    { id: 1, name: "Ahmad Zaki", email: "zaki@plan.gov.my", role: "SUPER_ADMIN", provider: "MyGovUC SSO" },
    { id: 2, name: "Perancang Sabah", email: "admin.sabah@sabah.gov.my", role: "ADMIN", provider: "Microsoft Azure AD" },
    { id: 3, name: "Dr. Siti Aminah", email: "siti@utm.my", role: "USER", provider: "Google SSO" }
  ]);

  const database = {
    selayang: { name: "Selayang", coords: [3.2379, 101.6640], zoom: 13, baseRisk: 75 },
    kuantan: { name: "Kuantan", coords: [3.8077, 103.3260], zoom: 13, baseRisk: 68 },
    lahad_datu: { name: "Lahad Datu", coords: [5.0268, 118.3270], zoom: 12, baseRisk: 82 }
  };

  const current = database[selectedRegionKey];
  const calculatedRiskScore = Math.min(100, Math.round(current.baseRisk + (urbanExpansionRate * 1.2)));

  // SSO LOGIN HANDLER
  const handleSSOLogin = (provider, mockData) => {
    setCurrentUser({ ...mockData, provider });
    setIsAuthenticated(true);
    setCurrentPage('map');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setShowUserMenu(false);
    setCurrentPage('map');
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    if (passwordForm.newPass !== passwordForm.confirmPass) {
      setPasswordStatus(lang === 'BM' ? 'Kata laluan tidak sepadan!' : 'Passwords do not match!');
      return;
    }
    setPasswordStatus(lang === 'BM' ? 'Berjaya dikemaskini!' : 'Successfully updated!');
    setTimeout(() => {
      setShowPasswordModal(false);
      setPasswordStatus('');
      setPasswordForm({ current: '', newPass: '', confirmPass: '' });
    }, 1000);
  };

  const handleDeleteSpatial = (id) => {
    if (window.confirm(lang === 'BM' ? 'Adakah anda pasti ingin memadam data ini?' : 'Are you sure you want to delete this data?')) {
      setSpatialDataList(spatialDataList.filter(item => item.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans relative">
      
      {/* HEADER / NAVIGATION BAR */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex flex-wrap items-center justify-between gap-4 z-20">
        
        {/* SUDUT KIRI: TOGGLE DWI-BAHASA (BM / EN) + LOGO */}
        <div className="flex items-center gap-4">
          <div className="bg-slate-800 p-0.5 rounded-lg border border-slate-700 flex items-center">
            <button 
              onClick={() => setLang('BM')}
              className={`px-2.5 py-1 text-[11px] font-extrabold rounded-md transition ${lang === 'BM' ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'}`}
            >
              BM
            </button>
            <button 
              onClick={() => setLang('EN')}
              className={`px-2.5 py-1 text-[11px] font-extrabold rounded-md transition ${lang === 'EN' ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'}`}
            >
              EN
            </button>
          </div>

          <h1 
            onClick={() => setCurrentPage('map')} 
            className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2 cursor-pointer"
          >
            {t.title} <span className="text-emerald-400">AI</span>
          </h1>

          {/* ROLE BADGE */}
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
              🌐 {t.guest}
            </span>
          )}
        </div>

        {/* SUDUT KANAN: NAVIGATION & SSO BUTTON */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg border border-slate-700">
            <button 
              onClick={() => setCurrentPage('map')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition ${currentPage === 'map' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-300'}`}
            >
              {t.mapTab}
            </button>

            {isAuthenticated && (currentUser?.role === 'ADMIN' || currentUser?.role === 'SUPER_ADMIN') && (
              <button 
                onClick={() => setCurrentPage('admin')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition ${
                  currentPage === 'admin' 
                    ? currentUser?.role === 'SUPER_ADMIN' ? 'bg-purple-500 text-slate-950 font-bold' : 'bg-amber-500 text-slate-950 font-bold' 
                    : 'text-amber-400'
                }`}
              >
                {t.adminTab}
              </button>
            )}
          </div>

          {!isAuthenticated && currentPage !== 'login' && (
            <button 
              onClick={() => setCurrentPage('login')}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs px-4 py-2 rounded-lg shadow-lg shadow-emerald-500/10 transition flex items-center gap-2"
            >
              <span>🔑</span> {t.loginSSO}
            </button>
          )}

          {currentPage === 'login' && (
            <button 
              onClick={() => setCurrentPage('map')}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs px-3 py-2 rounded-lg border border-slate-700 transition"
            >
              ← {t.backToMap}
            </button>
          )}
        </div>
      </header>

      {/* 1. HALAMAN LOG MASUK SSO (LANDING / LOGIN PAGE) */}
      {currentPage === 'login' && (
        <main className="flex-1 flex items-center justify-center p-6 bg-slate-950">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-amber-500 to-purple-500"></div>

            <div className="text-center space-y-2">
              <h2 className="text-2xl font-black text-white tracking-tight">{t.ssoHeader}</h2>
              <p className="text-xs text-slate-400">{t.ssoSub}</p>
            </div>

            <div className="space-y-4">
              {/* Option 1: Super Admin */}
              <button 
                onClick={() => handleSSOLogin('MyGovUC SSO', { name: "Ahmad Zaki", email: "zaki@plan.gov.my", role: "SUPER_ADMIN" })}
                className="w-full bg-slate-800 hover:bg-purple-950/40 border border-slate-700 hover:border-purple-500/50 p-4 rounded-2xl flex items-center justify-between text-left transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-lg">🏛️</div>
                  <div>
                    <p className="text-xs font-bold text-white group-hover:text-purple-300">{t.loginAsSuperAdmin}</p>
                    <p className="text-[10px] text-slate-400">zaki@plan.gov.my • MyGovUC</p>
                  </div>
                </div>
                <span className="text-[10px] bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded font-mono font-bold">SUPER ADMIN</span>
              </button>

              {/* Option 2: Admin */}
              <button 
                onClick={() => handleSSOLogin('Microsoft Azure AD', { name: "Perancang Sabah", email: "admin.sabah@sabah.gov.my", role: "ADMIN" })}
                className="w-full bg-slate-800 hover:bg-amber-950/40 border border-slate-700 hover:border-amber-500/50 p-4 rounded-2xl flex items-center justify-between text-left transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-lg">🏢</div>
                  <div>
                    <p className="text-xs font-bold text-white group-hover:text-amber-300">{t.loginAsAdmin}</p>
                    <p className="text-[10px] text-slate-400">admin.sabah@sabah.gov.my • Azure AD</p>
                  </div>
                </div>
                <span className="text-[10px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded font-mono font-bold">ADMIN</span>
              </button>

              {/* Option 3: Standard User */}
              <button 
                onClick={() => handleSSOLogin('Google SSO', { name: "Dr. Siti Aminah", email: "siti@utm.my", role: "USER" })}
                className="w-full bg-slate-800 hover:bg-emerald-950/40 border border-slate-700 hover:border-emerald-500/50 p-4 rounded-2xl flex items-center justify-between text-left transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-lg">🌐</div>
                  <div>
                    <p className="text-xs font-bold text-white group-hover:text-emerald-300">{t.loginAsUser}</p>
                    <p className="text-[10px] text-slate-400">siti@utm.my • Google SSO</p>
                  </div>
                </div>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-mono font-bold">USER</span>
              </button>
            </div>
          </div>
        </main>
      )}

      {/* 2. HALAMAN UTAMA / MAP VIEW */}
      {currentPage === 'map' && (
        <main className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="space-y-6 lg:col-span-1">
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
              <label className="text-xs text-slate-400 block font-semibold">{t.selectRegion}</label>
              <select 
                value={selectedRegionKey}
                onChange={(e) => setSelectedRegionKey(e.target.value)}
                className="w-full bg-slate-800 text-sm font-semibold text-emerald-400 px-3 py-2 rounded-lg border border-slate-700 focus:outline-none"
              >
                <option value="lahad_datu">Lahad Datu (Sabah)</option>
                <option value="selayang">Selayang (Selangor)</option>
                <option value="kuantan">Kuantan (Pahang)</option>
              </select>

              <div className="space-y-3 pt-2 border-t border-slate-800">
                <div className="flex justify-between items-center">
                  <h2 className="text-xs font-bold uppercase text-emerald-400">{t.urbanSim}</h2>
                  <span className="text-xs font-mono font-bold text-amber-400">+{urbanExpansionRate}%</span>
                </div>
                <input 
                  type="range" min="0" max="25" value={urbanExpansionRate}
                  onChange={(e) => setUrbanExpansionRate(e.target.value)}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                />
                <div className="flex justify-between text-xs pt-1">
                  <span className="text-slate-400">{t.riskScore}:</span>
                  <span className="font-bold text-red-400">{calculatedRiskScore} / 100</span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3 bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden relative min-h-[480px]">
            <MapContainer key={selectedRegionKey} center={current.coords} zoom={current.zoom} className="w-full h-full min-h-[480px]">
              <TileLayer url="https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}" />
              <TileLayer url="https://mt1.google.com/vt/lyrs=h&x={x}&y={y}&z={z}" />
              <Circle center={current.coords} radius={1000 + (urbanExpansionRate * 80)} pathOptions={{ color: 'red', fillColor: 'red', fillOpacity: 0.35 }} />
              <Marker position={current.coords}><Popup>{current.name}</Popup></Marker>
            </MapContainer>
          </div>
        </main>
      )}

      {/* 3. HALAMAN PROFIL PENGGUNA */}
      {currentPage === 'profile' && isAuthenticated && (
        <main className="flex-1 p-6 max-w-3xl mx-auto w-full space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500 flex items-center justify-center text-emerald-400 font-bold text-xl">
                {currentUser.name.charAt(0)}
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">{currentUser.name}</h2>
                <p className="text-xs text-slate-400">{currentUser.email}</p>
                <p className="text-[10px] text-emerald-400 mt-1 font-mono">SSO: {currentUser.provider}</p>
              </div>
            </div>
            <span className="bg-slate-800 border border-slate-700 text-xs px-3 py-1 rounded-lg text-amber-400 font-bold">
              {currentUser.role}
            </span>
          </div>
        </main>
      )}

      {/* 4. HALAMAN ADMIN & SUPER ADMIN */}
      {currentPage === 'admin' && isAuthenticated && (currentUser?.role === 'ADMIN' || currentUser?.role === 'SUPER_ADMIN') && (
        <main className="flex-1 p-6 max-w-6xl mx-auto w-full space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              ⚙️ {t.adminTitle} ({currentUser.role})
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
              <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider">{t.uploadTitle}</h3>
              <div className="border-2 border-dashed border-slate-700 rounded-xl p-6 text-center bg-slate-950/40 cursor-pointer">
                <div className="text-2xl mb-1">📁</div>
                <p className="text-xs text-slate-300">{t.dragDrop}</p>
              </div>
            </div>

            <div className={`p-6 rounded-2xl space-y-4 border ${currentUser?.role === 'SUPER_ADMIN' ? 'bg-slate-900 border-purple-500/40' : 'bg-slate-900/40 border-slate-800 opacity-50'}`}>
              <h3 className="text-xs font-bold text-purple-400 uppercase tracking-wider">{t.userMgmtTitle}</h3>
              {currentUser?.role === 'SUPER_ADMIN' ? (
                <div className="space-y-2 text-xs">
                  {usersList.map(u => (
                    <div key={u.id} className="bg-slate-800 p-2.5 rounded-lg flex justify-between items-center">
                      <div>
                        <p className="font-bold text-slate-200">{u.name}</p>
                        <p className="text-[10px] text-slate-400">{u.email}</p>
                      </div>
                      <span className="text-[10px] bg-slate-900 px-2 py-0.5 rounded text-emerald-400 font-mono font-bold border border-slate-700">{u.role}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic py-6 text-center">{t.restricted}</p>
              )}
            </div>
          </div>

          {/* JADUAL DATA SPATIAL */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">{t.dataListTitle}</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase font-semibold">
                    <th className="py-3 px-3">{t.dataId}</th>
                    <th className="py-3 px-3">{t.region}</th>
                    <th className="py-3 px-3">{t.filename}</th>
                    <th className="py-3 px-3">{t.uploader}</th>
                    <th className="py-3 px-3">{t.status}</th>
                    <th className="py-3 px-3 text-right">{t.actions}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {spatialDataList.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-850/50 transition">
                      <td className="py-3 px-3 font-mono text-emerald-400 font-bold">{item.id}</td>
                      <td className="py-3 px-3 font-semibold text-slate-200">{item.region}</td>
                      <td className="py-3 px-3 text-slate-300 font-mono text-[11px]">{item.filename}</td>
                      <td className="py-3 px-3 text-slate-400">{item.uploadedBy}</td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right space-x-2">
                        <button onClick={() => setEditingData(item)} className="bg-slate-800 text-amber-400 font-semibold px-2 py-1 rounded border border-slate-700">{t.edit}</button>
                        {currentUser?.role === 'SUPER_ADMIN' && (
                          <button onClick={() => handleDeleteSpatial(item.id)} className="bg-red-500/10 text-red-400 font-semibold px-2 py-1 rounded border border-red-500/30">{t.delete}</button>
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

      {/* MENU AKAUN TERAPUNG (BOTTOM RIGHT) */}
      {isAuthenticated && (
        <div className="fixed bottom-6 right-6 z-50">
          {showUserMenu && (
            <div className="mb-3 bg-slate-900 border border-slate-800 rounded-2xl p-2 w-56 shadow-2xl space-y-1">
              <div className="px-3 py-2 border-b border-slate-800">
                <p className="text-xs font-bold text-white truncate">{currentUser?.name}</p>
                <p className="text-[10px] text-slate-400 truncate">{currentUser?.email}</p>
              </div>

              <button 
                onClick={() => { setCurrentPage('profile'); setShowUserMenu(false); }}
                className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition"
              >
                👤 {t.profile}
              </button>

              <button 
                onClick={() => { setShowPasswordModal(true); setShowUserMenu(false); }}
                className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition"
              >
                🔑 {t.changePass}
              </button>

              <button 
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 text-xs font-bold text-red-400 hover:bg-red-500/10 rounded-xl transition"
              >
                🚪 {t.logout}
              </button>
            </div>
          )}

          <button 
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="bg-slate-900 hover:bg-slate-800 text-white p-2.5 rounded-full border border-slate-700 shadow-2xl flex items-center gap-3 pr-4 transition"
          >
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500 flex items-center justify-center font-bold text-emerald-400 text-xs">
              {currentUser?.name ? currentUser.name.charAt(0) : 'U'}
            </div>
            <span className="text-xs font-bold hidden sm:inline">{currentUser?.name}</span>
          </button>
        </div>
      )}

      {/* MODAL TUKAR KATA LALUAN */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white">🔑 {t.changePass}</h3>
              <button onClick={() => setShowPasswordModal(false)} className="text-slate-400 hover:text-white font-bold text-sm">✕</button>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">{t.currentPass}</label>
                <input type="password" required value={passwordForm.current} onChange={(e) => setPasswordForm({...passwordForm, current: e.target.value})} className="w-full bg-slate-800 border border-slate-700 text-xs px-3 py-2 rounded-lg text-white" />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">{t.newPass}</label>
                <input type="password" required value={passwordForm.newPass} onChange={(e) => setPasswordForm({...passwordForm, newPass: e.target.value})} className="w-full bg-slate-800 border border-slate-700 text-xs px-3 py-2 rounded-lg text-white" />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">{t.confirmPass}</label>
                <input type="password" required value={passwordForm.confirmPass} onChange={(e) => setPasswordForm({...passwordForm, confirmPass: e.target.value})} className="w-full bg-slate-800 border border-slate-700 text-xs px-3 py-2 rounded-lg text-white" />
              </div>

              {passwordStatus && <p className="text-[11px] font-semibold text-emerald-400">{passwordStatus}</p>}

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowPasswordModal(false)} className="px-3 py-1.5 text-xs text-slate-400">{t.cancel}</button>
                <button type="submit" className="bg-emerald-500 text-slate-950 font-bold text-xs px-4 py-1.5 rounded-lg">{t.save}</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
