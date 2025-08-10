import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { supabase } from '../supabase';
import RichTextEditor from '../components/RichTextEditor';
import Select from 'react-select/creatable';

const CreatePost = () => {
    // State untuk data post
    const [title, setTitle] = useState('');
    const [slug, setSlug] = useState('');
    const [content, setContent] = useState('');
    const [coverImageFile, setCoverImageFile] = useState(null);
    const [isPublished, setIsPublished] = useState(false);
    const [publishedAt, setPublishedAt] = useState('');

    // State untuk tag
    const [selectedTags, setSelectedTags] = useState([]);
    const [tagOptions, setTagOptions] = useState([]);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    // Mengambil semua tag dari database saat komponen dimuat
    useEffect(() => {
        const fetchTags = async () => {
            const { data, error } = await supabase.from('tags').select('id, name');
            if (error) {
                console.error('Error fetching tags:', error);
            } else {
                const formattedTags = data.map(tag => ({ value: tag.id, label: tag.name }));
                setTagOptions(formattedTags);
            }
        };
        fetchTags();
    }, []);

    const handleTitleChange = (e) => {
        const newTitle = e.target.value;
        setTitle(newTitle);
        const newSlug = newTitle.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');
        setSlug(newSlug);
    };

    const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setCoverImageFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title || !slug || !content) {
            Swal.fire('Oops...', 'Judul, Slug, dan Konten tidak boleh kosong.', 'error');
            return;
        }
        setIsSubmitting(true);
        Swal.fire({ title: 'Menyimpan...', text: 'Harap tunggu...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

        try {
            let imageUrl = null;
            if (coverImageFile) {
                const fileName = `${Date.now()}_${coverImageFile.name}`;
                const { data: uploadData, error: uploadError } = await supabase.storage.from('post-images').upload(fileName, coverImageFile);
                if (uploadError) throw uploadError;
                const { data: urlData } = supabase.storage.from('post-images').getPublicUrl(uploadData.path);
                imageUrl = urlData.publicUrl;
            }

            const publicationTime = publishedAt ? new Date(publishedAt).toISOString() : new Date().toISOString();

            // 1. Simpan postingan utama untuk mendapatkan ID-nya
            const { data: postData, error: postError } = await supabase
                .from('posts')
                .insert({ title, slug, content, cover_image_url: imageUrl, is_published: isPublished, published_at: publicationTime })
                .select('id')
                .single();
            if (postError) throw postError;
            const postId = postData.id;

            // 2. Proses semua tag yang dipilih dengan logika yang lebih aman
            const tagPromises = selectedTags.map(async (tagOption) => {
                if (tagOption.__isNew__) {
                    // Jika ini tag baru, coba buat di tabel 'tags'
                    const tagName = tagOption.label.toLowerCase();
                    const { data: newTag, error: insertError } = await supabase
                        .from('tags')
                        .insert({ name: tagName })
                        .select('id')
                        .single();

                    if (insertError && insertError.code === '23505') {
                        // Error code '23505' berarti 'unique_violation' (tag sudah ada)
                        // Jika tag sudah ada, ambil ID-nya
                        const { data: existingTag, error: selectError } = await supabase
                            .from('tags')
                            .select('id')
                            .eq('name', tagName)
                            .single();
                        if (selectError) throw selectError;
                        return { post_id: postId, tag_id: existingTag.id };
                    } else if (insertError) {
                        // Jika ada error lain, hentikan proses
                        throw insertError;
                    }
                    return { post_id: postId, tag_id: newTag.id };
                } else {
                    // Jika tag sudah ada, langsung gunakan ID-nya
                    return { post_id: postId, tag_id: tagOption.value };
                }
            });

            const postTagRelations = await Promise.all(tagPromises);

            // 3. Jika ada tag, simpan relasinya di tabel 'post_tags'
            if (postTagRelations.length > 0) {
                const { error: postTagsError } = await supabase.from('post_tags').insert(postTagRelations);
                if (postTagsError) throw postTagsError;
            }

            await Swal.fire('Berhasil!', 'Postingan dan tag telah berhasil disimpan.', 'success');
            navigate('/admin');
        } catch (error) {
            Swal.fire('Gagal!', `Terjadi kesalahan: ${error.message}`, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#030014] text-white pt-24 pb-16">
            <div className="max-w-4xl mx-auto p-8 bg-gray-900/50 backdrop-blur-lg border border-white/10 rounded-lg">
                <h2 className="text-3xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-[#6366f1] to-[#a855f7]">
                    Buat Postingan Baru
                </h2>
                <form onSubmit={handleSubmit} className="space-y-8">
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium mb-2">Judul Postingan</label>
                        <input type="text" id="title" value={title} onChange={handleTitleChange} className="w-full bg-white/10 border border-gray-700 rounded-md p-3 focus:ring-purple-500 focus:border-purple-500 transition" placeholder="Judul yang menarik..." required />
                    </div>

                    <div>
                        <label htmlFor="slug" className="block text-sm font-medium mb-2">Slug (URL)</label>
                        <input type="text" id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} className="w-full bg-white/10 border border-gray-700 rounded-md p-3 focus:ring-purple-500 focus:border-purple-500 transition" placeholder="contoh-slug-otomatis" required />
                    </div>

                    <div>
                        <label htmlFor="coverImage" className="block text-sm font-medium mb-2">Unggah Gambar Sampul</label>
                        <input type="file" id="coverImage" onChange={handleImageChange} className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-purple-600/20 file:text-purple-300 hover:file:bg-purple-600/30" accept="image/png, image/jpeg, image/gif, image/webp" />
                    </div>

                    <div>
                        <label htmlFor="published_at" className="block text-sm font-medium mb-2">Waktu Publikasi (Opsional)</label>
                        <input type="datetime-local" id="published_at" value={publishedAt} onChange={(e) => setPublishedAt(e.target.value)} className="w-full bg-white/10 border border-gray-700 rounded-md p-3 focus:ring-purple-500 focus:border-purple-500 transition [color-scheme:dark]" />
                        <p className="text-xs text-gray-500 mt-1">Kosongkan untuk menggunakan waktu saat ini.</p>
                    </div>

                    <div>
                        <label htmlFor="tags" className="block text-sm font-medium mb-2">Tags (Topik)</label>
                        <Select
                            isMulti
                            options={tagOptions}
                            value={selectedTags}
                            onChange={(newValue) => setSelectedTags(newValue)}
                            placeholder="Pilih atau ketik untuk membuat tag baru..."
                            styles={{
                                control: (base) => ({ ...base, backgroundColor: 'rgba(255, 255, 255, 0.1)', borderColor: '#4B5563', color: 'white', '&:hover': { borderColor: '#a855f7' } }),
                                menu: (base) => ({ ...base, backgroundColor: '#1F2937' }),
                                input: (base) => ({ ...base, color: 'white' }),
                                option: (base, { isFocused }) => ({ ...base, backgroundColor: isFocused ? '#374151' : '#1F2937', color: '#E5E7EB' }),
                                multiValue: (base) => ({ ...base, backgroundColor: '#4F46E5' }),
                                multiValueLabel: (base) => ({ ...base, color: 'white' }),
                                multiValueRemove: (base) => ({ ...base, color: 'white', '&:hover': { backgroundColor: '#a855f7', color: 'white' } }),
                            }}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Konten</label>
                        <RichTextEditor value={content} onChange={(newContent) => setContent(newContent)} />
                    </div>

                    <div className="flex items-center justify-start gap-4 pt-4 border-t border-white/10">
                        <label htmlFor="is_published" className="block text-sm font-medium">Status:</label>
                        <div className="flex items-center gap-2">
                            <input type="checkbox" id="is_published" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} className="h-4 w-4 rounded border-gray-600 bg-gray-800 text-purple-600 focus:ring-purple-600" />
                            <label htmlFor="is_published" className="text-sm">{isPublished ? 'Terbitkan' : 'Simpan sebagai Draf'}</label>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-4">
                        <button type="submit" disabled={isSubmitting} className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white rounded-md font-semibold transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-[#6366f1]/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed">
                            {isSubmitting ? 'Menyimpan...' : 'Simpan Postingan'}
                        </button>
                        <button type="button" onClick={() => navigate('/admin')} className="w-full sm:w-auto px-8 py-3 bg-gray-700/50 text-gray-300 rounded-md font-semibold transition-all duration-300 hover:bg-gray-700/80">
                            Batal
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreatePost;
