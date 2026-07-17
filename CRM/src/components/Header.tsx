/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Bell,
  LogOut,
  FolderOpen,
  Table,
  Search,
  ExternalLink,
  ChevronDown,
  Sparkles
} from 'lucide-react';
import { User } from '../types';

interface HeaderProps {
  user: any | null;
  spreadsheetId: string | null;
  activeRole: 'Super Admin' | 'IT Developer' | 'Marketing' | 'Customer Service' | 'Client';
  setActiveRole: (role: 'Super Admin' | 'IT Developer' | 'Marketing' | 'Customer Service' | 'Client') => void;
  onLogout: () => void;
  onSearch: (q: string) => void;
  notificationsCount: number;
  onClearNotifications: () => void;
}

export default function Header({
  user,
  spreadsheetId,
  activeRole,
  setActiveRole,
  onLogout,
  onSearch,
  notificationsCount,
  onClearNotifications
}: HeaderProps) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const sheetUrl = spreadsheetId
    ? `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`
    : '#';

  const rolesList: ('Super Admin' | 'IT Developer' | 'Marketing' | 'Customer Service' | 'Client')[] = [
    'Super Admin',
    'IT Developer',
    'Marketing',
    'Customer Service',
    'Client'
  ];

  return (
    <header className="bg-white border-b border-slate-200 h-16 px-6 flex items-center justify-between shrink-0 relative z-10 shadow-sm">
      {/* Search Input */}
      <div className="w-1/3 relative">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
          <Search size={18} />
        </span>
        <input
          id="global-search-input"
          type="text"
          placeholder="Cari client, order, invoice, tiket..."
          onChange={(e) => onSearch(e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 pl-10 pr-4 py-2 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
        />
      </div>

      {/* Action Tools */}
      <div className="flex items-center space-x-4">
        {/* Google Spreadsheet Integration Button */}
        {spreadsheetId && (
          <a
            id="sheet-db-link"
            href={sheetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1 px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-xs font-semibold rounded-lg transition"
            title="Buka Spreadsheet Database Realtime Anda"
          >
            <Table size={14} />
            <span className="hidden md:inline">Google Sheet DB</span>
            <ExternalLink size={12} />
          </a>
        )}

        {/* Google Drive Shortcut */}
        <a
          id="drive-folder-link"
          href="https://drive.google.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center space-x-1 px-3 py-1.5 bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 text-xs font-semibold rounded-lg transition"
          title="Buka Google Drive"
        >
          <FolderOpen size={14} />
          <span className="hidden md:inline">Google Drive</span>
          <ExternalLink size={12} />
        </a>

        {/* Role Quick Switch (RBAC Live Showcase) */}
        <div className="relative flex items-center space-x-2 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-lg">
          <Sparkles size={14} className="text-indigo-600" />
          <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider hidden lg:inline">
            Showcase Role:
          </span>
          <select
            id="role-showcase-select"
            value={activeRole}
            onChange={(e) => {
              setActiveRole(e.target.value as any);
              setShowProfileMenu(false);
            }}
            className="bg-transparent text-xs font-semibold text-indigo-800 outline-none cursor-pointer pr-1"
          >
            {rolesList.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        {/* Notification Bell */}
        <div className="relative">
          <button
            id="notification-bell-btn"
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-slate-500 hover:bg-slate-50 rounded-full transition focus:outline-none"
          >
            <Bell size={20} />
            {notificationsCount > 0 && (
              <span className="absolute top-1 right-1 w-4.5 h-4.5 bg-red-500 text-white text-[9px] font-bold flex items-center justify-center rounded-full border-2 border-white animate-bounce">
                {notificationsCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div
              id="notifications-dropdown"
              className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 shadow-xl rounded-xl overflow-hidden py-2"
            >
              <div className="px-4 py-2 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <span className="font-semibold text-xs text-slate-700">Notifikasi</span>
                {notificationsCount > 0 && (
                  <button
                    onClick={() => {
                      onClearNotifications();
                      setShowNotifications(false);
                    }}
                    className="text-[10px] text-indigo-600 hover:underline font-semibold"
                  >
                    Bersihkan Semua
                  </button>
                )}
              </div>
              <div className="max-h-60 overflow-y-auto">
                {notificationsCount === 0 ? (
                  <div className="px-4 py-6 text-center text-xs text-slate-400">
                    Tidak ada notifikasi baru
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    <div className="px-4 py-3 text-xs hover:bg-indigo-50/30 transition">
                      <p className="font-semibold text-slate-800">Database Berhasil Terkoneksi</p>
                      <p className="text-slate-500 mt-0.5 text-[11px]">Database Spreadsheet CRM EduTech berhasil disinkronisasi.</p>
                    </div>
                    <div className="px-4 py-3 text-xs hover:bg-indigo-50/30 transition">
                      <p className="font-semibold text-slate-800">Pembayaran Menunggu Verifikasi</p>
                      <p className="text-slate-500 mt-0.5 text-[11px]">Ada bukti transfer dari Universitas Nusantara Malang.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile dropdown */}
        <div className="relative">
          <button
            id="user-profile-menu-btn"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center space-x-2 focus:outline-none"
          >
            <img
              src={user?.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
              alt={user?.displayName || 'User Avatar'}
              referrerPolicy="no-referrer"
              className="w-9 h-9 rounded-full border border-slate-200 shadow-sm"
            />
            <div className="hidden md:block text-left">
              <p className="text-xs font-semibold text-slate-800 leading-3">
                {user?.displayName || 'User Admin'}
              </p>
              <span className="text-[10px] text-slate-400 font-medium leading-none">
                {activeRole}
              </span>
            </div>
            <ChevronDown size={14} className="text-slate-400" />
          </button>

          {showProfileMenu && (
            <div
              id="user-profile-dropdown"
              className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 shadow-xl rounded-xl py-2 overflow-hidden"
            >
              <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
                <p className="text-xs font-bold text-slate-800">{user?.displayName}</p>
                <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
              </div>
              <div className="py-1">
                <button
                  id="profile-dropdown-logout-btn"
                  onClick={() => {
                    setShowProfileMenu(false);
                    onLogout();
                  }}
                  className="w-full px-4 py-2 text-left text-xs text-red-600 hover:bg-red-50 font-medium flex items-center space-x-2 transition"
                >
                  <LogOut size={14} />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
