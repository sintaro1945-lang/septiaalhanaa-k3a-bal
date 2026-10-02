import React, { useState } from 'react';
import { Voyage, TrackingLog } from '../types';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { Compass, MapPin, Navigation, Radio, Waves, Plus, AlertCircle } from 'lucide-react';

interface LiveTrackingViewProps {
  voyages: Voyage[];
  trackingLogs: TrackingLog[];
}

export default function LiveTrackingView({ voyages, trackingLogs }: LiveTrackingViewProps) {
  const [selectedVoyageId, setSelectedVoyageId] = useState<string>(voyages[0]?.id || '');
  const [modalOpen, setModalOpen] = useState(false);
  const [lat, setLat] = useState(-5.2);
  const [lng, setLng] = useState(106.5);
  const [speed, setSpeed] = useState(16.5);
  const [weather, setWeather] = useState<'Cerah' | 'Berawan' | 'Hujan Ringan' | 'Badai / Ombak Besar'>('Cerah');
  const [note, setNote] = useState('Posisi normal, navigasi aman');

  const selectedVoyage = voyages.find(v => v.id === selectedVoyageId) || voyages[0];
  const logsForVoyage = trackingLogs.filter(l => l.voyageId === selectedVoyage?.id);

  const handleAddLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVoyage) return;
    try {
      await addDoc(collection(db, 'trackingLogs'), {
        voyageId: selectedVoyage.id,
        lat: Number(lat),
        lng: Number(lng),
        speed: Number(speed),
        weather,
        note,
        timestamp: new Date().toISOString()
      });
      setModalOpen(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'trackingLogs');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Pelacakan Kapal & GPS Real-Time</h2>
          <p className="text-slate-400 text-sm">Pantau koordinat GPS, cuaca laut, dan riwayat checkpoint pelayaran secara langsung.</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={selectedVoyageId}
            onChange={(e) => setSelectedVoyageId(e.target.value)}
            className="px-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm"
          >
            {voyages.map(v => (
              <option key={v.id} value={v.id}>{v.noVoyage} - {v.vesselName} ({v.origin} ➔ {v.destination})</option>
            ))}
          </select>
          <button
            onClick={() => setModalOpen(true)}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-medium text-sm flex items-center space-x-2 shadow-lg shadow-cyan-600/20 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Update Checkpoint</span>
          </button>
        </div>
      </div>

      {selectedVoyage ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map Simulation Panel */}
          <div className="lg:col-span-2 bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[400px]">
            <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none"></div>

            <div className="flex items-center justify-between relative z-10 mb-4">
              <div className="flex items-center space-x-2">
                <Radio className="w-5 h-5 text-emerald-400 animate-pulse" />
                <span className="font-bold text-white text-sm">Radar Live Tracking: {selectedVoyage.vesselName}</span>
              </div>
              <span className="px-3 py-1 bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 rounded-full text-xs font-semibold">
                {selectedVoyage.status}
              </span>
            </div>

            {/* Visual Radar Map Box */}
            <div className="relative z-10 my-auto py-12 flex flex-col items-center justify-center text-center">
              <div className="w-32 h-32 rounded-full border border-cyan-500/30 flex items-center justify-center animate-ping absolute"></div>
              <div className="w-24 h-24 rounded-full border border-cyan-500/50 flex items-center justify-center relative bg-cyan-950/40 backdrop-blur-sm shadow-xl">
                <Navigation className="w-10 h-10 text-cyan-400 animate-pulse transform rotate-45" />
              </div>
              <div className="mt-6 space-y-1">
                <p className="text-white font-semibold text-sm">Voyage: {selectedVoyage.noVoyage}</p>
                <p className="text-xs text-slate-400">{selectedVoyage.origin} ➔ {selectedVoyage.destination}</p>
                <p className="text-xs text-emerald-400 font-mono mt-1">Lat: -5.2000°, Lng: 106.5000° • 16.5 Knot</p>
              </div>
            </div>

            <div className="relative z-10 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>Sistem Pemantauan Satelit Maritim Aktif</span>
              <span className="text-cyan-400 font-medium">Update Terakhir: Baru saja</span>
            </div>
          </div>

          {/* Checkpoint History Sidebar */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col">
            <h3 className="font-bold text-white text-base mb-4 flex items-center space-x-2">
              <Compass className="w-5 h-5 text-cyan-400" />
              <span>Riwayat Checkpoint</span>
            </h3>

            <div className="space-y-3 flex-1 overflow-y-auto max-h-[350px]">
              {logsForVoyage.map((log) => (
                <div key={log.id} className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-cyan-300">{log.weather}</span>
                    <span className="text-[10px] text-slate-400">{new Date(log.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-xs text-white">{log.note}</p>
                  <p className="text-[10px] text-slate-400 font-mono">GPS: {log.lat}, {log.lng} • {log.speed} Knot</p>
                </div>
              ))}
              {logsForVoyage.length === 0 && (
                <p className="text-xs text-slate-400 text-center py-8">Belum ada log checkpoint untuk voyage ini.</p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <p className="text-slate-400 text-center py-12">Silakan buat voyage terlebih dahulu untuk melihat pelacakan.</p>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-4 bg-slate-800 border-b border-slate-700 flex items-center justify-between">
              <h3 className="font-bold text-white text-base">Tambah Checkpoint Pelacakan</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleAddLog} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Latitude</label>
                  <input type="number" step="0.0001" required value={lat} onChange={e => setLat(Number(e.target.value))} className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Longitude</label>
                  <input type="number" step="0.0001" required value={lng} onChange={e => setLng(Number(e.target.value))} className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Kecepatan (Knot)</label>
                  <input type="number" step="0.1" required value={speed} onChange={e => setSpeed(Number(e.target.value))} className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Kondisi Cuaca</label>
                  <select value={weather} onChange={e => setWeather(e.target.value as any)} className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm">
                    <option value="Cerah">Cerah</option>
                    <option value="Berawan">Berawan</option>
                    <option value="Hujan Ringan">Hujan Ringan</option>
                    <option value="Badai / Ombak Besar">Badai / Ombak Besar</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Catatan Log</label>
                <textarea rows={3} required value={note} onChange={e => setNote(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm" placeholder="Kondisi navigasi dan operasional..." />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm">Batal</button>
                <button type="submit" className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-medium rounded-xl text-sm">Simpan Checkpoint</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
