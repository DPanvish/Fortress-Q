import React from 'react';
import { ShieldCheck, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import FileUpload from '../components/FileUpload';

const Dashboard = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen relative overflow-hidden flex flex-col">
            {/* Navbar for Dashboard */}
            <nav className="w-full z-50 border-b border-white/10 bg-slate-950/50 backdrop-blur-md">
                <div className="max-w-7xl mx-auto flex items-center justify-between p-4">
                    <div
                        className="flex items-center space-x-2 cursor-pointer hover:opacity-80 transition"
                        onClick={() => navigate('/')}
                    >
                        <div className="bg-gradient-to-tr from-cyan-400 to-violet-500 p-2 rounded-lg">
                            <ShieldCheck className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-2xl font-bold text-white tracking-wide">
                        Fortress <span className="text-cyan-400">Q</span>
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/')}
                            className="text-slate-400 hover:text-white text-sm font-medium transition"
                        >
                            Logout
                        </button>
                        <button className="text-slate-950 bg-cyan-400 hover:bg-cyan-300 font-bold rounded-lg text-sm px-4 py-2 transition-all shadow-[0_0_15px_rgba(34,211,238,0.5)]">
                            Wallet Connected
                        </button>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="flex-grow flex items-center justify-center p-6 relative z-10">
                <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

                    <div className="text-left space-y-6">
                        <button onClick={() => navigate('/')} className="flex items-center text-slate-400 hover:text-cyan-400 transition mb-4">
                            <ChevronLeft className="w-4 h-4 mr-1"/> Back to Home
                        </button>
                        <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight">
                            Secure Upload <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-500">
                                Dashboard
                            </span>
                        </h1>
                        <p className="text-slate-400 text-lg max-w-lg">
                            Files are encrypted client-side. The server never sees your raw data.
                            Drag and drop your files to begin the quantum encryption process.
                        </p>
                    </div>

                    <div>
                        <FileUpload />
                    </div>

                </div>
            </main>
        </div>
    );
};

export default Dashboard;