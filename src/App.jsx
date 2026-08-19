import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, LayersControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// DICTIONARY DWI-BAHASA (BM / EN) - JPBW SABAH E-ZONING
const translations = {
  BM: {
    title: "E-Zoning Sabah",
    logout: "Log Keluar",
    profile: "Profil Pengguna",
    changePass: "Tukar Kata Laluan",
    mapTab: "Peta Spatial & Analisis",
    adminTab: "Panel Admin (IOC)",
    selectRegion: "Pilih Daerah (Sabah):",
    urbanSim: "Simulasi Pembangunan Guna Tanah",
    riskScore: "Skor Indeks Konflik Zon",
    ssoHeader: "Portal Log Masuk SSO E-Zoning",
    ssoSub: "Sila pilih akses identiti SSO agensi/pengguna untuk meneruskan",
    loginAsSuperAdmin: "Log Masuk sebagai Super Admin (JPBW)",
    loginAsAdmin: "Log Masuk sebagai System Admin",
    loginAsUser: "Log Masuk sebagai Public User (Orang Awam)",
    satEsri: "Satelit Esri High-Resolution",
    satGoogle: "Satelit Google Standard",
    satOsm: "OpenStreetMap Terrain",
    adminTitle: "Dashboard Pengurusan Data Spatial E-Zoning",
    uploadTitle: "Import Fail GIS (.geojson / .shp)",
    dragDrop: "Klik atau seret fail Shapefile / GeoJSON di sini (EPSG:4326 / EPSG:29873)",
    userMgmtTitle: "Pengurusan Pengguna & Peranan",
    dataListTitle: "Senarai Layer GIS Rasmi JPBW Sabah",
    dataId: "ID Layer",
    region: "Daerah",
    filename: "Nama Fail / Layer",
    uploader: "Dimuat Naik Oleh",
    status: "Status Kelulusan",
    actions: "Tindakan",
    edit: "Edit Attributes",
    delete: "Padam",
    restricted: "Akses Terhad kepada Super Admin JPBW",
    close: "Tutup",
    save: "Simpan",
    cancel: "Batal",
    currentPass: "Kata Laluan Sedia Ada",
    newPass: "Kata Laluan Baharu",
    confirmPass: "Sahkan Kata Laluan",
    profileTitle: "Maklumat Profil Akaun E-Zoning",
    personalInfo: "Maklumat Peribadi & Jabatan",
    sysPermissions: "Tahap Kebenaran Akses Layer GIS",
    recentActivity: "Aktiviti Carian & Transaksi",
  },
  EN: {
    title: "E-Zoning Sabah",
    logout: "Sign Out",
    profile: "User Profile",
    changePass: "Change Password",
    mapTab: "Spatial Map & Analytics",
    adminTab: "Admin Panel (IOC)",
    selectRegion: "Select District (Sabah):",
    urbanSim: "Land Use Development Simulation",
    riskScore: "Zoning Conflict Index Score",
    ssoHeader: "E-Zoning SSO Login Portal",
    ssoSub: "Please select your agency/user SSO identity provider",
    loginAsSuperAdmin: "Log in as Super Admin (JPBW)",
    loginAsAdmin: "Log in as System Admin",
    loginAsUser: "Log in as Public User",
    satEsri: "Esri High-Resolution Satellite",
    satGoogle: "Google Standard Satellite",
    satOsm: "OpenStreetMap Terrain",
    adminTitle: "E-Zoning Spatial Data Management Dashboard",
    uploadTitle: "Import GIS File (.geojson / .shp)",
    dragDrop: "Click or drag Shapefile / GeoJSON files here (EPSG:4326 / EPSG:29873)",
    userMgmtTitle: "User Management & Roles",
    dataListTitle: "JPBW Sabah Official GIS Layer List",
    dataId: "Layer ID",
    region: "District",
    filename: "File / Layer Name",
    uploader: "Uploaded By",
    status: "Approval Status",
    actions: "Actions",
    edit: "Edit Attributes",
    delete: "Delete",
    restricted: "Restricted to JPBW Super Admin",
    close: "Close",
    save: "Save",
    cancel: "Cancel",
    currentPass: "Current Password",
    newPass: "New Password",
    confirmPass: "Confirm Password",
    profileTitle: "E-Zoning Account Profile Information",
    personalInfo: "Personal & Department Info",
    sysPermissions: "GIS Layer Access Permissions",
    recentActivity: "Search Activity & Transactions",
  }
};

