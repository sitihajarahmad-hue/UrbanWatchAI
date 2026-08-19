import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, LayersControl, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// --------------------------------------------------------------------------
// 1. ISIKAN ID FAIL GOOGLE DRIVE KORANG DI SINI
// --------------------------------------------------------------------------
// Contoh: Jika URL Google Drive = https://drive.google.com/file/d/1ABC123xyz/view
// ID Fail = 1ABC123xyz
const GTS_FILE_ID = "16_6ir9Tj0FidZseKJB4c10U_U1IMNFNQ"; 

// Menggunakan Proxy CORS untuk mengelakkan ralat "Failed to fetch"
const DRIVE_DIRECT_URL = `https://drive.google.com/uc?export=download&id=${GTS_FILE_ID}`;
const CORS_PROXY_URL = `https://api.corsproxy.io/?${encodeURIComponent(DRIVE_DIRECT_URL)}`;

// DICTIONARY DWI-BAHASA (BM / EN)
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
  }
};

// DATA CADASTER TEMPATAN (FALLBACK)
const sampleCadastralPolygons = {
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": { "upi": "1201020001001", "no_lot": "Lot 101", "guna_tanah": "Zoning Komersial" },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[[116.0715, 5.9815], [116.0745, 5.9815], [116.0745, 5.9790], [116.0715, 5.9790], [116.0715, 5.9815]]]
      }
    },
    {
      "type": "Feature",
      "properties": { "upi": "1201020001002", "no_lot": "Lot 102", "guna_tanah": "Zoning Kediaman" },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[[116.0748, 5.9815], [116.0775, 5.9815], [116.0775, 5.9790], [116.0748, 5.9790], [116.0748, 5.9815]]]
      }
    }
  ]
};

