// src/pages/Blog.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabase';
import BlogCard from '../components/BlogCard';
import { Sparkles, Search } from 'lucide-react'; // Impor ikon Search
import AOS from 'aos';
import 'aos/dist/aos.css';

const Blog = () => {
  const [posts, setPosts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);

  // Fungsi untuk mengambil data post, sekarang bisa menerima query pencarian
  const fetchPosts = useCallback(async (query) => {
    // Set loading state based on whether it's an initial load or a search
    if (query) {
      setIsSearching(true);
    } else {
      setLoading(true);
    }

    try {
      let queryBuilder = supabase
        .from('posts')
        .select('*')
        .eq('is_published', true)
        .order('published_at', { ascending: false });

      // Jika ada query pencarian, tambahkan filter pencarian ke Supabase
      if (query) {
        // 'ilike' untuk pencarian case-insensitive yang mengandung query
        queryBuilder = queryBuilder.ilike('title', `%${query}%`);
      }

      const { data, error } = await queryBuilder;

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error.message);
    } finally {
      setLoading(false);
      setIsSearching(false);
    }
  }, []);

  // useEffect untuk "debouncing" agar tidak melakukan pencarian pada setiap ketikan
  useEffect(() => {
    // Inisialisasi AOS dan fetch data awal saat komponen pertama kali dimuat
    AOS.init({ once: false });
    fetchPosts(''); // Fetch semua post saat pertama kali load

    const handler = setTimeout(() => {
      // Hanya jalankan pencarian jika ada query
      if (searchQuery) {
        fetchPosts(searchQuery);
      }
    }, 500); // Tunggu 500ms setelah pengguna berhenti mengetik

    // Bersihkan timeout jika pengguna mengetik lagi sebelum 500ms
    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery, fetchPosts]);


  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    // Jika input pencarian kosong, langsung muat ulang semua postingan
    if (query === '') {
      fetchPosts('');
    }
  };

  return (
    <div className="min-h-screen bg-[#030014] text-white overflow-hidden px-[5%] sm:px-[5%] lg:px-[10%] pt-24 pb-16" id="Blog">
      {/* Header */}
      <div className="text-center lg:mb-16 mb-12">
        <h2
          className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#6366f1] to-[#a855f7]"
          data-aos="zoom-in-up" data-aos-duration="600"
        >
          My Article
        </h2>
        <p
          className="mt-4 text-gray-400 max-w-2xl mx-auto text-base sm:text-lg flex items-center justify-center gap-2"
          data-aos="zoom-in-up" data-aos-duration="800"
        >
          <Sparkles className="w-5 h-5 text-purple-400" />
          "A collection of my writings and reflections—sometimes sharing knowledge, sometimes personal confessions."
          <Sparkles className="w-5 h-5 text-purple-400" />
        </p>
      </div>

      {/* Search Bar dengan Ikon */}
      <div className="mb-12 max-w-lg mx-auto">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-5 w-5 text-gray-500" />
          </span>
          <input
            type="text"
            placeholder="Cari artikel berdasarkan judul..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full p-3 pl-10 rounded-lg bg-gray-800/50 border border-white/10 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300"
          />
        </div>
      </div>

      {/* Konten Blog */}
      <div className="container mx-auto">
        {loading ? (
          <p className="text-center text-gray-400">Memuat artikel...</p>
        ) : isSearching ? (
          <p className="text-center text-gray-400">Mencari...</p>
        ) : posts.length === 0 ? (
              <p className="text-center text-gray-400">
                {searchQuery ? `Tidak ada artikel yang cocok dengan pencarian "${searchQuery}".` : "Belum ada artikel."}
              </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post, index) => (
              <BlogCard
                key={post.id}
                post={post}
                animation={index % 3 === 0 ? "fade-right" : index % 3 === 1 ? "fade-up" : "fade-left"}
                duration={index % 3 === 1 ? "1200" : "1000"}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Blog;
