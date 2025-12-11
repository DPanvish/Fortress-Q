import React, {useCallback, useState} from 'react'

const FileUpload = () => {
    const [dragActive, setDragActive] = useState(false);
    const [files, setFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);

    // Handle drag events
    const handleDrag = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();

        if(e.type === "dragenter" || e.type === "dragover"){
            setDragActive(true);
        }else if(e.type === "dragleave"){
            setDragActive(false);
        }
    }, []);

    // Handle drop
    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if(e.dataTransfer.files && e.dataTransfer.files[0]){
            handleFiles(e.dataTransfer.files);
        }
    }, []);

    // Handle manual file selection
    const handleChange = (e) => {
        e.preventDefault();
        if(e.target.files && e.target.files[0]){
            handleFiles(e.target.files);
        }
    }

    // Handle file uploads
    const handleFiles = (newFiles) => {
        const fileArray = Array.from(newFiles).map(file => ({
            name: file.name,
            size: (file.size / 1024 / 1024).toFixed(2), // MB
            type: file.type
        }));
        setFiles(prevFiles => [...prevFiles, ...fileArray]);
    }

    // Handle remove file
    const removeFile = (fileName) => {
        setFiles(prevFiles => prevFiles.filter(file => file.name !== fileName));
    }

    // Simulate file upload
    const startUpload = () => {
        setUploading(true);
        let curr = 0;
        const interval = setInterval(() => {
            curr += 5;
            setProgress(curr);
            if(curr >= 100){
                clearInterval(interval);
                setUploading(false);
            }
        }, 100)
    }


    return (
        <div className="w-full max-w-xl mx-auto">
            {/* Glass Card Container */}
            <div className="relative group rounded-2xl p-0.5 bg-gradient-to-b from-cyan-500/20 to-violet-500/20">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-violet-500/10 blur-xl opacity-50 group-hover:opacity-100 transition duration-500"></div>

                <div className="relative bg-slate-950/90 backdrop-blur-xl rounded-2xl p-8 border border-white/5 shadow-2xl">

                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-white">Upload Documents</h2>
                            <p className="text-slate-400 text-sm mt-1">AES-256 Encryption & IPFS Storage</p>
                        </div>
                        <div className="p-2 bg-slate-800 rounded-lg border border-slate-700">
                            <Shield className="w-5 h-5 text-cyan-400" />
                        </div>
                    </div>

                    {/* Drag & Drop Zone */}
                    <div
                        className={`relative border-2 border-dashed rounded-xl p-8 transition-all duration-300 ease-in-out text-center cursor-pointer overflow-hidden
                        ${dragActive
                            ? 'border-cyan-400 bg-cyan-400/5'
                            : 'border-slate-700 hover:border-slate-500 hover:bg-slate-800/30'}
                        `}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                    >
                        <input
                            type="file"
                            multiple
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            onChange={handleChange}
                        />

                        <div className="flex flex-col items-center justify-center space-y-4">
                            <div className={`p-4 rounded-full bg-slate-900 border transition-all duration-300
                ${dragActive ? 'border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.3)]' : 'border-slate-700'}`}>
                                <UploadCloud className={`w-8 h-8 ${dragActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                            </div>
                            <div className="space-y-1">
                                <p className="text-slate-300 font-medium">
                                    Click to upload or drag and drop
                                </p>
                                <p className="text-slate-500 text-xs">
                                    SVG, PNG, JPG or PDF (MAX. 800x400px)
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* File List */}
                    {files.length > 0 && (
                        <div className="mt-6 space-y-3">
                            {files.map((file, index) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-slate-900 border border-slate-800 rounded-lg group hover:border-slate-700 transition-all">
                                    <div className="flex items-center space-x-3">
                                        <div className="p-2 bg-slate-800 rounded">
                                            <File className="w-4 h-4 text-violet-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-slate-200 truncate max-w-[150px]">{file.name}</p>
                                            <p className="text-xs text-slate-500">{file.size} MB</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => removeFile(file.name)}
                                        className="p-1 hover:bg-slate-800 rounded text-slate-500 hover:text-red-400 transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Progress Bar (Visible only during upload) */}
                    {(uploading || progress > 0) && (
                        <div className="mt-6">
                            <div className="flex justify-between text-xs mb-1">
                                <span className="text-cyan-400 font-semibold">Encrypting & Uploading...</span>
                                <span className="text-slate-400">{progress}%</span>
                            </div>
                            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                                <div
                                    className="bg-gradient-to-r from-cyan-400 to-violet-500 h-2 rounded-full transition-all duration-300 ease-out shadow-[0_0_10px_rgba(139,92,246,0.5)]"
                                    style={{ width: `${progress}%` }}
                                ></div>
                            </div>
                        </div>
                    )}

                    {/* Action Button */}
                    {files.length > 0 && progress === 0 && (
                        <button
                            onClick={startUpload}
                            className="mt-6 w-full py-3 bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white font-bold rounded-xl shadow-lg shadow-cyan-500/20 transition-all active:scale-[0.98]"
                        >
                            Encrypt & Upload to IPFS
                        </button>
                    )}

                    {progress === 100 && (
                        <div className="mt-6 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center gap-3 text-emerald-400 text-sm">
                            <CheckCircle className="w-5 h-5" />
                            <span>Upload Complete! Hash: QmX7...9z</span>
                        </div>
                    )}

                </div>
            </div>
        </div>
    )
}
export default FileUpload
