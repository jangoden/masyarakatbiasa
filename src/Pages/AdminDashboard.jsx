import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase'; // Assuming your supabase client is configured here
import Swal from 'sweetalert2';
import { Plus, Edit, Trash2, Eye, EyeOff, Search, RefreshCw, AlertCircle, Inbox } from 'lucide-react';

// --- Helper & UI Components ---

// A more visually appealing loading spinner
const LoadingSpinner = () => (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-400">
        <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-lg font-medium">Loading Dashboard...</p>
    </div>
);

// A component to handle empty states (no posts or no search results)
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

// --- Main Components ---

const DashboardHeader = () => (
    <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
            Dashboard
        </h1>
        <p className="text-gray-400 mt-2 text-lg">
            Manage all your blog posts in one place.
        </p>
    </div>
);

const ActionsBar = ({ searchTerm, setSearchTerm, onRefresh, refreshing }) => (
    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <Link
            to="/admin/create" // Updated the path to '/admin/create'
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

const PostRow = ({ post, onTogglePublish, onDelete, onEdit }) => (
    <tr className="hover:bg-white/5 transition-colors duration-200">
        <td className="px-6 py-4 font-medium text-white align-middle">
            {post.title}
        </td>
        <td className="px-6 py-4 hidden sm:table-cell align-middle">
            {post.is_published ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-green-500/20 text-green-300">
                    <Eye size={14} /> Published
                </span>
            ) : (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-300">
                    <EyeOff size={14} /> Draft
                </span>
            )}
        </td>
        <td className="px-6 py-4 hidden md:table-cell align-middle text-center">
            {/* Dibungkus dengan <Link> agar bisa di-klik */}
            <Link
                to={`/blog/${post.slug}`}
                target="_blank" // Membuka di tab baru
                rel="noopener noreferrer" // Praktik keamanan untuk target="_blank"
                title="Lihat postingan publik"
                className="flex items-center justify-center gap-2 text-gray-400 rounded-md py-1 px-2 transition-colors hover:bg-white/10 hover:text-white"
            >
                <Eye size={16} />
                <span>{post.view_count || 0}</span>
            </Link>
        </td>
        <td className="px-6 py-4 align-middle">
            <div className="flex justify-end items-center gap-2">
                <button
                    onClick={() => onTogglePublish(post.id, post.is_published)}
                    className="p-2 rounded-lg transition-colors ..."
                    title="Ubah status publikasi"
                >
                    {post.is_published ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
                <button
                    onClick={() => onEdit(post.id)}
                    className="p-2 rounded-lg text-blue-400 ..."
                    title="Edit postingan"
                >
                    <Edit size={18} />
                </button>
                <button
                    onClick={() => onDelete(post.id, post.title)}
                    className="p-2 rounded-lg text-red-400 ..."
                    title="Hapus postingan"
                >
                    <Trash2 size={18} />
                </button>
            </div>
        </td>
    </tr>
);


const AdminDashboard = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [refreshing, setRefreshing] = useState(false);
    const navigate = useNavigate();

    // Custom styles for SweetAlert2
    useEffect(() => {
        const style = document.createElement('style');
        style.innerHTML = `
            .swal2-popup {
                background-color: #1f2937 !important;
                color: #e5e7eb !important;
                border-radius: 1rem !important;
                border: 1px solid rgba(255, 255, 255, 0.1) !important;
            }
            .swal2-title {
                color: #ffffff !important;
            }
            .swal2-html-container {
                color: #d1d5db !important;
            }
            .swal2-confirm, .swal2-cancel {
                border-radius: 0.5rem !important;
                font-weight: 600 !important;
                transition: transform 0.2s;
            }
            .swal2-confirm:hover, .swal2-cancel:hover {
                transform: scale(1.05);
            }
        `;
        document.head.appendChild(style);
        return () => {
            document.head.removeChild(style);
        };
    }, []);


    const fetchPosts = useCallback(async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('posts')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setPosts(data || []);
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Fetch Error',
                text: `Failed to load posts: ${error.message}`,
            });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchPosts();
        // Give a bit of time for the animation to be noticeable
        setTimeout(() => setRefreshing(false), 500);
    };

    const handleEdit = (postId) => {
        navigate(`/admin/edit/${postId}`);
    };

    const handleDelete = async (postId, postTitle) => {
        const result = await Swal.fire({
            title: `Delete "${postTitle}"?`,
            text: "This action cannot be undone!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel'
        });

        if (result.isConfirmed) {
            try {
                const { error } = await supabase.from('posts').delete().eq('id', postId);
                if (error) throw error;
                Swal.fire('Deleted!', 'The post has been successfully deleted.', 'success');
                fetchPosts(); // Refresh list after deleting
            } catch (error) {
                Swal.fire('Failed!', `An error occurred: ${error.message}`, 'error');
            }
        }
    };

    const handleTogglePublish = async (postId, isPublished) => {
        const newStatus = !isPublished;
        const actionText = newStatus ? 'publish' : 'unpublish';

        try {
            const { error } = await supabase
                .from('posts')
                .update({ is_published: newStatus })
                .eq('id', postId);

            if (error) throw error;

            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'success',
                title: `Post successfully ${actionText}ed!`,
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true,
                background: '#111827',
                color: '#e5e7eb'
            });

            // Update the state locally for instant UI feedback
            setPosts(currentPosts =>
                currentPosts.map(p => p.id === postId ? { ...p, is_published: newStatus } : p)
            );

        } catch (error) {
            Swal.fire('Update Failed!', `Could not ${actionText} the post: ${error.message}`, 'error');
        }
    };

    const filteredPosts = posts.filter(post =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading && posts.length === 0) {
        return <LoadingSpinner />;
    }

    return (
        <div className="bg-gray-900 text-white min-h-screen p-4 sm:p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                <DashboardHeader />

                <div className="bg-black/20 backdrop-blur-lg border border-white/10 p-4 rounded-xl shadow-2xl shadow-black/20">
                    <ActionsBar
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                        onRefresh={handleRefresh}
                        refreshing={refreshing}
                    />
                </div>

                <div className="bg-black/20 backdrop-blur-lg border border-white/10 rounded-xl shadow-2xl shadow-black/20 overflow-hidden">
                    <div className="overflow-x-auto">
                        {filteredPosts.length > 0 ? (
                            <table className="w-full text-left">
                                <thead className="bg-white/5">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold text-gray-300 uppercase tracking-wider">Title</th>
                                        <th className="px-6 py-4 font-semibold text-gray-300 uppercase tracking-wider hidden sm:table-cell">Status</th>
                                        <th className="px-6 py-4 font-semibold ... hidden md:table-cell text-center">Views</th>
                                        <th className="px-6 py-4 font-semibold text-gray-300 uppercase tracking-wider text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/10">
                                    {filteredPosts.map(post => (
                                        <PostRow
                                            key={post.id}
                                            post={post}
                                            onTogglePublish={handleTogglePublish}
                                            onDelete={handleDelete}
                                            onEdit={handleEdit}
                                        />
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <EmptyState searchTerm={searchTerm} />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
