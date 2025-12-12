import React, {useEffect, useState} from 'react'
import {useNavigate} from "react-router-dom";
import {AlertTriangle, CheckCircle} from "lucide-react";
import axios from 'axios';

const Wallet = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUser = async() => {
            try{
                const token = localStorage.getItem('token');

                if(!token){
                    navigate('/');
                    return;
                }

                const response = await axios.get("http://localhost:5000/api/auth/me", {
                    headers: {
                        "x-auth-token": token
                    }
                });

                setUser(response.data);
            }catch(err){
                console.error("Error fetching wallet data:", error);
                if (err.response && err.response.status === 401) {
                    localStorage.removeItem('token');
                    navigate('/');
                }
            }finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-cyan-400">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mb-4"></div>
                <p>Retrieving Quantum Identity...</p>
            </div>
        );
    }

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
            <p className="text-slate-400 mb-8 text-lg">
                Identity: <span className="text-white font-mono">{user?.username}</span>
            </p>

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
                                {user?.walletAddressETH || "Not Generated Yet."}
                            </div>
                        </div>
                        <div>
                            <label className="text-slate-500 text-xs uppercase tracking-wider">Public Key (secp256k1)</label>
                            <div className="mt-1 p-3 bg-slate-950 rounded border border-slate-800 font-mono text-xs text-red-300/70 break-all h-20 overflow-y-auto custom-scrollbar">
                                {user?.ecdsaPublicKey || "Not Generated"}
                            </div>
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
                                {user?.quantumPublicKey || "Generating..."}
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
