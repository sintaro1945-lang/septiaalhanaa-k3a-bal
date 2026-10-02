import React from 'react';
import { Vessel, Voyage, MaintenanceRecord } from '../types';
import { Ship, Anchor, Compass, TrendingUp, AlertTriangle, CheckCircle2, DollarSign, Activity, Waves } from 'lucide-react';

interface DashboardViewProps {
  vessels: Vessel[];
  voyages: Voyage[];
  maintenance: MaintenanceRecord[];
  onOpenAi: () => void;
  setActiveTab: (tab: string) => void;
}

export default function DashboardView({ vessels, voyages, maintenance, onOpenAi, setActiveTab }: DashboardViewProps) {
  const activeVesselsCount = vessels.filter(v => v.status === 'Berlayar').length;
  const inTransitVoyages = voyages.filter(voy => voy.status === 'In Transit').length;
  const totalRevenue = voyages.reduce((sum, v) => sum + (v.revenue || 0), 0);
  const totalDWT = vessels.reduce((sum, v) => sum + (v.dwt || 0), 0);

  const formatIDR = (num: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-slate-900 to-cyan-950 p-6 rounded-2xl border border-blue-500/30 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-cyan-500/20 text-cyan-300 rounded-full text-xs font-semibold mb-2">
            <Waves className="w-3.5 h-3.5 animate-pulse" />
            <span>Sistem Operasional Waktu Nyata (Real-Time Database Connected)</span>
          </div>
          <h2 className="text-2xl font-bold text-white">Dashboard Operasional Angkutan Laut</h2>
          <p className="text-slate-300 text-sm mt-1">Pantau performa armada, manifest pelayaran, dan status logistik maritim secara live.</p>
        </div>
        <button
          onClick={onOpenAi}
          className="px-5 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold rounded-xl shadow-lg shadow-cyan-500/25 flex items-center space-x-2 text-sm transition shrink-0"
        >
          <Sparkles className="w-4 h-4" />
          <span>Analisis AI & Asisten Rute</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl shadow-lg flex items-center space-x-4">
          <div className="w-12 h-12 bg-blue-600/20 border border-blue-500/30 rounded-xl flex items-center justify-center text-blue-400">
            <Ship className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400">Kapal Berlayar</p>
            <h3 className="text-2xl font-bold text-white mt-0.5">{activeVesselsCount} <span className="text-xs text-slate-400 font-normal">/ {vessels.length} Total</span></h3>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl shadow-lg flex items-center space-x-4">
          <div className="w-12 h-12 bg-cyan-600/20 border border-cyan-500/30 rounded-xl flex items-center justify-center text-cyan-400">
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400">Voyage Aktif</p>
            <h3 className="text-2xl font-bold text-white mt-0.5">{inTransitVoyages} <span className="text-xs text-slate-400 font-normal">Manifest</span></h3>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl shadow-lg flex items-center space-x-4">
          <div className="w-12 h-12 bg-emerald-600/20 border border-emerald-500/30 rounded-xl flex items-center justify-center text-emerald-400">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400">Total Nilai Freight</p>
            <h3 className="text-lg font-bold text-white mt-0.5">{formatIDR(totalRevenue)}</h3>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl shadow-lg flex items-center space-x-4">
          <div className="w-12 h-12 bg-purple-600/20 border border-purple-500/30 rounded-xl flex items-center justify-center text-purple-400">
            <Anchor className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400">Total Kapasitas (DWT)</p>
            <h3 className="text-xl font-bold text-white mt-0.5">{totalDWT.toLocaleString('id-ID')} Ton</h3>
          </div>
        </div>
      </div>

      {/* Quick Action / Recent Manifests & Active Vessels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Voyages Table */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-lg flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-white text-base flex items-center space-x-2">
              <Compass className="w-5 h-5 text-cyan-400" />
              <span>Pelayaran Aktif (Voyages)</span>
            </h3>
            <button
              onClick={() => setActiveTab('transactions')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-medium"
            >
              Lihat Semua →
            </button>
          </div>

          <div className="space-y-3 flex-1 overflow-x-auto">
            {voyages.slice(0, 4).map((voy) => (
              <div key={voy.id || voy.noVoyage} className="p-3.5 bg-slate-950/60 border border-slate-800/80 rounded-xl flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-white text-xs">{voy.noVoyage}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                      voy.status === 'In Transit' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' :
                      voy.status === 'Scheduled' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                      'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}>
                      {voy.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{voy.vesselName} • {voy.origin} ➔ {voy.destination}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold text-emerald-400">{formatIDR(voy.revenue || 0)}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Muatan: {voy.tonnage} Ton</p>
                </div>
              </div>
            ))}
            {voyages.length === 0 && (
              <p className="text-xs text-slate-400 text-center py-6">Belum ada data pelayaran.</p>
            )}
          </div>
        </div>

        {/* Fleet Status Summary */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-lg flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-white text-base flex items-center space-x-2">
              <Ship className="w-5 h-5 text-blue-400" />
              <span>Status Armada Kapal</span>
            </h3>
            <button
              onClick={() => setActiveTab('master')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-medium"
            >
              Kelola Master →
            </button>
          </div>

          <div className="space-y-3 flex-1 overflow-x-auto">
            {vessels.slice(0, 4).map((v) => (
              <div key={v.id || v.name} className="p-3.5 bg-slate-950/60 border border-slate-800/80 rounded-xl flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-white text-xs">{v.name}</span>
                    <span className="text-[10px] text-slate-400">({v.type})</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Lokasi: {v.currentLocation}</p>
                </div>
                <div className="text-right">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold ${
                    v.status === 'Berlayar' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                    v.status === 'Sandar' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                    'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}>
                    {v.status}
                  </span>
                  <p className="text-[10px] text-slate-400 mt-1">DWT: {v.dwt.toLocaleString('id-ID')} T</p>
                </div>
              </div>
            ))}
            {vessels.length === 0 && (
              <p className="text-xs text-slate-400 text-center py-6">Belum ada data kapal.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Sparkles({ className }: { className?: string }) {
  return <Activity className={className} />;
}
