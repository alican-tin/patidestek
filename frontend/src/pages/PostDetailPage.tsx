import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Badge, Spinner, Alert, Button, Textarea, Modal, Select, Label } from 'flowbite-react';
import api from '../lib/api';
import { Post, Comment } from '../types';
import { useAuth } from '../contexts/AuthContext';

const PostDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated, user } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [newComment, setNewComment] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentError, setCommentError] = useState('');

  const [showReportModal, setShowReportModal] = useState(false);
  const [reportCommentId, setReportCommentId] = useState<number | null>(null);
  const [reportReason, setReportReason] = useState('SPAM');
  const [reportDetails, setReportDetails] = useState('');
  const [reportLoading, setReportLoading] = useState(false);
  const [reportSuccess, setReportSuccess] = useState('');

  useEffect(() => {
    const loadPost = async () => {
      try {
        const [postRes, commentsRes] = await Promise.all([
          api.get<Post>(`/posts/${id}`),
          api.get<Comment[]>(`/posts/${id}/comments`),
        ]);
        setPost(postRes.data);
        setComments(commentsRes.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'İlan bulunamadı.');
      } finally {
        setLoading(false);
      }
    };
    loadPost();
  }, [id]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setCommentLoading(true);
    setCommentError('');

    try {
      const response = await api.post<Comment>(`/posts/${id}/comments`, { content: newComment });
      setComments([...comments, response.data]);
      setNewComment('');
    } catch (err: any) {
      setCommentError(err.response?.data?.message || 'Yorum eklenemedi.');
    } finally {
      setCommentLoading(false);
    }
  };

  const openReportModal = (commentId: number) => {
    setReportCommentId(commentId);
    setReportReason('SPAM');
    setReportDetails('');
    setShowReportModal(true);
  };

  const handleReport = async () => {
    if (!reportCommentId) return;

    setReportLoading(true);

    try {
      await api.post('/comment-reports', {
        commentId: reportCommentId,
        reason: reportReason,
        details: reportDetails || undefined,
      });
      setShowReportModal(false);
      setReportSuccess('Şikayetiniz alındı. Teşekkürler!');
      setTimeout(() => setReportSuccess(''), 3000);
    } catch (err: any) {
      setCommentError(err.response?.data?.message || 'Şikayet gönderilemedi.');
    } finally {
      setReportLoading(false);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!window.confirm('Bu yorumu silmek istediğinize emin misiniz?')) return;

    try {
      await api.delete(`/comments/${commentId}`);
      setComments(comments.filter((c) => c.id !== commentId));
    } catch (err: any) {
      setCommentError(err.response?.data?.message || 'Yorum silinemedi.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="xl" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <Alert color="failure">
        {error || 'İlan bulunamadı.'}
      </Alert>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="rounded-2xl shadow-soft ring-1 ring-black/5 overflow-hidden">
        {post.imageUrl ? (
          <img
            src={post.imageUrl}
            alt={post.title}
            className="w-full max-h-96 object-cover"
          />
        ) : (
          <div className="w-full h-48 bg-gradient-to-br from-brand-cream to-white flex items-center justify-center">
            <img src="/images/placeholder.png" alt="Görsel yok" className="h-24 w-24 object-contain opacity-60" />
          </div>
        )}

        <div className="p-6">
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            {post.category && (
              <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${
                post.category.name === 'Kayıp' ? 'bg-orange-100 text-orange-700 ring-1 ring-orange-300' :
                post.category.name === 'Buldum' ? 'bg-sky-100 text-sky-700 ring-1 ring-sky-300' :
                post.category.name === 'Sahiplendirme' ? 'bg-green-100 text-green-700 ring-1 ring-green-300' :
                post.category.name === 'Yardım' ? 'bg-rose-100 text-rose-700 ring-1 ring-rose-300' :
                'bg-gray-100 text-gray-700 ring-1 ring-gray-300'
              }`}>
                {post.category.name}
              </span>
            )}
            {post.tags?.map((tag) => (
              <span key={tag.id} className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold bg-gray-50 text-gray-600 ring-1 ring-gray-200">
                {tag.name}
              </span>
            ))}
          </div>

          <h1 className="text-3xl font-extrabold text-brand-ink mb-4">{post.title}</h1>

          <p className="text-gray-700 whitespace-pre-wrap mb-6">{post.description}</p>

          <div className="bg-brand-cream/50 p-4 rounded-xl mb-6">
            <h3 className="font-bold text-brand-ink mb-2">Konum</h3>
            <p className="text-gray-600">{post.provinceName}, {post.districtName}, {post.neighbourhoodName}</p>
          </div>

          <div className="text-sm text-gray-500 flex gap-6">
            <p>👤 {post.owner?.name}</p>
            <p>{new Date(post.createdAt).toLocaleDateString('tr-TR')}</p>
          </div>
        </div>
      </Card>

      {/* Comments Section */}
      <Card className="mt-6 rounded-2xl shadow-soft ring-1 ring-black/5">
        <h2 className="text-xl font-extrabold text-brand-ink mb-4">Yorumlar ({comments.length})</h2>

        {reportSuccess && (
          <Alert color="success" className="mb-4">
            {reportSuccess}
          </Alert>
        )}

        {commentError && (
          <Alert color="failure" className="mb-4" onDismiss={() => setCommentError('')}>
            {commentError}
          </Alert>
        )}

        {comments.length === 0 ? (
          <p className="text-gray-500">Henüz yorum yapılmamış.</p>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="border-b pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold">{comment.user.name}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(comment.createdAt).toLocaleDateString('tr-TR')}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {isAuthenticated && (comment.user.id === user?.id || user?.role === 'ADMIN') && (
                      <Button
                        size="xs"
                        color="failure"
                        onClick={() => handleDeleteComment(comment.id)}
                      >
                        Sil
                      </Button>
                    )}
                    {isAuthenticated && (
                      <Button
                        size="xs"
                        color="gray"
                        onClick={() => openReportModal(comment.id)}
                      >
                        Şikayet Et
                      </Button>
                    )}
                  </div>
                </div>
                <p className="mt-2">{comment.content}</p>
              </div>
            ))}
          </div>
        )}

        {/* Add Comment Form */}
        {isAuthenticated ? (
          user?.isBanned ? (
            <Alert color="warning" className="mt-4">
              Hesabınız yasaklandığı için yorum yapamazsınız.
            </Alert>
          ) : (
            <form onSubmit={handleAddComment} className="mt-6">
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Yorumunuzu yazın..."
                rows={3}
                required
              />
              <Button type="submit" className="mt-2" disabled={commentLoading}>
                {commentLoading ? 'Gönderiliyor...' : 'Yorum Ekle'}
              </Button>
            </form>
          )
        ) : (
          <Alert color="info" className="mt-4">
            Yorum yapmak için giriş yapmanız gerekmektedir.
          </Alert>
        )}
      </Card>

      {/* Report Modal */}
      <Modal show={showReportModal} onClose={() => setShowReportModal(false)}>
        <Modal.Header>Yorumu Şikayet Et</Modal.Header>
        <Modal.Body>
          <div className="space-y-4">
            <div>
              <Label htmlFor="reason" value="Şikayet Nedeni" />
              <Select
                id="reason"
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
              >
                <option value="SPAM">Spam</option>
                <option value="ABUSE">Kötüye Kullanım</option>
                <option value="PERSONAL_INFO">Kişisel Bilgi</option>
                <option value="OTHER">Diğer</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="details" value="Detaylar (Opsiyonel)" />
              <Textarea
                id="details"
                value={reportDetails}
                onChange={(e) => setReportDetails(e.target.value)}
                placeholder="Ek açıklama..."
                rows={3}
              />
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={handleReport} disabled={reportLoading}>
            {reportLoading ? 'Gönderiliyor...' : 'Şikayet Et'}
          </Button>
          <Button color="gray" onClick={() => setShowReportModal(false)}>
            İptal
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default PostDetailPage;
