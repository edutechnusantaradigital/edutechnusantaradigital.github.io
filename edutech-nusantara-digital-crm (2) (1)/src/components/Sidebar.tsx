import React from 'react';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Briefcase,
  Layers,
  FileSpreadsheet,
  FileCheck,
  CreditCard,
  FolderOpen,
  BarChart3,
  Settings,
  LogOut,
  Moon,
  Sun,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  User,
  Database
} from 'lucide-react';
import { UserRole } from '../types/crm';

interface SidebarProps {
  role: UserRole;
  userName: string;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  onLogout: () => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export default function Sidebar({
  role,
  userName,
  activeTab,
  setActiveTab,
  darkMode,
  setDarkMode,
  onLogout,
  isCollapsed,
  setIsCollapsed
}: SidebarProps) {
  const isAdminView = role !== 'CLIENT';

  // Sidebar Menu configuration based on Role Based Access Control (RBAC)
  let currentMenu: { id: string; name: string; icon: any }[] = [];

  if (role === 'SUPER_ADMIN') {
    currentMenu = [
      { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
      { id: 'clients', name: 'Data Client', icon: Users },
      { id: 'users', name: 'Data User / Staff', icon: UserCheck },
      { id: 'services', name: 'Katalog Layanan', icon: Briefcase },
      { id: 'orders', name: 'Order / Pesanan', icon: Layers },
      { id: 'progress', name: 'Progress Project', icon: FileSpreadsheet },
      { id: 'invoices', name: 'Invoice / Tagihan', icon: FileCheck },
      { id: 'payments', name: 'Verifikasi Pembayaran', icon: CreditCard },
      { id: 'documents', name: 'Pusat Dokumen', icon: FolderOpen },
      { id: 'reports', name: 'Laporan Finansial', icon: BarChart3 },
      { id: 'sheets', name: 'Integrasi Sheets', icon: Database },
      { id: 'settings', name: 'Pengaturan Instansi', icon: Settings }
    ];
  } else if (role === 'IT') {
    currentMenu = [
      { id: 'dashboard', name: 'Dashboard IT', icon: LayoutDashboard },
      { id: 'services', name: 'Kelola Website', icon: Briefcase },
      { id: 'progress', name: 'Maintenance Project', icon: FileSpreadsheet },
      { id: 'documents', name: 'Hosting & Domain', icon: FolderOpen },
      { id: 'sheets', name: 'Google Script & DB', icon: Database }
    ];
  } else if (role === 'MARKETING') {
    currentMenu = [
      { id: 'dashboard', name: 'Dashboard Marketing', icon: LayoutDashboard },
      { id: 'clients', name: 'Kelola Client', icon: Users },
      { id: 'services', name: 'Katalog Penawaran', icon: Briefcase },
      { id: 'orders', name: 'Order & Prospek', icon: Layers },
      { id: 'progress', name: 'Status Proyek', icon: FileSpreadsheet },
      { id: 'invoices', name: 'Invoice Tagihan', icon: FileCheck },
      { id: 'payments', name: 'Status Pembayaran', icon: CreditCard },
      { id: 'reports', name: 'Laporan Marketing', icon: BarChart3 }
    ];
  } else {
    // CLIENT or default fallback
    currentMenu = [
      { id: 'dashboard-client', name: 'Dashboard Client', icon: LayoutDashboard },
      { id: 'orders', name: 'Pesanan Saya', icon: Layers },
      { id: 'progress', name: 'Status Project', icon: FileSpreadsheet },
      { id: 'invoices', name: 'Invoice', icon: FileCheck },
      { id: 'payments', name: 'Pembayaran Saya', icon: CreditCard },
      { id: 'documents', name: 'Dokumen', icon: FolderOpen },
      { id: 'chats', name: 'Pesan / Konsultasi', icon: MessageSquare },
      { id: 'profile', name: 'Profil Saya', icon: User }
    ];
  }

  return (
    <aside
      className={`fixed top-0 left-0 h-screen bg-white/75 dark:bg-slate-900/80 backdrop-blur-md border-r border-slate-200/50 dark:border-slate-800/50 flex flex-col justify-between transition-all duration-300 z-30 shadow-sm ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div>
        {/* Sidebar Header / Brand Logo */}
        <div className={`h-16 flex items-center justify-between px-4 border-b border-slate-200/50 dark:border-slate-800/50 transition-all duration-300 ${!isCollapsed ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white' : ''}`}>
          <div className="flex items-center gap-3 overflow-hidden">
            <div className={`w-9 h-9 min-w-9 rounded-lg flex items-center justify-center shadow-md ${!isCollapsed ? 'bg-white/20 backdrop-blur-sm text-white' : 'bg-gradient-to-tr from-blue-600 to-sky-400 text-white shadow-blue-500/20'}`}>
              <ShieldAlert size={20} />
            </div>
            {!isCollapsed && (
              <div className="leading-tight animate-fade-in text-white">
                <span className="text-sm font-bold tracking-tight block truncate">
                  EduTech CRM
                </span>
                <span className="text-[9px] font-mono font-bold tracking-widest text-blue-200 uppercase">
                  {role} Panel
                </span>
              </div>
            )}
          </div>
          
          {/* Toggle Collapsed Button */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`p-1.5 rounded-lg transition ${
              !isCollapsed
                ? 'text-white/80 hover:text-white bg-white/10 border border-white/10 hover:bg-white/20'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 bg-slate-50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50'
            }`}
          >
            {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>

        {/* Sidebar Menu Items */}
        <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-14rem)]">
          {currentMenu.map((item) => {
            const IconComponent = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-100/50 dark:border-blue-900/40 shadow-sm font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <IconComponent
                  size={18}
                  className={`transition-all ${
                    isActive ? 'scale-110 text-blue-600 dark:text-blue-400' : 'group-hover:scale-110 text-slate-400'
                  }`}
                />
                {!isCollapsed && (
                  <span className="animate-fade-in block truncate">{item.name}</span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Sidebar Footer Controls */}
      <div className="p-3 border-t border-slate-200/50 dark:border-slate-800/50 space-y-2">
        {/* Storage Used widget from Professional Polish design */}
        {!isCollapsed && (
          <div className="bg-slate-900 dark:bg-slate-950 text-white p-4 rounded-2xl shadow-sm mb-2">
            <p className="text-[10px] uppercase tracking-wider opacity-60 mb-2 font-mono font-bold">Storage Used</p>
            <div className="w-full bg-white/20 h-1.5 rounded-full mb-2">
              <div className="bg-blue-400 w-3/4 h-full rounded-full"></div>
            </div>
            <p className="text-xs">7.5 GB of 10 GB</p>
          </div>
        )}

        {/* Dark Mode Switcher */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="w-full flex items-center justify-between p-2.5 rounded-xl text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 border border-transparent hover:border-slate-200/30 dark:hover:border-slate-700/30 transition text-sm font-medium"
        >
          <div className="flex items-center gap-3.5">
            {darkMode ? (
              <>
                <Sun size={18} className="text-amber-500" />
                {!isCollapsed && <span className="text-slate-600 dark:text-slate-300">Light Mode</span>}
              </>
            ) : (
              <>
                <Moon size={18} className="text-slate-400" />
                {!isCollapsed && <span className="text-slate-600 dark:text-slate-300">Dark Mode</span>}
              </>
            )}
          </div>
        </button>

        {/* User Card (When sidebar not collapsed) */}
        {!isCollapsed && (
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-200/30 dark:border-slate-700/30 flex items-center gap-3 mb-1.5">
            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 font-bold text-xs uppercase">
              {userName.charAt(0)}
            </div>
            <div className="leading-tight overflow-hidden">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block truncate">{userName}</span>
              <span className="text-[10px] text-slate-400 block truncate">{role} Account</span>
            </div>
          </div>
        )}

        {/* Logout Button */}
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-sm font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 border border-transparent hover:border-rose-100 dark:hover:border-rose-900/30 transition"
        >
          <LogOut size={18} className="text-rose-500" />
          {!isCollapsed && <span className="animate-fade-in font-semibold">Keluar</span>}
        </button>
      </div>
    </aside>
  );
}
