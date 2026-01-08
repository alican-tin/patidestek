import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button, Spinner, Alert, Modal } from 'flowbite-react';
import api from '../lib/api';
import { Post } from '../types';
import PostCard from '../components/PostCard';
import { useAuth } from '../contexts/AuthContext';

const MyPostsPage: React.FC = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const loadPosts = async () => {
    setLoading(true);
    try {
      const response = await api.get<Post[]>('/my/posts');
      setPosts(response.data);
    } catch (err) {
      setError('İlanlar yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;

    setDeleteLoading(true);
    try {
      await api.delete(`/posts/${deleteId}`);
      setPosts(posts.filter((p) => p.id !== deleteId));
      setDeleteId(null);
    } catch (err) {
      setError('İlan silinemedi.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const isBanned = user?.isBanned;

  return (
    <div>
      {/* Hero Banner */}
      <div className="mb-6 overflow-hidden rounded-2xl bg-white shadow-soft ring-1 ring-black/5">
        <div className="bg-gradient-to-r from-brand-orange to-brand-green px-6 py-5 flex justify-between items-center">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">İlanlarım</h1>
            <p className="mt-1 text-sm text-white/90">Oluşturduğunuz tüm ilanları buradan yönetin.</p>
          </div>
          {!isBanned && (
            <Button as={Link} to="/my/posts/new" className="bg-white text-brand-orange hover:bg-brand-cream font-bold">
              + Yeni İlan
            </Button>
          )}
        </div>
      </div>

      {isBanned && (
        <Alert color="failure" className="mb-4">
          Hesabınız yasaklandığı için yeni ilan oluşturamazsınız.
        </Alert>
      )}

      {error && (
        <Alert color="failure" className="mb-4" onDismiss={() => setError('')}>
          {error}
        </Alert>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="xl" />
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl shadow-soft ring-1 ring-black/5">
          <img src="/images/empty-state.png" alt="İlan yok" className="w-48 h-48 mx-auto mb-4 object-contain" />
          <p className="text-xl font-bold text-brand-ink">Henüz ilanınız yok</p>
          {!isBanned && (
            <Button as={Link} to="/my/posts/new" className="mt-4 bg-brand-orange hover:bg-brand-orangeDark text-white">
              İlk İlanınızı Oluşturun
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <div key={post.id} className="relative">
              <PostCard post={post} showStatus />
              <div className="absolute top-2 right-2 flex gap-2">
                <Button
                  size="xs"
                  color="failure"
                  onClick={() => setDeleteId(post.id)}
                >
                  Sil
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal show={deleteId !== null} onClose={() => setDeleteId(null)}>
        <Modal.Header>İlanı Sil</Modal.Header>
        <Modal.Body>
          <p>Bu ilanı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button color="failure" onClick={handleDelete} disabled={deleteLoading}>
            {deleteLoading ? 'Siliniyor...' : 'Sil'}
          </Button>
          <Button color="gray" onClick={() => setDeleteId(null)}>
            İptal
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default MyPostsPage;
