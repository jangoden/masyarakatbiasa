// src/components/ProtectedRoute.jsx

import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../supabase';

const ProtectedRoute = ({ children }) => {
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setSession(session);
            setLoading(false);
        };

        fetchSession();

        const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);

    if (loading) {
        return <div className="min-h-screen bg-[#030014] flex items-center justify-center text-white">Loading...</div>; // Tampilkan loading
    }

    if (!session) {
        // Jika tidak ada sesi (belum login), arahkan ke halaman login
        return <Navigate to="/login" replace />;
    }

    // Jika sudah login, tampilkan halaman yang diminta (misal: CreatePost)
    return children;
};

export default ProtectedRoute;