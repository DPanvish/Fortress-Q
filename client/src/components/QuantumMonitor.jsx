import React, { useState } from 'react';
import axios from 'axios';
import { Activity, Lock, AlertTriangle, Radio, ShieldCheck, ShieldAlert } from 'lucide-react';

const QuantumMonitor = () => {
    const [loading, setLoading] = useState(false);
    const [attackMode, setAttackMode] = useState(false);
    const [result, setResult] = useState(null);

    const runSimulation = async () => {
        setLoading(true);
        setResult(null);

        const token = localStorage.getItem('token');

        if (!token) {
            console.error("No token found. User likely not logged in.");
            setLoading(false);
            return;
        }

        const config = {
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': token
            }
        };

        try {
            const res = await axios.post(
                'http://localhost:5000/api/auth/qkd',
                { simulateAttack: attackMode },
                config
            );
            setResult(res.data);
        } catch (err) {
            console.error("Simulation failed", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-slate-900/80 border border-slate-700 rounded-2xl p-6 backdrop-blur-sm w-full">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                        <Activity size={24} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white">Quantum Channel Monitor</h3>
                        <p className="text-xs text-slate-400">BB84 Protocol Real-time Simulation</p>
                    </div>
                </div>

                {/* Attack Toggle Switch */}
                <div className="flex items-center gap-3 bg-black/40 p-1 rounded-full border border-slate-700">
                    <button
                        onClick={() => setAttackMode(false)}
                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${!attackMode ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                    >
                        Secure
                    </button>
                    <button
                        onClick={() => setAttackMode(true)}
                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${attackMode ? 'bg-red-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                    >
                        Intercept
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Left: Control & Status */}
                <div className="space-y-6">
                    <div className="bg-black/50 rounded-xl p-4 border border-slate-800 h-32 flex flex-col justify-center items-center relative overflow-hidden">
                        {/* Background Animation */}
                        {loading && (
                            <div className="absolute inset-0 bg-[url('https://media.giphy.com/media/3o7qE1YN7aQfVOWvks/giphy.gif')] opacity-10 bg-cover mix-blend-screen" />
                        )}

                        {!loading && !result && (
                            <div className="text-slate-500 text-sm flex flex-col items-center gap-2">
                                <Radio className="animate-pulse" />
                                <span>Ready to initiate Quantum Key Distribution...</span>
                            </div>
                        )}

                        {loading && (
                            <div className="text-cyan-400 text-sm font-mono flex flex-col items-center gap-2 z-10">
                                <Activity className="animate-spin" />
                                <span>Transmitting Qubits (Alice → Bob)...</span>
                            </div>
                        )}

                        {!loading && result && (() => {
                            // Safely check QBER. If result is null (shouldn't happen here), default to false.
                            const qberValue = result.QBER || 0;
                            const isSafe = qberValue < 5;

                            return (
                                <div className={`flex flex-col items-center gap-1 z-10 ${isSafe ? 'text-emerald-400' : 'text-red-500'}`}>
                                    {isSafe ? <ShieldCheck size={32} /> : <ShieldAlert size={32} />}
                                    <span className="font-bold text-lg">
                                        {isSafe ? "CHANNEL SECURE" : "INTRUDER DETECTED"}
                                    </span>
                                </div>
                            );
                        })()}
                    </div>

                    <button
                        onClick={runSimulation}
                        disabled={loading}
                        className={`w-full py-3 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2
                        ${loading ? 'bg-slate-700 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500'}`}
                    >
                        {loading ? 'Negotiating...' : 'Initiate Handshake'}
                    </button>
                </div>

                {/* Right: Telemetry Data */}
                <div className="bg-black/80 rounded-xl border border-slate-800 p-4 font-mono text-xs overflow-hidden flex flex-col relative">
                    <div className="flex items-center gap-2 mb-2 border-b border-slate-800 pb-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        <span className="text-slate-400">TELEMETRY_LOG</span>
                    </div>

                    <div className="space-y-2 text-slate-300 flex-grow">
                        {!result ? (
                            <p className="opacity-50">Waiting for transmission data...</p>
                        ) : (
                            <>
                                <div className="flex justify-between">
                                    <span>Total Qubits Sent:</span>
                                    <span className="text-white">{result.total_qubits}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Basis Matches:</span>
                                    <span className="text-blue-400">{result.basis_matches}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Errors Detected:</span>
                                    <span className={result.errors_detected > 0 ? "text-red-400" : "text-slate-500"}>
                                        {result.errors_detected}
                                    </span>
                                </div>
                                <div className="h-px bg-slate-800 my-2"></div>
                                <div className="flex justify-between items-center">
                                    <span className="font-bold">QBER (Error Rate):</span>
                                    <span className={`px-2 py-0.5 rounded text-black font-bold ${result.QBER > 5 ? "bg-red-500" : "bg-emerald-500"}`}>
                                        {result.QBER}%
                                    </span>
                                </div>
                                <div className="mt-2">
                                    <span className="block text-slate-500 mb-1">Generated Key Fragment:</span>
                                    <p className="break-all bg-slate-900 p-2 rounded border border-slate-800 text-cyan-500">
                                        {result.key}
                                    </p>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuantumMonitor;