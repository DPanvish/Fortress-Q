import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ShieldAlert, Zap, Lock, Unlock, Terminal, Cpu, Clock, ShieldCheck, Search, Database } from 'lucide-react';

const Simulator = () => {
    const navigate = useNavigate();
    const [running, setRunning] = useState(false);
    const [result, setResult] = useState(null);
    const [logs, setLogs] = useState([]);
    const [targetWallet, setTargetWallet] = useState("Loading...");
    const [walletType, setWalletType] = useState("legacy"); // 'legacy' or 'quantum'

    // Thesis Data Points
    const CLASSICAL_TIME = "300 Trillion Years";
    const QUANTUM_TIME = "~10 Seconds";

    // Fetch User Wallet to Target
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const token = localStorage.getItem('token');
                if(token) {
                    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
                    const res = await axios.get(`${API_URL}/api/quantum/me`, {
                        headers: { 'x-auth-token': token }
                    });
                    setTargetWallet(res.data.walletAddressETH || "0xUnknown");
                }
            } catch(e) {}
        };
        fetchUser();
    }, []);

    const addLog = (msg) => setLogs(prev => [...prev, `> ${msg}`]);
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    const startSimulation = async () => {
        setRunning(true);
        setLogs([]);
        setResult(null);

        // PHASE 1: RECONNAISSANCE
        addLog(`INITIATING TARGET ACQUISITION...`);
        await delay(800);
        addLog(`Scanning Blockchain Network for ${walletType.toUpperCase()} signatures...`);
        await delay(1200);

        if (walletType === 'legacy') {
            addLog(`Target Identified: ${targetWallet}`);
            await delay(600);
            addLog(`Extracting Public Key from Transaction History...`);
            await delay(1000);
            addLog(`Public Key Found: 04a3b...9f21 (ECDSA secp256k1)`);
            await delay(800);
            addLog(`Mapping ECDSA Key to Integer Factorization Problem (N)...`);
            await delay(800);
            addLog(`Simulated Modulus N = 15 (for demonstration)`);
        } else {
            addLog(`Target Identified: ${targetWallet} (Quantum-Resistant)`);
            await delay(600);
            addLog(`Analyzing Lattice Structure (ML-KEM-1024)...`);
            await delay(1000);
            addLog(`Lattice Basis: 1024-dimensional vector space`);
        }

        // PHASE 2: CLASSICAL ATTACK (The Struggle)
        addLog("------------------------------------------------");
        addLog("PHASE 1: CLASSICAL CRYPTANALYSIS");

        if (walletType === 'legacy') {
            addLog("Attempting General Number Field Sieve (GNFS)...");
            await delay(1500);
            addLog("CPU Load: 100%");
            await delay(1000);
            addLog("❌ Classical CPU struggling with prime factorization...");
            addLog(`⚠ ESTIMATED TIME TO CRACK: ${CLASSICAL_TIME}`);
        } else {
            addLog("Attempting Lattice Basis Reduction (BKZ Algorithm)...");
            await delay(1500);
            addLog("Calculating Shortest Vector Problem (SVP)...");
            await delay(1000);
            addLog("❌ Exponential complexity encountered.");
            addLog(`⚠ ESTIMATED TIME TO CRACK: INFINITE`);
        }

        await delay(1000);

        // PHASE 3: QUANTUM ATTACK (The Solution)
        addLog("------------------------------------------------");
        addLog("PHASE 2: QUANTUM COMPUTING ATTACK");
        addLog("🚀 ACTIVATING QISKIT RUNTIME ENVIRONMENT...");
        await delay(800);
        addLog("Initializing Qubits in Superposition...");
        await delay(600);
        addLog("Applying Hadamard Gates...");
        await delay(600);

        try {
            const token = localStorage.getItem('token');

            // Call the real Python script
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

            // We can simulate a different N for variety if we wanted, but 15 is the standard demo
            const targetVal = 15;

            if (walletType === 'legacy') {
                addLog(`Running Shor's Algorithm on N=${targetVal}...`);
            } else {
                addLog(`Attempting Quantum Fourier Transform on Lattice Grid...`);
            }

            const res = await axios.post(`${API_URL}/api/quantum/attack`, {
                walletType: walletType,
                targetValue: targetVal
            }, {
                headers: { 'x-auth-token': token }
            });

            await delay(1500); // Suspense

            if (res.data) {
                setResult(res.data);
                addLog(`✅ QUANTUM CIRCUIT EXECUTION COMPLETE`);

                if (res.data.status === "VULNERABLE") {
                    addLog(`Measurement Collapsed to Eigenstate.`);
                    addLog(`Period (r) Found: ${res.data.period_r}`);
                    await delay(500);
                    addLog(`Calculating GCD...`);
                    addLog(`Factors Derived: ${res.data.guessed_factors.join(", ")}`);
                    await delay(500);
                    addLog(`Reconstructing Private Key...`);
                    addLog(`Derived Private Key for ${targetWallet.substring(0,6)}...`);
                    addLog(`Target N=${res.data.target_number} BROKEN.`);
                } else {
                    addLog(`⚠ SHOR'S ALGORITHM FAILED`);
                    addLog(`Reason: ${res.data.message}`);
                    addLog(`Lattice structure has no periodic function to exploit.`);
                    addLog(`Target Wallet is QUANTUM RESISTANT.`);
                }
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
                            Real-time simulation of a Quantum Attack on blockchain assets.
                            Demonstrating the vulnerability of ECDSA (Legacy) vs. the resilience of Lattice Cryptography (Quantum).
                        </p>
                    </div>

                    {/* Wallet Type Selection */}
                    <div className="bg-slate-900 border border-slate-700 p-4 rounded-xl">
                        <h3 className="text-sm font-bold text-slate-400 mb-3 uppercase">Select Target Architecture</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => setWalletType('legacy')}
                                className={`p-4 rounded-lg border flex flex-col items-center gap-2 transition-all ${walletType === 'legacy' ? 'bg-red-900/20 border-red-500 text-red-400' : 'bg-slate-800 border-transparent text-slate-500 hover:bg-slate-700'}`}
                            >
                                <Lock size={24} />
                                <span className="font-bold">Legacy Wallet</span>
                                <span className="text-xs opacity-70">ECDSA / RSA</span>
                            </button>
                            <button
                                onClick={() => setWalletType('quantum')}
                                className={`p-4 rounded-lg border flex flex-col items-center gap-2 transition-all ${walletType === 'quantum' ? 'bg-cyan-900/20 border-cyan-500 text-cyan-400' : 'bg-slate-800 border-transparent text-slate-500 hover:bg-slate-700'}`}
                            >
                                <ShieldCheck size={24} />
                                <span className="font-bold">Quantum Wallet</span>
                                <span className="text-xs opacity-70">Kyber / Dilithium</span>
                            </button>
                        </div>
                    </div>

                    {/* Comparison Cards */}
                    <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl space-y-4 shadow-xl">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="bg-slate-800 p-3 rounded-full">
                                {walletType === 'legacy' ? <Search className="text-red-400" /> : <Database className="text-cyan-400" />}
                            </div>
                            <div>
                                <h3 className="font-bold text-white">Target Encryption</h3>
                                <p className="text-xs text-slate-500">
                                    {walletType === 'legacy' ? "Simulating N=15 (RSA Concept)" : "Simulating Lattice Grid (ML-KEM)"}
                                </p>
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
                        {running ? "Running Attack Simulation..." : "Launch Shor's Attack"}
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
                                    ${log.includes("RESISTANT") ? "text-green-400 font-bold bg-green-900/10 p-1" : ""}
                                    ${log.includes("CLASSICAL") ? "text-yellow-500" : ""}
                                    ${log.includes("QUANTUM") ? "text-cyan-400" : ""}
                                    ${log.includes("PHASE") ? "text-white font-bold border-b border-white/20 pb-1 mt-2" : ""}
                                    ${!log.includes("BROKEN") && !log.includes("RESISTANT") && !log.includes("CLASSICAL") && !log.includes("QUANTUM") && !log.includes("PHASE") ? "text-slate-300" : ""}
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
                        <div className={`border rounded-xl p-6 animate-in slide-in-from-bottom-4 backdrop-blur-md ${result.status === "VULNERABLE" ? "bg-red-950/40 border-red-500/50" : "bg-green-950/40 border-green-500/50"}`}>
                            <div className="flex items-center justify-between mb-4">
                                <div className={`flex items-center gap-3 ${result.status === "VULNERABLE" ? "text-red-400" : "text-green-400"}`}>
                                    {result.status === "VULNERABLE" ? <Unlock size={24} /> : <ShieldCheck size={24} />}
                                    <h3 className="text-xl font-bold">{result.status === "VULNERABLE" ? "KEY SHATTERED" : "ATTACK REPELLED"}</h3>
                                </div>
                                <span className={`text-black text-xs font-bold px-2 py-1 rounded ${result.status === "VULNERABLE" ? "bg-red-500" : "bg-green-500"}`}>
                                    {result.status}
                                </span>
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
                                <div className={`col-span-2 space-y-1 pt-2 border-t ${result.status === "VULNERABLE" ? "border-red-500/20" : "border-green-500/20"}`}>
                                    <span className="text-slate-500 text-xs uppercase">Result</span>
                                    <div className={`${result.status === "VULNERABLE" ? "text-red-400" : "text-green-400"} font-mono text-lg font-bold tracking-wide`}>
                                        {result.status === "VULNERABLE" ?
                                            `[${result.guessed_factors.join(" × ")}] = ${result.target_number}` :
                                            result.message
                                        }
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