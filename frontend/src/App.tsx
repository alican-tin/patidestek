import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

import FeedPage from './pages/FeedPage';
import PostDetailPage from './pages/PostDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MyPostsPage from './pages/MyPostsPage';
import PostFormPage from './pages/PostFormPage';

import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminPendingPosts from './pages/admin/AdminPendingPosts';
import AdminCategories from './pages/admin/AdminCategories';
import AdminTags from './pages/admin/AdminTags';
import AdminCommentReports from './pages/admin/AdminCommentReports';
import AdminUsers from './pages/admin/AdminUsers';

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {/* Public Routes */}
        <Route index element={<FeedPage />} />
        <Route path="posts/:id" element={<PostDetailPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />

        {/* Protected User Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="my/posts" element={<MyPostsPage />} />
          <Route path="my/posts/new" element={<PostFormPage />} />
          <Route path="my/posts/:id/edit" element={<PostFormPage />} />
        </Route>

        {/* Protected Admin Routes */}
        <Route element={<ProtectedRoute requireAdmin />}>
          <Route path="admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="posts/pending" element={<AdminPendingPosts />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="tags" element={<AdminTags />} />
            <Route path="comment-reports" element={<AdminCommentReports />} />
            <Route path="users" element={<AdminUsers />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  );
};

export default App;
