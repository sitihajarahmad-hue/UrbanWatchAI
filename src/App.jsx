import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON, LayersControl } from 'react-leaflet';
// IMPORT SSO COMPONENT AWAK DI SINI
// import { AuthProvider } from './context/AuthContext'; 

export default function App() {
  const [dataGts, setDataGts] = useState(null);
  
  // 1. DATA DINAMIK DARI DRIVE (LOGIK SEBENAR)
  useEffect(() => {
    const fetchRealData = async () => {
      try {
        const response = await fetch('https://drive.google.com/drive/folders/16_6ir9Tj0FidZseKJB4c10U_U1IMNFNQ?usp=drive_link');
        const json = await response.json();
        setDataGts(json); // Data sebenar awak masuk sini
      } catch (e) {
        console.error("Gagal ambil data:", e);
      }
    };
    fetchRealData();
  }, []);

  // 2. MAPPING DATA SEBENAR (Saya akan betulkan fungsi ini sebaik awak beri contoh data)
  const styleLayer = (feature) => ({
    // Gantikan dengan key sebenar daripada data awak
    color: feature.properties.KOD_WARNA ? '#ff0000' : '#0000ff', 
    weight: 2
  });

  return (
    <div className="app-container">
      {/* SSO INTEGRATION - Masukkan komponen SSO asal awak di sini */}
      
      <MapContainer center={[5.9788, 116.0753]} zoom={14} className="map-full">
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        
        {dataGts && (
          <GeoJSON 
            data={dataGts} 
            style={styleLayer}
            onEachFeature={(feature, layer) => {
              // Popup sebenar berdasarkan data awak
              layer.bindPopup(`ID: ${feature.properties.ID_SEBENAR}`);
            }}
          />
        )}
      </MapContainer>
    </div>
  );
}
