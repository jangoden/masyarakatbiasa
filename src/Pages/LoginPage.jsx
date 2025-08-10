// src/pages/LoginPage.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { supabase } from '../supabase';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email,
                password: password,
            });

            if (error) throw error;

            // --- VERIFIKASI PENTING ---
            // Baris ini akan mencetak ID user yang baru saja berhasil login
            console.log("LOGIN BERHASIL! User ID:", data.user.id);
            // -------------------------

            // Jika berhasil, arahkan ke halaman admin
            navigate('/admin');
        } catch (error) {
            Swal.fire('Login Gagal', error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#030014] text-white flex items-center justify-center">
            <div className="max-w-md w-full mx-auto p-8 bg-gray-900/50 backdrop-blur-lg border border-white/10 rounded-lg">
                <h2 className="text-3xl font-bold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-[#6366f1] to-[#a855f7]">
                    Admin Login
                </h2>
                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium mb-2">Email</label>
                        <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                            className="w-full bg-white/10 border border-gray-700 rounded-md p-3 focus:ring-purple-500 focus:border-purple-500 transition" />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium mb-2">Password</label>
                        <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required
                            className="w-full bg-white/10 border border-gray-700 rounded-md p-3 focus:ring-purple-500 focus:border-purple-500 transition" />
                    </div>
                    <button type="submit" disabled={loading}
                        className="w-full px-6 py-3 bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white rounded-md font-semibold transition-all duration-300 hover:scale-[1.02] disabled:opacity-50">
                        {loading ? 'Loading...' : 'Login'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;