import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, LayersControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// DICTIONARY DWI-BAHASA
const translations = {
  BM: {
    title: "UrbanWatch",
    logout: "Log Keluar",
    profile: "Profil Saya",
    changePass: "Tukar Kata Laluan",
    mapTab: "Peta & Analisis Satelit",
    adminTab: "Panel Admin",
    selectRegion: "Pilih Daerah Analysis:",
    urbanSim: "Simulasi Pembandaran",
    riskScore: "Skor Indeks Risiko",
    ssoHeader: "Portal Log Masuk SSO System",
    ssoSub: "Sila pilih pembekal identiti SSO anda untuk meneruskan akses ke dalam sistem",
    loginAsSuperAdmin: "Log Masuk sebagai Super Admin",
    loginAsAdmin: "Log Masuk sebagai Admin Biasa",
    loginAsUser: "Log Masuk sebagai Pengguna Biasa",
    sentinelLayers: "Lapisan Satelit Sentinel-2 (Terus)",
    trueColor: "Sentinel-2 (Warna Sebenar RGB)",
    ndvi: "Sentinel-2 (Analisis Bitumbuhan - NDVI)",
    moisture: "Sentinel-2 (Analisis Kelembapan / Air - NDWI)",
    googleSat: "Google Satellite Standard",
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
    restricted: "Terhad kepada Super Admin",
    close: "Tutup",
    save: "Simpan",
    cancel: "Batal",
    currentPass: "Kata Laluan Sedia Ada",
    newPass: "Kata Laluan Baharu",
    confirmPass: "Sahkan Kata Laluan Baharu",
  },
  EN: {
    title: "UrbanWatch",
    logout: "Sign Out",
    profile: "My Profile",
    changePass: "Change Password",
    mapTab: "Map & Satellite Analytics",
    adminTab: "Admin Panel",
    selectRegion: "Select Analysis Region:",
    urbanSim: "Urban Simulation",
    riskScore: "Risk Index Score",
    ssoHeader: "SSO System Login Portal",
    ssoSub: "Please select your SSO identity provider to proceed into the system",
    loginAsSuperAdmin: "Log in as Super Admin",
    loginAsAdmin: "Log in as Standard Admin",
    loginAsUser: "Log in as Standard User",
    sentinelLayers: "Live Sentinel-2 Satellite Layers",
    trueColor: "Sentinel-2 (True Color RGB)",
    ndvi: "Sentinel-2 (Vegetation Index - NDVI)",
    moisture: "Sentinel-2 (Moisture Index - NDWI)",
    googleSat: "Google Satellite Standard",
    adminTitle: "Administration & Spatial Data Dashboard",
    uploadTitle: "1. Import New Spatial File",
    dragDrop: "Click or drag GIS files (.geojson / .shp) here",
    userMgmtTitle: "2. SSO User Permissions",
    dataListTitle: "3. Spatial Datasets in Database",
    dataId: "Data ID",
    region: "Region",
    filename: "Filename",
    uploader: "Uploaded By",
    status: "Status",
    actions: "Actions",
    edit: "Edit",
    delete: "Delete",
    restricted: "Restricted to Super Admin",
    close: "Close",
    save: "Save",
    cancel: "Cancel",
    currentPass: "Current Password",
    newPass: "New Password",
    confirmPass: "Confirm New Password",
  }
};

