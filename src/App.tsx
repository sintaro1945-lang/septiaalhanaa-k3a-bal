import React, { useState, useEffect } from 'react';
import { auth, db } from './firebase';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { collection, onSnapshot, doc, getDoc, addDoc, updateDoc, deleteDoc, setDoc } from 'firebase/firestore';
import { 
  Ship, Anchor, Compass, Package, Users, FileText, Wrench, 
  LayoutDashboard, LogOut, Sparkles, Waves 
} from 'lucide-react';

import LoginView from './components/LoginView';
import DashboardView from './components/DashboardView';
import MasterDataView from './components/MasterDataView';
import TransactionView from './components/TransactionView';
import LiveTrackingView from './components/LiveTrackingView';
import MaintenanceView from './components/MaintenanceView';
import ReportsView from './components/ReportsView';
import AiAssistantModal from './components/AiAssistantModal';
import { Vessel, Port, CargoType, Crew, Voyage, TrackingLog, MaintenanceRecord, UserProfile } from './types';
import { 
  initialVessels, initialPorts, initialCargoTypes, initialCrew, 
  initialVoyages, initialTrackingLogs, initialMaintenance, 
  loadFromStorage, saveToStorage 
} from './storage';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [localUser, setLocalUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // App Navigation state
  const [activeTab, setActiveTab] = useState<'dashboard' | 'master' | 'transactions' | 'tracking' | 'maintenance' | 'reports'>('dashboard');
  const [aiModalOpen, setAiModalOpen] = useState(false);

  // Data states with localStorage fallback
  const [vessels, setVessels] = useState<Vessel[]>(() => loadFromStorage('vessels', initialVessels));
  const [ports, setPorts] = useState<Port[]>(() => loadFromStorage('ports', initialPorts));
  const [cargoTypes, setCargoTypes] = useState<CargoType[]>(() => loadFromStorage('cargoTypes', initialCargoTypes));
  const [crewList, setCrewList] = useState<Crew[]>(() => loadFromStorage('crew', initialCrew));
  const [voyages, setVoyages] = useState<Voyage[]>(() => loadFromStorage('voyages', initialVoyages));
  const [trackingLogs, setTrackingLogs] = useState<TrackingLog[]>(() => loadFromStorage('tracking', initialTrackingLogs));
  const [maintenance, setMaintenance] = useState<MaintenanceRecord[]>(() => loadFromStorage('maintenance', initialMaintenance));

  useEffect(() => {
    const savedLocalUser = localStorage.getItem('oceanfleet_local_user');
    if (savedLocalUser) {
      try {
        const parsed = JSON.parse(savedLocalUser);
        setLocalUser(parsed);
        setUserProfile({
          uid: parsed.uid,
          email: parsed.email,
          displayName: parsed.displayName,
          role: parsed.role,
          createdAt: new Date().toISOString()
        });
        setAuthLoading(false);
        return;
      } catch (e) {
        console.error(e);
      }
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const userSnap = await getDoc(doc(db, 'users', user.uid));
          if (userSnap.exists()) {
            setUserProfile(userSnap.data() as UserProfile);
          } else {
            setUserProfile({
              uid: user.uid,
              email: user.email || '',
              displayName: user.displayName || 'Operator',
              role: 'admin',
              createdAt: new Date().toISOString()
            });
          }
        } catch (e) {
          console.error("Error fetching user profile:", e);
        }
      } else {
        setUserProfile(null);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => { saveToStorage('vessels', vessels); }, [vessels]);
  useEffect(() => { saveToStorage('ports', ports); }, [ports]);
  useEffect(() => { saveToStorage('cargoTypes', cargoTypes); }, [cargoTypes]);
  useEffect(() => { saveToStorage('crew', crewList); }, [crewList]);
  useEffect(() => { saveToStorage('voyages', voyages); }, [voyages]);
  useEffect(() => { saveToStorage('tracking', trackingLogs); }, [trackingLogs]);
  useEffect(() => { saveToStorage('maintenance', maintenance); }, [maintenance]);

  // Master Data CRUD handlers
  const handleAddMasterItem = (type: 'vessels' | 'ports' | 'cargo' | 'crew', data: any) => {
    const newItem = { ...data, id: 'item_' + Date.now() };
    if (type === 'vessels') {
      const updated = [newItem, ...vessels];
      setVessels(updated);
      try { addDoc(collection(db, 'vessels'), newItem).catch(() => {}); } catch(e){}
    } else if (type === 'ports') {
      const updated = [newItem, ...ports];
      setPorts(updated);
      try { addDoc(collection(db, 'ports'), newItem).catch(() => {}); } catch(e){}
    } else if (type === 'cargo') {
      const updated = [newItem, ...cargoTypes];
      setCargoTypes(updated);
      try { addDoc(collection(db, 'cargoTypes'), newItem).catch(() => {}); } catch(e){}
    } else if (type === 'crew') {
      const updated = [newItem, ...crewList];
      setCrewList(updated);
      try { addDoc(collection(db, 'crew'), newItem).catch(() => {}); } catch(e){}
    }
  };

  const handleUpdateMasterItem = (type: 'vessels' | 'ports' | 'cargo' | 'crew', id: string, data: any) => {
    if (type === 'vessels') {
      const updated = vessels.map(v => v.id === id ? { ...v, ...data } : v);
      setVessels(updated);
      try { updateDoc(doc(db, 'vessels', id), data).catch(() => {}); } catch(e){}
    } else if (type === 'ports') {
      const updated = ports.map(p => p.id === id ? { ...p, ...data } : p);
      setPorts(updated);
      try { updateDoc(doc(db, 'ports', id), data).catch(() => {}); } catch(e){}
    } else if (type === 'cargo') {
      const updated = cargoTypes.map(c => c.id === id ? { ...c, ...data } : c);
      setCargoTypes(updated);
      try { updateDoc(doc(db, 'cargoTypes', id), data).catch(() => {}); } catch(e){}
    } else if (type === 'crew') {
      const updated = crewList.map(cr => cr.id === id ? { ...cr, ...data } : cr);
      setCrewList(updated);
      try { updateDoc(doc(db, 'crew', id), data).catch(() => {}); } catch(e){}
    }
  };

  const handleDeleteMasterItem = (type: 'vessels' | 'ports' | 'cargo' | 'crew', id: string) => {
    if (type === 'vessels') {
      setVessels(vessels.filter(v => v.id !== id));
      try { deleteDoc(doc(db, 'vessels', id)).catch(() => {}); } catch(e){}
    } else if (type === 'ports') {
      setPorts(ports.filter(p => p.id !== id));
      try { deleteDoc(doc(db, 'ports', id)).catch(() => {}); } catch(e){}
    } else if (type === 'cargo') {
      setCargoTypes(cargoTypes.filter(c => c.id !== id));
      try { deleteDoc(doc(db, 'cargoTypes', id)).catch(() => {}); } catch(e){}
    } else if (type === 'crew') {
      setCrewList(crewList.filter(cr => cr.id !== id));
      try { deleteDoc(doc(db, 'crew', id)).catch(() => {}); } catch(e){}
    }
  };

  // Voyage CRUD handlers
  const handleAddVoyage = (data: Partial<Voyage>) => {
    const newVoy: Voyage = { id: 'voy_' + Date.now(), ...(data as any) };
    const updated = [newVoy, ...voyages];
    setVoyages(updated);
    try { addDoc(collection(db, 'voyages'), newVoy).catch(() => {}); } catch(e){}
  };

  const handleUpdateVoyage = (id: string, data: Partial<Voyage>) => {
    const updated = voyages.map(v => v.id === id ? { ...v, ...data } : v);
    setVoyages(updated);
    try { updateDoc(doc(db, 'voyages', id), data).catch(() => {}); } catch(e){}
  };

  const handleDeleteVoyage = (id: string) => {
    setVoyages(voyages.filter(v => v.id !== id));
    try { deleteDoc(doc(db, 'voyages', id)).catch(() => {}); } catch(e){}
  };

  const handleLogout = async () => {
    localStorage.removeItem('oceanfleet_local_user');
    try {
      await signOut(auth);
    } catch (e) {}
    window.location.reload();
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-cyan-400 font-medium text-sm">Memuat Sistem OceanFleet Pro...</p>
      </div>
    );
  }

  if (!currentUser && !localUser) {
    return <LoginView />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-cyan-400 rounded-xl flex items-center justify-center shadow-md text-white">
            <Anchor className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-white text-base tracking-wide">OceanFleet Pro</h1>
            <p className="text-[11px] text-cyan-400">Sistem Manajemen Bisnis & Angkutan Laut</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={() => setAiModalOpen(true)}
            className="hidden sm:flex items-center space-x-2 px-3 py-1.5 bg-cyan-500/25 hover:bg-cyan-500/35 border border-cyan-500/40 rounded-xl text-cyan-300 text-xs font-semibold transition"
          >
            <Sparkles className="w-4 h-4" />
            <span>AI Assistant</span>
          </button>

          <div className="flex items-center space-x-3 pl-4 border-l border-slate-800">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-semibold text-white">{userProfile?.displayName || currentUser?.email || 'Operator'}</p>
              <p className="text-[10px] text-cyan-400 uppercase tracking-wider">{userProfile?.role || 'Admin'}</p>
            </div>
            <button
              onClick={handleLogout}
              title="Keluar"
              className="p-2 bg-slate-800 hover:bg-red-950/60 hover:text-red-400 text-slate-300 rounded-xl transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col md:flex-row">
        <aside className="w-full md:w-64 bg-slate-900/60 border-r border-slate-800 p-4 space-y-2 shrink-0">
          <div className="text-[10px] uppercase font-bold text-slate-500 px-3 pb-1 tracking-wider">Menu Utama</div>
          
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
              activeTab === 'dashboard' ? 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 shadow-lg shadow-cyan-500/10' : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard Analitik</span>
          </button>

          <button
            onClick={() => setActiveTab('master')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
              activeTab === 'master' ? 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 shadow-lg shadow-cyan-500/10' : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
            }`}
          >
            <Ship className="w-4 h-4" />
            <span>Master Data</span>
          </button>

          <button
            onClick={() => setActiveTab('transactions')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
              activeTab === 'transactions' ? 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 shadow-lg shadow-cyan-500/10' : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Manifest Pelayaran</span>
          </button>

          <button
            onClick={() => setActiveTab('tracking')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
              activeTab === 'tracking' ? 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 shadow-lg shadow-cyan-500/10' : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
            }`}
          >
            <Waves className="w-4 h-4" />
            <span>Pelacakan Real-Time</span>
          </button>

          <button
            onClick={() => setActiveTab('maintenance')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
              activeTab === 'maintenance' ? 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 shadow-lg shadow-cyan-500/10' : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
            }`}
          >
            <Wrench className="w-4 h-4" />
            <span>Perawatan & Bunker</span>
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
              activeTab === 'reports' ? 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 shadow-lg shadow-cyan-500/10' : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Laporan & Ekspor</span>
          </button>
        </aside>

        <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
          {activeTab === 'dashboard' && (
            <DashboardView 
              vessels={vessels} 
              voyages={voyages} 
              maintenance={maintenance} 
              onOpenAi={() => setAiModalOpen(true)}
              setActiveTab={(tab) => setActiveTab(tab as any)}
            />
          )}
          {activeTab === 'master' && (
            <MasterDataView 
              vessels={vessels} 
              ports={ports} 
              cargoTypes={cargoTypes} 
              crewList={crewList} 
              onAdd={handleAddMasterItem}
              onUpdate={handleUpdateMasterItem}
              onDelete={handleDeleteMasterItem}
            />
          )}
          {activeTab === 'transactions' && (
            <TransactionView 
              voyages={voyages} 
              vessels={vessels} 
              ports={ports} 
              cargoTypes={cargoTypes} 
              onAddVoyage={handleAddVoyage}
              onUpdateVoyage={handleUpdateVoyage}
              onDeleteVoyage={handleDeleteVoyage}
            />
          )}
          {activeTab === 'tracking' && (
            <LiveTrackingView 
              voyages={voyages} 
              trackingLogs={trackingLogs} 
            />
          )}
          {activeTab === 'maintenance' && (
            <MaintenanceView 
              maintenance={maintenance} 
              vessels={vessels} 
            />
          )}
          {activeTab === 'reports' && (
            <ReportsView 
              voyages={voyages} 
              maintenance={maintenance} 
              vessels={vessels} 
            />
          )}
        </main>
      </div>

      <AiAssistantModal 
        isOpen={aiModalOpen} 
        onClose={() => setAiModalOpen(false)} 
        vessels={vessels} 
        voyages={voyages} 
      />
    </div>
  );
}
