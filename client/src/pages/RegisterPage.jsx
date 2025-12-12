import React, {useState} from 'react'
import {useNavigate} from "react-router-dom";
import axios from "axios";
import {Loader2} from "lucide-react";

const RegisterPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({username: "", email: "", password: ""});
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState("");

    const handleChange = (e) => {
        setFormData({...formData, [e.target.name]: e.target.value});
    }

    const handleSubmit = async(e) => {
        e.preventDefault();
        setLoading(true);
        setStatus("Initializing Quantum Key Generation...");

        try{
            setTimeout(() => setStatus("Generating Elliptic Curve Keys (Legacy)..."), 800);
            setTimeout(() => setStatus("Generating Kyber-1024 Lattice Keys (Quantum Safe)..."), 1800);

            setTimeout(async() => {
                const res = await axios.post("http://localhost:5000/api/auth/register", formData);
                localStorage.setItem("token", res.data.token);
                navigate("/dashboard");
            }, 3000);
        }catch(err){
            console.error(err);
            setStatus("Error: " + (err.response?.data?.msg || "Registration Failed"));
            setLoading(false);
        }
    }
    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-4">
            {/* Background Effects */}
            <div className="fixed top-0 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-[128px] pointer-events-none" />
            <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-[128px] pointer-events-none" />

            <div className="bg-slate-900/50 backdrop-blur-xl p-8 rounded-2xl border border-white/10 shadow-2xl w-full max-w-md relative z-10">
                <div className="text-center mb-8">
                    <div className="inline-flex p-3 bg-gradient-to-tr from-cyan-400 to-violet-500 rounded-xl mb-4 shadow-lg shadow-cyan-500/20">
                        <ShieldCheck className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-white">Create Identity</h2>
                    <p className="text-slate-400 mt-2">Join the Post-Quantum Era</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="relative">
                        <User className="absolute left-3 top-3.5 w-5 h-5 text-slate-500" />
                        <input type="text" name="username" placeholder="Username" onChange={handleChange} required
                               className="w-full pl-10 pr-4 py-3 bg-slate-950/50 border border-slate-700 rounded-lg text-white focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none transition" />
                    </div>
                    <div className="relative">
                        <Mail className="absolute left-3 top-3.5 w-5 h-5 text-slate-500" />
                        <input type="email" name="email" placeholder="Email Address" onChange={handleChange} required
                               className="w-full pl-10 pr-4 py-3 bg-slate-950/50 border border-slate-700 rounded-lg text-white focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none transition" />
                    </div>
                    <div className="relative">
                        <Lock className="absolute left-3 top-3.5 w-5 h-5 text-slate-500" />
                        <input type="password" name="password" placeholder="Password" onChange={handleChange} required
                               className="w-full pl-10 pr-4 py-3 bg-slate-950/50 border border-slate-700 rounded-lg text-white focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none transition" />
                    </div>

                    <button type="submit" disabled={loading}
                            className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-lg shadow-lg shadow-cyan-500/20 transition-all active:scale-[0.98] flex justify-center items-center gap-2">
                        {loading ? <><Loader2 className="animate-spin w-5 h-5" /> Processing...</> : "Generate Hybrid Keys"}
                    </button>
                </form>

                {loading && (
                    <div className="mt-4 text-center text-xs text-cyan-400 animate-pulse font-mono">
                        {status}
                    </div>
                )}

                <div className="mt-6 text-center">
                    <p className="text-slate-400 text-sm">
                        Already have an identity? <Link to="/login" className="text-cyan-400 hover:underline">Login</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
export default RegisterPage
