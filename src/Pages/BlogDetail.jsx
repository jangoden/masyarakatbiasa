import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../supabase';
import { ArrowLeft, Tag, Calendar } from 'lucide-react';
import AOS from 'aos';
import 'aos/dist/aos.css';

// ✅ Tambahkan Helmet untuk meta tag dinamis
import { Helmet } from 'react-helmet';

const TagPill = ({ tagName }) => {
  return (
    <Link
      to={`/blog/tags/${tagName}`}
      className="inline-flex items-center gap-2 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10 px-3 py-1.5 text-sm font-medium text-purple-300 transition-colors hover:bg-white/10 hover:border-purple-400/50"
    >
      <Tag size={16} />
      <span className="capitalize">{tagName}</span>
    </Link>
  );
};

const BlogDetail = () => {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AOS.init({ once: true });
    fetchPost();
    window.scrollTo(0, 0);
  }, [slug]);

  async function fetchPost() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`*, tags ( id, name )`)
        .eq('slug', slug)
        .single();

      if (error) throw error;

      if (data) {
        await supabase.rpc('increment_view_count', { post_id_to_update: data.id });
        setPost(data);

        // ✅ Tracking event Google Analytics: read_blog
        if (window.gtag && data?.title) {
          window.gtag('event', 'read_blog', {
            event_category: 'Blog',
            event_label: data.title,
            value: 1
          });
        }
      }
    } catch (error) {
      console.error('Error fetching post:', error.message);
    } finally {
      setLoading(false);
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030014] flex items-center justify-center text-white">
        Loading article...
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-[#030014] flex flex-col items-center justify-center text-white">
        <h2 className="text-4xl font-bold mb-4">404 - Post Not Found</h2>
        <Link to="/blog" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white font-medium transition-all duration-300 hover:scale-105">
          <ArrowLeft className="w-5 h-5" />
          Kembali ke Blog
        </Link>
      </div>
    );
  }

  const pageUrl = `https://deniirahman.my.id/blog/${slug}`;

  return (
    <div className="min-h-screen bg-[#030014] text-white overflow-hidden pt-24 pb-16">
      {/* ✅ Helmet untuk SEO dan preview WhatsApp/Twitter */}
      <Helmet>
        <title>{post.title}</title>
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.excerpt || post.title} />
        <meta property="og:image" content={post.cover_image_url} />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:type" content="blog" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="prerender-render-delay" content="1000" />
        <meta name="twitter:title" content={post.title} />
        <meta name="twitter:description" content={post.excerpt || post.title} />
        <meta name="twitter:image" content={post.cover_image_url} />
      </Helmet>

      <div className="max-w-4xl mx-auto px-5">
        <div data-aos="fade-down">
          <Link to="/blog" className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors mb-8">
            <ArrowLeft className="w-5 h-5" />
            Kembali ke Semua Artikel
          </Link>
        </div>

        <article>
          <header data-aos="fade-up">
            <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-100 to-gray-300 mb-4 leading-tight">
              {post.title}
            </h1>
            <div className="flex items-center gap-2 text-gray-500 mb-4">
              <Calendar className="w-4 h-4" />
              <time dateTime={post.published_at || post.created_at}>
                {formatDate(post.published_at || post.created_at)}
              </time>
            </div>
            <img
              src={post.cover_image_url}
              alt={post.title}
              className="w-full rounded-2xl mb-12 shadow-2xl shadow-black/30"
            />
          </header>

          <div
            data-aos="fade-up"
            data-aos-delay="200"
            className="prose prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {post.tags && post.tags.length > 0 && (
            <footer className="mt-12 pt-8 border-t border-white/10">
              <h3 className="text-lg font-semibold mb-4 text-gray-300">Related Topics:</h3>
              <div className="flex flex-wrap gap-3">
                {post.tags.map((tag) => (
                  <TagPill key={tag.id} tagName={tag.name} />
                ))}
              </div>
            </footer>
          )}
        </article>
      </div>
    </div>
  );
};

export default BlogDetail;
