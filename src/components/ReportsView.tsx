import React from 'react';
import { Voyage, MaintenanceRecord, Vessel } from '../types';
import { FileText, Printer, Download, DollarSign, TrendingUp, ShieldCheck } from 'lucide-react';

interface ReportsViewProps {
  voyages: Voyage[];
  maintenance: MaintenanceRecord[];
  vessels: Vessel[];
}

export default function ReportsView({ voyages, maintenance, vessels }: ReportsViewProps) {
  const totalRevenue = voyages.reduce((acc, v) => acc + (v.revenue || 0), 0);
  const totalMaintenanceCost = maintenance.reduce((acc, m) => acc + (m.cost || 0), 0);
  const netProfit = totalRevenue - totalMaintenanceCost;

  const formatIDR = (num: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const headers = ['No. Voyage', 'Kapal', 'Asal', 'Tujuan', 'Kargo', 'Tonase', 'Pendapatan', 'Status'];
    const rows = voyages.map(v => [
      v.noVoyage,
      v.vesselName,
      v.origin,
      v.destination,
      v.cargoType,
      v.tonnage,
      v.revenue,
      v.status
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'laporan_pelayaran_oceanfleet.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Laporan Keuangan & Kinerja Operasional</h2>
          <p className="text-slate-400 text-sm">Analisis pendapatan freight, biaya operasional kapal, dan cetak laporan resmi.</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 rounded-xl font-medium text-sm flex items-center space-x-2 transition"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-medium text-sm flex items-center space-x-2 shadow-lg shadow-cyan-600/20 transition"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Laporan</span>
          </button>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl shadow-xl">
          <p className="text-xs text-slate-400">Total Pendapatan (Freight Revenue)</p>
          <h3 className="text-2xl font-bold text-emerald-400 mt-2">{formatIDR(totalRevenue)}</h3>
          <p className="text-xs text-slate-500 mt-1">Dari {voyages.length} manifest pelayaran</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl shadow-xl">
          <p className="text-xs text-slate-400">Total Biaya Perawatan & Bunker</p>
          <h3 className="text-2xl font-bold text-red-400 mt-2">{formatIDR(totalMaintenanceCost)}</h3>
          <p className="text-xs text-slate-500 mt-1">Dari {maintenance.length} catatan perbaikan</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl shadow-xl">
          <p className="text-xs text-slate-400">Estimasi Laba Operasional</p>
          <h3 className="text-2xl font-bold text-cyan-400 mt-2">{formatIDR(netProfit)}</h3>
          <p className="text-xs text-emerald-500 mt-1">Margin sehat ➔ Operasional Optimal</p>
        </div>
      </div>

      {/* Detailed Voyage Summary Report Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="font-bold text-white text-base flex items-center space-x-2">
          <FileText className="w-5 h-5 text-cyan-400" />
          <span>Rekapitulasi Manifest Pelayaran & Muatan</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-xs tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">No. Voyage</th>
                <th className="px-6 py-4">Kapal</th>
                <th className="px-6 py-4">Rute</th>
                <th className="px-6 py-4">Jenis Kargo</th>
                <th className="px-6 py-4">Tonase</th>
                <th className="px-6 py-4 text-right">Pendapatan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {voyages.map((voy) => (
                <tr key={voy.id} className="hover:bg-slate-950/40">
                  <td className="px-6 py-4 font-bold text-cyan-400">{voy.noVoyage}</td>
                  <td className="px-6 py-4 font-semibold text-white">{voy.vesselName}</td>
                  <td className="px-6 py-4">{voy.origin} ➔ {voy.destination}</td>
                  <td className="px-6 py-4">{voy.cargoType}</td>
                  <td className="px-6 py-4">{voy.tonnage?.toLocaleString('id-ID')} Ton</td>
                  <td className="px-6 py-4 text-right font-semibold text-emerald-400">{formatIDR(voy.revenue || 0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
