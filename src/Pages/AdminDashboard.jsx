import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase'; // Pastikan file ini ada
import Swal from 'sweetalert2';
import { Plus, Edit, Trash2, Eye, EyeOff, Search, RefreshCw, Inbox } from 'lucide-react';

// --- STYLING CONFIGURATION ---
// Konfigurasi terpusat untuk SweetAlert2 agar tema gelap konsisten
const swalTheme = {
    background: '#1f2937', // bg-gray-800
    color: '#e5e7eb', // text-gray-200
    customClass: {
        popup: 'rounded-xl border border-white/10',
        confirmButton: 'px-4 py-2 rounded-lg font-semibold transition-transform hover:scale-105',
        cancelButton: 'px-4 py-2 rounded-lg font-semibold transition-transform hover:scale-105',
    },
    confirmButtonColor: '#a855f7', // purple-500
    cancelButtonColor: '#6b7280', // gray-500
};

const swalToast = {
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    background: '#111827', // bg-gray-900
    color: '#e5e7eb',
    didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
    },
};

// --- CUSTOM HOOK FOR DATA LOGIC ---
// Memisahkan semua logika terkait data post ke dalam hook ini
const usePosts = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchPosts = useCallback(async () => {
        try {
            const { data, error } = await supabase.from('posts').select('*').order('created_at', { ascending: false });
            if (error) throw error;
            setPosts(data || []);
        } catch (error) {
            Swal.fire({
                ...swalTheme,
                icon: 'error',
                title: 'Fetch Error',
                text: `Failed to load posts: ${error.message}`,
            });
        }
    }, []);

    useEffect(() => {
        setLoading(true);
        fetchPosts().finally(() => setLoading(false));
    }, [fetchPosts]);

    const refreshPosts = async () => {
        setRefreshing(true);
        await fetchPosts();
        setRefreshing(false);
    };

    const deletePost = async (postId, postTitle) => {
        const result = await Swal.fire({
            ...swalTheme,
            title: `Delete "${postTitle}"?`,
            text: "This action cannot be undone!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
        });

        if (result.isConfirmed) {
            try {
                const { error } = await supabase.from('posts').delete().eq('id', postId);
                if (error) throw error;
                await fetchPosts(); // Re-fetch data
                Swal.fire({ ...swalToast, icon: 'success', title: 'Post deleted successfully!' });
            } catch (error) {
                Swal.fire({ ...swalTheme, icon: 'error', title: 'Delete Failed!', text: `An error occurred: ${error.message}` });
            }
        }
    };

    const togglePublishPost = async (postId, isPublished) => {
        const newStatus = !isPublished;
        try {
            const { error } = await supabase.from('posts').update({ is_published: newStatus }).eq('id', postId);
            if (error) throw error;
            setPosts((current) => current.map(p => p.id === postId ? { ...p, is_published: newStatus } : p));
            Swal.fire({ ...swalToast, icon: 'success', title: `Post ${newStatus ? 'published' : 'unpublished'}!` });
        } catch (error) {
            Swal.fire({ ...swalTheme, icon: 'error', title: 'Update Failed!', text: `Could not update post: ${error.message}` });
        }
    };

    return { posts, loading, refreshing, refreshPosts, deletePost, togglePublishPost };
};


// --- UI COMPONENTS ---

const LoadingSpinner = () => (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-400">
        <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-lg font-medium">Loading Dashboard...</p>
    </div>
);

const EmptyState = ({ searchTerm }) => (
    <div className="flex flex-col items-center justify-center py-16 text-center text-gray-400">
        {searchTerm ? (
            <>
                <Search size={48} className="mb-4 text-gray-500" />
                <h3 className="text-xl font-semibold text-white">No Results Found</h3>
                <p>Your search for "{searchTerm}" did not return any results.</p>
            </>
        ) : (
            <>
                <Inbox size={48} className="mb-4 text-gray-500" />
                <h3 className="text-xl font-semibold text-white">No Posts Yet</h3>
                <p>Click the "Create New Post" button to get started.</p>
            </>
        )}
    </div>
);

const DashboardHeader = () => (
    <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
            Admin Dashboard
        </h1>
        <p className="text-gray-400 mt-2 text-lg">Manage all your blog posts in one place.</p>
    </div>
);

const ActionsBar = ({ searchTerm, setSearchTerm, onRefresh, refreshing }) => (
    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <Link
            to="/admin/create"
            className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:from-purple-500 hover:to-pink-500 transition-all duration-300 shadow-lg shadow-purple-500/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 focus:ring-offset-gray-900"
        >
            <Plus size={20} />
            Create New Post
        </Link>
        <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-grow">
                <input
                    type="text"
                    placeholder="Search posts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full md:w-72 px-4 py-3 pl-10 rounded-lg bg-black/20 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all duration-300"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
            <button
                onClick={onRefresh}
                className="p-3 rounded-lg bg-black/20 border border-white/10 text-gray-400 hover:text-white hover:bg-black/30 hover:border-purple-500 transition-all duration-300"
                disabled={refreshing}
                aria-label="Refresh posts"
            >
                <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
        </div>
    </div>
);

const PostStatus = ({ published }) => (
    published ? (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-green-500/20 text-green-300">
            <Eye size={14} /> Published
        </span>
    ) : (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-300">
            <EyeOff size={14} /> Draft
        </span>
    )
);