export default function App() {
  const [lang, setLang] = useState('BM');
  const t = translations[lang];

  // AUTH STATE
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // PAGE VIEW STATE: 'map' | 'profile' | 'admin'
  const [currentPage, setCurrentPage] = useState('map');

  // UI MODALS
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current: '', newPass: '', confirmPass: '' });
  const [passwordStatus, setPasswordStatus] = useState('');

  // MAP STATE - SABAH DISTRICTS
  const [selectedRegionKey, setSelectedRegionKey] = useState('kota_kinabalu');
  const [urbanExpansionRate, setUrbanExpansionRate] = useState(0); 

  // ORIGINAL GIS DATA LAYERS (RUJUKAN DOKUMEN URS JPBW SABAH)
  const [spatialDataList] = useState([
    { id: 'LYR-ZONINGPD', region: 'Kota Kinabalu', filename: 'ZONINGPD.geojson (Landuse District Plan)', uploadedBy: 'admin.jpbw@sabah.gov.my', status: 'Approved' },
    { id: 'LYR-KADASTER', region: 'Penampang', filename: 'KADASTER.shp (Cadastral Lots & Parcel UPI)', uploadedBy: 'admin.jpbw@sabah.gov.my', status: 'Approved' },
    { id: 'LYR-ZONINGPT', region: 'Putatan', filename: 'ZONINGPT.geojson (Local Plan Landuse)', uploadedBy: 'system.admin@sabah.gov.my', status: 'Approved' },
    { id: 'LYR-BKLAIR1', region: 'Tuaran', filename: 'BKLAIR1.shp (Water Pipeline Infrastructure)', uploadedBy: 'water.dept@sabah.gov.my', status: 'Pending Approval' },
    { id: 'LYR-ELEKTRIK1', region: 'Kota Kinabalu', filename: 'ELEKTRIK1.shp (High Voltage Grid)', uploadedBy: 'sesb.admin@sabah.gov.my', status: 'Approved' }
  ]);

  // USERS LIST ACCORDING TO URS SPECIFICATION (SUPER ADMIN, SYSTEM ADMIN, PUBLIC USER)
  const [usersList] = useState([
    { id: 1, name: "Pegawai JPBW Sabah", email: "superadmin.jpbw@sabah.gov.my", role: "SUPER_ADMIN", provider: "Sabah Pay / Govt SSO" },
    { id: 2, name: "Perancang Bandar", email: "sysadmin.planner@sabah.gov.my", role: "SYSTEM_ADMIN", provider: "Microsoft Azure AD" },
    { id: 3, name: "Pengguna Awam / Pemaju", email: "public.user@gmail.com", role: "PUBLIC_USER", provider: "MyGovUC SSO" }
  ]);

  // SABAH TARGET DISTRICTS (FROM URS REPORT)
  const database = {
    kota_kinabalu: { name: "Kota Kinabalu", coords: [5.9804, 116.0735], zoom: 12, baseRisk: 70 },
    penampang: { name: "Penampang", coords: [5.9122, 116.1030], zoom: 13, baseRisk: 65 },
    putatan: { name: "Putatan", coords: [5.8920, 116.0500], zoom: 13, baseRisk: 60 },
    tuaran: { name: "Tuaran", coords: [6.1778, 116.2308], zoom: 12, baseRisk: 55 }
  };

  const current = database[selectedRegionKey];
  const calculatedRiskScore = Math.min(100, Math.round(current.baseRisk + (urbanExpansionRate * 1.2)));

  const handleSSOLogin = (provider, mockData) => {
    setCurrentUser({
      ...mockData,
      provider,
      department: mockData.role === 'SUPER_ADMIN' ? 'Jabatan Perancang Bandar & Wilayah (JPBW)' : mockData.role === 'SYSTEM_ADMIN' ? 'Bahagian Pemetaan Spatial' : 'Orang Awam / Penyelidik',
      phone: "+60 88-123 456",
      joinedDate: "15 Jan 2025",
      tokens: mockData.role === 'PUBLIC_USER' ? 100 : 'Unlimited'
    });
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

  // 1. LANDING PAGE SSO LOG IN (CLEAN WHITE THEME WITH EMERALD/BLUE BORDERS)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <div className="bg-slate-100 p-0.5 rounded-lg border border-slate-200 flex items-center">
              <button onClick={() => setLang('BM')} className={`px-3 py-1 text-[11px] font-bold rounded-md transition ${lang === 'BM' ? 'bg-emerald-600 text-white shadow' : 'text-slate-500'}`}>BM</button>
              <button onClick={() => setLang('EN')} className={`px-3 py-1 text-[11px] font-bold rounded-md transition ${lang === 'EN' ? 'bg-emerald-600 text-white shadow' : 'text-slate-500'}`}>EN</button>
            </div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">{t.title} <span className="text-emerald-600">JPBW</span></h1>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-8 space-y-8 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-500 via-blue-500 to-emerald-500"></div>
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">{t.ssoHeader}</h2>
              <p className="text-sm text-slate-500">{t.ssoSub}</p>
            </div>

            <div className="space-y-4">
              <button onClick={() => handleSSOLogin('Sabah Govt SSO', { name: "Pegawai JPBW Sabah", email: "superadmin.jpbw@sabah.gov.my", role: "SUPER_ADMIN" })} className="w-full bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-400 p-4 rounded-2xl flex items-center justify-between text-left transition shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg">🏛️</div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">{t.loginAsSuperAdmin}</p>
                    <p className="text-[11px] text-slate-500">superadmin.jpbw@sabah.gov.my</p>
                  </div>
                </div>
              </button>

              <button onClick={() => handleSSOLogin('Microsoft Azure AD', { name: "Perancang Bandar", email: "sysadmin.planner@sabah.gov.my", role: "SYSTEM_ADMIN" })} className="w-full bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-400 p-4 rounded-2xl flex items-center justify-between text-left transition shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-lg">🏢</div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">{t.loginAsAdmin}</p>
                    <p className="text-[11px] text-slate-500">sysadmin.planner@sabah.gov.my</p>
                  </div>
                </div>
              </button>

              <button onClick={() => handleSSOLogin('MyGovUC / Google', { name: "Pengguna Awam", email: "public.user@gmail.com", role: "PUBLIC_USER" })} className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-400 p-4 rounded-2xl flex items-center justify-between text-left transition shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-lg">🌐</div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">{t.loginAsUser}</p>
                    <p className="text-[11px] text-slate-500">public.user@gmail.com</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // 2. DASHBOARD UTAMA (CLEAN WHITE THEME + ACCENT BORDERS)
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans relative">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex flex-wrap items-center justify-between gap-4 z-20 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="bg-slate-100 p-0.5 rounded-lg border border-slate-200 flex items-center">
            <button onClick={() => setLang('BM')} className={`px-3 py-1 text-[11px] font-bold rounded-md transition ${lang === 'BM' ? 'bg-emerald-600 text-white shadow' : 'text-slate-500'}`}>BM</button>
            <button onClick={() => setLang('EN')} className={`px-3 py-1 text-[11px] font-bold rounded-md transition ${lang === 'EN' ? 'bg-emerald-600 text-white shadow' : 'text-slate-500'}`}>EN</button>
          </div>
          <h1 onClick={() => setCurrentPage('map')} className="text-xl font-extrabold text-slate-900 tracking-tight cursor-pointer">
            {t.title} <span className="text-emerald-600">JPBW</span>
          </h1>
          <span className={`text-[10px] px-3 py-1 rounded-full font-bold border ${
            currentUser?.role === 'SUPER_ADMIN' ? 'bg-blue-50 text-blue-700 border-blue-300' : currentUser?.role === 'SYSTEM_ADMIN' ? 'bg-amber-50 text-amber-700 border-amber-300' : 'bg-emerald-50 text-emerald-700 border-emerald-300'
          }`}>
            {currentUser?.role}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button onClick={() => setCurrentPage('map')} className={`px-4 py-1.5 text-xs font-bold rounded-md transition ${currentPage === 'map' ? 'bg-white text-emerald-700 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'}`}>
              🗺️ {t.mapTab}
            </button>
            {(currentUser?.role === 'SYSTEM_ADMIN' || currentUser?.role === 'SUPER_ADMIN') && (
              <button onClick={() => setCurrentPage('admin')} className={`px-4 py-1.5 text-xs font-bold rounded-md transition ${currentPage === 'admin' ? 'bg-white text-blue-700 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'}`}>
                ⚙️ {t.adminTab}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* VIEW 1: MAP + PANEL ANALISIS (ORIGINAL SABAH DATA) */}
      {currentPage === 'map' && (
        <main className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="space-y-6 lg:col-span-1">
            <div className="bg-white border-t-4 border-t-emerald-500 border-x border-b border-slate-200 p-5 rounded-xl space-y-4 shadow-sm">
              <label className="text-xs text-slate-500 block font-bold uppercase tracking-wide">{t.selectRegion}</label>
              <select 
                value={selectedRegionKey}
                onChange={(e) => setSelectedRegionKey(e.target.value)}
                className="w-full bg-slate-50 text-sm font-bold text-slate-800 px-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              >
                <option value="kota_kinabalu">Kota Kinabalu (Raster / Zoning)</option>
                <option value="penampang">Penampang (Kadaster / Lot)</option>
                <option value="putatan">Putatan (Zoning PT)</option>
                <option value="tuaran">Tuaran (Infrastruktur / Utility)</option>
              </select>

              <div className="space-y-3 pt-4 border-t border-slate-100">
                <div className="flex justify-between items-center">
                  <h2 className="text-xs font-bold uppercase text-slate-700">{t.urbanSim}</h2>
                  <span className="text-xs font-mono font-bold text-blue-600">+{urbanExpansionRate}%</span>
                </div>
                <input 
                  type="range" min="0" max="25" value={urbanExpansionRate}
                  onChange={(e) => setUrbanExpansionRate(e.target.value)}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
                <div className="flex justify-between text-xs pt-1">
                  <span className="font-semibold text-slate-500">{t.riskScore}:</span>
                  <span className={`font-bold ${calculatedRiskScore > 75 ? 'text-red-600' : 'text-amber-600'}`}>{calculatedRiskScore} / 100</span>
                </div>
              </div>
            </div>

            {/* INFORMASI TIER LAYER ACCORDING TO URS */}
            <div className="bg-white border-l-4 border-l-blue-500 border-y border-r border-slate-200 p-4 rounded-xl shadow-sm text-xs space-y-2">
              <h3 className="font-bold text-slate-800 uppercase tracking-wide">Peringkat Akses Layer (Sabah E-Zoning)</h3>
              <p className="text-slate-600">● <strong>1st Level (FOC):</strong> Akses asas 9 atribut (Daerah, Kod Geran)[span_20](start_span)[span_20](end_span).</p>
              <p className="text-slate-600">● <strong>2nd Level (Subscription):</strong> Akses 8 atribut tambahan pelan daerah[span_21](start_span)[span_21](end_span).</p>
              <p className="text-slate-600">● <strong>3rd Level (Token Access):</strong> Carian Lot Kadaster (10 Token / Parcel)[span_22](start_span)[span_22](end_span).</p>
            </div>
          </div>

          <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden relative min-h-[500px] z-0">
            <MapContainer key={selectedRegionKey} center={current.coords} zoom={current.zoom} className="w-full h-full min-h-[500px]">
              <LayersControl position="topright">
                <LayersControl.BaseLayer checked name={t.satEsri}>
                  <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
                </LayersControl.BaseLayer>
                <LayersControl.BaseLayer name={t.satGoogle}>
                  <TileLayer url="https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}" />
                </LayersControl.BaseLayer>
                <LayersControl.BaseLayer name={t.satOsm}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                </LayersControl.BaseLayer>
              </LayersControl>
              <TileLayer url="https://mt1.google.com/vt/lyrs=h&x={x}&y={y}&z={z}" />
              <Circle center={current.coords} radius={1000 + (urbanExpansionRate * 80)} pathOptions={{ color: '#059669', fillColor: '#10b981', fillOpacity: 0.3 }} />
              <Marker position={current.coords}><Popup>{current.name} - GIS Spatial Layer Active</Popup></Marker>
            </MapContainer>
          </div>
        </main>
      )}

      {/* VIEW 2: HALAMAN PROFIL PENGGUNA (DESIGN BERSIH, PUTIH, BORDER HIJAU & BIRU) */}
      {currentPage === 'profile' && (
        <main className="flex-1 p-6 max-w-5xl mx-auto w-full space-y-6">
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">👤 {t.profileTitle}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* KAD PROFIL KIRI */}
            <div className="md:col-span-1 bg-white border-t-4 border-t-blue-500 border-x border-b border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col items-center text-center space-y-4">
              <div className="w-24 h-24 rounded-full bg-blue-50 border-2 border-blue-400 shadow-md flex items-center justify-center text-blue-600 font-black text-4xl">
                {currentUser?.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">{currentUser?.name}</h3>
                <p className="text-sm text-slate-500 mb-2">{currentUser?.email}</p>
                <span className="bg-slate-100 border border-slate-200 text-xs px-3 py-1 rounded-full text-slate-700 font-bold">
                  Role: {currentUser?.role}
                </span>
              </div>
              <div className="w-full border-t border-slate-100 pt-4 mt-2">
                <button onClick={() => setShowPasswordModal(true)} className="w-full bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold text-xs py-2 rounded-lg transition shadow-sm">
                  🔑 {t.changePass}
                </button>
              </div>
            </div>

            {/* KAD MAKLUMAT KANAN */}
            <div className="md:col-span-2 space-y-6">
              
              {/* MAKLUMAT PERIBADI */}
              <div className="bg-white border-l-4 border-l-emerald-500 border-y border-r border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2 uppercase tracking-wide">{t.personalInfo}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className="text-[11px] text-slate-400 font-bold uppercase block mb-1">Nama Penuh</label>
                    <p className="font-semibold text-slate-800">{currentUser?.name}</p>
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 font-bold uppercase block mb-1">Penyedia SSO</label>
                    <p className="font-semibold text-slate-800">{currentUser?.provider}</p>
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 font-bold uppercase block mb-1">Jabatan / Agensi</label>
                    <p className="font-semibold text-slate-800">{currentUser?.department}</p>
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 font-bold uppercase block mb-1">Baki Token Carian</label>
                    <p className="font-bold text-emerald-600">{currentUser?.tokens}</p>
                  </div>
                </div>
              </div>

              {/* KEBENARAN SISTEM E-ZONING */}
              <div className="bg-white border-l-4 border-l-blue-500 border-y border-r border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2 uppercase tracking-wide">{t.sysPermissions}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-200">✅</div>
                    <div>
                      <p className="font-bold text-slate-800">Akses Peta Interactive IOC</p>
                      <p className="text-[11px] text-slate-500">Melihat layer ZONINGPD, ZONINGPT & KADASTER[span_23](start_span)[span_23](end_span).</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${currentUser?.role !== 'PUBLIC_USER' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
                      {currentUser?.role !== 'PUBLIC_USER' ? '✅' : '❌'}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">Muat Naik Layer Spatial JPBW</p>
                      <p className="text-[11px] text-slate-500">Menambah data Shapefile (.shp) & GeoJSON[span_24](start_span)[span_24](end_span).</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${currentUser?.role === 'SUPER_ADMIN' ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
                      {currentUser?.role === 'SUPER_ADMIN' ? '👑' : '❌'}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">Kelulusan Data & Pengurusan Pengguna</p>
                      <p className="text-[11px] text-slate-500">Kelulusan akhir layer spatial sebelum diterbitkan[span_25](start_span)[span_25](end_span).</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* AKTIVITI TERKINI */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2 uppercase tracking-wide">{t.recentActivity}</h3>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-center justify-between border-b border-slate-50 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🗺️</span>
                      <span className="text-slate-700 font-medium">Log masuk SSO E-Zoning Sabah</span>
                    </div>
                    <span className="text-xs text-slate-400">Hari ini, 08:30 AM</span>
                  </li>
                  <li className="flex items-center justify-between border-b border-slate-50 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">📍</span>
                      <span className="text-slate-700 font-medium">Carian Lot Kadaster di Kota Kinabalu</span>
                    </div>
                    <span className="text-xs text-slate-400">Semalam, 14:15 PM</span>
                  </li>
                </ul>
              </div>

            </div>
          </div>
        </main>
      )}

      {/* VIEW 3: HALAMAN ADMIN (CLEAN WHITE THEME) */}
      {currentPage === 'admin' && (currentUser?.role === 'SYSTEM_ADMIN' || currentUser?.role === 'SUPER_ADMIN') && (
        <main className="flex-1 p-6 max-w-6xl mx-auto w-full space-y-6">
          <div className="border-b border-slate-200 pb-4">
            <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
              ⚙️ {t.adminTitle}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border-t-4 border-t-emerald-500 border-x border-b border-slate-200 p-6 rounded-2xl space-y-4 shadow-sm">
              <h3 className="text-xs font-bold text-emerald-600 uppercase tracking-wider">{t.uploadTitle}</h3>
              <div className="border-2 border-dashed border-slate-300 hover:border-emerald-500 hover:bg-emerald-50 rounded-xl p-8 text-center bg-slate-50 cursor-pointer transition">
                <div className="text-3xl mb-2">📁</div>
                <p className="text-xs text-slate-500 font-semibold">{t.dragDrop}</p>
              </div>
            </div>

            <div className={`p-6 rounded-2xl space-y-4 border shadow-sm ${currentUser?.role === 'SUPER_ADMIN' ? 'bg-white border-t-4 border-t-blue-500 border-x border-b border-slate-200' : 'bg-slate-50 border-slate-200 opacity-70'}`}>
              <h3 className={`text-xs font-bold uppercase tracking-wider ${currentUser?.role === 'SUPER_ADMIN' ? 'text-blue-600' : 'text-slate-400'}`}>{t.userMgmtTitle}</h3>
              {currentUser?.role === 'SUPER_ADMIN' ? (
                <div className="space-y-2 text-xs">
                  {usersList.map(u => (
                    <div key={u.id} className="bg-slate-50 p-3 rounded-xl flex justify-between items-center border border-slate-200">
                      <div>
                        <p className="font-bold text-slate-800">{u.name}</p>
                        <p className="text-[10px] text-slate-500">{u.email}</p>
                      </div>
                      <span className="text-[10px] bg-white px-2 py-1 rounded-md text-blue-700 font-bold border border-slate-200 shadow-sm">{u.role}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic py-8 text-center">{t.restricted}</p>
              )}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">{t.dataListTitle}</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 uppercase font-bold bg-slate-50">
                    <th className="py-3 px-4 rounded-tl-lg">{t.dataId}</th>
                    <th className="py-3 px-4">{t.region}</th>
                    <th className="py-3 px-4">{t.filename}</th>
                    <th className="py-3 px-4">{t.uploader}</th>
                    <th className="py-3 px-4">{t.status}</th>
                    <th className="py-3 px-4 text-right rounded-tr-lg">{t.actions}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {spatialDataList.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-4 font-mono text-slate-600 font-bold">{item.id}</td>
                      <td className="py-3 px-4 font-bold text-slate-800">{item.region}</td>
                      <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">{item.filename}</td>
                      <td className="py-3 px-4 text-slate-500">{item.uploadedBy}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold border ${item.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <button className="bg-white text-blue-600 hover:bg-blue-50 font-bold px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">{t.edit}</button>
                        {currentUser?.role === 'SUPER_ADMIN' && (
                          <button className="bg-white text-red-600 hover:bg-red-50 font-bold px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">{t.delete}</button>
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

      {/* MENU AKAUN TERAPUNG */}
      <div className="fixed bottom-6 right-6 z-50">
        {showUserMenu && (
          <div className="mb-3 bg-white border border-slate-200 rounded-2xl p-2 w-56 shadow-xl space-y-1">
            <div className="px-3 py-3 border-b border-slate-100 bg-slate-50 rounded-t-xl mb-1">
              <p className="text-sm font-bold text-slate-800 truncate">{currentUser?.name}</p>
              <p className="text-[10px] text-slate-500 truncate">{currentUser?.email}</p>
            </div>
            <button onClick={() => { setCurrentPage('profile'); setShowUserMenu(false); }} className="w-full text-left px-3 py-2 text-xs font-bold text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition">
              👤 {t.profile}
            </button>
            <button onClick={() => { setShowPasswordModal(true); setShowUserMenu(false); }} className="w-full text-left px-3 py-2 text-xs font-bold text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition">
              🔑 {t.changePass}
            </button>
            <button onClick={handleLogout} className="w-full text-left px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-lg transition">
              🚪 {t.logout}
            </button>
          </div>
        )}

        <button onClick={() => setShowUserMenu(!showUserMenu)} className="bg-white hover:bg-slate-50 text-slate-800 p-2 rounded-full border border-slate-200 shadow-lg flex items-center gap-3 pr-4 transition">
          <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 border border-blue-300 flex items-center justify-center font-black text-sm">
            {currentUser?.name ? currentUser.name.charAt(0) : 'U'}
          </div>
          <span className="text-sm font-bold hidden sm:inline">{currentUser?.name}</span>
        </button>
      </div>

      {/* MODAL TUKAR KATA LALUAN */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-sm w-full p-6 space-y-5 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-800">🔑 {t.changePass}</h3>
              <button onClick={() => setShowPasswordModal(false)} className="text-slate-400 hover:text-slate-700 font-bold text-lg">✕</button>
            </div>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-slate-500 block mb-1 uppercase">{t.currentPass}</label>
                <input type="password" required value={passwordForm.current} onChange={(e) => setPasswordForm({...passwordForm, current: e.target.value})} className="w-full bg-slate-50 border border-slate-200 text-sm px-3 py-2.5 rounded-lg text-slate-800 focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-500 block mb-1 uppercase">{t.newPass}</label>
                <input type="password" required value={passwordForm.newPass} onChange={(e) => setPasswordForm({...passwordForm, newPass: e.target.value})} className="w-full bg-slate-50 border border-slate-200 text-sm px-3 py-2.5 rounded-lg text-slate-800 focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-500 block mb-1 uppercase">{t.confirmPass}</label>
                <input type="password" required value={passwordForm.confirmPass} onChange={(e) => setPasswordForm({...passwordForm, confirmPass: e.target.value})} className="w-full bg-slate-50 border border-slate-200 text-sm px-3 py-2.5 rounded-lg text-slate-800 focus:outline-none focus:border-blue-500" />
              </div>
              {passwordStatus && <p className="text-xs font-bold text-emerald-600 bg-emerald-50 p-2 rounded-lg text-center border border-emerald-100">{passwordStatus}</p>}
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button type="button" onClick={() => setShowPasswordModal(false)} className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-50 rounded-lg">{t.cancel}</button>
                <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2 rounded-lg shadow-sm">{t.save}</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
