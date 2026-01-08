import React from 'react';
import { Link } from 'react-router-dom';
import { Post } from '../types';

interface PostCardProps {
  post: Post;
  showStatus?: boolean;
}

const getCategoryStyle = (categoryName?: string) => {
  switch (categoryName) {
    case 'Kayıp':
      return 'bg-orange-100 text-orange-700 ring-1 ring-orange-300';
    case 'Buldum':
      return 'bg-sky-100 text-sky-700 ring-1 ring-sky-300';
    case 'Sahiplendirme':
      return 'bg-green-100 text-green-700 ring-1 ring-green-300';
    case 'Yardım':
      return 'bg-rose-100 text-rose-700 ring-1 ring-rose-300';
    default:
      return 'bg-gray-100 text-gray-700 ring-1 ring-gray-300';
  }
};

const getTagStyle = (tagName: string) => {
  if (['Acil', 'Yaralı'].includes(tagName)) return 'bg-rose-50 text-rose-700 ring-1 ring-rose-200';
  if (['Hasta'].includes(tagName)) return 'bg-red-50 text-red-700 ring-1 ring-red-200';
  if (['Tedavi'].includes(tagName)) return 'bg-violet-50 text-violet-700 ring-1 ring-violet-200';
  if (['Mama'].includes(tagName)) return 'bg-amber-50 text-amber-800 ring-1 ring-amber-200';
  if (['Geçici Yuva'].includes(tagName)) return 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200';
  if (['Kısır', 'Aşılı'].includes(tagName)) return 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200';
  return 'bg-gray-50 text-gray-600 ring-1 ring-gray-200';
};

const getStatusStyle = (status: string) => {
  switch (status) {
    case 'PENDING':
      return { label: 'Beklemede', cls: 'bg-yellow-100 text-yellow-800 ring-1 ring-yellow-300' };
    case 'APPROVED':
      return { label: 'Onaylandı', cls: 'bg-green-100 text-green-700 ring-1 ring-green-300' };
    case 'REJECTED':
      return { label: 'Reddedildi', cls: 'bg-rose-100 text-rose-700 ring-1 ring-rose-300' };
    case 'RESOLVED':
      return { label: 'Çözüldü', cls: 'bg-blue-100 text-blue-700 ring-1 ring-blue-300' };
    default:
      return null;
  }
};

const Pill: React.FC<{ className: string; children: React.ReactNode }> = ({ className, children }) => (
  <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${className}`}>
    {children}
  </span>
);

const PostCard: React.FC<PostCardProps> = ({ post, showStatus = false }) => {
  const status = showStatus ? getStatusStyle(post.status) : null;
  const linkTo = showStatus ? `/my/posts/${post.id}/edit` : `/posts/${post.id}`;

  return (
    <Link
      to={linkTo}
      className="group block overflow-hidden rounded-2xl bg-white shadow-soft ring-1 ring-black/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
    >
      <div className="relative">
        {post.imageUrl ? (
          <img
            src={post.imageUrl}
            alt={post.title}
            className="h-48 w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="h-48 w-full bg-gradient-to-br from-brand-cream to-white flex items-center justify-center p-6">
            <img
              src="/images/placeholder.png"
              alt="Görsel yok"
              className="h-full w-full object-contain opacity-60 drop-shadow-sm grayscale-[0.2]"
            />
        </div>
        )}

        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          {post.category?.name && (
            <Pill className={getCategoryStyle(post.category.name)}>{post.category.name}</Pill>
          )}
          {status && <Pill className={status.cls}>{status.label}</Pill>}
        </div>
      </div>

      <div className="p-5">
        <h3 className="text-lg font-extrabold tracking-tight text-brand-ink group-hover:text-brand-orange transition-colors line-clamp-1">
          {post.title}
        </h3>

        <p className="mt-2 line-clamp-2 text-sm text-gray-600">
          {post.description}
        </p>

        {post.tags && post.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {post.tags.slice(0, 4).map((tag) => (
              <Pill key={tag.id} className={getTagStyle(tag.name)}>
                {tag.name}
              </Pill>
            ))}
            {post.tags.length > 4 && (
              <Pill className="bg-gray-100 text-gray-600 ring-1 ring-gray-200">
                +{post.tags.length - 4}
              </Pill>
            )}
          </div>
        )}

        <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
          <span className="inline-flex items-center gap-1">
            {post.provinceName}, {post.districtName}
          </span>
          <span className="inline-flex items-center gap-1">
            {new Date(post.createdAt).toLocaleDateString('tr-TR')}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default PostCard;
