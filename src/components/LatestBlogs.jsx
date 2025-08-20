import React, { useState, useEffect, memo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar } from 'lucide-react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { supabase } from '../supabase'; // Pastikan path ini benar

// Komponen Card untuk setiap postingan blog
const HomeBlogCard = memo(({ post, delay }) => {
    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric', month: 'long', year: 'numeric'
        });
    };

    const createExcerpt = (htmlContent, length = 100) => {
        if (!htmlContent) return '';
        const text = htmlContent.replace(/<[^>]+>/g, '');
        return text.length > length ? text.substring(0, length) + '...' : text;
    };

    return (
        <div data-aos="fade-up" data-aos-delay={delay}>
            <Link to={`/blog/${post.slug}`} className="block group bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 overflow-hidden transition-all duration-300 hover:border-purple-500/50 hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/10 h-full flex flex-col">
                <div className="overflow-hidden">
                    <img src={post.cover_image_url || 'https://placehold.co/600x400/030014/FFF?text=Blog'} alt={post.title} className="w-full h-48 object-cover transition-all duration-500 group-hover:scale-110" loading="lazy" />
                </div>
                <div className="p-5 flex flex-col flex-grow">
                    <h3 className="font-bold text-xl text-gray-100 mb-2 truncate group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r from-[#a855f7] to-[#6366f1] transition-colors duration-300">
                        {post.title}
                    </h3>
                    <p className="text-gray-400 text-sm leading-relaxed line-clamp-3 mb-4 flex-grow">
                        {createExcerpt(post.content, 120)}
                    </p>
                    <div className="flex items-center text-xs text-gray-500 mt-auto pt-2 border-t border-white/10">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>{formatDate(post.published_at || post.created_at)}</span>
                    </div>
                </div>
            </Link>
        </div>
    );
});

// Komponen utama untuk section blog
const LatestBlogs = () => {
    const [latestPosts, setLatestPosts] = useState([]);

    useEffect(() => {
        AOS.init({ once: true, offset: 50 });

        const fetchLatestPosts = async () => {
            try {
                const { data, error } = await supabase
                    .from('posts')
                    .select('title, slug, content, cover_image_url, published_at, created_at')
                    .eq('is_published', true)
                    .order('published_at', { ascending: false, nullsFirst: false })
                    .order('created_at', { ascending: false })
                    .limit(3);

                if (error) throw error;
                setLatestPosts(data || []);
            } catch (error) {
                console.error("Error fetching latest posts:", error.message);
            }
        };

        fetchLatestPosts();
    }, []);

    // Jangan tampilkan section sama sekali jika tidak ada post
    if (latestPosts.length === 0) {
        return null;
    }

    return (
        <div className="py-24 px-[5%] sm:px-[5%] lg:px-[10%]" data-aos="fade-up">
            <div className="text-center mb-12">
                <h2 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#6366f1] to-[#a855f7]">
                    My Blog
                </h2>
                <p className="mt-4 text-gray-400 max-w-2xl mx-auto">
                    "A collection of my writings and reflections—sometimes sharing knowledge, sometimes personal confessions."
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {latestPosts.map((post, index) => (
                    <HomeBlogCard key={post.id} post={post} delay={index * 150} />
                ))}
            </div>

            <div className="text-center mt-16" data-aos="fade-up" data-aos-delay="450">
                <Link to="/blog" className="group inline-flex items-center gap-1 px-4 py-2 rounded-lg text-gray-400 font-medium transition-all duration-300 bg-[#030014]/80 hover:bg-[#030014] border border-white/10 hover:border-white/20 text-sm">
                    See More
                    <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
            </div>
        </div>
    );
};

export default LatestBlogs;
