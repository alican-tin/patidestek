import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import { Footer } from 'flowbite-react';

const Layout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-paws">
      <Header />
      <main className="flex-1 mx-auto w-full max-w-6xl px-4 py-8">
        <Outlet />
      </main>
      <Footer container className="rounded-none border-t border-gray-200 bg-white">
        <div className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src="/images/logo-full.png" alt="PatiDestek" className="h-12 object-contain" />
          </div>
          <Footer.Copyright href="#" by="PatiDestek" year={2026} />
          <Footer.LinkGroup>
            <Footer.Link href="#">Hakkımızda</Footer.Link>
            <Footer.Link href="#">İletişim</Footer.Link>
          </Footer.LinkGroup>
        </div>
      </Footer>
    </div>
  );
};

export default Layout;
