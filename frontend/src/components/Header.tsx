import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar, Button, Dropdown, Avatar } from 'flowbite-react';
import { useAuth } from '../contexts/AuthContext';

const Header: React.FC = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <Navbar
      fluid
      className="bg-gradient-to-r from-brand-orange via-brand-orange to-brand-green shadow-soft"
    >
      <Navbar.Brand as={Link} to="/">
        <div className="flex items-center gap-3">
          <img src="/images/logo-icon.png" alt="PatiDestek" className="h-12 w-12 object-contain" />
          <div className="leading-tight">
            <span className="block whitespace-nowrap text-xl font-extrabold text-white">
              PatiDestek
            </span>
            <span className="hidden sm:block text-xs font-medium text-white/90">
              Patiler için dijital dayanışma
            </span>
          </div>
        </div>
      </Navbar.Brand>
      
      <div className="flex md:order-2 gap-2">
        {isAuthenticated ? (
          <Dropdown
            arrowIcon={false}
            inline
            label={
              <Avatar
                alt="User"
                rounded
                placeholderInitials={user?.name.charAt(0).toUpperCase()}
              />
            }
          >
            <Dropdown.Header>
              <span className="block text-sm">{user?.name}</span>
              <span className="block truncate text-sm font-medium">{user?.email}</span>
              {user?.isBanned && (
                <span className="text-red-600 text-xs">Hesabınız yasaklandı</span>
              )}
            </Dropdown.Header>
            <Dropdown.Item as={Link} to="/my/posts">
              İlanlarım
            </Dropdown.Item>
            {isAdmin && (
              <Dropdown.Item as={Link} to="/admin">
                Admin Panel
              </Dropdown.Item>
            )}
            <Dropdown.Divider />
            <Dropdown.Item onClick={handleLogout}>Çıkış Yap</Dropdown.Item>
          </Dropdown>
        ) : (
          <>
            <Button
              as={Link}
              to="/login"
              size="sm"
              className="border border-white/20 bg-white text-brand-ink hover:bg-brand-cream"
            >
              Giriş
            </Button>
            <Button
              as={Link}
              to="/register"
              size="sm"
              className="bg-brand-orangeDark text-white hover:bg-orange-700"
            >
              Kayıt Ol
            </Button>
          </>
        )}
        <Navbar.Toggle />
      </div>

      <Navbar.Collapse>
        <Navbar.Link as={Link} to="/" className="text-white hover:text-white/80">
          Ana Sayfa
        </Navbar.Link>
        {isAuthenticated && (
          <>
            <Navbar.Link as={Link} to="/my/posts" className="text-white hover:text-white/80">
              İlanlarım
            </Navbar.Link>
            <Navbar.Link as={Link} to="/my/posts/new" className="text-white hover:text-white/80">
              Yeni İlan
            </Navbar.Link>
          </>
        )}
      </Navbar.Collapse>
    </Navbar>
  );
};

export default Header;
