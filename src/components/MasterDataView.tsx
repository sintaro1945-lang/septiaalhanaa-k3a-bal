import React, { useState } from 'react';
import { Vessel, Port, CargoType, Crew } from '../types';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { Ship, Anchor, Package, Users, Plus, Edit, Trash2, X, Check } from 'lucide-react';

interface MasterDataViewProps {
  vessels: Vessel[];
  ports: Port[];
  cargoTypes: CargoType[];
  crewList: Crew[];
}

export default function MasterDataView({ vessels, ports, cargoTypes, crewList }: MasterDataViewProps) {
  const [activeSubTab, setActiveSubTab] = useState<'vessels' | 'ports' | 'cargo' | 'crew'>('vessels');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  // Form states
  const [formData, setFormData] = useState<any>({});

  const handleOpenAdd = () => {
    setEditingItem(null);
    if (activeSubTab === 'vessels') {
      setFormData({ name: '', type: 'Container', dwt: 10000, speed: 15, status: 'Berlayar', currentLocation: 'Tanjung Priok', yearBuilt: 2020 });
    } else if (activeSubTab === 'ports') {
      setFormData({ code: '', name: '', country: 'Indonesia', coordinates: '0.0, 0.0' });
    } else if (activeSubTab === 'cargo') {
      setFormData({ name: '', category: 'General', ratePerTon: 400000 });
    } else if (activeSubTab === 'crew') {
      setFormData({ name: '', position: 'Mualim 1', phone: '', certification: 'ANT-II' });
    }
    setModalOpen(true);
  };

  const handleOpenEdit = (item: any) => {
    setEditingItem(item);
    setFormData({ ...item });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const colName = activeSubTab === 'vessels' ? 'vessels' :
                      activeSubTab === 'ports' ? 'ports' :
                      activeSubTab === 'cargo' ? 'cargoTypes' : 'crew';

      if (editingItem && editingItem.id) {
        const docRef = doc(db, colName, editingItem.id);
        await updateDoc(docRef, formData);
      } else {
        await addDoc(collection(db, colName), formData);
      }
      setModalOpen(false);
    } catch (error) {
      handleFirestoreError(error, editingItem ? OperationType.UPDATE : OperationType.CREATE, activeSubTab);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus data ini?')) return;
    try {
      const colName = activeSubTab === 'vessels' ? 'vessels' :
                      activeSubTab === 'ports' ? 'ports' :
                      activeSubTab === 'cargo' ? 'cargoTypes' : 'crew';
      await deleteDoc(doc(db, colName, id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, activeSubTab);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Sub-tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Master Data Angkutan Laut</h2>
          <p className="text-slate-400 text-sm">Kelola data master kapal, pelabuhan, jenis kargo, dan kru operasional.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-medium text-sm flex items-center space-x-2 shadow-lg shadow-cyan-600/20 transition self-start"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Data Baru</span>
        </button>
      </div>

      {/* Navigation tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveSubTab('vessels')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition flex items-center space-x-2 ${
            activeSubTab === 'vessels' ? 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-300' : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <Ship className="w-4 h-4" />
          <span>Kapal ({vessels.length})</span>
        </button>
        <button
          onClick={() => setActiveSubTab('ports')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition flex items-center space-x-2 ${
            activeSubTab === 'ports' ? 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-300' : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <Anchor className="w-4 h-4" />
          <span>Pelabuhan ({ports.length})</span>
        </button>
        <button
          onClick={() => setActiveSubTab('cargo')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition flex items-center space-x-2 ${
            activeSubTab === 'cargo' ? 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-300' : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Jenis Kargo ({cargoTypes.length})</span>
        </button>
        <button
          onClick={() => setActiveSubTab('crew')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition flex items-center space-x-2 ${
            activeSubTab === 'crew' ? 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-300' : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Kru & Staff ({crewList.length})</span>
        </button>
      </div>

      {/* Tables */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          {activeSubTab === 'vessels' && (
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase text-xs tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4">Nama Kapal</th>
                  <th className="px-6 py-4">Jenis</th>
                  <th className="px-6 py-4">DWT (Ton)</th>
                  <th className="px-6 py-4">Kecepatan</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Lokasi Saat Ini</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {vessels.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-950/40 transition">
                    <td className="px-6 py-4 font-semibold text-white">{v.name}</td>
                    <td className="px-6 py-4">{v.type}</td>
                    <td className="px-6 py-4">{v.dwt?.toLocaleString('id-ID')} T</td>
                    <td className="px-6 py-4">{v.speed} Knot</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold ${
                        v.status === 'Berlayar' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                        v.status === 'Sandar' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                        'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        {v.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">{v.currentLocation}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button onClick={() => handleOpenEdit(v)} className="p-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded-lg"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(v.id)} className="p-1.5 bg-slate-800 hover:bg-red-950 text-red-400 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
                {vessels.length === 0 && (
                  <tr><td colSpan={7} className="px-6 py-8 text-center text-slate-500">Belum ada data kapal.</td></tr>
                )}
              </tbody>
            </table>
          )}

          {activeSubTab === 'ports' && (
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase text-xs tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4">Kode Pelabuhan</th>
                  <th className="px-6 py-4">Nama Pelabuhan</th>
                  <th className="px-6 py-4">Negara</th>
                  <th className="px-6 py-4">Koordinat GPS</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {ports.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-950/40 transition">
                    <td className="px-6 py-4 font-bold text-cyan-400">{p.code}</td>
                    <td className="px-6 py-4 font-semibold text-white">{p.name}</td>
                    <td className="px-6 py-4">{p.country}</td>
                    <td className="px-6 py-4 text-slate-400 font-mono text-xs">{p.coordinates}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button onClick={() => handleOpenEdit(p)} className="p-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded-lg"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(p.id)} className="p-1.5 bg-slate-800 hover:bg-red-950 text-red-400 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
                {ports.length === 0 && (
                  <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">Belum ada data pelabuhan.</td></tr>
                )}
              </tbody>
            </table>
          )}

          {activeSubTab === 'cargo' && (
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase text-xs tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4">Nama Jenis Kargo</th>
                  <th className="px-6 py-4">Kategori</th>
                  <th className="px-6 py-4">Tarif / Ton (IDR)</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {cargoTypes.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-950/40 transition">
                    <td className="px-6 py-4 font-semibold text-white">{c.name}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 bg-slate-800 border border-slate-700 text-slate-300 rounded-full text-xs">{c.category}</span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-emerald-400">Rp {c.ratePerTon?.toLocaleString('id-ID')}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button onClick={() => handleOpenEdit(c)} className="p-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded-lg"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(c.id)} className="p-1.5 bg-slate-800 hover:bg-red-950 text-red-400 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
                {cargoTypes.length === 0 && (
                  <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-500">Belum ada data jenis kargo.</td></tr>
                )}
              </tbody>
            </table>
          )}

          {activeSubTab === 'crew' && (
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase text-xs tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4">Nama Kru</th>
                  <th className="px-6 py-4">Jabatan</th>
                  <th className="px-6 py-4">No. Telepon</th>
                  <th className="px-6 py-4">Sertifikasi</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {crewList.map((cr) => (
                  <tr key={cr.id} className="hover:bg-slate-950/40 transition">
                    <td className="px-6 py-4 font-semibold text-white">{cr.name}</td>
                    <td className="px-6 py-4 text-cyan-300">{cr.position}</td>
                    <td className="px-6 py-4">{cr.phone || '-'}</td>
                    <td className="px-6 py-4">{cr.certification || '-'}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button onClick={() => handleOpenEdit(cr)} className="p-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded-lg"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(cr.id)} className="p-1.5 bg-slate-800 hover:bg-red-950 text-red-400 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
                {crewList.length === 0 && (
                  <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">Belum ada data kru.</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-4 bg-slate-800 border-b border-slate-700 flex items-center justify-between">
              <h3 className="font-bold text-white text-base">
                {editingItem ? 'Edit Data Master' : 'Tambah Data Master'} ({activeSubTab})
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {activeSubTab === 'vessels' && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Nama Kapal</label>
                    <input type="text" required value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Jenis Kapal</label>
                      <select value={formData.type || 'Container'} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm">
                        <option value="Container">Container</option>
                        <option value="Bulk Carrier">Bulk Carrier</option>
                        <option value="Tanker">Tanker</option>
                        <option value="Ro-Ro">Ro-Ro</option>
                        <option value="General Cargo">General Cargo</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">DWT (Ton)</label>
                      <input type="number" required value={formData.dwt || 0} onChange={e => setFormData({...formData, dwt: Number(e.target.value)})} className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Kecepatan (Knot)</label>
                      <input type="number" step="0.1" required value={formData.speed || 12} onChange={e => setFormData({...formData, speed: Number(e.target.value)})} className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Status</label>
                      <select value={formData.status || 'Berlayar'} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm">
                        <option value="Berlayar">Berlayar</option>
                        <option value="Sandar">Sandar</option>
                        <option value="Perawatan">Perawatan</option>
                        <option value="Standby">Standby</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Lokasi Saat Ini</label>
                    <input type="text" required value={formData.currentLocation || ''} onChange={e => setFormData({...formData, currentLocation: e.target.value})} className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm" />
                  </div>
                </>
              )}

              {activeSubTab === 'ports' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Kode Pelabuhan</label>
                      <input type="text" required value={formData.code || ''} onChange={e => setFormData({...formData, code: e.target.value})} className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm uppercase" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Negara</label>
                      <input type="text" required value={formData.country || ''} onChange={e => setFormData({...formData, country: e.target.value})} className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Nama Pelabuhan</label>
                    <input type="text" required value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Koordinat GPS</label>
                    <input type="text" required value={formData.coordinates || ''} onChange={e => setFormData({...formData, coordinates: e.target.value})} className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm" />
                  </div>
                </>
              )}

              {activeSubTab === 'cargo' && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Nama Jenis Kargo</label>
                    <input type="text" required value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Kategori</label>
                    <input type="text" required value={formData.category || ''} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Tarif per Ton (IDR)</label>
                    <input type="number" required value={formData.ratePerTon || 0} onChange={e => setFormData({...formData, ratePerTon: Number(e.target.value)})} className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm" />
                  </div>
                </>
              )}

              {activeSubTab === 'crew' && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Nama Kru</label>
                    <input type="text" required value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Jabatan</label>
                    <select value={formData.position || 'Mualim 1'} onChange={e => setFormData({...formData, position: e.target.value})} className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm">
                      <option value="Kapten">Kapten</option>
                      <option value="Mualim 1">Mualim 1</option>
                      <option value="KKM">KKM</option>
                      <option value="ABK">ABK</option>
                      <option value="Operasional">Operasional</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">No. Telepon</label>
                    <input type="text" value={formData.phone || ''} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Sertifikasi</label>
                    <input type="text" value={formData.certification || ''} onChange={e => setFormData({...formData, certification: e.target.value})} className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm" />
                  </div>
                </>
              )}

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm">Batal</button>
                <button type="submit" className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-medium rounded-xl text-sm">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
