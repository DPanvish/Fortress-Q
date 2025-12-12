import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Wallet, LogOut, ShieldAlert, Download } from 'lucide-react';
import axios from 'axios';
import { MlKem1024 } from 'crystals-kyber-js';
import CryptoJS from 'crypto-js';

import FileUpload from '../components/FileUpload';
import FileList from '../components/FileList';

const Dashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [decrypting, setDecrypting] = useState(false);

    // Helper: Base64 -> Uint8Array
    const base64ToUint8Array = (base64) => {
        if (!base64) return new Uint8Array(0);
        const binaryString = window.atob(base64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) { bytes[i] = binaryString.charCodeAt(i); }
        return bytes;
    };

    useEffect(() => {
        const loadData = async () => {
            const token = localStorage.getItem('token');
            if (!token) return navigate('/login');

            try {
                const config = { headers: { 'x-auth-token': token } };
                const [userRes, filesRes] = await Promise.all([
                    axios.get('http://localhost:5000/api/auth/me', config),
                    axios.get('http://localhost:5000/api/files', config)
                ]);
                setUser(userRes.data);
                setFiles(filesRes.data);
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

    const handleDownload = async (file) => {
        try {
            setDecrypting(true);
            console.log(`1. Downloading Encrypted Content...`);

            // A. FETCH ENCRYPTED CONTENT
            const response = await axios.get(`http://localhost:5000/api/files/download/${file.ipfsHash}`, {
                responseType: 'text'
            });
            const encryptedContent = response.data;

            if (!encryptedContent) throw new Error("Downloaded content is empty");

            console.log("2. Decapsulating Quantum Key...");

            // B. RECOVER AES KEY (Kyber-1024)
            if (!user?.encryptedQuantumPrivateKey) throw new Error("User private key missing");

            const privateKeyBytes = base64ToUint8Array(user.encryptedQuantumPrivateKey);
            if (privateKeyBytes.length === 0) throw new Error("Invalid Private Key");

            // Handle various formats for the key (String, Array, MongoDB Buffer)
            let keyData = file.encryptedKey;

            if (typeof keyData === 'string') {
                try {
                    const parsed = JSON.parse(keyData);
                    keyData = parsed;
                } catch (e) {
                    // Keep as string if parse fails
                }
            }

            // Handle MongoDB Buffer format { type: 'Buffer', data: [...] }
            if (keyData && typeof keyData === 'object' && keyData.type === 'Buffer' && Array.isArray(keyData.data)) {
                keyData = keyData.data;
            }

            // Handle Object-map format { "0": 123, "1": 45... } (JSON stringified TypedArray)
            if (keyData && typeof keyData === 'object' && !Array.isArray(keyData) && !keyData.length) {
                keyData = Object.values(keyData);
            }

            if (!keyData) throw new Error("File encrypted key is missing");
            const capsuleBytes = new Uint8Array(keyData);

            if (capsuleBytes.length === 0) throw new Error("Encrypted Key (Capsule) is empty");

            const recipient = new MlKem1024();
            console.log(`Decapping: Capsule ${capsuleBytes.length} bytes, PrivKey ${privateKeyBytes.length} bytes`);
            const decryptedSecret = await recipient.decap(capsuleBytes, privateKeyBytes);

            if (!decryptedSecret) throw new Error("Quantum decapsulation failed");

            // Convert to Hex String
            const aesKeyHex = Array.from(decryptedSecret).map(b => b.toString(16).padStart(2, '0')).join('');
            console.log("AES Key Recovered:", aesKeyHex.substring(0, 10) + "...");

            // C. DECRYPT CONTENT (AES-256)
            console.log("3. Decrypting...");
            // Use the hex string directly as the passphrase to handle Salted__ format automatically
            const bytes = CryptoJS.AES.decrypt(encryptedContent.trim(), aesKeyHex);

            // Convert to UTF8 String (This recovers the 'data:...' string)
            const decryptedDataURI = bytes.toString(CryptoJS.enc.Utf8);

            // Validation: Must start with 'data:'
            if (!decryptedDataURI || !decryptedDataURI.startsWith("data:")) {
                throw new Error("Decryption failed. (Key mismatch or corrupted file)");
            }

            console.log("✅ Decryption Successful! Reconstructing Blob...");

            // D. CONVERT TO BLOB (Modern Method)
            // We use fetch() to handle the DataURI -> Blob conversion cleanly
            const blob = await (await fetch(decryptedDataURI)).blob();

            // E. TRIGGER DOWNLOAD
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            // Remove the .enc extension from the original filename for the recovered file
            const finalFileName = file.originalName.endsWith('.enc')
                ? file.originalName.slice(0, -4)
                : file.originalName;
            link.href = url;
            link.download = "Recovered_" + finalFileName;
            document.body.appendChild(link);
            link.click();

            // Cleanup
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

        } catch (err) {
            console.error("Decryption Failed:", err);
            alert("Decryption Error: " + err.message);
        } finally {
            setDecrypting(false);
        }
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

                {/* Header Section */}
                <div className="text-center space-y-4 pt-8">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-white">
                        Secure <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-500">Quantum Vault</span>
                    </h1>
                    <p className="text-slate-400 max-w-xl mx-auto">
                        Files are encrypted client-side. The server never sees your raw data.
                        Only your private Kyber key can unlock these assets.
                    </p>
                </div>

                {/* Upload Section */}
                <div className="flex justify-center">
                    <FileUpload />
                </div>

                {/* File List Section */}
                <div className="max-w-4xl mx-auto w-full">
                    <FileList files={files} onDownload={handleDownload} />
                    {decrypting && <p className="text-center text-cyan-400 mt-4 animate-pulse">Running Quantum Decapsulation...</p>}
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