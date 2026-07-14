import React, { useState, useEffect } from 'react';
import {
  Users,
  TrendingUp,
  FolderDot,
  CheckCircle2,
  Calendar as CalendarIcon,
  ChevronRight,
  UserPlus,
  FilePlus,
  ArrowUpRight,
  Clock,
  Sparkles,
  Inbox,
  Cpu,
  Wrench,
  Database,
  BarChart3,
  Server,
  Activity,
  HardDrive
} from 'lucide-react';
import { formatRupiah } from '../utils';

interface AdminDashboardProps {
  stats: {
    totalClients: number;
    activeProjects: number;
    completedProjects: number;
    pendingInvoicesCount: number;
    totalRevenue: number;
    pendingRevenue: number;
    revenueByMonth: { month: string; amount: number }[];
    ordersByCategory: { category: string; value: number }[];
  };
  onNavigateToTab: (tab: string) => void;
  onQuickAction: (action: 'client' | 'order' | 'invoice') => void;
  role: string;
}

export default function AdminDashboard({ stats, onNavigateToTab, onQuickAction, role }: AdminDashboardProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const date = new Date(year, month, 1);
    const days = [];
    while (date.getMonth() === month) {
      days.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }
    return days;
  };

  const days = getDaysInMonth();
  const daysOfWeek = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

  const calendarEvents = [
    { day: 15, title: 'Deadline OJS Prof Irwan', type: 'high' },
    { day: 19, title: 'Launch Web Nusantara Learn', type: 'success' },
    { day: 26, title: 'AI Automation Webhook Trial', type: 'warning' }
  ];

  const getHeroContent = () => {
    if (role === 'IT') {
      return {
        badge: 'PORTAL MAINTENANCE & IT SUPPORTS',
        title: 'EduTech IT & Infrastructure Hub',
        description: 'Selamat datang di konsol IT & maintenance. Monitor stabilitas server hosting, masa aktif domain klien, kelola basis data digital, serta maintenance script integrasi Google Workspace.'
      };
    }
    if (role === 'MARKETING') {
      return {
        badge: 'PORTAL AKQUISISI & PENAWARAN',
        title: 'EduTech Marketing Dashboard',
        description: 'Selamat datang di ruang kerja tim marketing. Kelola daur hidup prospek klien, susun penawaran OJS/legalitas sekolah, monitor status pembayaran invoice, dan dampingi follow up komunikasi pelanggan.'
      };
    }
    return {
      badge: 'SISTEM INFORMASI CRM AKTIF',
      title: 'EduTech Nusantara Digital CRM',
      description: 'Solusi integrasi database modern. Pantau seluruh daur hidup klien, invoice pembayaran digital, pendaftaran legalitas instansi, hingga laporan pendapatan otomatis dalam satu dashboard terpadu.'
    };
  };

  const hero = getHeroContent();

  return (
    <div className="space-y-6">
      {/* Dynamic Welcome Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-blue-700 to-sky-600 p-6 md:p-8 text-white shadow-lg shadow-blue-500/10">
        <div className="absolute right-0 bottom-0 top-0 opacity-15 hidden md:block">
          <svg width="300" height="100%" viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="200" cy="150" r="120" stroke="white" strokeWidth="12" />
            <circle cx="200" cy="150" r="80" stroke="white" strokeWidth="6" />
          </svg>
        </div>
        <div className="relative z-10 space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full backdrop-blur-md text-xs font-semibold tracking-wider">
            <Sparkles size={13} className="text-amber-300" />
            <span>{hero.badge}</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold font-sans tracking-tight leading-tight">
            {hero.title}
          </h2>
          <p className="text-sm text-blue-100 leading-relaxed font-light">
            {hero.description}
          </p>
          <div className="flex flex-wrap gap-4 pt-2">
            <div className="flex items-center gap-1.5 text-xs text-sky-100 font-mono bg-blue-900/30 px-3 py-1.5 rounded-lg border border-blue-500/20">
              <Clock size={14} />
              <span>{currentTime.toLocaleTimeString('id-ID')} WIB</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-sky-100 font-mono bg-blue-900/30 px-3 py-1.5 rounded-lg border border-blue-500/20">
              <CalendarIcon size={14} />
              <span>{currentTime.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Bento Row */}
      {role === 'IT' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            onClick={() => onNavigateToTab('progress')}
            className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/60 shadow-sm hover:shadow-md transition cursor-pointer group"
          >
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">MAINTENANCE PROJECT</p>
                <h3 className="text-2xl font-bold text-slate-800 dark:text-white group-hover:text-blue-600 transition">
                  {stats.activeProjects} Proyek
                </h3>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl text-blue-600 dark:text-blue-400">
                <Wrench size={20} />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-xs text-emerald-600">
              <span>Sistem & Server Berjalan Lancar</span>
            </div>
          </div>

          <div
            onClick={() => onNavigateToTab('documents')}
            className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/60 shadow-sm hover:shadow-md transition cursor-pointer group"
          >
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">HOSTING & DOMAIN</p>
                <h3 className="text-2xl font-bold text-slate-800 dark:text-white group-hover:text-sky-600 transition">
                  {stats.completedProjects + 3} Aktif
                </h3>
              </div>
              <div className="p-3 bg-sky-50 dark:bg-sky-950/40 rounded-xl text-sky-600 dark:text-sky-400">
                <Server size={20} />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
              <span>Uptime Server: 99.9%</span>
            </div>
          </div>

          <div
            onClick={() => onNavigateToTab('sheets')}
            className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/60 shadow-sm hover:shadow-md transition cursor-pointer group"
          >
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">GOOGLE SHEETS DATA</p>
                <h3 className="text-2xl font-bold text-slate-800 dark:text-white group-hover:text-emerald-600 transition">
                  Connected
                </h3>
              </div>
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl text-emerald-600 dark:text-emerald-400">
                <Database size={20} />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-xs text-emerald-600">
              <span>Auto-Sync Realtime Aktif</span>
            </div>
          </div>

          <div
            className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/60 shadow-sm hover:shadow-md transition cursor-pointer group"
          >
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">SECURITY PLATFORM</p>
                <h3 className="text-2xl font-bold text-slate-800 dark:text-white group-hover:text-amber-600 transition">
                  Secured
                </h3>
              </div>
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl text-amber-600 dark:text-amber-400">
                <Cpu size={20} />
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
              <span>Firewall: Aktif & Terlindungi</span>
            </div>
          </div>
        </div>
      ) : role === 'MARKETING' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            onClick={() => onNavigateToTab('clients')}
            className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/60 shadow-sm hover:shadow-md transition cursor-pointer group"
          >
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">TOTAL KLIEN</p>
                <h3 className="text-2xl font-bold text-slate-800 dark:text-white group-hover:text-blue-600 transition">
                  {stats.totalClients}
                </h3>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl text-blue-600 dark:text-blue-400">
                <Users size={20} />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-xs text-emerald-600">
              <TrendingUp size={14} />
              <span>100% Growth Semester Ini</span>
            </div>
          </div>

          <div
            onClick={() => onNavigateToTab('orders')}
            className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/60 shadow-sm hover:shadow-md transition cursor-pointer group"
          >
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">PROSPEK & ORDER BARU</p>
                <h3 className="text-2xl font-bold text-slate-800 dark:text-white group-hover:text-sky-600 transition">
                  {stats.activeProjects} Prospek
                </h3>
              </div>
              <div className="p-3 bg-sky-50 dark:bg-sky-950/40 rounded-xl text-sky-600 dark:text-sky-400">
                <FolderDot size={20} />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-400">
              <span>Siap ditindaklanjuti</span>
            </div>
          </div>

          <div
            onClick={() => onNavigateToTab('invoices')}
            className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/60 shadow-sm hover:shadow-md transition cursor-pointer group"
          >
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">INVOICE MENUNGGU</p>
                <h3 className="text-2xl font-bold text-slate-800 dark:text-white group-hover:text-emerald-600 transition">
                  {stats.pendingInvoicesCount} Invoice
                </h3>
              </div>
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 size={20} />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-xs text-amber-600">
              <span>Menunggu pembayaran klien</span>
            </div>
          </div>

          <div
            onClick={() => onNavigateToTab('reports')}
            className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/60 shadow-sm hover:shadow-md transition cursor-pointer group"
          >
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">PENDAPATAN TERTUNDA</p>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white group-hover:text-indigo-600 transition truncate font-sans">
                  {formatRupiah(stats.pendingRevenue)}
                </h3>
              </div>
              <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl text-indigo-600 dark:text-indigo-400">
                <TrendingUp size={20} />
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between text-xs text-slate-400 font-mono">
              <span>Total Sukses:</span>
              <span className="font-semibold text-emerald-600">{formatRupiah(stats.totalRevenue)}</span>
            </div>
          </div>
        </div>
      ) : (
        // DEFAULT / SUPER ADMIN
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            onClick={() => onNavigateToTab('clients')}
            className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/60 shadow-sm hover:shadow-md transition cursor-pointer group relative overflow-hidden"
          >
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">TOTAL CLIENT AKTIF</p>
                <h3 className="text-2xl font-bold text-slate-800 dark:text-white group-hover:text-blue-600 transition">
                  {stats.totalClients}
                </h3>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl text-blue-600 dark:text-blue-400 transition">
                <Users size={20} />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-xs text-emerald-600">
              <TrendingUp size={14} />
              <span>100% Growth Semester Ini</span>
            </div>
          </div>

          <div
            onClick={() => onNavigateToTab('progress')}
            className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/60 shadow-sm hover:shadow-md transition cursor-pointer group"
          >
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">PROYEK AKTIF (ON PROGRESS)</p>
                <h3 className="text-2xl font-bold text-slate-800 dark:text-white group-hover:text-sky-600 transition">
                  {stats.activeProjects}
                </h3>
              </div>
              <div className="p-3 bg-sky-50 dark:bg-sky-950/40 rounded-xl text-sky-600 dark:text-sky-400">
                <FolderDot size={20} />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
              <Clock size={14} />
              <span>Sedang ditangani oleh Tim Dev</span>
            </div>
          </div>

          <div
            onClick={() => onNavigateToTab('progress')}
            className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/60 shadow-sm hover:shadow-md transition cursor-pointer group"
          >
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">PROJECT SELESAI</p>
                <h3 className="text-2xl font-bold text-slate-800 dark:text-white group-hover:text-emerald-600 transition">
                  {stats.completedProjects}
                </h3>
              </div>
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 size={20} />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-xs text-emerald-600">
              <span>Sertifikat Serah Terima Terbit</span>
            </div>
          </div>

          <div
            onClick={() => onNavigateToTab('reports')}
            className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/60 shadow-sm hover:shadow-md transition cursor-pointer group"
          >
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">TOTAL PENDAPATAN (REVENUE)</p>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white group-hover:text-blue-600 transition truncate">
                  {formatRupiah(stats.totalRevenue)}
                </h3>
              </div>
              <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl text-indigo-600 dark:text-indigo-400">
                <TrendingUp size={20} />
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between text-xs text-slate-400 font-mono">
              <span>Piutang Pending:</span>
              <span className="font-semibold text-rose-500">{formatRupiah(stats.pendingRevenue)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Charts & Visual Rows */}
      {role === 'IT' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700/60 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-white">Server Resource Status Monitor</h4>
                <p className="text-xs text-slate-400">Metrik stabilitas hosting cloud EduTech Nusantara</p>
              </div>
              <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 text-xs font-semibold rounded-lg flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                ONLINE
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-slate-800 space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-500">Core CPU Usage</span>
                  <span className="text-blue-600">12%</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full">
                  <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: '12%' }}></div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-slate-800 space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-500">RAM / Memory Allocation</span>
                  <span className="text-purple-600">3.4 GB / 8 GB</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full">
                  <div className="bg-purple-600 h-1.5 rounded-full" style={{ width: '42.5%' }}></div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-slate-800 space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-500">Storage / Disk Space</span>
                  <span className="text-sky-600">7.5 GB / 10 GB</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full">
                  <div className="bg-sky-600 h-1.5 rounded-full" style={{ width: '75%' }}></div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-slate-800 space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-500">Database Connection Pool</span>
                  <span className="text-emerald-600">14 Active</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full">
                  <div className="bg-emerald-600 h-1.5 rounded-full" style={{ width: '28%' }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700/60 shadow-sm space-y-4 flex flex-col justify-between">
            <div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-white">Distribusi Layanan Sistem</h4>
              <p className="text-xs text-slate-400">Pengelompokan website & platform kelolaan IT</p>
            </div>

            <div className="space-y-4">
              {stats.ordersByCategory.map((cat, i) => {
                const totalVals = stats.ordersByCategory.reduce((s, x) => s + x.value, 0);
                const percentage = totalVals > 0 ? Math.round((cat.value / totalVals) * 100) : 0;
                const barColors = ['bg-blue-600', 'bg-sky-400', 'bg-amber-400', 'bg-emerald-400'];
                return (
                  <div key={i} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-600 dark:text-slate-300">{cat.category}</span>
                      <span className="text-slate-800 dark:text-white">{percentage}% ({cat.value})</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2">
                      <div
                        style={{ width: `${percentage}%` }}
                        className={`h-2 rounded-full ${barColors[i % barColors.length]}`}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-700/80 flex justify-between items-center text-xs text-slate-400">
              <span>Rincian Website Sistem</span>
              <button onClick={() => onNavigateToTab('services')} className="text-blue-600 hover:underline inline-flex items-center gap-0.5">
                <span>Kelola Layanan</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        // DEFAULT CHARTS FOR SUPER ADMIN & MARKETING
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700/60 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-white">Tren Pendapatan Bulanan</h4>
                <p className="text-xs text-slate-400">Data real-time penerimaan kas (lunas & down-payment)</p>
              </div>
              <span className="px-3 py-1 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 text-xs font-semibold rounded-lg">
                Tahun 2026
              </span>
            </div>

            <div className="h-64 w-full relative flex items-end pt-6">
              <div className="absolute top-0 left-0 right-0 h-full flex flex-col justify-between pointer-events-none">
                {[1, 2, 3, 4, 5].map((_, i) => (
                  <div key={i} className="w-full border-t border-slate-100 dark:border-slate-700/50 h-0"></div>
                ))}
              </div>

              <div className="w-full h-4/5 flex justify-around items-end relative z-10 px-2">
                {stats.revenueByMonth.map((item, index) => {
                  const heightPercentage = Math.max(15, (item.amount / 52000000) * 100);
                  return (
                    <div key={index} className="flex flex-col items-center gap-2 group w-12">
                      <div className="absolute mb-24 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] py-1 px-2 rounded shadow-md pointer-events-none z-20 whitespace-nowrap">
                        {formatRupiah(item.amount)}
                      </div>
                      <div
                        style={{ height: `${heightPercentage}%` }}
                        className="w-8 rounded-t-lg bg-gradient-to-t from-blue-600 to-sky-400 group-hover:from-blue-700 group-hover:to-sky-500 transition-all duration-500 shadow-md shadow-blue-500/10 cursor-pointer"
                      ></div>
                      <span className="text-[10px] font-mono font-medium text-slate-400 dark:text-slate-500">
                        {item.month}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700/60 shadow-sm space-y-4 flex flex-col justify-between">
            <div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-white">Pangsa Pasar Layanan</h4>
              <p className="text-xs text-slate-400">Distribusi pesanan per kategori produk</p>
            </div>

            <div className="space-y-4">
              {stats.ordersByCategory.map((cat, i) => {
                const totalVals = stats.ordersByCategory.reduce((s, x) => s + x.value, 0);
                const percentage = totalVals > 0 ? Math.round((cat.value / totalVals) * 100) : 0;
                const barColors = ['bg-blue-600', 'bg-sky-400', 'bg-amber-400', 'bg-emerald-400'];
                return (
                  <div key={i} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-600 dark:text-slate-300">{cat.category}</span>
                      <span className="text-slate-800 dark:text-white">{percentage}% ({cat.value})</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2">
                      <div
                        style={{ width: `${percentage}%` }}
                        className={`h-2 rounded-full ${barColors[i % barColors.length]}`}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-700/80 flex justify-between items-center text-xs text-slate-400">
              <span>Daftar Layanan EduTech</span>
              <button onClick={() => onNavigateToTab('services')} className="text-blue-600 hover:underline inline-flex items-center gap-0.5">
                <span>Buka Katalog</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Grid: Calendar, Quick Actions, and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Widget */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700/60 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <CalendarIcon size={16} className="text-blue-500" />
              <span>Kalender Rencana</span>
            </h4>
            <span className="text-xs text-slate-500 font-semibold uppercase">
              {currentDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
            </span>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-400 uppercase">
            {daysOfWeek.map((d, i) => (
              <span key={i}>{d}</span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1 text-center">
            {Array.from({ length: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay() }).map((_, i) => (
              <div key={i} className="h-7 w-7"></div>
            ))}
            
            {days.map((day, i) => {
              const dayNum = day.getDate();
              const hasEvent = calendarEvents.find(e => e.day === dayNum);
              const isToday = dayNum === new Date().getDate() && day.getMonth() === new Date().getMonth();

              return (
                <div
                  key={i}
                  className={`h-7 w-7 mx-auto rounded-lg flex flex-col items-center justify-center text-xs relative cursor-pointer font-medium transition ${
                    isToday
                      ? 'bg-blue-600 text-white font-bold'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50'
                  }`}
                >
                  <span>{dayNum}</span>
                  {hasEvent && (
                    <span
                      className={`absolute bottom-0.5 w-1 h-1 rounded-full ${
                        hasEvent.type === 'high' ? 'bg-rose-500' : hasEvent.type === 'success' ? 'bg-emerald-500' : 'bg-amber-500'
                      }`}
                    ></span>
                  )}
                </div>
              );
            })}
          </div>

          <div className="pt-2 space-y-2 border-t border-slate-100 dark:border-slate-700/80">
            {calendarEvents.map((evt, i) => (
              <div key={i} className="flex items-center gap-2 text-[11px]">
                <span className={`w-2 h-2 rounded-full ${evt.type === 'high' ? 'bg-rose-500' : evt.type === 'success' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                <span className="font-semibold text-slate-500">Tgl {evt.day}:</span>
                <span className="text-slate-700 dark:text-slate-300 truncate">{evt.title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions Shortcuts */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700/60 shadow-sm space-y-5">
          <div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-white">Aksi Cepat Instan</h4>
            <p className="text-xs text-slate-400">Tombol pintas sesuai wewenang role Anda</p>
          </div>

          {role === 'IT' ? (
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => onNavigateToTab('progress')}
                className="p-4 rounded-xl border border-blue-500/10 hover:border-blue-500/30 bg-blue-50/20 dark:bg-blue-950/15 text-left group transition animate-fade-in"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3">
                  <Wrench size={16} />
                </div>
                <h5 className="text-xs font-bold text-slate-800 dark:text-white group-hover:text-blue-600 transition">Maintenance</h5>
                <p className="text-[10px] text-slate-400 mt-1">Status Proyek</p>
              </button>

              <button
                onClick={() => onNavigateToTab('sheets')}
                className="p-4 rounded-xl border border-sky-500/10 hover:border-sky-500/30 bg-sky-50/20 dark:bg-sky-950/15 text-left group transition animate-fade-in"
              >
                <div className="w-8 h-8 rounded-lg bg-sky-100 dark:bg-sky-900/40 text-sky-600 dark:text-sky-400 flex items-center justify-center mb-3">
                  <Database size={16} />
                </div>
                <h5 className="text-xs font-bold text-slate-800 dark:text-white group-hover:text-sky-600 transition">Google Sheets</h5>
                <p className="text-[10px] text-slate-400 mt-1">Integrasi DB</p>
              </button>

              <button
                onClick={() => onNavigateToTab('services')}
                className="p-4 rounded-xl border border-indigo-500/10 hover:border-indigo-500/30 bg-indigo-50/20 dark:bg-indigo-950/15 text-left group transition animate-fade-in"
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3">
                  <Server size={16} />
                </div>
                <h5 className="text-xs font-bold text-slate-800 dark:text-white group-hover:text-indigo-600 transition">Web Catalog</h5>
                <p className="text-[10px] text-slate-400 mt-1">Kelola Website</p>
              </button>

              <button
                onClick={() => onNavigateToTab('documents')}
                className="p-4 rounded-xl border border-slate-500/10 hover:border-slate-500/30 bg-slate-50 dark:bg-slate-800 text-left group transition animate-fade-in"
              >
                <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 flex items-center justify-center mb-3">
                  <HardDrive size={16} />
                </div>
                <h5 className="text-xs font-bold text-slate-800 dark:text-white group-hover:text-slate-600 transition">Hosting/Domain</h5>
                <p className="text-[10px] text-slate-400 mt-1">Pusat Dokumen</p>
              </button>
            </div>
          ) : role === 'MARKETING' ? (
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => onQuickAction('client')}
                className="p-4 rounded-xl border border-blue-500/10 hover:border-blue-500/30 bg-blue-50/20 dark:bg-blue-950/15 text-left group transition animate-fade-in"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3">
                  <UserPlus size={16} />
                </div>
                <h5 className="text-xs font-bold text-slate-800 dark:text-white group-hover:text-blue-600 transition">Client Baru</h5>
                <p className="text-[10px] text-slate-400 mt-1">Input Prospek</p>
              </button>

              <button
                onClick={() => onQuickAction('order')}
                className="p-4 rounded-xl border border-sky-500/10 hover:border-sky-500/30 bg-sky-50/20 dark:bg-sky-950/15 text-left group transition animate-fade-in"
              >
                <div className="w-8 h-8 rounded-lg bg-sky-100 dark:bg-sky-900/40 text-sky-600 dark:text-sky-400 flex items-center justify-center mb-3">
                  <FilePlus size={16} />
                </div>
                <h5 className="text-xs font-bold text-slate-800 dark:text-white group-hover:text-sky-600 transition">Buat Penawaran</h5>
                <p className="text-[10px] text-slate-400 mt-1">Pencatatan Order</p>
              </button>

              <button
                onClick={() => onQuickAction('invoice')}
                className="p-4 rounded-xl border border-indigo-500/10 hover:border-indigo-500/30 bg-indigo-50/20 dark:bg-indigo-950/15 text-left group transition animate-fade-in"
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3">
                  <FilePlus size={16} />
                </div>
                <h5 className="text-xs font-bold text-slate-800 dark:text-white group-hover:text-indigo-600 transition">Tagih Klien</h5>
                <p className="text-[10px] text-slate-400 mt-1">Invoice Tagihan</p>
              </button>

              <button
                onClick={() => onNavigateToTab('chats')}
                className="p-4 rounded-xl border border-slate-500/10 hover:border-slate-500/30 bg-slate-50 dark:bg-slate-800 text-left group transition animate-fade-in"
              >
                <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 flex items-center justify-center mb-3">
                  <Inbox size={16} />
                </div>
                <h5 className="text-xs font-bold text-slate-800 dark:text-white group-hover:text-slate-600 transition">Follow Up</h5>
                <p className="text-[10px] text-slate-400 mt-1">WhatsApp Chat</p>
              </button>
            </div>
          ) : (
            // DEFAULT SUPER ADMIN
            <div className="grid grid-cols-2 gap-3 animate-fade-in">
              <button
                onClick={() => onQuickAction('client')}
                className="p-4 rounded-xl border border-blue-500/10 hover:border-blue-500/30 bg-blue-50/20 dark:bg-blue-950/15 text-left group transition"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3">
                  <UserPlus size={16} />
                </div>
                <h5 className="text-xs font-bold text-slate-800 dark:text-white group-hover:text-blue-600 transition">Klien Baru</h5>
                <p className="text-[10px] text-slate-400 mt-1">Registrasi Profil</p>
              </button>

              <button
                onClick={() => onQuickAction('order')}
                className="p-4 rounded-xl border border-sky-500/10 hover:border-sky-500/30 bg-sky-50/20 dark:bg-sky-950/15 text-left group transition"
              >
                <div className="w-8 h-8 rounded-lg bg-sky-100 dark:bg-sky-900/40 text-sky-600 dark:text-sky-400 flex items-center justify-center mb-3">
                  <FilePlus size={16} />
                </div>
                <h5 className="text-xs font-bold text-slate-800 dark:text-white group-hover:text-sky-600 transition">Catat Order</h5>
                <p className="text-[10px] text-slate-400 mt-1">Buat Tiket Proyek</p>
              </button>

              <button
                onClick={() => onQuickAction('invoice')}
                className="p-4 rounded-xl border border-indigo-500/10 hover:border-indigo-500/30 bg-indigo-50/20 dark:bg-indigo-950/15 text-left group transition"
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3">
                  <FilePlus size={16} />
                </div>
                <h5 className="text-xs font-bold text-slate-800 dark:text-white group-hover:text-indigo-600 transition">Tagih Klien</h5>
                <p className="text-[10px] text-slate-400 mt-1">Buat Invoice PDF</p>
              </button>

              <button
                onClick={() => onNavigateToTab('settings')}
                className="p-4 rounded-xl border border-slate-500/10 hover:border-slate-500/30 bg-slate-50 dark:bg-slate-800 text-left group transition"
              >
                <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 flex items-center justify-center mb-3">
                  <ArrowUpRight size={16} />
                </div>
                <h5 className="text-xs font-bold text-slate-800 dark:text-white group-hover:text-slate-600 transition">Sistem Kustom</h5>
                <p className="text-[10px] text-slate-400 mt-1">Konfigurasi Instansi</p>
              </button>
            </div>
          )}
        </div>

        {/* Recent Activity Feed */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700/60 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-white">Aktivitas Terkini</h4>
            <p className="text-xs text-slate-400">Jejak audit sistem EduTech Nusantara</p>
          </div>

          <div className="space-y-4 my-2.5 max-h-48 overflow-y-auto">
            <div className="flex gap-3 text-xs leading-normal">
              <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 size={12} />
              </div>
              <div>
                <p className="text-slate-700 dark:text-slate-300">
                  <strong className="font-semibold text-slate-800 dark:text-white">Rizki Handika</strong> memperbarui hak akses menu integrasi database.
                </p>
                <span className="text-[10px] text-slate-400 block mt-0.5">Hari ini, 15:28 WIB</span>
              </div>
            </div>

            <div className="flex gap-3 text-xs leading-normal">
              <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center flex-shrink-0">
                <Clock size={12} />
              </div>
              <div>
                <p className="text-slate-700 dark:text-slate-300">
                  <strong className="font-semibold text-slate-800 dark:text-white">Badrul</strong> mengevaluasi koneksi integrasi Google Spreadsheet.
                </p>
                <span className="text-[10px] text-slate-400 block mt-0.5">Kemarin, 16:30 WIB</span>
              </div>
            </div>

            <div className="flex gap-3 text-xs leading-normal">
              <div className="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-950/50 text-amber-600 flex items-center justify-center flex-shrink-0">
                <Inbox size={12} />
              </div>
              <div>
                <p className="text-slate-700 dark:text-slate-300">
                  <strong className="font-semibold text-slate-800 dark:text-white">Abdul Hakim</strong> memproses follow up prospek klien Jurnal Indonesia.
                </p>
                <span className="text-[10px] text-slate-400 block mt-0.5">12 Apr, 14:00 WIB</span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-700/80 text-center">
            <button
              onClick={() => onNavigateToTab('progress')}
              className="text-xs text-blue-600 hover:underline inline-flex items-center gap-0.5"
            >
              <span>Lihat Detail Linimasa</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
