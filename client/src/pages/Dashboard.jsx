import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Wallet, LogOut, ShieldAlert } from 'lucide-react';
import axios from 'axios';

import QuantumMonitor from "../components/QuantumMonitor.jsx";
import QuantumMiner from "../components/QuantumMiner.jsx";

const Dashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            const token = localStorage.getItem('token');
            if (!token) return navigate('/login');

            try {
                const config = { headers: { 'x-auth-token': token } };
                const userRes = await axios.get('http://localhost:5000/api/auth/me', config);
                setUser(userRes.data);
            } catch (err) {
                localStorage.removeItem('token');
                navigate('/login');
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-cyan-400">Loading Vault...</div>;

    return (
        <div className="min-h-screen relative overflow-hidden flex flex-col bg-slate-950 text-slate-200 font-sans selection:bg-cyan-500/30">

            {/* Background Effects */}
            <div className="fixed top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[128px] pointer-events-none" />
            <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-[128px] pointer-events-none" />

            {/* Navbar */}
            <nav className="w-full z-50 border-b border-white/10 bg-slate-950/50 backdrop-blur-md sticky top-0">
                <div className="max-w-7xl mx-auto flex items-center justify-between p-4">
                    <div className="flex items-center space-x-2">
                        <div className="bg-gradient-to-tr from-cyan-400 to-violet-500 p-2 rounded-lg">
                            <ShieldCheck className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-xl md:text-2xl font-bold text-white tracking-wide">
                            Fortress <span className="text-cyan-400">Q</span>
                        </span>
                    </div>

                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/wallet')} className="flex items-center gap-2 text-slate-300 hover:text-cyan-400 transition font-medium text-sm">
                            <Wallet className="w-4 h-4" /> <span className="hidden sm:inline">My Wallet</span>
                        </button>
                        <button onClick={handleLogout} className="text-slate-400 hover:text-white text-sm font-medium transition flex items-center gap-2">
                            <LogOut className="w-4 h-4" /> Logout
                        </button>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="flex-grow p-6 relative z-10 max-w-7xl mx-auto w-full space-y-12">

                {/* Header Section with Identity Badge */}
                <div className="text-center space-y-4 pt-8">

                    {/* Welcome Message */}
                    {user && <h2 className="text-xl text-cyan-400 font-mono">Welcome, {user.username}</h2>}

                    {/* QUANTUM BADGE (Only shows if Seed exists) */}
                    {user?.quantumSeed && (
                        <div className="flex items-center justify-center">
                            <div className="flex items-center gap-3 px-5 py-2 bg-violet-900/40 border border-violet-500/50 rounded-full shadow-[0_0_15px_rgba(139,92,246,0.3)] transition-all hover:scale-105">
                                <span className="text-violet-400 animate-pulse text-xl">⚛️</span>
                                <div className="flex flex-col text-left">
                                    <span className="text-[10px] text-violet-200 font-bold uppercase tracking-wider">
                                        Identity Secured by IBM Qiskit
                                    </span>
                                    <span className="text-[9px] text-violet-400 font-mono truncate w-32">
                                        Seed: {user.quantumSeed.substring(0, 12)}...
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    <h1 className="text-4xl md:text-5xl font-extrabold text-white">
                        Secure <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-500">Quantum Vault</span>
                    </h1>
                    <p className="text-slate-400 max-w-xl mx-auto">
                        Files are encrypted client-side. The server never sees your raw data.
                        Only your private Kyber key can unlock these assets.
                    </p>
                </div>

                <div className="max-w-4xl mx-auto w-full mb-8">
                    <QuantumMonitor />
                    <QuantumMiner />
                </div>

                {/* Tools Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8 border-t border-white/5">
                    <div className="bg-slate-900/50 border border-red-500/20 rounded-2xl p-6 relative overflow-hidden group hover:border-red-500/40 transition-all">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <ShieldAlert className="w-24 h-24 text-red-500" />
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2">Attack Simulator</h3>
                        <p className="text-slate-400 text-sm mb-4">Test your keys against Shor's Algorithm.</p>
                        <button onClick={() => navigate('/simulator')} className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-sm font-bold rounded-lg">
                            Launch Simulation
                        </button>
                    </div>

                    <div className="bg-slate-900/50 border border-cyan-500/20 rounded-2xl p-6 relative overflow-hidden group hover:border-cyan-500/40 transition-all">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Wallet className="w-24 h-24 text-cyan-500" />
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2">Smart Migration</h3>
                        <p className="text-slate-400 text-sm mb-4">Upgrade legacy contracts to PQC standards.</p>
                        <button onClick={() => navigate('/migration')} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-bold rounded-lg">
                            Open Tool
                        </button>
                    </div>
                </div>

            </main>
        </div>
    );
};

export default Dashboard;