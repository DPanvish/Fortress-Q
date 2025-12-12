import React, {useEffect, useState} from 'react'
import {useNavigate} from "react-router-dom";
import {AlertTriangle, CheckCircle} from "lucide-react";

const Wallet = () => {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        // Fetch user data here...
        // For now, Lets simulate the data structure to show the UI
        setUser({
            walletAddressETH: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
            quantumPublicKey: "Kyber-1024-Post-Quantum-Key-Sequence...",
            balance: "12.5 FQ (Fortress Quantum)"
        });
    }, []);

    return (
        <div className="min-h-screen pt-24 px-6 flex flex-col items-center">
            <button
                onClick={() => navigate('/dashboard')}
                className="self-start mb-6 text-slate-400 hover:text-white flex items-center gap-2 transition"
            >
                ← Back to Dashboard
            </button>
            <h1 className="text-4xl font-extrabold text-white mb-8">
                Hybrid Security <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-500">Wallet</span>
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-6xl">
                {/* Classical Card */}
                <div className="relative p-6 rounded-2xl bg-slate-900/50 border border-red-500/30 backdrop-blur-md">
                    <div className="absolute -top-3 -right-3 bg-red-500/20 border border-red-500 text-red-400 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> VULNERABLE TO QC
                    </div>

                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <span className="w-2 h-8 bg-red-500 rounded-full"></span>
                        Legacy Identity (ECC)
                    </h2>

                    <div className="space-y-4">
                        <div>
                            <label className="text-slate-500 text-xs uppercase tracking-wider">Wallet Address</label>
                            <div className="mt-1 p-3 bg-slate-950 rounded border border-slate-800 font-mono text-sm text-slate-300 break-all">
                                {user?.walletAddressETH}
                            </div>
                        </div>
                        <div className="p-4 bg-red-900/10 rounded-lg border border-red-900/30 text-red-200 text-sm">
                            ⚠️ This address is secured by Elliptic Curve Cryptography. A 20M Qubit Quantum Computer could derive your Private Key in 8 hours.
                        </div>
                    </div>
                </div>

                {/* Quantum Card */}
                <div className="relative p-6 rounded-2xl bg-slate-900/50 border border-cyan-500/30 backdrop-blur-md shadow-[0_0_30px_rgba(34,211,238,0.1)]">
                    <div className="absolute -top-3 -right-3 bg-cyan-500/20 border border-cyan-500 text-cyan-400 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> QUANTUM SAFE
                    </div>

                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <span className="w-2 h-8 bg-cyan-400 rounded-full"></span>
                        Fortress Identity (Kyber)
                    </h2>

                    <div className="space-y-4">
                        <div>
                            <label className="text-slate-500 text-xs uppercase tracking-wider">Lattice-Based Public Key</label>
                            <div className="mt-1 p-3 bg-slate-950 rounded border border-slate-800 font-mono text-sm text-cyan-300 break-all h-24 overflow-y-auto custom-scrollbar">
                                {user?.quantumPublicKey}
                            </div>
                        </div>
                        <div className="p-4 bg-cyan-900/10 rounded-lg border border-cyan-900/30 text-cyan-200 text-sm">
                            🛡️ Secured by Module-Lattice Key Encapsulation (ML-KEM). Mathematically resistant to Shor's Algorithm.
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Button */}
            <div className="mt-12">
                <button className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl font-bold text-white shadow-lg hover:scale-105 transition-transform">
                    Simulate Quantum Migration
                </button>
            </div>
        </div>
    )
}
export default Wallet
