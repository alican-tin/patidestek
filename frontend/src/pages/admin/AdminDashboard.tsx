import React, { useState, useEffect } from 'react';
import { Card, Spinner } from 'flowbite-react';
import api from '../../lib/api';

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    pendingPosts: 0,
    openReports: 0,
    totalUsers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [pendingRes, reportsRes, usersRes] = await Promise.all([
          api.get('/admin/posts/pending'),
          api.get('/comment-reports?status=OPEN'),
          api.get('/users'),
        ]);
        setStats({
          pendingPosts: pendingRes.data.length,
          openReports: reportsRes.data.length,
          totalUsers: usersRes.data.length,
        });
      } catch (err) {
        console.error('Failed to load stats:', err);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="xl" />
      </div>
    );
  }

  return (
    <div>
      {/* Hero Banner */}
      <div className="mb-8 overflow-hidden rounded-2xl bg-white shadow-soft ring-1 ring-black/5">
        <div className="bg-gradient-to-r from-brand-orange to-brand-green px-6 py-5">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Admin Dashboard</h1>
          <p className="mt-1 text-sm text-white/90">Moderasyon, kullanıcılar ve şikayetler tek ekranda.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="rounded-2xl shadow-soft ring-1 ring-black/5 hover:shadow-lift transition-shadow">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-yellow-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <h3 className="text-lg font-bold text-brand-ink">Bekleyen İlanlar</h3>
            <p className="text-4xl font-extrabold text-yellow-500 mt-2">{stats.pendingPosts}</p>
          </div>
        </Card>

        <Card className="rounded-2xl shadow-soft ring-1 ring-black/5 hover:shadow-lift transition-shadow">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-red-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <h3 className="text-lg font-bold text-brand-ink">Açık Şikayetler</h3>
            <p className="text-4xl font-extrabold text-red-500 mt-2">{stats.openReports}</p>
          </div>
        </Card>

        <Card className="rounded-2xl shadow-soft ring-1 ring-black/5 hover:shadow-lift transition-shadow">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-blue-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            </div>
            <h3 className="text-lg font-bold text-brand-ink">Toplam Kullanıcı</h3>
            <p className="text-4xl font-extrabold text-blue-500 mt-2">{stats.totalUsers}</p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
