import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../supabase';
import { Calendar, ArrowRight } from 'lucide-react';

// Komponen untuk menampilkan satu kartu blog (bisa dibuat file terpisah jika mau)
const BlogCard = ({ post }) => (
    <div className="bg-gray-800/50 backdrop-blur-lg border border-white/10 rounded-lg overflow-hidden group transition-all duration-300 hover:border-purple-400/50 hover:scale-[1.02]">
        {post.cover_image_url && (
            <img src={post.cover_image_url} alt={post.title} className="w-full h-48 object-cover" />
        )}
        <div className="p-6">
            <h3 className="text-xl font-bold mb-2 text-white group-hover:text-purple-300 transition-colors">
                <Link to={`/blog/${post.slug}`}>{post.title}</Link>
            </h3>
            <div className="flex items-center text-gray-400 text-sm mb-4">
                <Calendar size={14} className="mr-2" />
                <span>{new Date(post.published_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            </div>
            {/* Anda bisa menambahkan cuplikan konten di sini jika ada di data Anda */}
            <Link to={`/blog/${post.slug}`} className="inline-flex items-center font-semibold text-purple-400 group-hover:text-purple-300">
                Baca Selengkapnya <ArrowRight size={16} className="ml-1" />
            </Link>
        </div>
    </div>
);

const PostsByTagPage = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const { tagName } = useParams(); // Mengambil 'tagName' dari URL

    useEffect(() => {
        const fetchPostsByTag = async () => {
            if (!tagName) return;

            setLoading(true);

            // Query ini akan mengambil semua post yang memiliki tag dengan nama yang sesuai.
            // `tags!inner(name)` memastikan hanya post yang punya tag yang cocok yang akan diambil.
            const { data, error } = await supabase
                .from('posts')
                .select('*, tags!inner(name)')
                .eq('tags.name', tagName)
                .eq('is_published', true) // Hanya tampilkan post yang sudah terbit
                .order('published_at', { ascending: false });

            if (error) {
                console.error("Error fetching posts by tag:", error);
                setPosts([]);
            } else {
                setPosts(data);
            }
            setLoading(false);
        };

        fetchPostsByTag();
    }, [tagName]); // Jalankan ulang efek ini jika tagName berubah

    return (
        <div className="min-h-screen bg-[#030014] text-white pt-24 pb-16">
            <div className="max-w-6xl mx-auto px-4">
                <header className="mb-12 text-center">
                    <p className="text-purple-400 mb-2">Menampilkan Postingan dengan Topik</p>
                    <h1 className="text-4xl sm:text-5xl font-bold capitalize text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
                        {tagName}
                    </h1>
                </header>

                {loading ? (
                    <div className="text-center">Memuat postingan...</div>
                ) : posts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {posts.map(post => (
                            <BlogCard key={post.id} post={post} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-gray-400">
                        <p>Tidak ada postingan yang ditemukan dengan topik ini.</p>
                        <Link to="/blog" className="mt-4 inline-block text-purple-400 hover:underline">
                            Kembali ke Semua Postingan
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PostsByTagPage;
