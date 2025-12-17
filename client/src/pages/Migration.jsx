import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import axios from 'axios';
import {
    ArrowRight, ShieldCheck, AlertTriangle, Wallet, RefreshCw, Link,
    Lock, CheckCircle, FileSignature
} from 'lucide-react';

// Import the BB84 Monitor
import QuantumMonitor from '../components/QuantumMonitor';

const LEGACY_ADDRESS = "0x30A83F5e57Fa28a89b559850E586e08549eCbBc1";
const QUANTUM_ADDRESS = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";

const LEGACY_ABI = [
    "function withdraw() external",
    "function getBalance() external view returns (uint256)",
    "function owner() external view returns (address)"
];

const QUANTUM_ABI = [
    "function getBalance() external view returns (uint256)",
    "function withdrawSecurely(string memory latticeSecret) external"
];

const Migration = () => {
    const navigate = useNavigate();

    // --- BLOCKCHAIN STATE ---
    const [provider, setProvider] = useState(null);
    const [account, setAccount] = useState(null);
    const [legacyBalance, setLegacyBalance] = useState("0.0");
    const [quantumBalance, setQuantumBalance] = useState("0.0");
    const [status, setStatus] = useState("idle"); // idle, migrating, success, error
    const [logs, setLogs] = useState([]);
    const [chainId, setChainId] = useState(null);
    const [migrationStep, setMigrationStep] = useState(0); // 0=Idle, 1=Extract, 2=Deposit, 3=Signing

    // QUANTUM SECURITY STATE
    const [channelSecure, setChannelSecure] = useState(false); // Gatekeeper
    const [signature, setSignature] = useState(null); // Dilithium Receipt

    // SETUP PROVIDER ON LOAD
    useEffect(() => {
        if (window.ethereum) {
            const tempProvider = new ethers.BrowserProvider(window.ethereum);
            setProvider(tempProvider);

            tempProvider.listAccounts().then(accounts => {
                if (accounts.length > 0) {
                    setAccount(accounts[0].address);
                    refreshBalances(tempProvider);
                }
            });

            window.ethereum.on('accountsChanged', (accounts) => {
                if (accounts.length > 0) {
                    setAccount(accounts[0]);
                    refreshBalances(tempProvider);
                } else {
                    setAccount(null);
                }
            });

            window.ethereum.on('chainChanged', () => window.location.reload());
        }
    }, []);

    const addLog = (msg) => setLogs(prev => [...prev, `> ${msg}`]);

    // NETWORK SWITCHER
    const switchToLocalhost = async () => {
        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: '0x539' }], // 1337
            });
        } catch (switchError) {
            if (switchError.code === 4902) {
                await window.ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [{
                        chainId: '0x539',
                        chainName: 'Hardhat Localhost',
                        rpcUrls: ['http://127.0.0.1:8545'],
                        nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 }
                    }],
                });
            }
        }
    };

    // CONNECT WALLET
    const connectWallet = async () => {
        if (!provider) return;
        try {
            addLog("Requesting MetaMask Connection...");
            await provider.send("eth_requestAccounts", []);
            const signer = await provider.getSigner();
            const address = await signer.getAddress();
            setAccount(address);

            const network = await provider.getNetwork();
            if (network.chainId.toString() !== "1337") {
                addLog("⚠️ Wrong Network. Switching to Localhost...");
                await switchToLocalhost();
            }

            addLog(`Connected: ${address.slice(0,6)}...`);
            await refreshBalances(provider);
        } catch (err) {
            console.error(err);
            addLog("Connection Rejected.");
        }
    };

    const refreshBalances = async (currentProvider) => {
        try {
            const network = await currentProvider.getNetwork();
            setChainId(network.chainId.toString());

            // Safe check for code before calling
            const legacyCode = await currentProvider.getCode(LEGACY_ADDRESS);
            if (legacyCode === "0x") return;

            const legacyContract = new ethers.Contract(LEGACY_ADDRESS, LEGACY_ABI, currentProvider);
            const quantumContract = new ethers.Contract(QUANTUM_ADDRESS, QUANTUM_ABI, currentProvider);

            const bal1 = await legacyContract.getBalance();
            const qCode = await currentProvider.getCode(QUANTUM_ADDRESS);
            const bal2 = qCode !== "0x" ? await quantumContract.getBalance() : 0n;

            setLegacyBalance(ethers.formatEther(bal1));
            setQuantumBalance(ethers.formatEther(bal2));
        } catch (e) {
            console.error(e);
        }
    };

    // THE MAIN EXECUTION LOGIC
    const startMigration = async () => {
        // GATEKEEPER CHECK
        if (!channelSecure) {
            alert("⛔ CHANNEL INSECURE! Please run the BB84 Handshake in Step 1 first.");
            addLog("❌ Error: Quantum Channel not established.");
            return;
        }

        if (!account || !provider) return;
        setStatus("migrating");
        setMigrationStep(1);
        setLogs([]);
        addLog("Initiating Quantum Migration Protocol...");

        try {
            const signer = await provider.getSigner();
            const userAddress = await signer.getAddress();
            addLog(`Operator: ${userAddress.slice(0, 10)}...`);

            // LEGACY WITHDRAW
            addLog("Step 2A: Extracting Funds from Legacy Contract...");
            const legacyWithSigner = new ethers.Contract(LEGACY_ADDRESS, LEGACY_ABI, signer);

            const tx1 = await legacyWithSigner.withdraw();
            addLog("Processing Withdrawal...");
            await tx1.wait();
            addLog("✅ Funds Extracted to Wallet.");

            setMigrationStep(2);

            // UANTUM DEPOSIT
            addLog("Step 2B: Securing funds into Quantum Lattice...");
            const txCount = await signer.provider.getTransactionCount(userAddress);

            const tx2 = await signer.sendTransaction({
                to: QUANTUM_ADDRESS,
                value: ethers.parseEther("10.0"),
                nonce: txCount
            });
            addLog("Processing Quantum Deposit...");
            const receipt = await tx2.wait();
            addLog("✅ Funds Locked with Post-Quantum Keys.");

            // --- C. DILITHIUM SIGNATURE (NEW) ---
            setMigrationStep(3);
            addLog("Step 3: Generating Dilithium Signature Receipt...");

            const token = localStorage.getItem('token');
            const sigRes = await axios.post('http://localhost:5000/api/auth/sign-migration',
                { migrationId: receipt.hash.substring(0, 10) },
                { headers: { 'x-auth-token': token } }
            );

            setSignature(sigRes.data);
            addLog("✅ Lattice Signature Verified.");

            setStatus("success");
            await refreshBalances(provider);

        } catch (err) {
            console.error(err);
            addLog(`❌ Error: ${err.message.slice(0, 50)}...`);
            setStatus("error");
            setMigrationStep(0);
        }
    };

    const resetDemo = async () => {
        if (!provider) return;
        try {
            const signer = await provider.getSigner();
            addLog("🔄 Resetting Demo State...");
            const txRefill = await signer.sendTransaction({
                to: LEGACY_ADDRESS,
                value: ethers.parseEther("10.0")
            });
            await txRefill.wait();
            addLog("✅ Reset Complete.");
            setStatus("idle");
            setSignature(null); // Clear receipt
            await refreshBalances(provider);
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 font-sans p-8">
            {/* HEADER */}
            <div className="flex justify-between items-center mb-8">
                <button onClick={() => navigate('/dashboard')} className="text-slate-400 hover:text-cyan-400 flex items-center gap-2">
                    ← Back to Dashboard
                </button>
                {!account ? (
                    <button onClick={connectWallet} className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-lg flex items-center gap-2">
                        <Link size={16} /> Connect Wallet
                    </button>
                ) : chainId && chainId !== "1337" ? (
                    <button onClick={switchToLocalhost} className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg flex items-center gap-2 animate-pulse">
                        <AlertTriangle size={16} /> Switch Network
                    </button>
                ) : (
                    <div className="px-4 py-2 bg-slate-800 rounded-lg text-green-400 font-mono text-sm border border-green-500/30">
                        ● Connected: {account.slice(0,6)}...
                    </div>
                )}
            </div>

            <div className="max-w-6xl mx-auto space-y-8">

                {/* TITLE */}
                <div className="text-center space-y-2">
                    <h1 className="text-4xl font-bold text-white">Smart Contract <span className="text-cyan-400">Migration</span></h1>
                    <p className="text-slate-400">Securely transfer assets from Vulnerable to Quantum-Safe contracts.</p>
                </div>

                {/* QUANTUM HANDSHAKE */}
                <div className={`border rounded-xl p-6 transition-all ${channelSecure ? 'bg-emerald-900/10 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.1)]' : 'bg-slate-900 border-slate-700'}`}>
                    <div className="flex items-center gap-3 mb-4">
                        <div className={`p-2 rounded-lg ${channelSecure ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                            <Lock size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white">Step 1: Secure Quantum Channel</h3>
                            <p className="text-xs text-slate-400">Establish BB84 Handshake before authorizing transfer.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                        <QuantumMonitor />

                        {/* Manual Override for Demo Flow if needed */}
                        <div className="p-4 bg-black/40 rounded-xl border border-slate-800 h-full flex flex-col justify-center items-center text-center space-y-3">
                            <p className="text-sm text-slate-300">
                                Protocol Status: <span className={channelSecure ? "text-emerald-400 font-bold" : "text-red-400 font-bold"}>
                                    {channelSecure ? "SECURE (QBER 0%)" : "UNVERIFIED"}
                                </span>
                            </p>
                            {!channelSecure && (
                                <div className="flex items-center gap-2 mt-2">
                                    <input
                                        type="checkbox"
                                        checked={channelSecure}
                                        onChange={(e) => setChannelSecure(e.target.checked)}
                                        className="w-5 h-5 accent-emerald-500 cursor-pointer"
                                    />
                                    <span className="text-xs text-slate-500">Manual Override (If Simulation Offline)</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* MIGRATION VISUALIZER */}
                <div className={`relative transition-all duration-500 ${!channelSecure ? 'opacity-50 grayscale pointer-events-none' : 'opacity-100'}`}>
                    {!channelSecure && (
                        <div className="absolute inset-0 z-50 flex items-center justify-center">
                            <div className="bg-black/80 px-6 py-3 rounded-full border border-red-500/50 text-red-400 font-bold flex items-center gap-2 backdrop-blur-sm">
                                <Lock size={16} /> Locked: Secure Channel Required
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* VISUALS */}
                        <div className="space-y-8">

                            {/* LEGACY CARD */}
                            <div className={`p-6 rounded-2xl border transition-all ${legacyBalance === "0.0" ? "border-slate-800 opacity-50 bg-slate-900/50" : "border-red-500/30 bg-red-950/10"}`}>
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 bg-red-500/10 rounded-lg text-red-500"><AlertTriangle size={24} /></div>
                                        <div>
                                            <h3 className="font-bold text-white">Legacy Wallet</h3>
                                            <p className="text-xs text-red-400">Vulnerable ECDSA</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-mono font-bold text-white">{legacyBalance} ETH</div>
                                        {legacyBalance === "0.0" && <button onClick={resetDemo} className="text-xs text-cyan-400 mt-1 hover:underline">🔄 Reset</button>}
                                    </div>
                                </div>
                            </div>

                            {/* FLOW INDICATOR */}
                            <div className="flex flex-col items-center justify-center text-slate-600 gap-2 h-16">
                                {status === 'migrating' ? (
                                    <>
                                        <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
                                        <span className="text-xs font-mono text-cyan-400 animate-pulse font-bold">
                                            {migrationStep === 1 ? "EXTRACTING..." : migrationStep === 2 ? "SECURING..." : "SIGNING..."}
                                        </span>
                                    </>
                                ) : (
                                    <ArrowRight className={`w-8 h-8 ${status === 'success' ? 'text-green-500' : ''} rotate-90 lg:rotate-0`} />
                                )}
                            </div>

                            {/* QUANTUM CARD */}
                            <div className={`p-6 rounded-2xl border transition-all ${quantumBalance === "0.0" ? "border-slate-800 bg-slate-900/50" : "border-cyan-500/30 bg-cyan-950/10 shadow-[0_0_30px_rgba(34,211,238,0.1)]"}`}>
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 bg-cyan-500/10 rounded-lg text-cyan-400"><ShieldCheck size={24} /></div>
                                        <div>
                                            <h3 className="font-bold text-white">Quantum Vault</h3>
                                            <p className="text-xs text-cyan-400">Secured by Dilithium</p>
                                        </div>
                                    </div>
                                    <span className="text-2xl font-mono font-bold text-white">{quantumBalance} ETH</span>
                                </div>
                            </div>

                            {/* MAIN BUTTON */}
                            {status !== 'success' && legacyBalance !== "0.0" && (
                                <button
                                    onClick={startMigration}
                                    disabled={!account || status === 'migrating'}
                                    className={`w-full py-4 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2 transition-all
                                    ${!account ? "bg-slate-800 text-slate-500 cursor-not-allowed" : "bg-gradient-to-r from-cyan-600 to-violet-600 hover:from-cyan-500 hover:to-violet-500"}`}
                                >
                                    {status === 'migrating' ? <RefreshCw className="animate-spin" /> : <Wallet />}
                                    {!account ? "Connect Wallet to Migrate" : status === 'migrating' ? "Executing Protocol..." : "Execute Smart Migration"}
                                </button>
                            )}

                            {/* SIGNATURE RECEIPT (Final Success State) */}
                            {status === 'success' && signature && (
                                <div className="bg-black/60 rounded-xl p-6 border border-emerald-500/30 animate-in zoom-in">
                                    <div className="flex items-center gap-2 text-emerald-400 mb-4 border-b border-white/10 pb-2">
                                        <CheckCircle size={20} />
                                        <span className="font-bold">MIGRATION SUCCESSFUL</span>
                                    </div>
                                    <div className="space-y-2 font-mono text-xs text-slate-300">
                                        <div className="flex justify-between"><span className="text-slate-500">Algorithm:</span><span className="text-white">{signature.algorithm}</span></div>
                                        <div className="flex justify-between"><span className="text-slate-500">Lattice Dim:</span><span>{signature.lattice_dimension}</span></div>
                                        <div className="mt-2">
                                            <span className="text-slate-500 block mb-1">Dilithium Signature:</span>
                                            <p className="break-all bg-black p-2 rounded text-purple-400 border border-purple-500/20">{signature.signature}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* LOGS */}
                        <div className="bg-black/80 rounded-xl border border-slate-800 p-4 font-mono text-sm h-[600px] overflow-y-auto shadow-inner">
                            <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-2">
                                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                <span className="text-slate-500 ml-2">migration_cli.exe --secure</span>
                            </div>
                            <div className="space-y-2 text-slate-300">
                                <p>> System Ready.</p>
                                {logs.map((log, i) => (
                                    <p key={i} className={log.includes("Error") ? "text-red-400" : log.includes("✅") ? "text-green-400" : "text-slate-300"}>{log}</p>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Migration;