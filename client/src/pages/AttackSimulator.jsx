import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Terminal, ShieldAlert, ShieldCheck, Play, XCircle, Lock } from 'lucide-react';

const AttackSimulator = () => {
    const navigate = useNavigate();
    const [legacyStatus, setLegacyStatus] = useState('idle'); // idle, attacking, cracked
    const [quantumStatus, setQuantumStatus] = useState('idle'); // idle, attacking, secure
    const [logs, setLogs] = useState([]);
    const logsEndRef = useRef(null);

    // Auto-scroll logs
    useEffect(() => {
        logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [logs]);

    const addLog = (msg, type = 'info') => {
        const timestamp = new Date().toLocaleTimeString();
        setLogs(prev => [...prev, { time: timestamp, msg, type }].slice(-20));
    };

    const startAttack = () => {
        setLegacyStatus('attacking');
        setQuantumStatus('attacking');
        setLogs([]);
        addLog("INITIALIZING SHOR'S ALGORITHM SIMULATION...", 'warning');
        addLog("TARGET 1: Standard ECDSA Wallet (secp256k1)");
        addLog("TARGET 2: Fortress Q Lattice Vault (Kyber-1024)");

        // SIMULATION: Legacy Crack (Weak)
        let progress = 0;
        const legacyInterval = setInterval(() => {
            progress += Math.floor(Math.random() * 15);
            if (progress < 100) {
                addLog(`[ECDSA] Deriving Private Key... ${progress}%`, 'error');
            } else {
                clearInterval(legacyInterval);
                setLegacyStatus('cracked');
                addLog("[CRITICAL] LEGACY KEY BROKEN! PRIVATE KEY EXPOSED.", 'critical');
                addLog(">> 0x4c2e...9a1b (Exposed)", 'critical');
            }
        }, 800);

        // SIMULATION: Quantum Attack (Strong)
        let qProgress = 0;
        const quantumInterval = setInterval(() => {
            qProgress += 0.001; // Extremely slow progress
            addLog(`[KYBER] Lattice reduction attempt... 0.00${Math.floor(qProgress)}%`);

            // Stop the simulation after legacy cracks to show the contrast
            if (progress >= 100 && qProgress < 1) {
                clearInterval(quantumInterval);
                setQuantumStatus('secure');
                addLog("[FAIL] QUANTUM ATTACK FAILED.", 'success');
                addLog(">> Estimated time to crack: 1.4 x 10^18 Years", 'success');
            }
        }, 600);
    };

    return (
        <div className="min-h-screen pt-20 px-6 pb-12 flex flex-col items-center bg-slate-950 font-mono">

            <button
                onClick={() => navigate('/dashboard')}
                className="self-start max-w-7xl mx-auto w-full mb-6 text-slate-500 hover:text-white flex items-center gap-2 transition"
            >
                ← Return to Safe Zone
            </button>

            <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* LEFT COLUMN: VISUALIZERS */}
                <div className="lg:col-span-2 space-y-8">

                    {/* 1. LEGACY TARGET */}
                    <div className={`p-6 rounded-xl border-2 transition-all ${legacyStatus === 'cracked' ? 'border-red-500 bg-red-900/10 shadow-[0_0_50px_rgba(239,68,68,0.2)]' : 'border-slate-800 bg-slate-900'}`}>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <ShieldAlert className={legacyStatus === 'cracked' ? 'text-red-500' : 'text-slate-400'} />
                                Target A: Legacy Wallet
                            </h3>
                            <span className={`px-2 py-1 rounded text-xs font-bold ${legacyStatus === 'cracked' ? 'bg-red-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                {legacyStatus === 'cracked' ? 'COMPROMISED' : 'ECDSA-256'}
              </span>
                        </div>
                        {legacyStatus === 'cracked' ? (
                            <div className="text-red-500 font-bold text-4xl animate-pulse">
                                KEY CRACKED IN 4.2s
                            </div>
                        ) : (
                            <div className="h-12 bg-slate-800 rounded-full overflow-hidden relative">
                                <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-500">
                                    {legacyStatus === 'attacking' ? 'BRUTE FORCING...' : 'WAITING FOR ATTACK'}
                                </div>
                                {legacyStatus === 'attacking' && (
                                    <div className="h-full bg-red-600 w-[90%] animate-pulse transition-all duration-1000"></div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* 2. QUANTUM TARGET */}
                    <div className={`p-6 rounded-xl border-2 transition-all ${quantumStatus === 'secure' ? 'border-emerald-500 bg-emerald-900/10 shadow-[0_0_50px_rgba(16,185,129,0.2)]' : 'border-slate-800 bg-slate-900'}`}>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <ShieldCheck className={quantumStatus === 'secure' ? 'text-emerald-500' : 'text-slate-400'} />
                                Target B: Fortress Vault
                            </h3>
                            <span className="px-2 py-1 rounded text-xs font-bold bg-cyan-900/30 text-cyan-400 border border-cyan-500/30">
                KYBER-1024 (QUANTUM SAFE)
              </span>
                        </div>

                        <div className="flex items-end gap-4">
                            <div className="w-full">
                                <div className="flex justify-between text-xs text-slate-400 mb-1">
                                    <span>Lattice Vector Resistance</span>
                                    <span>100% Integrity</span>
                                </div>
                                <div className="h-4 bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500 w-full shadow-[0_0_10px_#10b981]"></div>
                                </div>
                            </div>
                        </div>

                        {quantumStatus === 'secure' && (
                            <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded text-emerald-400 text-sm">
                                <Lock className="w-4 h-4 inline mr-2" />
                                Attack ineffective. Key space too large (2^1024).
                            </div>
                        )}
                    </div>

                </div>

                {/* RIGHT COLUMN: TERMINAL */}
                <div className="bg-black rounded-xl border border-slate-800 p-4 font-mono text-xs md:text-sm overflow-hidden flex flex-col h-[500px] shadow-2xl">
                    <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-2">
                        <Terminal className="w-4 h-4 text-cyan-400" />
                        <span className="text-slate-300">ATTACK_CONSOLE_V1.sh</span>
                    </div>

                    <div className="flex-grow overflow-y-auto space-y-1 custom-scrollbar pr-2">
                        {logs.map((log, i) => (
                            <div key={i} className={`${
                                log.type === 'critical' ? 'text-red-500 font-bold bg-red-900/20' :
                                    log.type === 'error' ? 'text-orange-400' :
                                        log.type === 'success' ? 'text-emerald-400' :
                                            log.type === 'warning' ? 'text-yellow-400' : 'text-slate-400'
                            }`}>
                                <span className="opacity-50">[{log.time}]</span> {log.msg}
                            </div>
                        ))}
                        <div ref={logsEndRef} />
                    </div>

                    {legacyStatus === 'idle' && (
                        <button
                            onClick={startAttack}
                            className="mt-4 w-full py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded flex items-center justify-center gap-2 animate-pulse"
                        >
                            <Play className="w-4 h-4 fill-current" /> RUN QUANTUM ATTACK
                        </button>
                    )}

                    {legacyStatus !== 'idle' && quantumStatus !== 'secure' && (
                        <button disabled className="mt-4 w-full py-3 bg-slate-800 text-slate-500 font-bold rounded cursor-wait">
                            ATTACK IN PROGRESS...
                        </button>
                    )}

                    {quantumStatus === 'secure' && (
                        <button
                            onClick={() => { setLegacyStatus('idle'); setQuantumStatus('idle'); setLogs([]); }}
                            className="mt-4 w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded"
                        >
                            RESET SIMULATION
                        </button>
                    )}
                </div>

            </div>
        </div>
    );
};

export default AttackSimulator;