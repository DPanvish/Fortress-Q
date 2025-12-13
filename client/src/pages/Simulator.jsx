import React, {useState} from 'react'
import {useNavigate} from "react-router-dom";

const VICTIM_OWNER = "0xae0478140036d14e93A7B7482512e1d91745B650";
const LEGACY_CONTRACT = "0x30A83F5e57Fa28a89b559850E586e08549eCbBc1";

const LEGACY_ABI = ["function withdraw() external"];


const Simulator = () => {
    const navigate = useNavigate();
    const [logs, setLogs] = useState([]);
    const [status, setStatus] = useState("idle");
    const [foundKey, setFoundKey] = useState(null);
    const [progress, setProgress] = useState(0);

    const addLog = (msg) => {
        setLogs(prev => [msg, ...prev].slice(0, 10));
    }

    // The Real Attack Logic
    const launchAttack = async() => {
        setStatus("cracking");
        setLogs([]);
        addLog("🚀 Initializing Quantum Shor's Simulation...");

        // We start searching for the private key from 0 upwards.
        // In a real attack, this search space is 2^256.
        // Here, we simulate the 'reduced' space found by Shor's Algo.

        let guess = 0n;
        const maxGuess = 100000n;
        const startTime = Date.now();

        const crackLoop = setInterval(async() => {
            for(let i = 0; i < 500; i++){
                guess++;

                const currentKey = "0x" + guess.toString(16).padStart(64, '0');

                const wallet = new ethers.Wallet(currentKey);

                if(wallet.address.toLowerCase() === VICTIM_OWNER.toLowerCase()){
                    clearInterval(crackLoop);
                    finishAttack(currentKey);
                    return;
                }
            }

            setProgress(Number(guess));
            if(guess % 1000n === 0n){
                addLog(`Trying Key: 0x...${guess.toString(16)}`);
            }

            if(guess > maxGuess){
                clearInterval(crackLoop);
                setStatus("failed");
                addLog("❌ Attack Timed Out. Key not in range.");
            }
        }, 10);
    };

    const finishAttack = async (privateKey) => {
        const timeTaken = (Date.now() - startTime) / 1000;
        addLog(`✅ KEY FOUND in ${timeTaken}s!`);
        addLog(`🔑 Private Key: ${privateKey}`);
        setFoundKey(privateKey);
        setStatus("draining");

        try {
            addLog("💀 Stealing Funds with Recovered Key...");

            // 1. Connect to Localhost using the STOLEN KEY
            const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
            const stolenWallet = new ethers.Wallet(privateKey, provider);

            // 2. Connect to the Victim's Contract
            const contract = new ethers.Contract(LEGACY_CONTRACT, LEGACY_ABI, stolenWallet);

            // 3. CALL WITHDRAW (The Theft)
            const tx = await contract.withdraw();
            addLog(`Transaction Sent: ${tx.hash}`);
            await tx.wait();

            addLog("💰 FUNDS STOLEN SUCCESSFULLY.");
            setStatus("success");
        } catch (err) {
            console.error(err);
            addLog(`❌ Error Stealing: ${err.message}`);
            setStatus("success"); // Still a success that we found the key
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 font-sans p-8 flex flex-col items-center">
            <button onClick={() => navigate('/dashboard')} className="self-start mb-8 text-slate-400 hover:text-cyan-400">← Back</button>

            <div className="max-w-4xl w-full space-y-8">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-red-500 mb-2 flex justify-center items-center gap-3">
                        <ShieldAlert size={40} /> Quantum Attack Simulator
                    </h1>
                    <p className="text-slate-400">
                        Demonstrating <strong>Key Recovery Attack</strong>.
                        Simulating Shor's Algorithm by searching a reduced entropy keyspace.
                    </p>
                </div>

                {/* Target Info */}
                <div className="bg-slate-900 border border-red-900/50 rounded-xl p-6 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                        <h3 className="text-sm font-bold text-slate-500 uppercase">Target Owner (Victim)</h3>
                        <p className="font-mono text-cyan-400 break-all">{VICTIM_OWNER}</p>
                    </div>
                    <div className="text-right">
                        <h3 className="text-sm font-bold text-slate-500 uppercase">Target Contract</h3>
                        <p className="font-mono text-white break-all">{LEGACY_CONTRACT}</p>
                    </div>
                </div>

                {/* Action Area */}
                <div className="flex justify-center">
                    {status === 'idle' && (
                        <button onClick={launchAttack} className="bg-red-600 hover:bg-red-500 text-white text-xl font-bold py-4 px-12 rounded-full shadow-[0_0_40px_rgba(220,38,38,0.5)] transition-all transform hover:scale-105 flex items-center gap-3">
                            <Zap /> LAUNCH ATTACK
                        </button>
                    )}
                    {status === 'cracking' && (
                        <div className="text-center space-y-2">
                            <RefreshCw className="animate-spin w-12 h-12 text-red-500 mx-auto" />
                            <p className="text-red-400 font-mono">Brute Forcing ECDSA Key...</p>
                            <p className="text-xs text-slate-500">Keys Checked: {progress}</p>
                        </div>
                    )}
                    {status === 'success' && (
                        <div className="bg-green-900/20 border border-green-500/50 p-6 rounded-xl text-center">
                            <Unlock className="w-16 h-16 text-green-500 mx-auto mb-4" />
                            <h2 className="text-2xl font-bold text-green-400">SYSTEM COMPROMISED</h2>
                            <p className="text-green-200">Private Key Recovered & Funds Drained</p>
                        </div>
                    )}
                </div>

                {/* Terminal Output */}
                <div className="bg-black border border-slate-800 rounded-lg p-4 font-mono text-sm h-64 overflow-y-auto shadow-inner custom-scrollbar">
                    <div className="flex items-center gap-2 mb-2 border-b border-slate-800 pb-2">
                        <Terminal size={14} className="text-slate-500"/>
                        <span className="text-slate-500">root@attacker:~/exploit# ./run_shors.py</span>
                    </div>
                    {logs.map((log, i) => (
                        <div key={i} className={`${log.includes('✅') ? 'text-green-400 font-bold' : log.includes('❌') ? 'text-red-500' : 'text-slate-300'}`}>
                            {log}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
export default Simulator;