export default function App() {
  const [lang, setLang] = useState('BM');
  const t = translations[lang];

  // AUTH STATE
  const [isAuthenticated, setIsAuthenticated] = useState(true); // Set true untuk preview cepat
  const [currentUser, setCurrentUser] = useState({
    name: "Pegawai JPBW Sabah",
    email: "superadmin.jpbw@sabah.gov.my",
    role: "SUPER_ADMIN",
    provider: "Sabah Govt SSO",
    department: "Jabatan Perancang Bandar & Wilayah (JPBW)",
    tokens: "Unlimited"
  });

  // PAGE VIEW STATE
  const [currentPage, setCurrentPage] = useState('map');

  // UI MODALS & FORM
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current: '', newPass: '', confirmPass: '' });
  const [passwordStatus, setPasswordStatus] = useState('');

  // MAP & REGION STATE
  const [selectedRegionKey, setSelectedRegionKey] = useState('kota_kinabalu');
  const [urbanExpansionRate, setUrbanExpansionRate] = useState(0);

  // STATE UNTUK LAYER DINAMIK GTS DARI GOOGLE DRIVE
  const [gtsDriveData, setGtsDriveData] = useState(null);
  const [gtsLoading, setGtsLoading] = useState(false);
  const [gtsError, setGtsError] = useState(null);

  // FETCH DATA GTS SECARA DINAMIK PADA LOAD
  useEffect(() => {
    setGtsLoading(true);
    fetch(CORS_PROXY_URL)
      .then((res) => {
        if (!res.ok) throw new Error("Gagal mengambil data dari Google Drive (Status: " + res.status + ")");
        return res.json();
      })
      .then((data) => {
        setGtsDriveData(data);
        setGtsLoading(false);
      })
      .catch((err) => {
        console.warn("Ralat fetching Drive (Guna Fallback jika ada):", err.message);
        setGtsError("Gagal membaca Google Drive file ID. Sila pastikan kebenaran Sharing ditukar ke 'Anyone with link'.");
        setGtsLoading(false);
      });
  }, []);

  const database = {
    kota_kinabalu: { name: "Kota Kinabalu", coords: [5.9804, 116.0735], zoom: 14, baseRisk: 70 },
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
      department: mockData.role === 'SUPER_ADMIN' ? 'Jabatan Perancang Bandar & Wilayah (JPBW)' : 'Bahagian Pemetaan Spatial',
      tokens: mockData.role === 'PUBLIC_USER' ? 100 : 'Unlimited'
    });
    setIsAuthenticated(true);
    setCurrentPage('map');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setShowUserMenu(false);
  };

  // STYLING DYNAMICS UNTUK LAYER GTS
  const getGTSColor = (kategori) => {
    if (!kategori) return '#3b82f6';
    const kat = kategori.toLowerCase();
    if (kat.includes('perumahan') || kat.includes('kediaman')) return '#facc15';
    if (kat.includes('komersial') || kat.includes('perniagaan')) return '#ea580c';
    if (kat.includes('lapang') || kat.includes('rekreasi') || kat.includes('hijau')) return '#22c55e';
    if (kat.includes('industri')) return '#a855f7';
    return '#64748b';
  };

  const gtsStyle = (feature) => ({
    color: getGTSColor(feature?.properties?.kategori || feature?.properties?.guna_tanah),
    weight: 2,
    opacity: 0.9,
    fillColor: getGTSColor(feature?.properties?.kategori || feature?.properties?.guna_tanah),
    fillOpacity: 0.4
  });

  const onEachGTSFeature = (feature, layer) => {
    if (feature.properties) {
      const p = feature.properties;
      layer.bindPopup(`
        <div style="font-size:12px; font-family:sans-serif;">
          <b style="color:#0f172a; font-size:13px;">🏗️ ${p.kategori || p.guna_tanah || 'Guna Tanah Semasa'}</b><br/>
          <hr style="margin:4px 0; border:0; border-top:1px solid #e2e8f0;"/>
          <b>ID:</b> ${p.id_gts || p.id || '-'}<br/>
          <b>Keterangan:</b> ${p.aktiviti || p.keterangan || '-'}<br/>
          <b>Keluasan:</b> ${p.keluasan_ha || p.area || '-'} Hektar
        </div>
      `);
    }
  };

  // 1. LANDING PAGE LOGIN (AKAN DIPAPARKAN JIKA LOGOUT)
  if (!isAuthenticated) {
    return (
      <div className="w-full h-screen overflow-y-auto bg-slate-50 text-slate-800 flex flex-col font-sans">
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm">
          <h1 className="text-2xl font-black text-slate-800">{t.title} <span className="text-emerald-600">JPBW</span></h1>
          <div className="flex gap-2">
            <button onClick={() => setLang('BM')} className={`px-3 py-1 text-xs font-bold rounded ${lang === 'BM' ? 'bg-emerald-600 text-white' : 'bg-slate-100'}`}>BM</button>
            <button onClick={() => setLang('EN')} className={`px-3 py-1 text-xs font-bold rounded ${lang === 'EN' ? 'bg-emerald-600 text-white' : 'bg-slate-100'}`}>EN</button>
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center p-6 my-auto">
          <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-8 space-y-6 shadow-xl">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-black">{t.ssoHeader}</h2>
              <p className="text-sm text-slate-500">{t.ssoSub}</p>
            </div>
            <div className="space-y-3">
              <button onClick={() => handleSSOLogin('Sabah Govt SSO', { name: "Pegawai JPBW Sabah", email: "superadmin.jpbw@sabah.gov.my", role: "SUPER_ADMIN" })} className="w-full bg-slate-50 hover:bg-blue-50 border p-4 rounded-2xl flex items-center gap-3 text-left">
                <span className="text-2xl">🏛️</span>
                <div>
                  <p className="text-sm font-bold">{t.loginAsSuperAdmin}</p>
                  <p className="text-[11px] text-slate-500">superadmin.jpbw@sabah.gov.my</p>
                </div>
              </button>
              <button onClick={() => handleSSOLogin('Microsoft Azure AD', { name: "Perancang Bandar", email: "sysadmin.planner@sabah.gov.my", role: "SYSTEM_ADMIN" })} className="w-full bg-slate-50 hover:bg-emerald-50 border p-4 rounded-2xl flex items-center gap-3 text-left">
                <span className="text-2xl">🏢</span>
                <div>
                  <p className="text-sm font-bold">{t.loginAsAdmin}</p>
                  <p className="text-[11px] text-slate-500">sysadmin.planner@sabah.gov.my</p>
                </div>
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // 2. MAIN APP CONTAINER (HEADER + MAP / PROFILE / ADMIN)
  return (
    <div className="w-full h-screen overflow-y-auto bg-slate-50 text-slate-800 flex flex-col font-sans relative">
      {/* HEADER NAV */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex flex-wrap items-center justify-between gap-4 z-20 shadow-sm sticky top-0">
        <div className="flex items-center gap-4">
          <div className="bg-slate-100 p-0.5 rounded-lg border flex items-center">
            <button onClick={() => setLang('BM')} className={`px-3 py-1 text-[11px] font-bold rounded ${lang === 'BM' ? 'bg-emerald-600 text-white' : 'text-slate-500'}`}>BM</button>
            <button onClick={() => setLang('EN')} className={`px-3 py-1 text-[11px] font-bold rounded ${lang === 'EN' ? 'bg-emerald-600 text-white' : 'text-slate-500'}`}>EN</button>
          </div>
          <h1 onClick={() => setCurrentPage('map')} className="text-xl font-black text-slate-900 cursor-pointer">
            {t.title} <span className="text-emerald-600">JPBW</span>
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => setCurrentPage('map')} className={`px-4 py-1.5 text-xs font-bold rounded-lg transition ${currentPage === 'map' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
            🗺️ {t.mapTab}
          </button>
          {(currentUser?.role === 'SYSTEM_ADMIN' || currentUser?.role === 'SUPER_ADMIN') && (
            <button onClick={() => setCurrentPage('admin')} className={`px-4 py-1.5 text-xs font-bold rounded-lg transition ${currentPage === 'admin' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
              ⚙️ {t.adminTab}
            </button>
          )}
        </div>
      </header>

      {/* PAGE 1: MAP VIEW */}
      {currentPage === 'map' && (
        <main className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-4 gap-6 pb-24">
          <div className="space-y-6 lg:col-span-1">
            <div className="bg-white border-t-4 border-t-emerald-500 border-x border-b p-5 rounded-xl space-y-4 shadow-sm">
              <label className="text-xs text-slate-500 block font-bold uppercase">{t.selectRegion}</label>
              <select 
                value={selectedRegionKey}
                onChange={(e) => setSelectedRegionKey(e.target.value)}
                className="w-full bg-slate-50 text-sm font-bold px-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none"
              >
                <option value="kota_kinabalu">Kota Kinabalu</option>
                <option value="penampang">Penampang</option>
                <option value="putatan">Putatan</option>
                <option value="tuaran">Tuaran</option>
              </select>

              <div className="space-y-2 pt-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold">{t.urbanSim}</span>
                  <span className="font-mono text-blue-600 font-bold">+{urbanExpansionRate}%</span>
                </div>
                <input 
                  type="range" min="0" max="25" value={urbanExpansionRate}
                  onChange={(e) => setUrbanExpansionRate(e.target.value)}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
              </div>
            </div>

            {/* STATUS LOADING DRIVE */}
            {gtsLoading && (
              <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-xl text-xs font-bold flex items-center gap-2 animate-pulse">
                <span>🔄</span> Memuatkan Layer GTS daripada Google Drive...
              </div>
            )}
            {gtsError && (
              <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl text-xs space-y-1">
                <p className="font-bold">⚠️ Nota GIS Drive:</p>
                <p className="text-[11px] text-amber-700">{gtsError}</p>
              </div>
            )}
          </div>

          <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden relative min-h-[550px] z-0">
            <MapContainer key={selectedRegionKey} center={current.coords} zoom={current.zoom} className="w-full h-full min-h-[550px]">
              <LayersControl position="topright">
                <LayersControl.BaseLayer checked name={t.satEsri}>
                  <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
                </LayersControl.BaseLayer>
                <LayersControl.BaseLayer name={t.satOsm}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                </LayersControl.BaseLayer>

                {/* OVERLAY 1: LOT KADASTER */}
                <LayersControl.Overlay checked name="Poligon Lot Kadaster">
                  <GeoJSON data={sampleCadastralPolygons} style={{ color: '#0284c7', weight: 2, fillOpacity: 0.2 }} />
                </LayersControl.Overlay>

                {/* OVERLAY 2: DATA DINAMIK GUNA TANAH SEMASA (GTS) DARI GOOGLE DRIVE */}
                {gtsDriveData && (
                  <LayersControl.Overlay checked name="Guna Tanah Semasa (GTS - Drive)">
                    <GeoJSON 
                      key={JSON.stringify(gtsDriveData)}
                      data={gtsDriveData} 
                      style={gtsStyle} 
                      onEachFeature={onEachGTSFeature} 
                    />
                  </LayersControl.Overlay>
                )}
              </LayersControl>

              <Circle center={current.coords} radius={1000 + (urbanExpansionRate * 80)} pathOptions={{ color: '#059669', fillColor: '#10b981', fillOpacity: 0.2 }} />
              <Marker position={current.coords}><Popup>{current.name} - Active Layer</Popup></Marker>
            </MapContainer>
          </div>
        </main>
      )}

      {/* PAGE 2: PROFIL PENGGUNA */}
      {currentPage === 'profile' && (
        <main className="flex-1 p-6 max-w-4xl mx-auto w-full space-y-6 pb-24">
          <h2 className="text-2xl font-black">👤 {t.profileTitle}</h2>
          <div className="bg-white border rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-4 border-b pb-4">
              <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 font-black text-2xl flex items-center justify-center">
                {currentUser?.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-lg font-bold">{currentUser?.name}</h3>
                <p className="text-xs text-slate-500">{currentUser?.email}</p>
                <span className="text-[10px] bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded border border-blue-200 mt-1 inline-block">{currentUser?.role}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div><p className="text-slate-400 font-bold">JABATAN</p><p className="font-bold">{currentUser?.department}</p></div>
              <div><p className="text-slate-400 font-bold">PENYEDIA SSO</p><p className="font-bold">{currentUser?.provider}</p></div>
            </div>
          </div>
        </main>
      )}

      {/* PAGE 3: ADMIN PANEL */}
      {currentPage === 'admin' && (
        <main className="flex-1 p-6 max-w-5xl mx-auto w-full space-y-6 pb-24">
          <h2 className="text-2xl font-black">⚙️ {t.adminTitle}</h2>
          <div className="bg-white border rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase">{t.uploadTitle}</h3>
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center bg-slate-50">
              <p className="text-xs text-slate-500 font-bold">{t.dragDrop}</p>
            </div>
          </div>
        </main>
      )}

      {/* FLOATING USER PROFILE BUTTON */}
      <div className="fixed bottom-6 right-6 z-50">
        {showUserMenu && (
          <div className="mb-2 bg-white border rounded-2xl p-2 w-52 shadow-2xl space-y-1">
            <button onClick={() => { setCurrentPage('profile'); setShowUserMenu(false); }} className="w-full text-left px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-lg">👤 {t.profile}</button>
            <button onClick={handleLogout} className="w-full text-left px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-lg">🚪 {t.logout}</button>
          </div>
        )}
        <button onClick={() => setShowUserMenu(!showUserMenu)} className="bg-white border shadow-lg px-4 py-2 rounded-full font-bold text-xs flex items-center gap-2">
          <span>👤</span> {currentUser?.name}
        </button>
      </div>
    </div>
  );
}
