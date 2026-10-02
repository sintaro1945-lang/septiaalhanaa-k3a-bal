import React, { useState } from 'react';
import { auth, googleProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, db } from '../firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { Anchor, Shield, Ship, Compass, Lock, Mail, User as UserIcon, AlertCircle, ArrowRight, Zap } from 'lucide-react';
import { UserRole } from '../types';

export default function LoginView() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('admin@oceanfleet.id');
  const [password, setPassword] = useState('admin123456');
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState<UserRole>('admin');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [domainWarning, setDomainWarning] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setDomainWarning(false);

    try {
      if (isRegister) {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, 'users', cred.user.uid), {
          uid: cred.user.uid,
          email,
          displayName: displayName || email.split('@')[0],
          role,
          createdAt: new Date().toISOString()
        });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      console.warn("Firebase Auth error:", err);
      if (err.message && (err.message.includes('unauthorized-domain') || err.message.includes('auth/')) ) {
        setDomainWarning(true);
        setError('Domain Vercel/Eksternal belum di-whitelist di Firebase Console.');
      } else {
        setError(err.message || 'Authentication failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    setDomainWarning(false);
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      const userRef = doc(db, 'users', cred.user.uid);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
        await setDoc(userRef, {
          uid: cred.user.uid,
          email: cred.user.email || '',
          displayName: cred.user.displayName || 'Admin Operator',
          role: 'admin',
          createdAt: new Date().toISOString()
        });
      }
    } catch (err: any) {
      console.warn("Google Sign-In error:", err);
      if (err.message && err.message.includes('unauthorized-domain')) {
        setDomainWarning(true);
        setError('Domain Vercel/Eksternal belum di-whitelist di Firebase Console.');
      } else {
        setError(err.message || 'Google Sign-In failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLocalBypassLogin = () => {
    const localUser = {
      uid: 'local-admin-' + Date.now(),
      email: email || 'admin@oceanfleet.id',
      displayName: displayName || email.split('@')[0] || 'Admin Eksternal',
      role: role || 'admin'
    };
    localStorage.setItem('oceanfleet_local_user', JSON.stringify(localUser));
    window.location.reload();
  };

  const fillDemoAccount = (demoEmail: string, demoPass: string, demoRole: UserRole) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setRole(demoRole);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none"></div>
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md bg-slate-900/90 backdrop-blur-xl border border-blue-500/30 rounded-2xl shadow-2xl overflow-hidden relative z-10 p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-tr from-blue-600 to-cyan-400 rounded-2xl shadow-lg mb-4 text-white">
            <Anchor className="w-8 h-8 animate-pulse" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-wide">OceanFleet Pro</h1>
          <p className="text-sm text-cyan-300 mt-1">Sistem Manajemen Bisnis & Angkutan Laut</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/40 rounded-xl text-red-200 text-sm space-y-2">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
              <span className="font-semibold">{error}</span>
            </div>
            {domainWarning && (
              <div className="pt-2 border-t border-red-500/30">
                <p className="text-xs text-red-300 mb-2">
                  Karena Anda mengakses dari domain Vercel publik, Firebase Auth memerlukan domain ini ditambahkan di Authorized Domains Firebase Console.
                </p>
                <button
                  onClick={handleLocalBypassLogin}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg text-xs flex items-center justify-center space-x-2 shadow-md transition"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Masuk Instan (Mode Bypass / Offline)</span>
                </button>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Nama Lengkap</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <UserIcon className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Capt. Budi Santoso"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 text-sm"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Email / Username</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@oceanfleet.id"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-semibold rounded-xl shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center space-x-2 text-sm disabled:opacity-50"
          >
            <span>{loading ? 'Memproses...' : isRegister ? 'Daftar Akun Baru' : 'Masuk Aplikasi'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-4">
          <button
            onClick={handleLocalBypassLogin}
            className="w-full py-2.5 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 rounded-xl text-xs font-semibold flex items-center justify-center space-x-2 transition shadow-md"
          >
            <Zap className="w-4 h-4 text-emerald-400" />
            <span>Masuk Cepat (Bypass Domain Vercel)</span>
          </button>
        </div>

        <div className="mt-6">
          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-slate-700"></div>
            <span className="flex-shrink mx-4 text-slate-400 text-xs">Atau gunakan Google</span>
            <div className="flex-grow border-t border-slate-700"></div>
          </div>

          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full mt-2 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-white text-sm font-medium transition-all flex items-center justify-center space-x-3 shadow-md"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>Masuk dengan Google</span>
          </button>
        </div>

        <div className="mt-6 p-3 bg-slate-950/60 border border-slate-800 rounded-xl text-center">
          <p className="text-xs text-slate-400 mb-2">Akun Demo Cepat (Klik untuk isi):</p>
          <div className="flex flex-wrap gap-2 justify-center">
            <button
              onClick={() => fillDemoAccount('admin@oceanfleet.id', 'admin123456', 'admin')}
              className="px-2.5 py-1 bg-blue-600/25 hover:bg-blue-600/40 border border-blue-500/35 text-cyan-300 rounded-lg text-xs font-medium"
            >
              Admin Demo
            </button>
            <button
              onClick={() => fillDemoAccount('manager@oceanfleet.id', 'manager123456', 'manager')}
              className="px-2.5 py-1 bg-cyan-600/25 hover:bg-cyan-600/40 border border-cyan-500/35 text-cyan-300 rounded-lg text-xs font-medium"
            >
              Manager Demo
            </button>
          </div>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsRegister(!isRegister)}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-medium"
          >
            {isRegister ? 'Sudah punya akun? Masuk di sini' : 'Belum punya akun? Daftar akun baru'}
          </button>
        </div>
      </div>
    </div>
  );
}