export default function App() {
  const [lang, setLang] = useState('BM');
  const t = translations[lang];

  // AUTH STATE
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // PAGE VIEW STATE
  const [currentPage, setCurrentPage] = useState('map');

  // UI MODALS STATE
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

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

  const database = {
    selayang: { name: "Selayang", coords: [3.2379, 101.6640], zoom: 13, baseRisk: 75 },
    kuantan: { name: "Kuantan", coords: [3.8077, 103.3260], zoom: 13, baseRisk: 68 },
    lahad_datu: { name: "Lahad Datu", coords: [5.0268, 118.3270], zoom: 12, baseRisk: 82 }
  };

  const current = database[selectedRegionKey];
  const calculatedRiskScore = Math.min(100, Math.round(current.baseRisk + (urbanExpansionRate * 1.2)));

  // SENTINEL HUB WMS ENDPOINT (DEMO INSTANCE)
  const sentinelWmsUrl = "https://services.sentinel-hub.com/ogc/wms/bd864e0b-e910-403b-bcaa-e045adab82c9";

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

  // LANDING PAGE LOGIN SSO
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
        <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-slate-800 p-0.5 rounded-lg border border-slate-700 flex items-center">
              <button onClick={() => setLang('BM')} className={`px-2.5 py-1 text-[11px] font-extrabold rounded-md transition ${lang === 'BM' ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-400'}`}>BM</button>
              <button onClick={() => setLang('EN')} className={`px-2.5 py-1 text-[11px] font-extrabold rounded-md transition ${lang === 'EN' ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-400'}`}>EN</button>
            </div>
            <h1 className="text-xl font-extrabold text-white tracking-tight">{t.title} <span className="text-emerald-400">AI</span></h1>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-amber-500 to-purple-500"></div>
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-black text-white tracking-tight">{t.ssoHeader}</h2>
              <p className="text-xs text-slate-400">{t.ssoSub}</p>
            </div>

            <div className="space-y-4">
              <button onClick={() => handleSSOLogin('MyGovUC SSO', { name: "Ahmad Zaki", email: "zaki@plan.gov.my", role: "SUPER_ADMIN" })} className="w-full bg-slate-800 hover:bg-purple-950/40 border border-slate-700 p-4 rounded-2xl flex items-center justify-between text-left transition">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-lg">🏛️</div>
                  <div>
                    <p className="text-xs font-bold text-white">{t.loginAsSuperAdmin}</p>
                    <p className="text-[10px] text-slate-400">zaki@plan.gov.my • MyGovUC</p>
                  </div>
                </div>
                <span className="text-[10px] bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded font-mono font-bold">SUPER ADMIN</span>
              </button>

              <button onClick={() => handleSSOLogin('Microsoft Azure AD', { name: "Perancang Sabah", email: "admin.sabah@sabah.gov.my", role: "ADMIN" })} className="w-full bg-slate-800 hover:bg-amber-950/40 border border-slate-700 p-4 rounded-2xl flex items-center justify-between text-left transition">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-lg">🏢</div>
                  <div>
                    <p className="text-xs font-bold text-white">{t.loginAsAdmin}</p>
                    <p className="text-[10px] text-slate-400">admin.sabah@sabah.gov.my • Azure AD</p>
                  </div>
                </div>
                <span className="text-[10px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded font-mono font-bold">ADMIN</span>
              </button>

              <button onClick={() => handleSSOLogin('Google SSO', { name: "Dr. Siti Aminah", email: "siti@utm.my", role: "USER" })} className="w-full bg-slate-800 hover:bg-emerald-950/40 border border-slate-700 p-4 rounded-2xl flex items-center justify-between text-left transition">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-lg">🌐</div>
                  <div>
                    <p className="text-xs font-bold text-white">{t.loginAsUser}</p>
                    <p className="text-[10px] text-slate-400">siti@utm.my • Google SSO</p>
                  </div>
                </div>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-mono font-bold">USER</span>
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans relative">
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex flex-wrap items-center justify-between gap-4 z-20">
        <div className="flex items-center gap-4">
          <div className="bg-slate-800 p-0.5 rounded-lg border border-slate-700 flex items-center">
            <button onClick={() => setLang('BM')} className={`px-2.5 py-1 text-[11px] font-extrabold rounded-md transition ${lang === 'BM' ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-400'}`}>BM</button>
            <button onClick={() => setLang('EN')} className={`px-2.5 py-1 text-[11px] font-extrabold rounded-md transition ${lang === 'EN' ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-400'}`}>EN</button>
          </div>
          <h1 onClick={() => setCurrentPage('map')} className="text-xl font-extrabold text-white tracking-tight cursor-pointer">
            {t.title} <span className="text-emerald-400">AI</span>
          </h1>
          <span className="text-[10px] px-2.5 py-0.5 rounded-full font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            {currentUser?.role}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg border border-slate-700">
            <button onClick={() => setCurrentPage('map')} className={`px-3 py-1 text-xs font-semibold rounded-md transition ${currentPage === 'map' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-300'}`}>
              {t.mapTab}
            </button>
            {(currentUser?.role === 'ADMIN' || currentUser?.role === 'SUPER_ADMIN') && (
              <button onClick={() => setCurrentPage('admin')} className={`px-3 py-1 text-xs font-semibold rounded-md transition ${currentPage === 'admin' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-amber-400'}`}>
                {t.adminTab}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* DASHBOARD PETA & SATELIT SENTINEL */}
      {currentPage === 'map' && (
        <main className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="space-y-6 lg:col-span-1">
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4 shadow-lg">
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

              {/* NOTIS DATA SATELIT */}
              <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-400">
                <p className="font-bold text-slate-300 mb-1">📡 Sentinel-2 Data Feed:</p>
                <p>Gunakan ikon lapisan (*Layers*) di penjuru kanan atas peta untuk menukar spektrum Satelit Sentinel-2.</p>
              </div>
            </div>
          </div>

          {/* PETA INTERAKTIF SENTINEL-2 */}
          <div className="lg:col-span-3 bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden relative min-h-[500px]">
            <MapContainer key={selectedRegionKey} center={current.coords} zoom={current.zoom} className="w-full h-full min-h-[500px]">
              <LayersControl position="topright">
                
                {/* LAPISAN 1: GOOGLE SATELLITE STANDARD */}
                <LayersControl.BaseLayer checked name={t.googleSat}>
                  <TileLayer url="https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}" />
                </LayersControl.BaseLayer>

                {/* LAPISAN 2: SENTINEL-2 TRUE COLOR */}
                <LayersControl.BaseLayer name={t.trueColor}>
                  <TileLayer
                    url={`${sentinelWmsUrl}?REQUEST=GetTile&TILECOL={x}&TILEROW={y}&TILEMATRIXSET=PopularVisualisation3857&TILEMATRIX={z}&LAYER=TRUE-COLOR&FORMAT=image/png`}
                    attribution="&copy; Copernicus Sentinel Data"
                  />
                </LayersControl.BaseLayer>

                {/* LAPISAN 3: SENTINEL-2 NDVI (VEGETATION) */}
                <LayersControl.BaseLayer name={t.ndvi}>
                  <TileLayer
                    url={`${sentinelWmsUrl}?REQUEST=GetTile&TILECOL={x}&TILEROW={y}&TILEMATRIXSET=PopularVisualisation3857&TILEMATRIX={z}&LAYER=NDVI&FORMAT=image/png`}
                    attribution="&copy; Copernicus Sentinel Data"
                  />
                </LayersControl.BaseLayer>

                {/* LAPISAN 4: SENTINEL-2 NDWI (MOISTURE/WATER) */}
                <LayersControl.BaseLayer name={t.moisture}>
                  <TileLayer
                    url={`${sentinelWmsUrl}?REQUEST=GetTile&TILECOL={x}&TILEROW={y}&TILEMATRIXSET=PopularVisualisation3857&TILEMATRIX={z}&LAYER=MOISTURE-INDEX&FORMAT=image/png`}
                    attribution="&copy; Copernicus Sentinel Data"
                  />
                </LayersControl.BaseLayer>

              </LayersControl>

              <TileLayer url="https://mt1.google.com/vt/lyrs=h&x={x}&y={y}&z={z}" />
              <Circle center={current.coords} radius={1000 + (urbanExpansionRate * 80)} pathOptions={{ color: 'red', fillColor: 'red', fillOpacity: 0.35 }} />
              <Marker position={current.coords}><Popup>{current.name} Spatial Marker</Popup></Marker>
            </MapContainer>
          </div>
        </main>
      )}

      {/* MENU AKAUN TERAPUNG */}
      <div className="fixed bottom-6 right-6 z-50">
        {showUserMenu && (
          <div className="mb-3 bg-slate-900 border border-slate-800 rounded-2xl p-2 w-56 shadow-2xl space-y-1">
            <div className="px-3 py-2 border-b border-slate-800">
              <p className="text-xs font-bold text-white truncate">{currentUser?.name}</p>
              <p className="text-[10px] text-slate-400 truncate">{currentUser?.email}</p>
            </div>
            <button onClick={() => { setShowPasswordModal(true); setShowUserMenu(false); }} className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition">
              🔑 {t.changePass}
            </button>
            <button onClick={handleLogout} className="w-full text-left px-3 py-2 text-xs font-bold text-red-400 hover:bg-red-500/10 rounded-xl transition">
              🚪 {t.logout}
            </button>
          </div>
        )}

        <button onClick={() => setShowUserMenu(!showUserMenu)} className="bg-slate-900 hover:bg-slate-800 text-white p-2.5 rounded-full border border-slate-700 shadow-2xl flex items-center gap-3 pr-4 transition">
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500 flex items-center justify-center font-bold text-emerald-400 text-xs">
            {currentUser?.name ? currentUser.name.charAt(0) : 'U'}
          </div>
          <span className="text-xs font-bold hidden sm:inline">{currentUser?.name}</span>
        </button>
      </div>
    </div>
  );
}
