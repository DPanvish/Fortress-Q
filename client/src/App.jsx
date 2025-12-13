import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/HomePage';
import Dashboard from './pages/Dashboard';
import Wallet from './pages/Wallet';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Migration from "./pages/Migration.jsx";
import PrivateRoute from './components/PrivateRoute';
import AttackSimulator from "./pages/AttackSimulator.jsx";
import Simulator from "./pages/Simulator.jsx";

const App = () => {
    return (
        <Router>
            <div className="min-h-screen bg-slate-950 text-slate-200 antialiased selection:bg-cyan-500/30">
                {/* Background Effects */}
                <div className="fixed top-0 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-[128px] pointer-events-none z-0" />
                <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-[128px] pointer-events-none z-0" />

                <Routes>
                    {/* PUBLIC ROUTES (Anyone can see these) */}
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />

                    {/* PROTECTED ROUTES (Must be logged in) */}
                    <Route element={<PrivateRoute />}>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/wallet" element={<Wallet />} />
                        <Route path="/migration" element={<Migration />} />
                        <Route path="/simulator" element={<Simulator />} />
                    </Route>
                </Routes>

            </div>
        </Router>
    )
}
export default App
