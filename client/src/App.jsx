import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/HomePage';
import Dashboard from './pages/Dashboard';

const App = () => {
    return (
        <Router>
            <div className="min-h-screen bg-slate-950 text-slate-200 antialiased selection:bg-cyan-500/30">

                {/* Global Background Glow Effects */}
                <div className="fixed top-0 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-[128px] pointer-events-none z-0" />
                <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-[128px] pointer-events-none z-0" />

                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                </Routes>

            </div>
        </Router>
    )
}
export default App
