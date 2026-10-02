import React, { useState, useEffect } from 'react';
import { auth, db, handleFirestoreError, OperationType, signOut } from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { checkAndSeedDatabase } from './seedData';
import { 
  Ship, Anchor, Compass, Package, Users, FileText, Wrench, 
  LayoutDashboard, LogOut, Bell, Sparkles, Shield, Waves, UserCheck 
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

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [localUser, setLocalUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // App Navigation state
  const [activeTab, setActiveTab] = useState<'dashboard' | 'master' | 'transactions' | 'tracking' | 'maintenance' | 'reports'>('dashboard');
  const [aiModalOpen, setAiModalOpen] = useState(false);

  // Data states from real Firebase
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [ports, setPorts] = useState<Port[]>([]);
  const [cargoTypes, setCargoTypes] = useState<CargoType[]>([]);
  const [crewList, setCrewList] = useState<Crew[]>([]);
  const [voyages, setVoyages] = useState<Voyage[]>([]);
  const [trackingLogs, setTrackingLogs] = useState<TrackingLog[]>([]);
  const [maintenance, setMaintenance] = useState<MaintenanceRecord[]>([]);

  useEffect(() => {
    // Check local storage bypass first
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
        checkAndSeedDatabase();
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
          await checkAndSeedDatabase();
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

  // Real-time Firestore listeners with robust error handling
  useEffect(() => {
    if (!currentUser && !localUser) return;

    const unsubVessels = onSnapshot(collection(db, 'vessels'), (snap) => {
      setVessels(snap.docs.map(d => ({ id: d.id, ...d.data() } as Vessel)));
    }, (error) => handleFirestoreError(error, OperationType.GET, 'vessels'));

    const unsubPorts = onSnapshot(collection(db, 'ports'), (snap) => {
      setPorts(snap.docs.map(d => ({ id: d.id, ...d.data() } as Port)));
    }, (error) => handleFirestoreError(error, OperationType.GET, 'ports'));

    const unsubCargo = onSnapshot(collection(db, 'cargoTypes'), (snap) => {
      setCargoTypes(snap.docs.map(d => ({ id: d.id, ...d.data() } as CargoType)));
    }, (error) => handleFirestoreError(error, OperationType.GET, 'cargoTypes'));

    const unsubCrew = onSnapshot(collection(db, 'crew'), (snap) => {
      setCrewList(snap.docs.map(d => ({ id: d.id, ...d.data() } as Crew)));
    }, (error) => handleFirestoreError(error, OperationType.GET, 'crew'));

    const unsubVoyages = onSnapshot(collection(db, 'voyages'), (snap) => {
      setVoyages(snap.docs.map(d => ({ id: d.id, ...d.data() } as Voyage)));
    }, (error) => handleFirestoreError(error, OperationType.GET, 'voyages'));

    const unsubTracking = onSnapshot(collection(db, 'trackingLogs'), (snap) => {
      setTrackingLogs(snap.docs.map(d => ({ id: d.id, ...d.data() } as TrackingLog)));
    }, (error) => handleFirestoreError(error, OperationType.GET, 'trackingLogs'));

    const unsubMaint = onSnapshot(collection(db, 'maintenance'), (snap) => {
      setMaintenance(snap.docs.map(d => ({ id: d.id, ...d.data() } as MaintenanceRecord)));
    }, (error) => handleFirestoreError(error, OperationType.GET, 'maintenance'));

    return () => {
      unsubVessels();
      unsubPorts();
      unsubCargo();
      unsubCrew();
      unsubVoyages();
      unsubTracking();
      unsubMaint();
    };
  }, [currentUser, localUser]);

  const handleLogout = async () => {
    localStorage.removeItem('oceanfleet_local_user');
    try {
      await signOut(auth);
    } catch (e) {
      // ignore
    }
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
      {/* Top Navbar */}
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
            className="hidden sm:flex items-center space-x-2 px-3 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 rounded-xl text-cyan-300 text-xs font-semibold transition"
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

      {/* Main Layout */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Sidebar */}
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

        {/* Content Area */}
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
            />
          )}
          {activeTab === 'transactions' && (
            <TransactionView 
              voyages={voyages} 
              vessels={vessels} 
              ports={ports} 
              cargoTypes={cargoTypes} 
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

      {/* AI Assistant Modal */}
      <AiAssistantModal 
        isOpen={aiModalOpen} 
        onClose={() => setAiModalOpen(false)} 
        vessels={vessels} 
        voyages={voyages} 
      />
    </div>
  );
}
