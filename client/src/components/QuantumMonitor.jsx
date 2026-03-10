import React, { useState } from 'react';
import axios from 'axios';
import { Activity, Lock, RefreshCw, ShieldCheck, ShieldAlert, Zap } from 'lucide-react';

const QuantumMonitor = ({ onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);

    const runQKD = async (attack = false) => {
        setLoading(true);
        setError(null);
        setData(null);
        try {
            const token = localStorage.getItem('token');
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const res = await axios.post(`${API_URL}/api/quantum/qkd`,
                { simulateAttack: attack },
                { headers: { 'x-auth-token': token } }
            );
            
            setData(res.data);
            
            if (res.data.secure && onSuccess) {
                onSuccess();
            }
        } catch (err) {
            console.error(err);
            setError("QKD Simulation Failed. Backend offline?");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-slate-900/80 border border-slate-700 rounded-2xl p-6 backdrop-blur-sm w-full h-full flex flex-col justify-between">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-violet-500/10 rounded-lg text-violet-400">
                        <Activity size={24} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white">BB84 Protocol</h3>
                        <p className="text-xs text-slate-400">Quantum Key Distribution</p>
                    </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2 border ${
                    !data ? 'bg-slate-800 border-slate-600 text-slate-400' :
                    data.secure ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' :
                    'bg-red-500/20 border-red-500/50 text-red-400'
                }`}>
                    {!data ? <Lock size={12} /> : data.secure ? <ShieldCheck size={12} /> : <ShieldAlert size={12} />}
                    {!data ? "IDLE" : data.secure ? "CHANNEL SECURE" : "EAVESDROPPER DETECTED"}
                </div>
            </div>

            {/* Visualization Area */}
            <div className="bg-black/40 rounded-xl p-4 border border-slate-800 mb-6 min-h-[140px] flex flex-col justify-center items-center relative overflow-hidden flex-grow">
                
                {loading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-10">
                        <RefreshCw className="animate-spin text-violet-400" size={32} />
                    </div>
                )}

                {!data && !loading && (
                    <div className="text-slate-600 text-sm flex flex-col items-center gap-2">
                        <Activity size={32} className="opacity-20" />
                        <span>Ready to initialize Quantum Channel...</span>
                    </div>
                )}

                {error && !loading && (
                    <div className="text-red-400 text-sm text-center">
                        {error}
                    </div>
                )}

                {data && (
                    <div className="w-full space-y-4 animate-in fade-in">
                        {/* Bits Visualization */}
                        <div className="flex justify-center gap-1 flex-wrap">
                            {data.raw_bits_sample.map((bit, i) => (
                                <div key={i} className={`w-8 h-8 flex items-center justify-center rounded font-mono font-bold text-sm
                                    ${data.secure ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'}
                                `}>
                                    {bit}
                                </div>
                            ))}
                            <span className="self-center text-slate-500 text-xs ml-2">...stream</span>
                        </div>

                        {/* Metrics */}
                        <div className="grid grid-cols-3 gap-4 border-t border-white/5 pt-4">
                            <div className="text-center">
                                <div className="text-xs text-slate-500 uppercase">QBER</div>
                                <div className={`font-mono font-bold ${data.qber > 0.1 ? 'text-red-400' : 'text-emerald-400'}`}>
                                    {(data.qber * 100).toFixed(1)}%
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="text-xs text-slate-500 uppercase">Key Len</div>
                                <div className="font-mono font-bold text-white">{data.key_length} bits</div>
                            </div>
                            <div className="text-center">
                                <div className="text-xs text-slate-500 uppercase">Status</div>
                                <div className={`font-bold text-xs ${data.secure ? 'text-emerald-400' : 'text-red-400'}`}>
                                    {data.secure ? 'ESTABLISHED' : 'COMPROMISED'}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Controls */}
            <div className="grid grid-cols-2 gap-4">
                <button 
                    onClick={() => runQKD(false)}
                    disabled={loading}
                    className="py-2 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
                >
                    {loading ? <RefreshCw className="animate-spin" size={16} /> : <Zap size={16} />}
                    Establish Key
                </button>
                <button 
                    onClick={() => runQKD(true)}
                    disabled={loading}
                    className="py-2 bg-slate-800 hover:bg-red-900/30 text-slate-300 hover:text-red-400 font-bold rounded-lg text-sm transition-colors border border-slate-700 hover:border-red-500/30 flex items-center justify-center gap-2"
                >
                    <ShieldAlert size={16} />
                    Simulate Eve
                </button>
            </div>
        </div>
    );
};

export default QuantumMonitor;