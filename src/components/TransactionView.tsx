import React, { useState } from 'react';
import { Voyage, Vessel, Port, CargoType } from '../types';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { Compass, Plus, Edit, Trash2, X, DollarSign, Calendar, MapPin } from 'lucide-react';

interface TransactionViewProps {
  voyages: Voyage[];
  vessels: Vessel[];
  ports: Port[];
  cargoTypes: CargoType[];
}

export default function TransactionView({ voyages, vessels, ports, cargoTypes }: TransactionViewProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingVoyage, setEditingVoyage] = useState<Voyage | null>(null);
  const [formData, setFormData] = useState<Partial<Voyage>>({
    noVoyage: `VOY-2026-00${voyages.length + 1}`,
    vesselName: vessels[0]?.name || '',
    origin: ports[0]?.name || '',
    destination: ports[1]?.name || '',
    cargoType: cargoTypes[0]?.name || '',
    tonnage: 5000,
    revenue: 2000000000,
    status: 'Scheduled',
    departureDate: new Date().toISOString().split('T')[0],
    arrivalDate: new Date(Date.now() + 86400000 * 4).toISOString().split('T')[0]
  });

  const handleOpenAdd = () => {
    setEditingVoyage(null);
    setFormData({
      noVoyage: `VOY-2026-00${voyages.length + 1}`,
      vesselName: vessels[0]?.name || '',
      origin: ports[0]?.name || '',
      destination: ports[1]?.name || '',
      cargoType: cargoTypes[0]?.name || '',
      tonnage: 5000,
      revenue: 2000000000,
      status: 'Scheduled',
      departureDate: new Date().toISOString().split('T')[0],
      arrivalDate: new Date(Date.now() + 86400000 * 4).toISOString().split('T')[0]
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (voy: Voyage) => {
    setEditingVoyage(voy);
    setFormData({ ...voy });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingVoyage && editingVoyage.id) {
        await updateDoc(doc(db, 'voyages', editingVoyage.id), formData);
      } else {
        await addDoc(collection(db, 'voyages'), formData);
      }
      setModalOpen(false);
    } catch (error) {
      handleFirestoreError(error, editingVoyage ? OperationType.UPDATE : OperationType.CREATE, 'voyages');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus manifest pelayaran ini?')) return;
    try {
      await deleteDoc(doc(db, 'voyages', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'voyages');
    }
  };

  const formatIDR = (num: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Transaksi Manifest Pelayaran (Voyage)</h2>
          <p className="text-slate-400 text-sm">Kelola jadwal keberangkatan kapal, rute asal-tujuan, muatan kargo, dan nilai freight.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-medium text-sm flex items-center space-x-2 shadow-lg shadow-cyan-600/20 transition self-start"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Manifest Voyage</span>
        </button>
      </div>

      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-xs tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">No. Voyage</th>
                <th className="px-6 py-4">Kapal</th>
                <th className="px-6 py-4">Rute (Asal ➔ Tujuan)</th>
                <th className="px-6 py-4">Kargo & Tonase</th>
                <th className="px-6 py-4">Pendapatan Freight</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {voyages.map((voy) => (
                <tr key={voy.id} className="hover:bg-slate-950/40 transition">
                  <td className="px-6 py-4 font-bold text-cyan-400">{voy.noVoyage}</td>
                  <td className="px-6 py-4 font-semibold text-white">{voy.vesselName}</td>
                  <td className="px-6 py-4">
                    <div className="text-xs text-slate-300">{voy.origin}</div>
                    <div className="text-xs text-cyan-400 mt-0.5">➔ {voy.destination}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-xs text-white">{voy.cargoType}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{voy.tonnage?.toLocaleString('id-ID')} Ton</div>
                  </td>
                  <td className="px-6 py-4 font-semibold text-emerald-400">{formatIDR(voy.revenue || 0)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold ${
                      voy.status === 'In Transit' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' :
                      voy.status === 'Scheduled' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                      voy.status === 'Arrived' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                      'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}>
                      {voy.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button onClick={() => handleOpenEdit(voy)} className="p-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded-lg"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(voy.id)} className="p-1.5 bg-slate-800 hover:bg-red-950 text-red-400 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
              {voyages.length === 0 && (
                <tr><td colSpan={7} className="px-6 py-8 text-center text-slate-500">Belum ada data manifest pelayaran.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-4 bg-slate-800 border-b border-slate-700 flex items-center justify-between">
              <h3 className="font-bold text-white text-base">
                {editingVoyage ? 'Edit Manifest Voyage' : 'Buat Manifest Voyage Baru'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">No. Voyage</label>
                  <input type="text" required value={formData.noVoyage || ''} onChange={e => setFormData({...formData, noVoyage: e.target.value})} className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Pilih Kapal</label>
                  <select value={formData.vesselName || ''} onChange={e => setFormData({...formData, vesselName: e.target.value})} className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm">
                    {vessels.map(v => (
                      <option key={v.id} value={v.name}>{v.name} ({v.type})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Pelabuhan Asal</label>
                  <select value={formData.origin || ''} onChange={e => setFormData({...formData, origin: e.target.value})} className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm">
                    {ports.map(p => (
                      <option key={p.id} value={p.name}>{p.name} ({p.code})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Pelabuhan Tujuan</label>
                  <select value={formData.destination || ''} onChange={e => setFormData({...formData, destination: e.target.value})} className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm">
                    {ports.map(p => (
                      <option key={p.id} value={p.name}>{p.name} ({p.code})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Jenis Kargo</label>
                  <select value={formData.cargoType || ''} onChange={e => setFormData({...formData, cargoType: e.target.value})} className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm">
                    {cargoTypes.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Tonase (Ton)</label>
                  <input type="number" required value={formData.tonnage || 0} onChange={e => setFormData({...formData, tonnage: Number(e.target.value)})} className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Pendapatan Freight (IDR)</label>
                  <input type="number" required value={formData.revenue || 0} onChange={e => setFormData({...formData, revenue: Number(e.target.value)})} className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Status Pelayaran</label>
                  <select value={formData.status || 'Scheduled'} onChange={e => setFormData({...formData, status: e.target.value as any})} className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm">
                    <option value="Scheduled">Scheduled</option>
                    <option value="In Transit">In Transit</option>
                    <option value="Arrived">Arrived</option>
                    <option value="Delayed">Delayed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Tgl Berangkat</label>
                  <input type="date" value={formData.departureDate || ''} onChange={e => setFormData({...formData, departureDate: e.target.value})} className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Tgl Tiba (Est)</label>
                  <input type="date" value={formData.arrivalDate || ''} onChange={e => setFormData({...formData, arrivalDate: e.target.value})} className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm" />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm">Batal</button>
                <button type="submit" className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-medium rounded-xl text-sm">Simpan Manifest</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
