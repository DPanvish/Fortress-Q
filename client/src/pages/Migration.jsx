import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Code, ShieldAlert, CheckCircle, RefreshCw } from 'lucide-react';

const Migration = () => {
    const navigate = useNavigate();
    const [status, setStatus] = useState("idle"); // idle, scanning, migrating, done

    const startMigration = () => {
        setStatus("scanning");
        setTimeout(() => setStatus("migrating"), 2000);
        setTimeout(() => setStatus("done"), 5000);
    };

    const legacyCode = `contract VulnerableWallet {
    // ❌ USES ECDSA (VULNERABLE)
    function transfer(bytes32 hash, uint8 v, bytes32 r, bytes32 s) public {
        address signer = ecrecover(hash, v, r, s);
        require(signer == owner);
        // Transfer logic...
    }
}`;

    const quantumCode = `contract FortressQuantumWallet {
    // ✅ USES DILITHIUM / KYBER (SECURE)
    // NIST Standard Post-Quantum Signatures
    function transferSecure(bytes memory pq_signature, bytes memory message) public {
        bool isValid = PQ_Verify(pq_signature, message, quantumPublicKey);
        require(isValid, "Invalid Quantum Signature");
        // Transfer logic...
    }
}`;

    return (
        <div className="min-h-screen pt-20 px-6 pb-12 flex flex-col items-center">
            <button onClick={() => navigate('/wallet')} className="self-start max-w-6xl mx-auto w-full mb-6 text-slate-400 hover:text-white flex items-center gap-2 transition">
                ← Back to Wallet
            </button>

            <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-8 text-center">
                Smart Contract <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-500">Migration Bridge</span>
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full max-w-6xl">

                {/* LEFT: VULNERABLE CONTRACT */}
                <div className={`p-6 rounded-2xl border transition-all duration-500 ${status === 'done' ? 'bg-slate-900/30 border-slate-800 opacity-50' : 'bg-slate-900 border-red-500/50'}`}>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-red-400 font-bold flex items-center gap-2">
                            <ShieldAlert className="w-5 h-5" /> Legacy Contract (Solidity)
                        </h3>
                        {status === 'scanning' && <span className="text-red-400 text-xs animate-pulse">SCANNING VULNERABILITIES...</span>}
                    </div>
                    <pre className="bg-slate-950 p-4 rounded-lg text-xs md:text-sm font-mono text-slate-300 overflow-x-auto border border-white/5">
                        {legacyCode}
                    </pre>
                </div>

                {/* RIGHT: QUANTUM CONTRACT */}
                <div className={`p-6 rounded-2xl border transition-all duration-500 relative overflow-hidden ${status === 'done' ? 'bg-slate-900 border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.2)]' : 'bg-slate-900/50 border-slate-800'}`}>

                    {/* Overlay while waiting */}
                    {status !== 'done' && (
                        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center z-10">
                            {status === 'idle' && <p className="text-slate-500">Waiting to start...</p>}
                            {status === 'scanning' && <Loader className="text-red-400" text="Identifying ECDSA signatures..." />}
                            {status === 'migrating' && <Loader className="text-cyan-400" text="Injecting Dilithium logic..." />}
                        </div>
                    )}

                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-emerald-400 font-bold flex items-center gap-2">
                            <CheckCircle className="w-5 h-5" /> Quantum Safe Contract
                        </h3>
                        {status === 'done' && <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded">MIGRATION COMPLETE</span>}
                    </div>
                    <pre className="bg-slate-950 p-4 rounded-lg text-xs md:text-sm font-mono text-emerald-100/90 overflow-x-auto border border-white/5">
                        {quantumCode}
                    </pre>
                </div>

            </div>

            {/* ACTION BUTTON */}
            <div className="mt-12">
                {status === 'idle' ? (
                    <button onClick={startMigration} className="px-10 py-4 bg-gradient-to-r from-red-500 to-orange-600 hover:scale-105 transition-transform text-white font-bold rounded-xl shadow-lg flex items-center gap-3">
                        <RefreshCw className="w-5 h-5" /> Initiate Migration
                    </button>
                ) : status === 'done' ? (
                    <button className="px-10 py-4 bg-slate-800 text-slate-400 rounded-xl font-medium cursor-not-allowed">
                        Migration Successful
                    </button>
                ) : (
                    <button disabled className="px-10 py-4 bg-slate-800 text-white rounded-xl font-medium flex items-center gap-3">
                        <RefreshCw className="w-5 h-5 animate-spin" /> Processing...
                    </button>
                )}
            </div>
        </div>
    );
};

// Simple Loading Component
const Loader = ({ text, className }) => (
    <div className={`flex flex-col items-center ${className}`}>
        <RefreshCw className="w-8 h-8 animate-spin mb-3" />
        <p className="font-mono text-sm">{text}</p>
    </div>
);

export default Migration;