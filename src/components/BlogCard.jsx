// src/components/BlogCard.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ArrowUpRight } from 'lucide-react';
import 'aos/dist/aos.css';

const BlogCard = ({ post, animation, duration }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const excerpt = post.content.substring(0, 100).replace(/<[^>]+>/g, '') + '...';

  return (
    <div 
      data-aos={animation} 
      data-aos-duration={duration}
      className="relative group bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-[#6366f1]/10"
    >
      <Link to={`/blog/${post.slug}`} className="block">
        <div className="overflow-hidden">
          <img
            src={post.cover_image_url}
            alt={post.title}
            className="w-full h-48 object-cover transition-all duration-500 group-hover:scale-110"
            loading="lazy"
          />
        </div>
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-100 mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r from-[#6366f1] to-[#a855f7] transition-colors duration-300">
            {post.title}
          </h3>
          <p className="text-gray-400 text-sm leading-relaxed mb-4">
            {excerpt}
          </p>
          <div className="flex justify-between items-center text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(post.published_at || post.created_at)}</span>
            </div>
            <div className="flex items-center gap-1 text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              Read More
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default BlogCard;