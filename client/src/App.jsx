import React from 'react';
import { ShieldCheck, Lock, UploadCloud, ChevronRight, Github} from "lucide-react";
import FileUpload from "./components/FileUpload";

const App = () => {
    return (
        <div className="min-h-screen relative overflow-hidden flex flex-col">

            {/* Background Glow */}
            <div className="fixed top-0 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-[128px] pointer-events-none" />
            <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-[128px] pointer-events-none" />

            {/* Navbar */}
            <nav className="w-full z-50 border-b border-white/10 bg-slate-950/50 backdrop-blur-md">
                <div className="max-w-7xl mx-auto flex items-center justify-between p-4">
                    <div className="flex items-center space-x-2">
                        <div className="bg-gradient-to-tr from-cyan-400 to-violet-500 p-2 rounded-lg">
                            <ShieldCheck className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-2xl font-bold text-white tracking-wide">
                        Fortress
                            <span className="text-cyan-400">Q</span>
                        </span>
                    </div>
                    <button className="text-slate-950 bg-cyan-400 hover:bg-cyan-300 font-bold rounded-lg text-sm px-4 py-2 transition-all shadow-[0_0_15px_rgba(34,211,238,0.5)]">
                        Connect Wallet
                    </button>
                </div>
            </nav>

            {/* Main Content */}
            <main className="flex-grow flex items-center justify-center p-6 relative z-10">
                <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

                    {/* Left Side: Text */}
                    <div className="text-left space-y-6">
                        <div className="inline-flex items-center px-3 py-1 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 text-xs font-medium">
                            <span className="flex w-2 h-2 bg-violet-400 rounded-full mr-2 animate-pulse"></span>
                            Secure Dashboard
                        </div>
                        <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight">
                            Upload Sensitive Data <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-500">
                                Without Fear.
                            </span>
                        </h1>
                        <p className="text-slate-400 text-lg max-w-lg">
                            Files are encrypted client-side using post-quantum algorithms before ever leaving your device.
                        </p>
                    </div>

                    {/* Right Side: The Upload Component */}
                    <div>
                        <FileUpload />
                    </div>

                </div>
            </main>
        </div>
    )
}
export default App
