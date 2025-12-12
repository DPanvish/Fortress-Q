import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, UploadCloud, Github } from 'lucide-react';

const Home = () => {
    const navigate = useNavigate();

    return (
        <div className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 overflow-hidden">

            {/* Navbar (Simplified for Home) */}
            <nav className="fixed w-full z-50 top-0 start-0 border-b border-white/10 bg-slate-950/50 backdrop-blur-md">
                <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between p-4">
                    <div className="flex items-center space-x-2">
                        <div className="bg-gradient-to-tr from-cyan-400 to-violet-500 p-2 rounded-lg">
                            <ShieldCheck className="w-6 h-6 text-white" />
                        </div>
                        <span className="self-center text-2xl font-bold text-white tracking-wide">
                        Fortress <span className="text-cyan-400">Q</span>
                        </span>
                    </div>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="text-slate-950 bg-cyan-400 hover:bg-cyan-300 font-bold rounded-lg text-sm px-4 py-2 transition-all shadow-[0_0_15px_rgba(34,211,238,0.5)]"
                    >
                        Launch App
                    </button>
                </div>
            </nav>

            {/* Hero Section */}
            <div className="relative z-10 max-w-5xl mx-auto mt-20">
                <div className="inline-flex items-center px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 text-xs font-medium mb-6">
                    <span className="flex w-2 h-2 bg-cyan-400 rounded-full mr-2 animate-pulse"></span>
                    Post-Quantum Cryptography Enabled
                </div>

                <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 leading-tight">
                    Secure Your Digital Life <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-600">
                    Against Future Threats
                    </span>
                </h1>

                <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
                    The world's first decentralized file vault powered by quantum-resistant algorithms.
                    Upload, encrypt, and store your data with military-grade security.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                        onClick={() => navigate('/register')}
                        className="flex items-center justify-center gap-2 px-8 py-4 text-base font-bold text-slate-900 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-xl hover:scale-105 transition-transform shadow-[0_0_20px_rgba(34,211,238,0.4)]"
                    >
                        <UploadCloud className="w-5 h-5" />
                        Get Started
                    </button>

                    <button
                        onClick={() => navigate('/login')}
                        className="flex items-center justify-center gap-2 px-8 py-4 text-base font-medium text-white bg-slate-800/50 border border-slate-600/50 rounded-xl hover:bg-slate-800 backdrop-blur-sm transition-all"
                    >
                        Login
                    </button>
                </div>

                {/* Feature Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 text-left">
                    {[
                        { title: "AES-256 Encryption", desc: "Military-grade encryption.", icon: <Lock className="w-6 h-6 text-blue-400"/> },
                        { title: "Quantum Safe", desc: "Resistant to quantum attacks.", icon: <ShieldCheck className="w-6 h-6 text-cyan-400"/> },
                        { title: "IPFS Storage", desc: "Decentralized & immutable.", icon: <UploadCloud className="w-6 h-6 text-violet-400"/> },
                    ].map((feature, idx) => (
                        <div key={idx} className="p-6 rounded-2xl bg-slate-900/40 border border-white/5 hover:border-cyan-500/30 transition-all backdrop-blur-sm">
                            <div className="mb-4 p-3 bg-slate-800/50 rounded-lg w-fit">
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                            <p className="text-slate-400 text-sm">{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Home;