import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, LayersControl, GeoJSON } from 'react-leaflet';

// --------------------------------------------------------------------------
// 1. Dapatkan Direct Download Link dari Google Drive
// --------------------------------------------------------------------------
// Contoh File ID dari Google Drive korang.
// Tukar ID di bawah dengan File ID fail .geojson GTS korang dalam Drive!
const GOOGLE_DRIVE_FILE_ID = "TUKAR_DENGAN_FILE_ID_GEOJSON_ANDA";
const GTS_URL = `https://drive.usercontent.google.com/download?id=${GOOGLE_DRIVE_FILE_ID}&export=download`;

export default function App() {
  // State untuk menyimpan data GeoJSON dari Drive
  const [gtsData, setGtsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --------------------------------------------------------------------------
  // 2. useEffect untuk Fetch Data secara dinamik apabila app dibuka
  // --------------------------------------------------------------------------
  useEffect(() => {
    fetch(GTS_URL)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Gagal memuat turun data GTS dari Google Drive.");
        }
        return res.json();
      })
      .then((data) => {
        setGtsData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Ralat fetching GTS:", err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // --------------------------------------------------------------------------
  // 3. Gaya Warna & Popup untuk Layer GTS
  // --------------------------------------------------------------------------
  const getGTSColor = (kategori) => {
    switch (kategori) {
      case 'Perumahan': return '#facc15'; // Yellow
      case 'Komersial': return '#ea580c'; // Orange / Red
      case 'Kawasan Lapang & Rekreasi': return '#22c55e'; // Green
      case 'Industri': return '#a855f7'; // Purple
      default: return '#3b82f6'; // Blue
    }
  };

  const gtsStyle = (feature) => ({
    color: getGTSColor(feature?.properties?.kategori),
    weight: 2,
    fillColor: getGTSColor(feature?.properties?.kategori),
    fillOpacity: 0.5
  });

  const onEachGTSFeature = (feature, layer) => {
    if (feature.properties) {
      const p = feature.properties;
      layer.bindPopup(`
        <div style="font-family:sans-serif; font-size:12px;">
          <b style="font-size:13px; color:#1e293b;">🏗️ Gunatanah: ${p.kategori || 'N/A'}</b><br/>
          <hr style="margin:4px 0; border:0; border-top:1px solid #cbd5e1;"/>
          <b>ID:</b> ${p.id_gts || p.id || '-'}<br/>
          <b>Aktiviti:</b> ${p.aktiviti || p.guna_tanah || '-'}<br/>
          <b>Keluasan:</b> ${p.keluasan_ha || '-'} Hektar
        </div>
      `);
    }
  };

  return (
    <div style={{ height: "100vh", width: "100vw" }}>
      {/* Indikator Status Memuatkan Data */}
      {loading && (
        <div style={{ position: "absolute", top: 10, left: 50, zIndex: 1000, background: "white", padding: "8px 12px", borderRadius: "8px", boxShadow: "0 2px 6px rgba(0,0,0,0.2)" }}>
          🔄 Memuatkan Layer GTS daripada Google Drive...
        </div>
      )}

      {error && (
        <div style={{ position: "absolute", top: 10, left: 50, zIndex: 1000, background: "#fee2e2", color: "#991b1b", padding: "8px 12px", borderRadius: "8px" }}>
          ⚠️ Ralat: {error}
        </div>
      )}

      <MapContainer center={[5.9788, 116.0753]} zoom={14} style={{ height: "100%", width: "100%" }}>
        <LayersControl position="topright">
          {/* Base Map */}
          <LayersControl.BaseLayer checked name="OpenStreetMap">
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          </LayersControl.BaseLayer>

          {/* OVERLAY: Layer Dinamik dari Google Drive */}
          <LayersControl.Overlay checked name="Gunatanah Semasa (GTS - Drive)">
            {gtsData && (
              <GeoJSON 
                key={JSON.stringify(gtsData)} // Key bertindak sebagai auto-refresh
                data={gtsData} 
                style={gtsStyle} 
                onEachFeature={onEachGTSFeature} 
              />
            )}
          </LayersControl.Overlay>
        </LayersControl>
      </MapContainer>
    </div>
  );
}
