import React, { useState, useEffect } from 'react';
import { Table, Button, Badge, Alert, Spinner, Select } from 'flowbite-react';
import api from '../../lib/api';
import { CommentReport } from '../../types';

const reasonLabels: Record<string, string> = {
  SPAM: 'Spam',
  ABUSE: 'Kötüye Kullanım',
  PERSONAL_INFO: 'Kişisel Bilgi',
  OTHER: 'Diğer',
};

const AdminCommentReports: React.FC = () => {
  const [reports, setReports] = useState<CommentReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('OPEN');
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const loadReports = async () => {
    setLoading(true);
    try {
      const response = await api.get<CommentReport[]>(`/comment-reports?status=${statusFilter}`);
      setReports(response.data);
    } catch (err) {
      setError('Şikayetler yüklenemedi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, [statusFilter]);

  const handleResolve = async (id: number) => {
    setActionLoading(id);
    try {
      await api.patch(`/comment-reports/${id}/resolve`);
      setReports(reports.filter((r) => r.id !== id));
    } catch (err) {
      setError('İşlem başarısız.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteReport = async (id: number) => {
    if (!confirm('Bu şikayeti silmek istediğinizden emin misiniz?')) return;
    setActionLoading(id);
    try {
      await api.delete(`/comment-reports/${id}`);
      setReports(reports.filter((r) => r.id !== id));
    } catch (err) {
      setError('Şikayet silinemedi.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteComment = async (report: CommentReport) => {
    if (!confirm('Bu yorumu kalıcı olarak silmek istediğinizden emin misiniz?')) return;
    setActionLoading(report.id);
    try {
      await api.delete(`/comments/${report.comment.id}`);
      setReports(reports.filter((r) => r.id !== report.id));
    } catch (err) {
      setError('Yorum silinemedi.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleBanUser = async (report: CommentReport) => {
    const userName = report.comment?.user?.name;
    if (!confirm(`${userName} kullanıcısını banlamak istediğinizden emin misiniz?`)) return;
    setActionLoading(report.id);
    try {
      await api.patch(`/users/${report.comment.user.id}/ban`, { isBanned: true });
      setError('');
      alert(`${userName} başarıyla banlandı!`);
    } catch (err) {
      setError('Kullanıcı banlanamadı.');
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Yorum Şikayetleri</h1>
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="OPEN">Açık</option>
          <option value="RESOLVED">Çözüldü</option>
        </Select>
      </div>

      {error && (
        <Alert color="failure" className="mb-4" onDismiss={() => setError('')}>
          {error}
        </Alert>
      )}

      {reports.length === 0 ? (
        <p className="text-gray-500">Şikayet bulunamadı.</p>
      ) : (
        <Table>
          <Table.Head>
            <Table.HeadCell>ID</Table.HeadCell>
            <Table.HeadCell>Yorum</Table.HeadCell>
            <Table.HeadCell>Neden</Table.HeadCell>
            <Table.HeadCell>Detay</Table.HeadCell>
            <Table.HeadCell>Şikayet Eden</Table.HeadCell>
            <Table.HeadCell>Tarih</Table.HeadCell>
            <Table.HeadCell>İşlemler</Table.HeadCell>
          </Table.Head>
          <Table.Body>
            {reports.map((report) => (
              <Table.Row key={report.id}>
                <Table.Cell>{report.id}</Table.Cell>
                <Table.Cell>
                  <div className="max-w-xs">
                    <p className="truncate">{report.comment?.content}</p>
                    <p className="text-xs text-gray-500">
                      Yazan: {report.comment?.user?.name}
                    </p>
                  </div>
                </Table.Cell>
                <Table.Cell>
                  <Badge color="red">{reasonLabels[report.reason]}</Badge>
                </Table.Cell>
                <Table.Cell>{report.details || '-'}</Table.Cell>
                <Table.Cell>{report.reporter?.name}</Table.Cell>
                <Table.Cell>
                  {new Date(report.createdAt).toLocaleDateString('tr-TR')}
                </Table.Cell>
                <Table.Cell>
                  <div className="flex flex-wrap gap-1">
                    {report.status === 'OPEN' && (
                      <Button
                        size="xs"
                        color="success"
                        onClick={() => handleResolve(report.id)}
                        disabled={actionLoading === report.id}
                      >
                        ✓ Çözüldü
                      </Button>
                    )}
                    <Button
                      size="xs"
                      color="failure"
                      onClick={() => handleDeleteComment(report)}
                      disabled={actionLoading === report.id}
                    >
                      🗑 Yorum
                    </Button>
                    <Button
                      size="xs"
                      color="warning"
                      onClick={() => handleBanUser(report)}
                      disabled={actionLoading === report.id}
                    >
                      🚫 Banla
                    </Button>
                    <Button
                      size="xs"
                      color="gray"
                      onClick={() => handleDeleteReport(report.id)}
                      disabled={actionLoading === report.id}
                    >
                      ✕ Şikayet
                    </Button>
                  </div>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      )}
    </div>
  );
};

export default AdminCommentReports;