// Komponen Baris Tabel untuk Desktop
const PostRow = ({ post, onTogglePublish, onDelete, onEdit }) => (
    <tr className="hover:bg-white/5 transition-colors duration-200">
        <td className="px-6 py-4 font-medium text-white align-middle">{post.title}</td>
        <td className="px-6 py-4 hidden sm:table-cell align-middle">
            <PostStatus published={post.is_published} />
        </td>
        <td className="px-6 py-4 hidden md:table-cell align-middle">
            <Link
                to={`/blog/${post.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                title="View post"
                className="flex items-center justify-center gap-2 text-gray-400 rounded-md py-1 px-2 transition-colors hover:bg-white/10 hover:text-white"
            >
                <Eye size={16} />
                <span>{post.view_count || 0}</span>
            </Link>
        </td>
        <td className="px-6 py-4 align-middle">
            <div className="flex justify-end items-center gap-3">
                <button onClick={() => onTogglePublish(post.id, post.is_published)} className="text-gray-400 hover:text-white transition-colors" title={post.is_published ? "Unpublish" : "Publish"}>
                    {post.is_published ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
                <button onClick={() => onEdit(post.id)} className="text-gray-400 hover:text-blue-400 transition-colors" title="Edit">
                    <Edit size={18} />
                </button>
                <button onClick={() => onDelete(post.id, post.title)} className="text-gray-400 hover:text-red-400 transition-colors" title="Delete">
                    <Trash2 size={18} />
                </button>
            </div>
        </td>
    </tr>
);

// Komponen Kartu yang Didesain Ulang untuk Mobile
const PostCard = ({ post, onTogglePublish, onDelete, onEdit }) => (
    <div className="bg-white/5 border border-white/10 rounded-lg p-4 flex flex-col">
        <div className="flex-grow">
            <h3 className="text-lg font-semibold text-white mb-2">{post.title}</h3>
            <div className="flex justify-between items-center text-sm text-gray-400">
                <PostStatus published={post.is_published} />
                <Link
                    to={`/blog/${post.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 hover:text-white"
                >
                    <Eye size={16} />
                    <span>{post.view_count || 0} views</span>
                </Link>
            </div>
        </div>
        <div className="border-t border-white/10 mt-4 pt-4 flex justify-end items-center gap-3">
            <button onClick={() => onTogglePublish(post.id, post.is_published)} className="text-gray-400 hover:text-white transition-colors" title={post.is_published ? "Unpublish" : "Publish"}>
                {post.is_published ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
            <button onClick={() => onEdit(post.id)} className="text-gray-400 hover:text-blue-400 transition-colors" title="Edit">
                <Edit size={20} />
            </button>
            <button onClick={() => onDelete(post.id, post.title)} className="text-gray-400 hover:text-red-400 transition-colors" title="Delete">
                <Trash2 size={20} />
            </button>
        </div>
    </div>
);

// --- MAIN COMPONENT ---
const AdminDashboard = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();
    const { posts, loading, refreshing, refreshPosts, deletePost, togglePublishPost } = usePosts();

    const handleEdit = (postId) => {
        navigate(`/admin/edit/${postId}`);
    };

    const filteredPosts = posts.filter((post) =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <LoadingSpinner />;

    return (
        <div className="bg-gray-900 text-white min-h-screen p-4 sm:p-8">
            <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 space-y-8">
                <DashboardHeader />

                <div className="bg-black/20 backdrop-blur-lg border border-white/10 p-4 rounded-xl shadow-2xl shadow-black/20">
                    <ActionsBar
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                        onRefresh={refreshPosts}
                        refreshing={refreshing}
                    />
                </div>

                <div className="bg-black/20 backdrop-blur-lg border border-white/10 rounded-xl shadow-2xl shadow-black/20 overflow-hidden">
                    {filteredPosts.length > 0 ? (
                        <>
                            {/* Tampilan Tabel untuk Desktop (md and up) */}
                            <div className="hidden md:block overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-white/5">
                                        <tr>
                                            <th className="px-6 py-4 text-sm font-semibold text-gray-300 uppercase tracking-wider">Title</th>
                                            <th className="px-6 py-4 text-sm font-semibold hidden sm:table-cell text-gray-300 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-4 text-sm font-semibold hidden md:table-cell text-gray-300 uppercase tracking-wider text-center">Views</th>
                                            <th className="px-6 py-4 text-sm font-semibold text-gray-300 uppercase tracking-wider text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/10">
                                        {filteredPosts.map(post => (
                                            <PostRow
                                                key={post.id}
                                                post={post}
                                                onTogglePublish={togglePublishPost}
                                                onDelete={deletePost}
                                                onEdit={handleEdit}
                                            />
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Tampilan Kartu untuk Mobile (below md) */}
                            <div className="md:hidden space-y-4 p-4">
                                {filteredPosts.map(post => (
                                    <PostCard
                                        key={post.id}
                                        post={post}
                                        onTogglePublish={togglePublishPost}
                                        onDelete={deletePost}
                                        onEdit={handleEdit}
                                    />
                                ))}
                            </div>
                        </>
                    ) : (
                        <EmptyState searchTerm={searchTerm} />
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;