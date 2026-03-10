import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Cpu, Zap, Lock } from 'lucide-react';

const Home = () => {
    const navigate = useNavigate();

    return (
        <div className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 overflow-hidden bg-slate-950">

            {/* Navbar */}
            <nav className="fixed w-full z-50 top-0 start-0 border-b border-white/10 bg-slate-950/80 backdrop-blur-md">
                <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between p-4">
                    <div className="flex items-center space-x-2">
                        <div className="bg-gradient-to-tr from-cyan-400 to-violet-500 p-2 rounded-lg">
                            <ShieldCheck className="w-6 h-6 text-white" />
                        </div>
                        <span className="self-center text-2xl font-bold text-white tracking-wide">
                        Fortress <span className="text-cyan-400">Q</span>
                        </span>
                    </div>
                    <div className="flex gap-4">
                        <button
                            onClick={() => navigate('/login')}
                            className="text-white hover:text-cyan-400 font-medium transition-colors"
                        >
                            Login
                        </button>
                        <button
                            onClick={() => navigate('/register')}
                            className="text-slate-950 bg-cyan-400 hover:bg-cyan-300 font-bold rounded-lg text-sm px-4 py-2 transition-all shadow-[0_0_15px_rgba(34,211,238,0.5)]"
                        >
                            Get Started
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <div className="relative z-10 max-w-5xl mx-auto mt-20">
                <div className="inline-flex items-center px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 text-xs font-medium mb-6">
                    <span className="flex w-2 h-2 bg-cyan-400 rounded-full mr-2 animate-pulse"></span>
                    Quantum-Resistant Blockchain Architecture
                </div>

                <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 leading-tight">
                    Defending Crypto Against <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-600">
                    The Quantum Threat
                    </span>
                </h1>

                <p className="text-slate-400 text-lg md:text-xl max-w-3xl mx-auto mb-10 leading-relaxed">
                    Experience the vulnerability of legacy wallets to Shor's Algorithm and migrate to a 
                    secure <strong>Post-Quantum Vault</strong> powered by Lattice Cryptography and Quantum Key Distribution.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                        onClick={() => navigate('/simulator')}
                        className="flex items-center justify-center gap-2 px-8 py-4 text-base font-bold text-slate-900 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-xl hover:scale-105 transition-transform shadow-[0_0_20px_rgba(34,211,238,0.4)]"
                    >
                        <Zap className="w-5 h-5" />
                        Launch Simulator
                    </button>

                    <button
                        onClick={() => navigate('/migration')}
                        className="flex items-center justify-center gap-2 px-8 py-4 text-base font-medium text-white bg-slate-800/50 border border-slate-600/50 rounded-xl hover:bg-slate-800 backdrop-blur-sm transition-all"
                    >
                        Migrate Assets
                    </button>
                </div>

                {/* Feature Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 text-left">
                    <div className="p-6 rounded-2xl bg-slate-900/40 border border-red-500/20 hover:border-red-500/50 transition-all backdrop-blur-sm group">
                        <div className="mb-4 p-3 bg-red-900/20 rounded-lg w-fit group-hover:bg-red-900/40 transition-colors">
                            <Cpu className="w-6 h-6 text-red-400"/>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Shor's Attack</h3>
                        <p className="text-slate-400 text-sm">
                            Simulate the factorization of integer keys to break RSA and ECDSA security using quantum circuits.
                        </p>
                    </div>

                    <div className="p-6 rounded-2xl bg-slate-900/40 border border-green-500/20 hover:border-green-500/50 transition-all backdrop-blur-sm group">
                        <div className="mb-4 p-3 bg-green-900/20 rounded-lg w-fit group-hover:bg-green-900/40 transition-colors">
                            <ShieldCheck className="w-6 h-6 text-green-400"/>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Lattice Defense</h3>
                        <p className="text-slate-400 text-sm">
                            Secure your identity with NIST-standardized CRYSTALS-Kyber and Dilithium algorithms.
                        </p>
                    </div>

                    <div className="p-6 rounded-2xl bg-slate-900/40 border border-violet-500/20 hover:border-violet-500/50 transition-all backdrop-blur-sm group">
                        <div className="mb-4 p-3 bg-violet-900/20 rounded-lg w-fit group-hover:bg-violet-900/40 transition-colors">
                            <Zap className="w-6 h-6 text-violet-400"/>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Quantum Mining</h3>
                        <p className="text-slate-400 text-sm">
                            Explore Grover's Algorithm for quadratic speedups in blockchain consensus mechanisms.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
