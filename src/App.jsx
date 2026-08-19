import React, { useState } from 'react';

export default function App() {
  const [selectedRegion, setSelectedRegion] = useState('kl_central');
  const [year, setYear] = useState(2026);

  // Data ringkasan analitik
  const summary = {
    total_alert_zones: 14,
    high_pressure_hotspots: 6,
    total_area_cleared_ha: 45.8,
    avg_risk_score: 82,
    risk_status: "High Alert"
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            UrbanWatch <span className="text-emerald-400">AI</span>
          </h1>
          <p className="text-xs text-slate-400">Spatial Early Warning System & Remote Sensing Pressure Monitor</p>
        </div>

        <div className="flex items-center gap-4">
          <select 
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="bg-slate-800 text-sm text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 focus:outline-none"
          >
            <option value="kl_central">Kuala Lumpur Central</option>
            <option value="sentul_setapak">Sentul - Setapak Sector</option>
            <option value="cyberjaya">Cyberjaya Tech Hub</option>
          </select>

          <div className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
            <span className="text-xs text-slate-400">Year:</span>
            <span className="text-sm font-bold text-emerald-400">{year}</span>
          </div>
        </div>
      </header>

      {/* Metrics Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 border-b border-slate-800 bg-slate-900/40">
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
          <p className="text-xs text-slate-400">Alert Zones</p>
          <p className="text-2xl font-bold text-amber-400">{summary.total_alert_zones}</p>
        </div>
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
          <p className="text-xs text-slate-400">High Pressure Hotspots</p>
          <p className="text-2xl font-bold text-red-400">{summary.high_pressure_hotspots}</p>
        </div>
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
          <p className="text-xs text-slate-400">Area Cleared</p>
          <p className="text-2xl font-bold text-emerald-400">{summary.total_area_cleared_ha} Ha</p>
        </div>
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
          <p className="text-xs text-slate-400">Avg Risk Score</p>
          <p className="text-2xl font-bold text-cyan-400">{summary.avg_risk_score}/100</p>
        </div>
      </div>

      {/* Main Content View */}
      <main className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-900/60 rounded-xl border border-slate-800 p-6 flex items-center justify-center min-h-[350px]">
          <div className="text-center">
            <p className="text-emerald-400 font-semibold mb-1">GIS Interactive Map Canvas Ready</p>
            <p className="text-xs text-slate-500">Region: {selectedRegion.replace('_', ' ').toUpperCase()} | Year: {year}</p>
          </div>
        </div>

        <div className="bg-slate-900/60 rounded-xl border border-slate-800 p-6">
          <h2 className="text-sm font-bold text-slate-200 mb-4">Priority Early Warnings</h2>
          <div className="space-y-3">
            <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/60">
              <span className="text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded">CRITICAL</span>
              <h3 className="text-sm font-semibold text-slate-100 mt-2">Sentul West Transit Corridor</h3>
              <p className="text-xs text-slate-400 mt-1">MRT3 Construction Proximity & High Density Pressure</p>
            </div>
            <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/60">
              <span className="text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded">HIGH</span>
              <h3 className="text-sm font-semibold text-slate-100 mt-2">Bukit Bintang Urban Infill</h3>
              <p className="text-xs text-slate-400 mt-1">Commercial Plot Ratio Limits Exceeded</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
