import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, TextInput, Label, Alert, Spinner } from 'flowbite-react';
import { HiOutlineExclamationCircle } from 'react-icons/hi';
import api from '../../lib/api';
import { Tag } from '../../types';

const AdminTags: React.FC = () => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const loadTags = async () => {
    try {
      const response = await api.get<Tag[]>('/tags');
      setTags(response.data);
    } catch (err) {
      setError('Etiketler yüklenemedi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTags();
  }, []);

  const openModal = (tag?: Tag) => {
    if (tag) {
      setEditId(tag.id);
      setName(tag.name);
    } else {
      setEditId(null);
      setName('');
    }
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);

    try {
      if (editId) {
        const response = await api.patch<Tag>(`/tags/${editId}`, { name });
        setTags(tags.map((t) => (t.id === editId ? response.data : t)));
      } else {
        const response = await api.post<Tag>('/tags', { name });
        setTags([...tags, response.data]);
      }
      setShowModal(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'İşlem başarısız.');
    } finally {
      setSaving(false);
    }
  };

  const openDeleteModal = (id: number) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);

    try {
      await api.delete(`/tags/${deleteId}`);
      setTags(tags.filter((t) => t.id !== deleteId));
      setShowDeleteModal(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Silme başarısız.');
    } finally {
      setDeleting(false);
      setDeleteId(null);
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
        <h1 className="text-3xl font-bold">Etiketler (Tür/Durum)</h1>
        <Button onClick={() => openModal()}>+ Yeni Etiket</Button>
      </div>

      {error && (
        <Alert color="failure" className="mb-4" onDismiss={() => setError('')}>
          {error}
        </Alert>
      )}

      <Table>
        <Table.Head>
          <Table.HeadCell>ID</Table.HeadCell>
          <Table.HeadCell>Ad</Table.HeadCell>
          <Table.HeadCell>İşlemler</Table.HeadCell>
        </Table.Head>
        <Table.Body>
          {tags.map((tag) => (
            <Table.Row key={tag.id}>
              <Table.Cell>{tag.id}</Table.Cell>
              <Table.Cell>{tag.name}</Table.Cell>
              <Table.Cell>
                <div className="flex gap-2">
                  <Button size="xs" onClick={() => openModal(tag)}>
                    Düzenle
                  </Button>
                  <Button size="xs" color="failure" onClick={() => openDeleteModal(tag.id)}>
                    Sil
                  </Button>
                </div>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>

      {/* Edit/Create Modal */}
      <Modal show={showModal} onClose={() => setShowModal(false)}>
        <Modal.Header>{editId ? 'Etiket Düzenle' : 'Yeni Etiket'}</Modal.Header>
        <Modal.Body>
          <div>
            <Label htmlFor="name" value="Etiket Adı" />
            <TextInput
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Örn: Kedi, Köpek, Yaralı..."
              required
            />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Kaydediliyor...' : 'Kaydet'}
          </Button>
          <Button color="gray" onClick={() => setShowModal(false)}>
            İptal
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} size="md" onClose={() => setShowDeleteModal(false)} popup>
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <HiOutlineExclamationCircle className="mx-auto mb-4 h-14 w-14 text-gray-400 dark:text-gray-200" />
            <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
              Bu etiketi silmek istediğinizden emin misiniz?
            </h3>
            <div className="flex justify-center gap-4">
              <Button color="failure" onClick={handleDelete} disabled={deleting}>
                {deleting ? 'Siliniyor...' : 'Evet, Sil'}
              </Button>
              <Button color="gray" onClick={() => setShowDeleteModal(false)}>
                Hayır, İptal
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default AdminTags;
