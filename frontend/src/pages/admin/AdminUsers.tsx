import React, { useState, useEffect } from 'react';
import { Table, Button, Badge, Alert, Spinner, Select } from 'flowbite-react';
import api from '../../lib/api';
import { User } from '../../types';

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const loadUsers = async () => {
    try {
      const response = await api.get<User[]>('/users');
      setUsers(response.data);
    } catch (err) {
      setError('Kullanıcılar yüklenemedi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleRoleChange = async (id: number, role: string) => {
    setActionLoading(id);
    try {
      const response = await api.patch<User>(`/users/${id}/role`, { role });
      setUsers(users.map((u) => (u.id === id ? { ...u, role: response.data.role } : u)));
    } catch (err) {
      setError('Rol güncellenemedi.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleBanToggle = async (id: number, isBanned: boolean) => {
    setActionLoading(id);
    try {
      const response = await api.patch<User>(`/users/${id}/ban`, { isBanned });
      setUsers(users.map((u) => (u.id === id ? { ...u, isBanned: response.data.isBanned } : u)));
    } catch (err) {
      setError('Ban durumu güncellenemedi.');
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
      <h1 className="text-3xl font-bold mb-6">Kullanıcılar</h1>

      {error && (
        <Alert color="failure" className="mb-4" onDismiss={() => setError('')}>
          {error}
        </Alert>
      )}

      <Table>
        <Table.Head>
          <Table.HeadCell>ID</Table.HeadCell>
          <Table.HeadCell>Ad</Table.HeadCell>
          <Table.HeadCell>E-posta</Table.HeadCell>
          <Table.HeadCell>Rol</Table.HeadCell>
          <Table.HeadCell>Durum</Table.HeadCell>
          <Table.HeadCell>Kayıt Tarihi</Table.HeadCell>
          <Table.HeadCell>İşlemler</Table.HeadCell>
        </Table.Head>
        <Table.Body>
          {users.map((user) => (
            <Table.Row key={user.id}>
              <Table.Cell>{user.id}</Table.Cell>
              <Table.Cell>{user.name}</Table.Cell>
              <Table.Cell>{user.email}</Table.Cell>
              <Table.Cell>
                <Select
                  value={user.role}
                  onChange={(e) => handleRoleChange(user.id, e.target.value)}
                  disabled={actionLoading === user.id}
                  sizing="sm"
                  className="w-24"
                >
                  <option value="USER">USER</option>
                  <option value="ADMIN">ADMIN</option>
                </Select>
              </Table.Cell>
              <Table.Cell>
                {user.isBanned ? (
                  <Badge color="failure">Yasaklı</Badge>
                ) : (
                  <Badge color="success">Aktif</Badge>
                )}
              </Table.Cell>
              <Table.Cell>
                {user.createdAt
                  ? new Date(user.createdAt).toLocaleDateString('tr-TR')
                  : '-'}
              </Table.Cell>
              <Table.Cell>
                <Button
                  size="xs"
                  color={user.isBanned ? 'success' : 'failure'}
                  onClick={() => handleBanToggle(user.id, !user.isBanned)}
                  disabled={actionLoading === user.id}
                >
                  {actionLoading === user.id ? (
                    <Spinner size="sm" />
                  ) : user.isBanned ? (
                    'Yasağı Kaldır'
                  ) : (
                    'Yasakla'
                  )}
                </Button>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </div>
  );
};

export default AdminUsers;
