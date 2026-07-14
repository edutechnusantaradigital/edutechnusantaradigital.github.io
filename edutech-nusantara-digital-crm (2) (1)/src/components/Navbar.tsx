import React, { useState } from 'react';
import { Bell, Search, Plus, Sparkles, LogOut, CheckCircle, HelpCircle, Laptop } from 'lucide-react';
import { User } from '../types/crm';

interface NavbarProps {
  user: User;
  activeTab: string;
  isCollapsed: boolean;
  onLogout: () => void;
  onQuickAction?: (action: 'client' | 'order' | 'invoice') => void;
}

export default function Navbar({
  user,
  activeTab,
  isCollapsed,
  onLogout,
  onQuickAction
}: NavbarProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Mock Notification Feed
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Pembayaran Diterima', text: 'DP 50% OJS Jurnal oleh Prof. Dr. Irwan disetujui', unread: true, time: '5 Menit lalu' },
    { id: 2, title: 'Menunggu Verifikasi', text: 'Bukti transfer invoice INV-003 diupload oleh Hendra Wijaya', unread: true, time: '2 Jam lalu' },
    { id: 3, title: 'Revisi Project', text: 'Siska meminta revisi desain mockup pendaftaran ISBN', unread: false, time: '1 Hari lalu' }
  ]);

  const unreadCount = notifications.filter(n => n.unread).length;

  // Breadcrumb logic mapping
  const getBreadcrumbTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Admin Dashboard';
      case 'dashboard-client': return 'Client Workspace';
      case 'clients': return 'Manajemen Klien';
      case 'users': return 'Struktur Organisasi / Staff';
      case 'services': return 'Katalog Layanan';
      case 'orders': return 'Pesanan & Pekerjaan';
      case 'progress': return 'Timeline & Project Progress';
      case 'invoices': return 'Billing & Faktur Penjualan';
      case 'payments': return 'Verifikasi Pembayaran';
      case 'documents': return 'Dokumen Digital';
      case 'reports': return 'Laporan Finansial';
      case 'settings': return 'Pengaturan Instansi';
      case 'chats': return 'Konsultasi Pesan';
      case 'profile': return 'Profil Pengguna';
      default: return 'EduTech CRM';
    }
  };

  const handleMarkAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, unread: false })));
  };

  return (
    <header
      className={`fixed top-0 right-0 h-16 bg-white/75 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50 flex items-center justify-between px-6 z-20 transition-all duration-300 ${
        isCollapsed ? 'left-20' : 'left-64'
      }`}
    >
      {/* Left section: Breadcrumb & Title */}
      <div className="flex items-center gap-4">
        <div className="hidden sm:flex flex-col">
          <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            EduTech Nusantara Digital CRM
          </span>
          <span className="text-sm font-semibold text-slate-800 dark:text-white tracking-tight leading-tight">
            {getBreadcrumbTitle()}
          </span>
        </div>
      </div>

      {/* Right section: Actions & Notifications & User Profile */}
      <div className="flex items-center gap-4">
        {/* Quick Actions (Admin Only) */}
        {user.role !== 'CLIENT' && onQuickAction && (
          <div className="relative group">
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm shadow-blue-500/10 transition transform hover:-translate-y-0.5">
              <Plus size={14} />
              <span>Aksi Cepat</span>
            </button>
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl shadow-xl py-1 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition duration-150">
              <button
                onClick={() => onQuickAction('client')}
                className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
              >
                + Tambah Client Baru
              </button>
              <button
                onClick={() => onQuickAction('order')}
                className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
              >
                + Catat Order Baru
              </button>
              <button
                onClick={() => onQuickAction('invoice')}
                className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
              >
                + Terbitkan Invoice
              </button>
            </div>
          </div>
        )}

        {/* Brand Link shortcut */}
        <a
          href="https://edutechnusantaradigital.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-blue-600 transition"
        >
          <Sparkles size={13} className="text-amber-500" />
          <span>Kunjungi Website</span>
        </a>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-white bg-slate-50 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-800/50 transition relative"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white dark:ring-slate-900 animate-pulse"></span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 rounded-xl shadow-xl overflow-hidden z-40 animate-fade-in">
              <div className="px-4 py-3 border-b border-slate-200/50 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-800/50 flex justify-between items-center">
                <span className="text-xs font-bold text-slate-800 dark:text-white">Notifikasi Center</span>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                  >
                    Tandai Semua Dibaca
                  </button>
                )}
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-700/50 max-h-64 overflow-y-auto">
                {notifications.map(n => (
                  <div key={n.id} className={`p-3.5 transition hover:bg-slate-50 dark:hover:bg-slate-700/20 ${n.unread ? 'bg-blue-50/30 dark:bg-blue-950/10' : ''}`}>
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-semibold text-slate-800 dark:text-white">{n.title}</span>
                      <span className="text-[9px] text-slate-400 font-mono">{n.time}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-normal">{n.text}</p>
                  </div>
                ))}
              </div>
              <div className="p-2 border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 text-center">
                <span className="text-[10px] text-slate-400 font-medium">EduTech Nusantara Digital CRM</span>
              </div>
            </div>
          )}
        </div>

        {/* User Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 focus:outline-none"
          >
            <img
              src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&h=100&q=80'}
              alt={user.name}
              className="w-8 h-8 rounded-full border border-blue-500/20 shadow-sm object-cover"
            />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 rounded-xl shadow-xl overflow-hidden z-40">
              <div className="p-4 bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-700">
                <p className="text-xs font-bold text-slate-800 dark:text-white truncate">{user.name}</p>
                <p className="text-[10px] text-slate-400 truncate mt-0.5">{user.email}</p>
                <span className="inline-block mt-2 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-[9px] font-mono font-semibold rounded uppercase">
                  {user.role}
                </span>
              </div>
              <div className="py-1">
                <button
                  onClick={() => { setShowUserMenu(false); onLogout(); }}
                  className="w-full text-left px-4 py-2.5 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 flex items-center gap-2"
                >
                  <LogOut size={14} />
                  <span>Keluar dari Aplikasi</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
