import React, { useState } from 'react';
import axios from 'axios';
import { Pickaxe, Zap, Clock, BatteryCharging } from 'lucide-react';

const QuantumMiner = () => {
    const [mining, setMining] = useState(false);
    const [result, setResult] = useState(null);
    const [classicalLog, setClassicalLog] = useState([]);

    const runMiner = async () => {
        setMining(true);
        setResult(null);
        setClassicalLog([]);

        // 1. Simulate Classical Mining (Slow Loop)
        const classicalDelay = (ms) => new Promise(res => setTimeout(res, ms));

        for (let i = 0; i < 4; i++) {
            setClassicalLog(prev => [...prev, `Checking Nonce ${i.toString(2).padStart(2, '0')}... ❌`]);
            await classicalDelay(400); // Artificial delay to show "work"
            // Let's pretend nonce '11' (3) is the target
            if(i === 3) {
                setClassicalLog(prev => [...prev, `Nonce 11 Found! ✅`]);
            }
        }

        // 2. Run Quantum Mining (Instant)
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post('http://localhost:5000/api/auth/mine', {}, {
                headers: { 'x-auth-token': token }
            });
            setResult(res.data);
        }catch (err) {
            console.error(err);
        }finally {
            setMining(false);
        }
    };

    return (
        <div className="bg-slate-900/80 border border-slate-700 rounded-2xl p-6 backdrop-blur-sm w-full">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400">
                        <Pickaxe size={24} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white">Quantum Proof-of-Work</h3>
                        <p className="text-xs text-slate-400">Grover's Algorithm Consensus</p>
                    </div>
                </div>
                {result && (
                    <div className="px-3 py-1 bg-green-500/20 border border-green-500/50 rounded-full text-green-400 text-xs font-bold flex items-center gap-2">
                        <BatteryCharging size={14} /> Energy Saved: {result.energy_reduction}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Classical Simulation */}
                <div className="bg-black/40 rounded-xl p-4 border border-slate-800">
                    <h4 className="text-xs text-slate-500 uppercase font-bold mb-3">Classical Mining (Brute Force)</h4>
                    <div className="space-y-2 font-mono text-xs h-32 overflow-y-auto">
                        {classicalLog.length === 0 && <span className="text-slate-600">Waiting to start...</span>}
                        {classicalLog.map((log, i) => (
                            <div key={i} className="text-slate-300">{log}</div>
                        ))}
                    </div>
                </div>

                {/* Quantum Result */}
                <div className="bg-black/40 rounded-xl p-4 border border-slate-800 flex flex-col justify-center">
                    <h4 className="text-xs text-slate-500 uppercase font-bold mb-3">Quantum Mining (Grover's)</h4>

                    {!result ? (
                        <div className="h-24 flex items-center justify-center text-slate-600 text-xs">
                            {mining ? <Zap className="animate-pulse text-amber-500" /> : "Ready"}
                        </div>
                    ) : (
                        <div className="space-y-3 animate-in fade-in zoom-in">
                            <div className="flex justify-between">
                                <span className="text-slate-400 text-xs">Nonce Found:</span>
                                <span className="text-amber-400 font-mono font-bold">{result.nonce_found} (Binary)</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400 text-xs">Iterations:</span>
                                <span className="text-white font-bold">1 <span className="text-xs text-slate-500">(vs 4)</span></span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400 text-xs">Time:</span>
                                <span className="text-emerald-400 font-bold">{result.quantum_time}ms</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <button
                onClick={runMiner}
                disabled={mining}
                className="w-full mt-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2"
            >
                {mining ? 'Mining Block...' : 'Start Consensus Comparison'}
            </button>
        </div>
    );
};

export default QuantumMiner;