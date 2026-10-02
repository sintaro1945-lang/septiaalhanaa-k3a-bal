import React, { useState } from 'react';
import { MaintenanceRecord, Vessel } from '../types';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { Wrench, Plus, Trash2, X, DollarSign, Calendar } from 'lucide-react';

interface MaintenanceViewProps {
  maintenance: MaintenanceRecord[];
  vessels: Vessel[];
}

export default function MaintenanceView({ maintenance, vessels }: MaintenanceViewProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [vesselName, setVesselName] = useState(vessels[0]?.name || '');
  const [type, setType] = useState<'Perawatan Berkala' | 'Perbaikan Mesin' | 'Drydock' | 'Bunker BBM'>('Perawatan Berkala');
  const [cost, setCost] = useState(45000000);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('Perawatan rutin mesin induk & penggantian filter.');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'maintenance'), {
        vesselName,
        type,
        cost: Number(cost),
        date,
        description
      });
      setModalOpen(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'maintenance');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus catatan perawatan ini?')) return;
    try {
      await deleteDoc(doc(db, 'maintenance', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'maintenance');
    }
  };

  const formatIDR = (num: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Perawatan Kapal & Bunker BBM</h2>
          <p className="text-slate-400 text-sm">Catat jadwal drydock, perbaikan mesin, dan pengisian bahan bakar kapal.</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-medium text-sm flex items-center space-x-2 shadow-lg shadow-cyan-600/20 transition self-start"
        >
          <Plus className="w-4 h-4" />
          <span>Catat Maintenance / Bunker</span>
        </button>
      </div>

      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-xs tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">Nama Kapal</th>
                <th className="px-6 py-4">Jenis Perawatan / Bunker</th>
                <th className="px-6 py-4">Biaya (IDR)</th>
                <th className="px-6 py-4">Tanggal</th>
                <th className="px-6 py-4">Keterangan</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {maintenance.map((m) => (
                <tr key={m.id} className="hover:bg-slate-950/40 transition">
                  <td className="px-6 py-4 font-semibold text-white">{m.vesselName}</td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 bg-slate-800 border border-slate-700 text-cyan-300 rounded-full text-xs">{m.type}</span>
                  </td>
                  <td className="px-6 py-4 font-semibold text-red-400">{formatIDR(m.cost || 0)}</td>
                  <td className="px-6 py-4 text-slate-400">{m.date}</td>
                  <td className="px-6 py-4 text-slate-300">{m.description}</td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => handleDelete(m.id)} className="p-1.5 bg-slate-800 hover:bg-red-950 text-red-400 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
              {maintenance.length === 0 && (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-500">Belum ada catatan perawatan kapal.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-4 bg-slate-800 border-b border-slate-700 flex items-center justify-between">
              <h3 className="font-bold text-white text-base">Catat Perawatan / Bunker BBM</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Pilih Kapal</label>
                <select value={vesselName} onChange={e => setVesselName(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm">
                  {vessels.map(v => (
                    <option key={v.id} value={v.name}>{v.name} ({v.type})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Jenis Aktivitas</label>
                <select value={type} onChange={e => setType(e.target.value as any)} className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm">
                  <option value="Perawatan Berkala">Perawatan Berkala</option>
                  <option value="Perbaikan Mesin">Perbaikan Mesin</option>
                  <option value="Drydock">Drydock</option>
                  <option value="Bunker BBM">Bunker BBM</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Biaya (IDR)</label>
                  <input type="number" required value={cost} onChange={e => setCost(Number(e.target.value))} className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Tanggal</label>
                  <input type="date" required value={date} onChange={e => setDate(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Keterangan / Deskripsi</label>
                <textarea rows={3} required value={description} onChange={e => setDescription(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm" />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm">Batal</button>
                <button type="submit" className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-medium rounded-xl text-sm">Simpan Catatan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
