import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { supabase } from '../supabase';
import RichTextEditor from '../components/RichTextEditor';
import Select from 'react-select/creatable';

const EditPost = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // State untuk semua field form
    const [title, setTitle] = useState('');
    const [slug, setSlug] = useState('');
    const [content, setContent] = useState('');
    const [coverImageFile, setCoverImageFile] = useState(null);
    const [existingCoverImageUrl, setExistingCoverImageUrl] = useState('');
    const [isPublished, setIsPublished] = useState(false);
    const [selectedTags, setSelectedTags] = useState([]);
    const [tagOptions, setTagOptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fetch data awal (termasuk tags)
    useEffect(() => {
        const fetchPostAndTags = async () => {
            setLoading(true);

            // Ambil semua opsi tag
            const { data: tagsData } = await supabase.from('tags').select('id, name');
            if (tagsData) {
                setTagOptions(tagsData.map(tag => ({ value: tag.id, label: tag.name })));
            }

            // Ambil data post spesifik
            if (!id) return;
            const { data: postData, error } = await supabase.from('posts').select(`*, tags(id, name)`).eq('id', id).single();

            if (error || !postData) {
                Swal.fire('Error', 'Gagal memuat data postingan.', 'error');
                navigate('/admin');
            } else {
                setTitle(postData.title);
                setSlug(postData.slug);
                setContent(postData.content);
                setIsPublished(postData.is_published);
                setExistingCoverImageUrl(postData.cover_image_url);
                setSelectedTags(postData.tags.map(tag => ({ value: tag.id, label: tag.name })));
            }
            setLoading(false);
        };
        fetchPostAndTags();
    }, [id, navigate]);

    // Handler untuk judul dan slug otomatis
    const handleTitleChange = (e) => {
        const newTitle = e.target.value; // <-- Hanya ambil .value
        setTitle(newTitle);
        const newSlug = newTitle.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');
        setSlug(newSlug);
    };

    // Fungsi submit yang lengkap dan sudah diperbaiki
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            let finalImageUrl = existingCoverImageUrl;
            if (coverImageFile) {
                const fileName = `${Date.now()}_${coverImageFile.name}`;
                const { data: uploadData, error: uploadError } = await supabase.storage.from('post-images').upload(fileName, coverImageFile);
                if (uploadError) throw uploadError;
                finalImageUrl = supabase.storage.from('post-images').getPublicUrl(uploadData.path).data.publicUrl;
            }

            // Create a clean update object without any circular references
            const updateData = {
                title: title.trim(),
                slug: slug.trim(),
                content: content || '', // Ensure content is never undefined
                is_published: isPublished,
                cover_image_url: finalImageUrl
            };
            
            const { error: postUpdateError } = await supabase
                .from('posts')
                .update(updateData)
                .eq('id', id);
            
            if (postUpdateError) throw postUpdateError;

            const tagIds = await Promise.all(selectedTags.map(async (tag) => {
                if (tag.__isNew__) {
                    const tagName = tag.label.toLowerCase();
                    const { data: newTag, error } = await supabase.from('tags').insert({ name: tagName }).select().single();
                    if (error && error.code === '23505') {
                        const { data: existingTag } = await supabase.from('tags').select('id').eq('name', tagName).single();
                        return existingTag.id;
                    } else if (error) throw error;
                    return newTag.id;
                }
                return tag.value;
            }));

            await supabase.from('post_tags').delete().eq('post_id', id);
            if (tagIds.length > 0) {
                const newPostTagRelations = tagIds.map(tagId => ({ post_id: id, tag_id: tagId }));
                await supabase.from('post_tags').insert(newPostTagRelations);
            }

            Swal.fire('Berhasil!', 'Postingan telah berhasil diperbarui.', 'success');
            navigate('/admin');
        } catch (error) {
            Swal.fire('Gagal!', `Terjadi kesalahan: ${error.message}`, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return <div className="text-center text-white py-40">Memuat editor...</div>;
    }

    return (
        <div className="min-h-screen bg-[#030014] text-white pt-24 pb-16">
            <div className="max-w-4xl mx-auto p-8 bg-gray-900/50 backdrop-blur-lg border border-white/10 rounded-lg">
                <h2 className="text-3xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-400">
                    Edit Postingan
                </h2>
                <form onSubmit={handleSubmit} className="space-y-8">
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium mb-2">Judul Postingan</label>
                        <input type="text" id="title" value={title} onChange={handleTitleChange} className="w-full bg-white/10 border border-gray-700 rounded-md p-3 focus:ring-blue-500 focus:border-blue-500 transition" required />
                    </div>
                    <div>
                        <label htmlFor="slug" className="block text-sm font-medium mb-2">Slug</label>
                        <input type="text" id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} className="w-full bg-white/10 border border-gray-700 rounded-md p-3 focus:ring-blue-500 focus:border-blue-500 transition" required />
                    </div>
                    <div>
                        <label htmlFor="coverImage" className="block text-sm font-medium mb-2">Ganti Gambar Sampul (Opsional)</label>
                        <input type="file" id="coverImage" onChange={(e) => setCoverImageFile(e.target.files[0])} className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-600/20 file:text-blue-300 hover:file:bg-blue-600/30" accept="image/png, image/jpeg, image/gif, image/webp" />
                        {existingCoverImageUrl && !coverImageFile && <img src={existingCoverImageUrl} alt="Gambar saat ini" className="mt-4 rounded-lg max-h-40" />}
                    </div>
                    <div>
                        <label htmlFor="tags" className="block text-sm font-medium mb-2">Tags</label>
                        <Select isMulti options={tagOptions} value={selectedTags} onChange={(newValue) => setSelectedTags(newValue)} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Konten</label>
                        <RichTextEditor value={content} onChange={(newContent) => setContent(newContent)} />
                    </div>
                    <div className="flex items-center gap-2 pt-4 border-t border-white/10">
                        <input type="checkbox" id="is_published" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} className="h-4 w-4 rounded border-gray-600 bg-gray-800 text-teal-500 focus:ring-teal-500" />
                        <label htmlFor="is_published" className="text-sm">Terbitkan Postingan</label>
                    </div>
                    <div className="flex gap-4">
                        <button type="submit" disabled={isSubmitting} className="px-8 py-3 bg-gradient-to-r from-blue-600 to-teal-500 text-white rounded-md font-semibold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50">
                            {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
                        </button>
                        <button type="button" onClick={() => navigate('/admin')} className="px-8 py-3 bg-gray-700/50 text-gray-300 rounded-md font-semibold transition-all duration-300 hover:bg-gray-700/80">
                            Batal
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditPost;
