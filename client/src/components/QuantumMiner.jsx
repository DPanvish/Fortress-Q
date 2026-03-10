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

        const classicalDelay = (ms) => new Promise(res => setTimeout(res, ms));

        // 1. Run Quantum Mining First (Get the Target)
        try {
            const token = localStorage.getItem('token');
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const res = await axios.post(`${API_URL}/api/quantum/mine`, {}, {
                headers: { 'x-auth-token': token }
            });
            const quantumData = res.data;
            setResult(quantumData);

            // 2. Run Classical Simulation to find the SAME nonce
            // Real World Scenario: 6-bit Search Space (N=64)
            const target = quantumData.decimal_value;
            
            for (let i = 0; i < 64; i++) {
                setClassicalLog(prev => [...prev, `Checking Nonce ${i.toString(2).padStart(6, '0')}... ❌`]);
                // Faster delay to accommodate larger search space
                await classicalDelay(40); 
                
                if(i === target) {
                    setClassicalLog(prev => [...prev, `Nonce ${target.toString(2).padStart(6, '0')} Found! ✅`]);
                    break;
                }
            }
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
                        <p className="text-xs text-slate-400">Grover's Algorithm (6-Qubit / N=64)</p>
                    </div>
                </div>
                {result && (
                    <div className="px-3 py-1 bg-green-500/20 border border-green-500/50 rounded-full text-green-400 text-xs font-bold flex items-center gap-2">
                        <BatteryCharging size={14} /> Energy Saved: {result.energy_reduction} (Grover's Speedup)
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
                                <span className="text-white font-bold">~6 <span className="text-xs text-slate-500">(vs 32)</span></span>
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