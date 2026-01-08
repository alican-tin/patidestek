import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from 'flowbite-react';
import { HiChartPie, HiClock, HiFolder, HiTag, HiExclamationCircle, HiUsers } from 'react-icons/hi';

const AdminLayout: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex gap-6">
      <Sidebar className="w-64">
        <Sidebar.Items>
          <Sidebar.ItemGroup>
            <Sidebar.Item
              as={Link}
              to="/admin"
              active={isActive('/admin')}
              icon={HiChartPie}
            >
              Dashboard
            </Sidebar.Item>
            <Sidebar.Item
              as={Link}
              to="/admin/posts/pending"
              active={isActive('/admin/posts/pending')}
              icon={HiClock}
            >
              Bekleyen İlanlar
            </Sidebar.Item>
            <Sidebar.Item
              as={Link}
              to="/admin/categories"
              active={isActive('/admin/categories')}
              icon={HiFolder}
            >
              Kategoriler
            </Sidebar.Item>
            <Sidebar.Item
              as={Link}
              to="/admin/tags"
              active={isActive('/admin/tags')}
              icon={HiTag}
            >
              Etiketler
            </Sidebar.Item>
            <Sidebar.Item
              as={Link}
              to="/admin/comment-reports"
              active={isActive('/admin/comment-reports')}
              icon={HiExclamationCircle}
            >
              Şikayetler
            </Sidebar.Item>
            <Sidebar.Item
              as={Link}
              to="/admin/users"
              active={isActive('/admin/users')}
              icon={HiUsers}
            >
              Kullanıcılar
            </Sidebar.Item>
          </Sidebar.ItemGroup>
        </Sidebar.Items>
      </Sidebar>

      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
