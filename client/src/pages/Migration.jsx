import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import { ArrowRight, ShieldCheck, AlertTriangle, Wallet, RefreshCw, Link } from 'lucide-react';

const LEGACY_ADDRESS = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";
const QUANTUM_ADDRESS = "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707";

const LEGACY_ABI = [
    "function withdraw() external",
    "function getBalance() external view returns (uint256)"
];

const QUANTUM_ABI = [
    "function getBalance() external view returns (uint256)",
    "function withdrawSecurely(string memory latticeSecret) external"
];

const Migration = () => {
    const navigate = useNavigate();
    const [provider, setProvider] = useState(null);
    const [account, setAccount] = useState(null); // Track connected user
    const [legacyBalance, setLegacyBalance] = useState("0.0");
    const [quantumBalance, setQuantumBalance] = useState("0.0");
    const [status, setStatus] = useState("idle");
    const [logs, setLogs] = useState([]);
    const [chainId, setChainId] = useState(null);

    const switchToLocalhost = async () => {
        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: '0x539' }], // Chain ID 1337 in Hex
            });
        } catch (switchError) {
            // This error code indicates that the chain has not been added to MetaMask.
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

    // 1. Setup Provider on Load (Don't force popup yet)
    useEffect(() => {
        if (window.ethereum) {
            const tempProvider = new ethers.BrowserProvider(window.ethereum);
            setProvider(tempProvider);

            // Check if already connected
            tempProvider.listAccounts().then(accounts => {
                if (accounts.length > 0) {
                    setAccount(accounts[0].address);
                    refreshBalances(tempProvider);
                }
            });

            // Listen for account changes
            window.ethereum.on('accountsChanged', (accounts) => {
                if (accounts.length > 0) {
                    setAccount(accounts[0]);
                    refreshBalances(tempProvider);
                } else {
                    setAccount(null);
                }
            });

            // Reload page on network switch to ensure clean state
            window.ethereum.on('chainChanged', () => {
                window.location.reload();
            });
        }
    }, []);

    const addLog = (msg) => setLogs(prev => [...prev, `> ${msg}`]);

    // 2. EXPLICIT CONNECT FUNCTION (Triggers Popup)
    const connectWallet = async () => {
        if (!provider) return;
        try {
            addLog("Requesting MetaMask Connection...");
            // This MUST be triggered by a button click to work reliably
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
            addLog("Connection Rejected by User.");
        }
    };

    const refreshBalances = async (currentProvider) => {
        try {
            const network = await currentProvider.getNetwork();
            setChainId(network.chainId.toString());

            // Verify contract existence to prevent BAD_DATA errors (wrong network/address)
            const legacyCode = await currentProvider.getCode(LEGACY_ADDRESS);
            if (legacyCode === "0x") {
                addLog(`⚠️ Contract missing on Chain ID ${network.chainId}`);
                addLog(`Checked: ${LEGACY_ADDRESS}`);
                if (network.chainId.toString() !== "1337") addLog("👉 Please switch MetaMask to Localhost 8545");
                return;
            }

            // We use the 'provider' (read-only) to check balances, not signer
            const legacyContract = new ethers.Contract(LEGACY_ADDRESS, LEGACY_ABI, currentProvider);
            const quantumContract = new ethers.Contract(QUANTUM_ADDRESS, QUANTUM_ABI, currentProvider);

            const bal1 = await legacyContract.getBalance();
            const quantumCode = await currentProvider.getCode(QUANTUM_ADDRESS);
            const bal2 = quantumCode !== "0x" ? await quantumContract.getBalance() : 0n;

            setLegacyBalance(ethers.formatEther(bal1));
            setQuantumBalance(ethers.formatEther(bal2));
        } catch (e) {
            console.error("Connection Error:", e);
            addLog("Error reading Blockchain. Check Console.");
        }
    };

    const startMigration = async () => {
        if (!account || !provider) return;
        setStatus("migrating");
        setLogs([]);
        addLog("Initiating Quantum Migration Protocol...");

        try {
            const signer = await provider.getSigner();
            const userAddress = await signer.getAddress();
            addLog(`Operator: ${userAddress.slice(0, 10)}...`);

            // A. LEGACY WITHDRAW
            const legacyWithSigner = new ethers.Contract(LEGACY_ADDRESS, LEGACY_ABI, signer);
            addLog("Step 1: Extracting Funds from Legacy Contract...");

            const tx1 = await legacyWithSigner.withdraw();
            addLog("Please Confirm Transaction 1 in MetaMask...");
            await tx1.wait();
            addLog("✅ Funds Extracted to Wallet.");

            // B. QUANTUM DEPOSIT
            addLog("Step 2: Securing funds into Quantum Lattice...");
            const tx2 = await signer.sendTransaction({
                to: QUANTUM_ADDRESS,
                value: ethers.parseEther("10.0")
            });
            addLog("Please Confirm Transaction 2 in MetaMask...");
            await tx2.wait();

            addLog("✅ Funds Locked with Post-Quantum Keys.");
            setStatus("success");
            await refreshBalances(provider);

        } catch (err) {
            console.error(err);
            addLog(`❌ Error: ${err.message.slice(0, 50)}...`);
            setStatus("error");
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 font-sans p-8">
            <div className="flex justify-between items-center mb-8">
                <button onClick={() => navigate('/dashboard')} className="text-slate-400 hover:text-cyan-400 flex items-center gap-2">
                    ← Back to Dashboard
                </button>

                {/* CONNECT BUTTON */}
                {!account ? (
                    <button
                        onClick={connectWallet}
                        className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-lg flex items-center gap-2"
                    >
                        <Link size={16} /> Connect Wallet
                    </button>
                ) : chainId && chainId !== "1337" ? (
                    <button
                        onClick={switchToLocalhost}
                        className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg flex items-center gap-2 animate-pulse"
                    >
                        <AlertTriangle size={16} /> Switch Network
                    </button>
                ) : (
                    <div className="px-4 py-2 bg-slate-800 rounded-lg text-green-400 font-mono text-sm border border-green-500/30">
                        ● Connected: {account.slice(0,6)}...{account.slice(-4)}
                    </div>
                )}
            </div>

            <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">

                {/* LEFT: VISUALIZER */}
                <div className="space-y-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Smart Contract Migration</h1>
                        <p className="text-slate-400">Move assets from ECDSA-dependent contracts to Lattice-based vaults.</p>
                    </div>

                    {/* Legacy Card */}
                    <div className={`p-6 rounded-2xl border transition-all duration-500 ${legacyBalance === "0.0" ? "border-slate-800 opacity-50 bg-slate-900/50" : "border-red-500/30 bg-red-950/20"}`}>
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-red-500/10 rounded-lg text-red-500"><AlertTriangle size={24} /></div>
                                <div>
                                    <h3 className="font-bold text-white">Legacy Wallet</h3>
                                    <p className="text-xs text-red-400">Vulnerable to Shor's Algo</p>
                                </div>
                            </div>
                            <span className="text-2xl font-mono font-bold text-white">{legacyBalance} ETH</span>
                        </div>
                        <div className="text-xs font-mono text-slate-500 break-all">{LEGACY_ADDRESS}</div>
                    </div>

                    {/* ARROW */}
                    <div className="flex justify-center text-slate-600">
                        <ArrowRight className={`w-8 h-8 ${status === 'migrating' ? 'text-cyan-400 animate-pulse' : ''} rotate-90 lg:rotate-0`} />
                    </div>

                    {/* Quantum Card */}
                    <div className={`p-6 rounded-2xl border transition-all duration-500 ${quantumBalance === "0.0" ? "border-slate-800 bg-slate-900/50" : "border-cyan-500/30 bg-cyan-950/20 shadow-[0_0_30px_rgba(34,211,238,0.2)]"}`}>
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-cyan-500/10 rounded-lg text-cyan-400"><ShieldCheck size={24} /></div>
                                <div>
                                    <h3 className="font-bold text-white">Quantum Vault</h3>
                                    <p className="text-xs text-cyan-400">Secured by Dilithium + Kyber</p>
                                </div>
                            </div>
                            <span className="text-2xl font-mono font-bold text-white">{quantumBalance} ETH</span>
                        </div>
                        <div className="text-xs font-mono text-slate-500 break-all">{QUANTUM_ADDRESS}</div>
                    </div>

                    {/* ACTION BUTTON */}
                    {status !== 'success' && legacyBalance !== "0.0" && (
                        <button
                            onClick={startMigration}
                            disabled={!account || status === 'migrating'}
                            className={`w-full py-4 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2 transition-all
                        ${!account
                                ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                                : "bg-gradient-to-r from-cyan-600 to-violet-600 hover:from-cyan-500 hover:to-violet-500"}`}
                        >
                            {status === 'migrating' ? <RefreshCw className="animate-spin" /> : <Wallet />}
                            {!account ? "Connect Wallet to Migrate" : status === 'migrating' ? "Migrating Assets..." : "Execute Smart Migration"}
                        </button>
                    )}
                </div>

                {/* RIGHT: LOGS */}
                <div className="bg-black/80 rounded-xl border border-slate-800 p-4 font-mono text-sm h-[500px] overflow-y-auto shadow-inner">
                    <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-2">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <span className="text-slate-500 ml-2">migration_cli.exe --network localhost</span>
                    </div>
                    <div className="space-y-2 text-slate-300">
                        <p>> Initializing connection...</p>
                        {logs.map((log, i) => (
                            <p key={i} className={log.includes("Error") ? "text-red-400" : log.includes("✅") ? "text-green-400" : "text-slate-300"}>
                                {log}
                            </p>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Migration;