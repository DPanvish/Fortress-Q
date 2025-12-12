import React from 'react';
import { FileText, Download, Lock, HardDrive } from 'lucide-react';

const FileList = ({ files, onDownload }) => {
    if (files.length === 0) {
        return (
            <div className="text-center p-8 border border-dashed border-slate-700 rounded-2xl bg-slate-900/30">
                <div className="inline-flex p-4 rounded-full bg-slate-800 mb-4">
                    <HardDrive className="w-6 h-6 text-slate-500" />
                </div>
                <p className="text-slate-400">Your Quantum Vault is empty.</p>
            </div>
        );
    }

    return (
        <div className="bg-slate-900/50 backdrop-blur-md rounded-2xl border border-white/5 overflow-hidden">
            <div className="p-6 border-b border-white/5">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Lock className="w-5 h-5 text-cyan-400" /> Stored Artifacts
                </h3>
            </div>

            <div className="divide-y divide-white/5">
                {files.map((file) => (
                    <div key={file._id} className="p-4 flex items-center justify-between hover:bg-white/5 transition group">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-slate-800 rounded-lg group-hover:bg-cyan-500/20 group-hover:text-cyan-400 transition">
                                <FileText className="w-6 h-6 text-slate-400 group-hover:text-cyan-400" />
                            </div>
                            <div>
                                <p className="text-white font-medium">{file.originalName}</p>
                                <div className="flex gap-3 text-xs text-slate-500">
                                    <span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                                    <span>•</span>
                                    <span className="font-mono text-cyan-500/70">IPFS: {file.ipfsHash.substring(0, 8)}...</span>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => onDownload(file)}
                            className="p-2 text-slate-400 hover:text-white hover:bg-cyan-500 rounded-lg transition-all flex items-center gap-2 text-sm font-medium"
                        >
                            <Download className="w-4 h-4" />
                            <span className="hidden md:inline">Decrypt & Download</span>
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FileList;