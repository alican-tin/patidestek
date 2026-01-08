import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, Spinner, Alert } from 'flowbite-react';
import api from '../../lib/api';
import { Post } from '../../types';

const AdminPendingPosts: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const loadPosts = async () => {
    setLoading(true);
    try {
      const response = await api.get<Post[]>('/admin/posts/pending');
      setPosts(response.data);
    } catch (err) {
      setError('İlanlar yüklenemedi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const handleApprove = async (id: number) => {
    setActionLoading(id);
    try {
      await api.patch(`/admin/posts/${id}/approve`);
      setPosts(posts.filter((p) => p.id !== id));
    } catch (err) {
      setError('Onaylama başarısız.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: number) => {
    setActionLoading(id);
    try {
      await api.patch(`/admin/posts/${id}/reject`);
      setPosts(posts.filter((p) => p.id !== id));
    } catch (err) {
      setError('Reddetme başarısız.');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="xl" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Bekleyen İlanlar</h1>

      {error && (
        <Alert color="failure" className="mb-4" onDismiss={() => setError('')}>
          {error}
        </Alert>
      )}

      {posts.length === 0 ? (
        <Card>
          <p className="text-gray-500">Bekleyen ilan yok.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <Card key={post.id}>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {post.category && (
                      <Badge color="blue">{post.category.name}</Badge>
                    )}
                    {post.tags?.map((tag) => (
                      <Badge key={tag.id} color="gray" size="sm">
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                  <h3 className="text-xl font-semibold">{post.title}</h3>
                  <p className="text-gray-600 mt-2">{post.description}</p>
                  <div className="text-sm text-gray-500 mt-2">
                    <p>👤 {post.owner?.name}</p>
                    <p>{post.provinceName}, {post.districtName}</p>
                    <p>{new Date(post.createdAt).toLocaleDateString('tr-TR')}</p>
                  </div>
                </div>

                {post.imageUrl && (
                  <img
                    src={post.imageUrl}
                    alt={post.title}
                    className="w-32 h-32 object-cover rounded-lg ml-4"
                  />
                )}
              </div>

              <div className="flex gap-2 mt-4">
                <Button
                  color="success"
                  onClick={() => handleApprove(post.id)}
                  disabled={actionLoading === post.id}
                >
                  ✓ Onayla
                </Button>
                <Button
                  color="failure"
                  onClick={() => handleReject(post.id)}
                  disabled={actionLoading === post.id}
                >
                  ✗ Reddet
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminPendingPosts;
