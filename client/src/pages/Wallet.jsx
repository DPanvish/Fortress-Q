import React, {useEffect, useState} from 'react'
import {useNavigate} from "react-router-dom";
import {AlertTriangle, CheckCircle, RefreshCw, Wallet as WalletIcon, Lock, ArrowDown, Shield} from "lucide-react";
import axios from 'axios';
import { ethers } from 'ethers';

// Address of the Quantum Vault (Must match Migration.jsx)
const QUANTUM_ADDRESS = import.meta.env.VITE_QUANTUM_ADDRESS || "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
const QUANTUM_ABI = [
    "function balances(address) view returns (uint256)",
    "function quantumLock() view returns (bytes32)",
    "function withdrawSecurely(string memory latticeSecret) external"
];

const Wallet = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [balances, setBalances] = useState({ eth: "0.00", quantum: "0.00" });
    const [connectedAddress, setConnectedAddress] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const [vaultData, setVaultData] = useState({ lockHash: null });
    const [withdrawing, setWithdrawing] = useState(false);
    const navigate = useNavigate();

    const fetchWalletData = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) { navigate('/'); return; }

            // 1. Get User Profile
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const response = await axios.get(`${API_URL}/api/auth/me`, {
                headers: { "x-auth-token": token }
            });
            const userData = response.data;
            setUser(userData);

            // 2. Determine which address to check (MetaMask vs Server Identity)
            // The Migration uses MetaMask, so we must check that address for the Vault Balance.
            let targetAddress = userData.walletAddressETH;
            if (window.ethereum) {
                try {
                    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
                    if (accounts.length > 0) {
                        targetAddress = accounts[0];
                        setConnectedAddress(targetAddress);
                    }
                } catch (e) { console.warn("MetaMask access denied", e); }
            }

            // 3. Get Real-time Blockchain Balances
            if (targetAddress) {
                try {
                    setRefreshing(true);
                    // Connect to Localhost Hardhat Node directly (Read-Only)
                    const RPC_URL = import.meta.env.VITE_BLOCKCHAIN_RPC || "http://127.0.0.1:8545";
                    const provider = new ethers.JsonRpcProvider(RPC_URL);
                    
                    // A. Legacy Balance (Native ETH)
                    const ethBal = await provider.getBalance(targetAddress);
                    
                    // B. Quantum Vault Balance (Contract Mapping)
                    const vaultContract = new ethers.Contract(QUANTUM_ADDRESS, QUANTUM_ABI, provider);
                    const qBal = await vaultContract.balances(targetAddress);
                    
                    // C. Dynamic Vault Data (Fetch the active Quantum Lock)
                    const lockHash = await vaultContract.quantumLock();

                    setBalances({
                        eth: ethers.formatEther(ethBal),
                        quantum: ethers.formatEther(qBal)
                    });
                    setVaultData({ lockHash });
                } catch (chainErr) {
                    console.error("Blockchain connection failed:", chainErr);
                } finally {
                    setRefreshing(false);
                }
            }
        } catch (err) {
            console.error("Error fetching wallet data:", err);
            if (err.response && err.response.status === 401) {
                localStorage.removeItem('token');
                navigate('/');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleWithdraw = async () => {
        if (!window.ethereum) return alert("MetaMask required");
        
        // In a real app, this secret comes from the user's private storage or QKD.
        // For the demo, we use the known secret from deployment.
        const secret = prompt("Enter Lattice Secret to unlock funds:", "lattice-secret-123");
        if (!secret) return;

        try {
            setWithdrawing(true);
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const vaultContract = new ethers.Contract(QUANTUM_ADDRESS, QUANTUM_ABI, signer);

            const tx = await vaultContract.withdrawSecurely(secret);
            await tx.wait();
            
            alert("✅ Withdrawal Successful! Funds moved to Native Balance.");
            fetchWalletData();
        } catch (e) {
            console.error(e);
            alert("Withdrawal Failed: " + (e.reason || e.message));
        } finally {
            setWithdrawing(false);
        }
    };

    useEffect(() => {
        fetchWalletData();
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
            
            <div className="flex justify-between items-end w-full max-w-6xl mb-8">
                <div>
                    <h1 className="text-4xl font-extrabold text-white mb-2">
                        Hybrid Security <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-500">Wallet</span>
                    </h1>
                    <p className="text-slate-400 text-lg">
                        Identity: <span className="text-white font-mono">{user?.username}</span>
                    </p>
                </div>
                <button onClick={fetchWalletData} className="text-cyan-400 hover:text-white flex items-center gap-2 text-sm font-bold transition">
                    <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} /> Refresh Balances
                </button>
            </div>

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
                        <div className="bg-black/40 p-4 rounded-xl border border-red-500/20 flex justify-between items-center">
                            <span className="text-slate-400 text-sm font-bold">Native Balance</span>
                            <span className="text-2xl font-mono text-white">{balances.eth} ETH</span>
                        </div>
                        <div>
                            <label className="text-slate-500 text-xs uppercase tracking-wider">Wallet Address</label>
                            <div className="mt-1 p-3 bg-slate-950 rounded border border-slate-800 font-mono text-sm text-slate-300 break-all flex justify-between items-center">
                                <span>{connectedAddress || user?.walletAddressETH || "Not Generated Yet."}</span>
                                {connectedAddress && <span className="text-[10px] bg-slate-800 px-2 py-1 rounded text-cyan-400 border border-cyan-500/30">MetaMask Connected</span>}
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
                        <div className="bg-black/40 p-4 rounded-xl border border-cyan-500/20 flex justify-between items-center">
                            <span className="text-slate-400 text-sm font-bold">Vault Balance</span>
                            <span className="text-2xl font-mono text-cyan-400">{balances.quantum} ETH</span>
                        </div>
                        <div>
                            <label className="text-slate-500 text-xs uppercase tracking-wider">Lattice-Based Public Key</label>
                            <div className="mt-1 p-3 bg-slate-950 rounded border border-slate-800 font-mono text-sm text-cyan-300 break-all h-24 overflow-y-auto custom-scrollbar">
                                {user?.quantumPublicKey || "Generating..."}
                            </div>
                        </div>
                        
                        {/* Dynamic Vault Status */}
                        <div className="p-4 bg-cyan-900/10 rounded-lg border border-cyan-900/30 space-y-2">
                            <div className="flex items-center gap-2 text-cyan-200 text-sm font-bold">
                                <Shield size={14} /> Active Quantum Lock
                            </div>
                            <div className="font-mono text-[10px] text-cyan-400/70 break-all">
                                {vaultData.lockHash || "Loading Contract State..."}
                            </div>
                            
                            {balances.quantum !== "0.0" && (
                                <button 
                                    onClick={handleWithdraw}
                                    disabled={withdrawing}
                                    className="w-full mt-2 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded flex items-center justify-center gap-2 transition"
                                >
                                    {withdrawing ? <RefreshCw className="animate-spin" size={12} /> : <ArrowDown size={12} />}
                                    Withdraw to Native Wallet
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Button */}
            <div className="mt-12">
                <button
                    onClick={() => navigate('/migration')}
                    className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl font-bold text-white shadow-lg hover:scale-105 transition-transform"
                >
                    Simulate Quantum Migration
                </button>
            </div>
        </div>
    )
}
export default Wallet
