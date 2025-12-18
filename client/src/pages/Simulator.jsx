import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ShieldAlert, Zap, Lock, Unlock, Terminal, Cpu, Clock } from 'lucide-react';

const Simulator = () => {
    const navigate = useNavigate();
    const [running, setRunning] = useState(false);
    const [result, setResult] = useState(null);
    const [logs, setLogs] = useState([]);

    // Thesis Data Points
    const CLASSICAL_TIME = "300 Trillion Years";
    const QUANTUM_TIME = "~10 Seconds";

    const addLog = (msg) => setLogs(prev => [...prev, `> ${msg}`]);

    const startSimulation = async () => {
        setRunning(true);
        setLogs([]);
        setResult(null);

        // CLASSICAL PHASE (The Struggle)
        addLog("Initializing Classical Brute Force Attack...");
        await new Promise(r => setTimeout(r, 600));
        addLog("Target: 2048-bit RSA Key (N=15 for demo)");

        addLog("Attempting General Number Field Sieve (GNFS)...");
        await new Promise(r => setTimeout(r, 500));
        addLog("❌ Iteration 10^9 failed. Prime factors unknown.");

        addLog(`⚠ ESTIMATED TIME REMAINING: ${CLASSICAL_TIME}`);
        await new Promise(r => setTimeout(r, 800));

        // QUANTUM PHASE (The Solution)
        addLog("🚀 ACTIVATING QUANTUM CIRCUIT (QISKIT)...");
        addLog("Initializing Superposition & Oracle...");

        try {
            const token = localStorage.getItem('token');

            // Call the real Python script
            const res = await axios.post('http://localhost:5000/api/auth/attack', {}, {
                headers: { 'x-auth-token': token }
            });

            if (res.data) {
                setResult(res.data);
                addLog(`✅ QUANTUM CIRCUIT COMPLETE`);
                addLog(`Period Found: 4`);
                addLog(`Factors Derived: ${res.data.guessed_factors.join(", ")}`);

                // THE VISUAL BRIDGE:
                // We pretend that finding factors 3 & 5 reveals the key
                addLog(`Derived Private Key: 0x0000...000F (Factors 3*5)`);
                addLog(`Target N=${res.data.target_number} BROKEN.`);
            }
        } catch (err) {
            console.error(err);
            addLog("❌ Connection Error: Ensure Backend is running Qiskit.");
        } finally {
            setRunning(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 font-sans p-8 flex flex-col items-center">
            <button onClick={() => navigate('/dashboard')} className="self-start mb-8 text-slate-400 hover:text-cyan-400">← Back</button>

            <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12">

                {/* LEFT COLUMN: THE THREAT MODEL */}
                <div className="space-y-8">
                    <div>
                        <h1 className="text-4xl font-bold text-white mb-2">Cryptographic <span className="text-red-500">Attack Vector</span></h1>
                        <p className="text-slate-400 leading-relaxed">
                            Current blockchain security relies on the difficulty of factoring large numbers (RSA) or discrete logarithms (ECC).
                            <strong> Shor's Algorithm</strong> utilizes quantum superposition to solve these problems exponentially faster.
                        </p>
                    </div>

                    {/* Comparison Cards */}
                    <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl space-y-4 shadow-xl">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="bg-slate-800 p-3 rounded-full"><Lock className="text-slate-400" /></div>
                            <div>
                                <h3 className="font-bold text-white">Target Encryption</h3>
                                <p className="text-xs text-slate-500">Simulating N=15 (RSA Concept)</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {/* Classical */}
                            <div className="bg-black/30 p-4 rounded-xl border border-slate-800">
                                <div className="flex items-center gap-2 mb-2 text-slate-500">
                                    <Clock size={16} /> <span className="text-xs font-bold uppercase">Classical CPU</span>
                                </div>
                                <span className="text-slate-300 font-mono font-bold text-lg">{CLASSICAL_TIME}</span>
                            </div>

                            {/* Quantum */}
                            <div className="bg-red-900/10 p-4 rounded-xl border border-red-500/30 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-20 h-20 bg-red-500/20 blur-xl rounded-full"></div>
                                <div className="flex items-center gap-2 mb-2 text-red-400">
                                    <Cpu size={16} /> <span className="text-xs font-bold uppercase">Quantum QPU</span>
                                </div>
                                <span className="text-red-400 font-mono font-bold text-lg animate-pulse">{QUANTUM_TIME}</span>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={startSimulation}
                        disabled={running}
                        className={`w-full py-4 font-bold rounded-xl shadow-[0_0_20px_rgba(239,68,68,0.4)] flex items-center justify-center gap-3 transition-all
                        ${running ? 'bg-slate-800 text-slate-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-500 text-white hover:scale-105'}`}
                    >
                        {running ? <Zap className="animate-spin" /> : <ShieldAlert />}
                        {running ? "Running Qiskit Circuit..." : "Launch Shor's Algorithm"}
                    </button>
                </div>

                {/* RIGHT COLUMN: TERMINAL & RESULTS */}
                <div className="space-y-6 flex flex-col">

                    {/* Terminal Window */}
                    <div className="bg-black/90 rounded-xl border border-red-900/30 font-mono text-sm h-[450px] flex flex-col shadow-2xl relative overflow-hidden">
                        {/* Terminal Header */}
                        <div className="flex items-center gap-2 px-4 py-2 border-b border-white/10 bg-white/5">
                            <Terminal size={14} className="text-red-400" />
                            <span className="text-red-400/80 text-xs font-bold">ROOT_ACCESS // QISKIT_RUNTIME</span>
                        </div>

                        {/* Logs */}
                        <div className="p-4 overflow-y-auto flex-grow space-y-2 custom-scrollbar">
                            {logs.length === 0 && (
                                <div className="h-full flex flex-col items-center justify-center text-slate-700 gap-2 opacity-50">
                                    <ShieldAlert size={48} />
                                    <span>Waiting for Attack Vector...</span>
                                </div>
                            )}
                            {logs.map((log, i) => (
                                <p key={i} className={`
                                    ${log.includes("BROKEN") ? "text-red-500 font-bold bg-red-900/10 p-1" : ""}
                                    ${log.includes("CLASSICAL") ? "text-yellow-500" : ""}
                                    ${log.includes("QUANTUM") ? "text-cyan-400" : ""}
                                    ${!log.includes("BROKEN") && !log.includes("CLASSICAL") && !log.includes("QUANTUM") ? "text-slate-300" : ""}
                                `}>
                                    {log}
                                </p>
                            ))}
                            {/* Dummy scroll anchor */}
                            <div className="h-2"></div>
                        </div>
                    </div>

                    {/* Result Card (Pops up on success) */}
                    {result && (
                        <div className="bg-red-950/40 border border-red-500/50 rounded-xl p-6 animate-in slide-in-from-bottom-4 backdrop-blur-md">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3 text-red-400">
                                    <Unlock size={24} />
                                    <h3 className="text-xl font-bold">KEY SHATTERED</h3>
                                </div>
                                <span className="bg-red-500 text-black text-xs font-bold px-2 py-1 rounded">VULNERABLE</span>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="space-y-1">
                                    <span className="text-slate-500 text-xs uppercase">Algorithm</span>
                                    <div className="text-white font-mono">{result.algorithm}</div>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-slate-500 text-xs uppercase">Qubits Consumed</span>
                                    <div className="text-white font-mono">{result.qubits_used}</div>
                                </div>
                                <div className="col-span-2 space-y-1 pt-2 border-t border-red-500/20">
                                    <span className="text-slate-500 text-xs uppercase">Prime Factors Found</span>
                                    <div className="text-red-400 font-mono text-2xl font-bold tracking-widest">
                                        [{result.guessed_factors.join(" × ")}] = {result.target_number}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Simulator;