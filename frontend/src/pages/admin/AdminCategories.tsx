import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, TextInput, Label, Alert, Spinner } from 'flowbite-react';
import { HiOutlineExclamationCircle } from 'react-icons/hi';
import api from '../../lib/api';
import { Category } from '../../types';

const AdminCategories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const loadCategories = async () => {
    try {
      const response = await api.get<Category[]>('/categories');
      setCategories(response.data);
    } catch (err) {
      setError('Kategoriler yüklenemedi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const openModal = (category?: Category) => {
    if (category) {
      setEditId(category.id);
      setName(category.name);
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
        const response = await api.patch<Category>(`/categories/${editId}`, { name });
        setCategories(categories.map((c) => (c.id === editId ? response.data : c)));
      } else {
        const response = await api.post<Category>('/categories', { name });
        setCategories([...categories, response.data]);
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
      await api.delete(`/categories/${deleteId}`);
      setCategories(categories.filter((c) => c.id !== deleteId));
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
        <h1 className="text-3xl font-bold">Kategoriler (İlan Tipleri)</h1>
        <Button onClick={() => openModal()}>+ Yeni Kategori</Button>
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
          {categories.map((category) => (
            <Table.Row key={category.id}>
              <Table.Cell>{category.id}</Table.Cell>
              <Table.Cell>{category.name}</Table.Cell>
              <Table.Cell>
                <div className="flex gap-2">
                  <Button size="xs" onClick={() => openModal(category)}>
                    Düzenle
                  </Button>
                  <Button size="xs" color="failure" onClick={() => openDeleteModal(category.id)}>
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
        <Modal.Header>{editId ? 'Kategori Düzenle' : 'Yeni Kategori'}</Modal.Header>
        <Modal.Body>
          <div>
            <Label htmlFor="name" value="Kategori Adı" />
            <TextInput
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Örn: Kayıp, Bulundu..."
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
              Bu kategoriyi silmek istediğinizden emin misiniz?
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

export default AdminCategories;
