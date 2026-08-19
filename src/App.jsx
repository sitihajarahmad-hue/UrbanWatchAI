import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// --------------------------------------------------------------------------
// GOOGLE DRIVE FILE ID RASMI AWAK
// --------------------------------------------------------------------------
const GTS_FILE_ID = "16_6ir9Tj0FidZseKJB4c10U_U1IMNFNQ";
const DRIVE_DIRECT_URL = `https://drive.google.com/uc?export=download&id=${GTS_FILE_ID}`;
const CORS_PROXY_URL = `https://api.corsproxy.io/?${encodeURIComponent(DRIVE_DIRECT_URL)}`;

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('dashboard');
  
  // STATE DATA GIS DARI DRIVE
  const [geoData, setGeoData] = useState(null);
  const [loadingGis, setLoadingGis] = useState(false);
  const [gisError, setGisError] = useState(null);

  // 1. FETCH DATA GEOJSON DARI DRIVE BILA DAHSUDAH LOGIN
  useEffect(() => {
    if (isAuthenticated) {
      setLoadingGis(true);
      fetch(CORS_PROXY_URL)
        .then((res) => {
          if (!res.ok) throw new Error("Gagal membaca file dari Google Drive.");
          return res.json();
        })
        .then((data) => {
          setGeoData(data);
          setLoadingGis(false);
        })
        .catch((err) => {
          console.error("Ralat GIS Drive:", err);
          setGisError(err.message);
          setLoadingGis(false);
        });
    }
  }, [isAuthenticated]);

  // 2. FUNGSI LOG IN (SSO)
  const handleSSOLogin = (providerName, roleName) => {
    setUser({
      name: "Pegawai Perancang JPBW",
      email: "planner@sabah.gov.my",
      role: roleName,
      provider: providerName
    });
    setIsAuthenticated(true);
  };

  // 3. STYLING DYNAMIC BAGI POLIGON DARI DATA DRIVE
  const styleGeoJSON = (feature) => {
    const props = feature.properties || {};
    const kat = (props.kategori || props.guna_tanah || '').toLowerCase();

    let color = '#3b82f6'; // Default Blue
    if (kat.includes('perumahan') || kat.includes('kediaman')) color = '#facc15'; // Yellow
    else if (kat.includes('komersial') || kat.includes('perniagaan')) color = '#ea580c'; // Orange
    else if (kat.includes('lapang') || kat.includes('rekreasi') || kat.includes('hijau')) color = '#22c55e'; // Green
    else if (kat.includes('industri')) color = '#a855f7'; // Purple

    return {
      color: color,
      weight: 1.5,
      opacity: 0.8,
      fillColor: color,
      fillOpacity: 0.4
    };
  };

  const onEachGeoFeature = (feature, layer) => {
    if (feature.properties) {
      const p = feature.properties;
      const keys = Object.keys(p);
      let content = `<div style="font-size:12px; font-family:sans-serif; color:#0f172a;"><b>Data Poligon GIS</b><hr style="margin:4px 0;"/>`;
      
      keys.forEach((key) => {
        content += `<b>${key}:</b> ${p[key]}<br/>`;
      });
      content += `</div>`;
      
      layer.bindPopup(content);
    }
  };

  // ========================================================================
  // LANDING PAGE (SSO) - TERUS MUNCUL SEBELUM USER DAFTAR / LOG IN
  // ========================================================================
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0a0f1c] text-white flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full bg-[#161d31] p-8 rounded-3xl border border-slate-800 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-black tracking-tight">UrbanWatch <span className="text-emerald-500">AI</span></h1>
            <p className="text-xs text-slate-400">Spatial Early Warning System & Remote Sensing Pressure Monitor</p>
          </div>

          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 text-xs text-slate-300">
            🔒 <b>Portal SSO Pendaftaran & Log Masuk</b>
            <p className="text-[11px] text-slate-400 mt-1">Sila sahkan identiti agensi anda untuk mengakses peta GIS spatial.</p>
          </div>

          <div className="space-y-3">
            <button 
              onClick={() => handleSSOLogin("Sabah Govt SSO", "Super Admin")}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3.5 px-4 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2"
            >
              <span>🏛️</span> Log Masuk via Sabah Govt SSO
            </button>
            
            <button 
              onClick={() => handleSSOLogin("Microsoft Azure AD", "Planner User")}
              className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 py-3.5 px-4 rounded-xl font-bold text-sm border border-slate-700 transition flex items-center justify-center gap-2"
            >
              <span>🏢</span> Log Masuk via Azure AD
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ========================================================================
  // MAIN APP DASHBOARD (URBANWATCH AI) - UNTUK USER YANG TELAH SSO LOGIN
  // ========================================================================
  return (
    <div className="min-h-screen bg-[#0a0f1c] text-slate-100 flex flex-col font-sans">
      {/* NAVBAR */}
      <header className="px-6 py-4 bg-[#161d31] border-b border-slate-800 flex justify-between items-center sticky top-0 z-30">
        <div>
          <h1 className="text-xl font-black">UrbanWatch <span className="text-emerald-500">AI</span></h1>
          <p className="text-[10px] text-slate-400">Spatial Early Warning System & Remote Sensing Pressure Monitor</p>
        </div>
        
        <div className="flex gap-3 items-center text-xs font-bold">
          <button 
            onClick={() => setCurrentPage('dashboard')} 
            className={`px-3 py-1.5 rounded-lg transition ${currentPage === 'dashboard' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Dashboard
          </button>
          <button 
            onClick={() => setCurrentPage('profile')} 
            className={`px-3 py-1.5 rounded-lg transition ${currentPage === 'profile' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Profile ({user?.name})
          </button>
          <button 
            onClick={() => { setIsAuthenticated(false); setUser(null); }} 
            className="bg-red-500/10 hover:bg-red-500/20 text-red-400 px-3 py-1.5 rounded-lg transition"
          >
            Log Keluar
          </button>
        </div>
      </header>

      {/* DASHBOARD VIEW */}
      {currentPage === 'dashboard' ? (
        <main className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
          {/* TOP METRICS ROW */}
          <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-[#161d31] p-4 rounded-xl border border-slate-800">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Alert Zones</p>
              <p className="text-2xl font-black text-amber-400 mt-1">14</p>
            </div>
            <div className="bg-[#161d31] p-4 rounded-xl border border-slate-800">
              <p className="text-[10px] font-bold text-slate-400 uppercase">High Pressure Hotspots</p>
              <p className="text-2xl font-black text-red-500 mt-1">6</p>
            </div>
            <div className="bg-[#161d31] p-4 rounded-xl border border-slate-800">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Area Cleared</p>
              <p className="text-2xl font-black text-emerald-400 mt-1">45.8 Ha</p>
            </div>
            <div className="bg-[#161d31] p-4 rounded-xl border border-slate-800">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Avg Risk Score</p>
              <p className="text-2xl font-black text-teal-400 mt-1">82/100</p>
            </div>
          </div>

          {/* MAP CANVAS (LEAFLET) */}
          <div className="lg:col-span-2 bg-[#161d31] h-[550px] rounded-xl border border-slate-800 overflow-hidden relative">
            {loadingGis && (
              <div className="absolute top-4 right-4 z-[1000] bg-slate-900/90 text-emerald-400 text-xs px-3 py-1.5 rounded-lg border border-slate-700 animate-pulse font-bold">
                🔄 Memuatkan Data Drive (ID: {GTS_FILE_ID.substring(0,6)}...)...
              </div>
            )}

            {gisError && (
              <div className="absolute top-4 right-4 z-[1000] bg-red-950/90 text-red-300 text-xs px-3 py-1.5 rounded-lg border border-red-800 font-bold">
                ⚠️ Ralat Drive: {gisError}
              </div>
            )}

            <MapContainer center={[5.9804, 116.0735]} zoom={12} style={{ height: '100%', width: '100%' }}>
              <TileLayer 
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" 
                attribution='&copy; CARTO'
              />
              
              {/* RENDER DATA HANYA BILA DATA SEBENAR DARI DRIVE DAH SAMPAI */}
              {geoData && (
                <GeoJSON 
                  key={JSON.stringify(geoData)}
                  data={geoData} 
                  style={styleGeoJSON}
                  onEachFeature={onEachGeoFeature}
                />
              )}
            </MapContainer>

            <div className="absolute bottom-4 left-4 z-[1000] text-[10px] text-emerald-400 font-bold bg-[#0a0f1c]/90 border border-slate-800 px-3 py-1 rounded-lg">
              GIS Interactive Map Canvas Ready • Region: Sabah
            </div>
          </div>

          {/* RIGHT SIDEBAR (NOTIFIKASI / WARNINGS) */}
          <div className="space-y-4">
            <h2 className="font-bold text-sm text-slate-200">Priority Early Warnings</h2>
            
            <div className="bg-[#161d31] p-4 rounded-xl border border-slate-800 space-y-3">
              <div className="border-l-4 border-red-500 pl-3 space-y-1">
                <span className="text-[9px] font-black bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded">CRITICAL</span>
                <p className="text-xs font-bold text-slate-200">Sentul West Transit Corridor</p>
                <p className="text-[10px] text-slate-400">MRT3 Construction Proximity & High Density Pressure</p>
              </div>

              <div className="border-l-4 border-amber-500 pl-3 space-y-1 pt-2">
                <span className="text-[9px] font-black bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded">HIGH</span>
                <p className="text-xs font-bold text-slate-200">Bukit Bintang Urban Infill</p>
                <p className="text-[10px] text-slate-400">Commercial Plot Ratio Limits Exceeded</p>
              </div>
            </div>
          </div>
        </main>
      ) : (
        /* USER PROFILE PAGE */
        <main className="p-8 max-w-lg mx-auto w-full">
          <div className="bg-[#161d31] p-6 rounded-2xl border border-slate-800 space-y-4">
            <h2 className="text-lg font-bold border-b border-slate-800 pb-3">👤 Profil Pengguna SSO</h2>
            <div className="space-y-2 text-xs">
              <p className="text-slate-400">Nama: <span className="text-slate-100 font-bold">{user?.name}</span></p>
              <p className="text-slate-400">E-mel: <span className="text-slate-100 font-bold">{user?.email}</span></p>
              <p className="text-slate-400">Peranan: <span className="text-slate-100 font-bold">{user?.role}</span></p>
              <p className="text-slate-400">Penyedia SSO: <span className="text-slate-100 font-bold">{user?.provider}</span></p>
            </div>
          </div>
        </main>
      )}
    </div>
  );
}
