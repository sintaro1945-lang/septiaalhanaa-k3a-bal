import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Sparkles, X, Send, Anchor, Compass, ShieldAlert } from 'lucide-react';
import { Voyage, Vessel } from '../types';

interface AiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  vessels: Vessel[];
  voyages: Voyage[];
}

export default function AiAssistantModal({ isOpen, onClose, vessels, voyages }: AiAssistantModalProps) {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleAskAI = async (customQuery?: string) => {
    const q = customQuery || prompt;
    if (!q.trim()) return;

    setLoading(true);
    setResponse('');

    try {
      // Initialize Gemini SDK with model gemini-2.5-flash as per gemini_api skill
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const contextSummary = `
      Anda adalah Asisten AI Senior Operasional & Keamanan Pelayaran untuk sistem OceanFleet Pro.
      Data Armada saat ini: ${JSON.stringify(vessels)}
      Data Pelayaran/Voyage saat ini: ${JSON.stringify(voyages)}
      
      Berikan analisis profesional, saran navigasi, optimalisasi rute, perkiraan cuaca/ombak, dan efisiensi bahan bakar dalam bahasa Indonesia yang formal, tegas, dan informatif.
      `;

      const result = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          { text: contextSummary },
          { text: q }
        ]
      });

      setResponse(result.text || 'Tidak ada respons dari AI.');
    } catch (error: any) {
      setResponse('Error AI: ' + (error.message || 'Gagal menghubungi Gemini API'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-cyan-500/40 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-4 bg-slate-800/80 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-cyan-400">
            <Sparkles className="w-5 h-5 animate-pulse" />
            <h3 className="font-bold text-white text-base">Gemini AI Maritime Assistant & Route Optimizer</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4 flex-1 text-sm text-slate-300">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <button
              onClick={() => handleAskAI('Analisis risiko cuaca dan keselamatan untuk seluruh armada yang sedang berlayar saat ini.')}
              className="p-3 bg-slate-800/60 hover:bg-slate-800 border border-slate-700 rounded-xl text-left transition flex items-start space-x-3"
            >
              <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-white text-xs">Analisis Risiko & Cuaca</p>
                <p className="text-slate-400 text-xs mt-0.5">Evaluasi ombak dan keselamatan pelayaran</p>
              </div>
            </button>
            <button
              onClick={() => handleAskAI('Berikan rekomendasi optimalisasi konsumsi bahan bakar (bunker) dan efisiensi rute untuk kapal-kapal aktif.')}
              className="p-3 bg-slate-800/60 hover:bg-slate-800 border border-slate-700 rounded-xl text-left transition flex items-start space-x-3"
            >
              <Compass className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-white text-xs">Optimasi Rute & BBM</p>
                <p className="text-slate-400 text-xs mt-0.5">Efisiensi operasional & bahan bakar</p>
              </div>
            </button>
          </div>

          {response && (
            <div className="p-4 bg-slate-950 border border-cyan-500/30 rounded-xl text-slate-200 whitespace-pre-wrap leading-relaxed">
              <div className="flex items-center space-x-2 mb-2 text-cyan-400 font-semibold text-xs">
                <Sparkles className="w-4 h-4" />
                <span>Hasil Analisis Gemini AI:</span>
              </div>
              {response}
            </div>
          )}

          {loading && (
            <div className="p-8 text-center text-cyan-400 flex flex-col items-center justify-center space-y-3">
              <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs">Menghitung data pelayaran & analisis cuaca laut...</p>
            </div>
          )}
        </div>

        <div className="p-4 bg-slate-800/80 border-t border-slate-700 flex items-center space-x-2">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAskAI()}
            placeholder="Tanyakan analisis operasional, rute, atau muatan kapal..."
            className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-400"
          />
          <button
            onClick={() => handleAskAI()}
            disabled={loading}
            className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-medium rounded-xl text-sm flex items-center space-x-2 transition"
          >
            <span>Kirim</span>
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
