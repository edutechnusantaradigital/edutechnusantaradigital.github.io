/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Users, TrendingUp, FileText, Briefcase, MessageSquare, DollarSign,
  ChevronRight, TrendingDown, Clock, Sparkles, ShieldCheck, Settings,
  Eye, EyeOff, LayoutGrid, Check, Palette, Star, ArrowUp, ArrowDown, Loader2
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Cell, Pie, BarChart, Bar, Cell as BarCell
} from 'recharts';
import { Client, Order, Project, Invoice, Ticket, FinanceLog } from '../types';

interface WidgetConfig {
  id: string;
  name: string;
  role: string; // "Super Admin", "Marketing", etc
  icon: string;
  color: string; // "indigo", "emerald", etc
  visible: string; // "true" or "false"
  sort_order: number;
}

interface DashboardProps {
  clients: Client[];
  orders: Order[];
  projects: Project[];
  invoices: Invoice[];
  tickets: Ticket[];
  finances: FinanceLog[];
  role: string;
  widgets: WidgetConfig[];
  onUpdateWidgetsLayout: (updated: WidgetConfig[]) => Promise<any>;
}

export default function DashboardView({
  clients,
  orders,
  projects,
  invoices,
  tickets,
  finances,
  role,
  widgets,
  onUpdateWidgetsLayout
}: DashboardProps) {
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [localWidgets, setLocalWidgets] = useState<WidgetConfig[]>([]);
  const [isSavingLayout, setIsSavingLayout] = useState(false);

  // 1. Calculate Metrics
  const activeClients = clients.filter(c => c.status === 'Active').length;
  const totalLeads = orders.filter(o => o.status === 'Lead').length;
  const totalProjects = projects.length;
  const runningProjects = projects.filter(p => ['On Progress', 'Testing', 'Revision'].includes(p.status)).length;
  const unresolvedTickets = tickets.filter(t => ['Open', 'Progress'].includes(t.status)).length;

  // Revenue computations
  const totalRevenue = invoices
    .filter(i => i.status === 'Paid')
    .reduce((sum, item) => sum + Number(item.grand_total || 0), 0);

  const unpaidAmount = invoices
    .filter(i => i.status === 'Unpaid' || i.status === 'Partial')
    .reduce((sum, item) => sum + Number(item.grand_total || 0), 0);

  const formatIDR = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(num);
  };

  // Prepare chart data
  const cashflowData = [
    { name: 'Jan', Pendapatan: 12500000, Pengeluaran: 4500000 },
    { name: 'Feb', Pendapatan: 18000000, Pengeluaran: 6000000 },
    { name: 'Mar', Pendapatan: 14000000, Pengeluaran: 5200000 },
    { name: 'Apr', Pendapatan: 23000000, Pengeluaran: 8000000 },
    { name: 'May', Pendapatan: 29000000, Pengeluaran: 9500000 },
    { name: 'Jun', Pendapatan: 35000000, Pengeluaran: 12000000 },
    { name: 'Jul', Pendapatan: totalRevenue || 45000000, Pengeluaran: 14200000 }
  ];

  const webCount = orders.filter(o => o.service_category?.toLowerCase() === 'website').length || 3;
  const edutechCount = orders.filter(o => o.service_category?.toLowerCase() === 'edutech').length || 5;
  const enterpriseCount = orders.filter(o => o.service_category?.toLowerCase() === 'enterprise').length || 2;
  const hostingCount = orders.filter(o => o.service_category?.toLowerCase() === 'hosting').length || 4;

  const pieData = [
    { name: 'Web Dev', value: webCount, color: '#6366f1' },
    { name: 'EduTech', value: edutechCount, color: '#10b981' },
    { name: 'Enterprise', value: enterpriseCount, color: '#f59e0b' },
    { name: 'Cloud/Hosting', value: hostingCount, color: '#3b82f6' }
  ];

  const barData = projects.map(p => ({
    name: p.name.length > 15 ? p.name.substring(0, 15) + '...' : p.name,
    Progress: p.progress || 0
  }));

  // Open Config Panel
  const handleOpenConfig = () => {
    // Sort local widget config copy for customization
    const sorted = [...widgets].sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0));
    setLocalWidgets(sorted);
    setShowConfigModal(true);
  };

  const handleSaveConfig = async () => {
    setIsSavingLayout(true);
    try {
      await onUpdateWidgetsLayout(localWidgets);
      setShowConfigModal(false);
      alert('Tampilan tata letak Dashboard berhasil disimpan langsung ke Google Spreadsheet!');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingLayout(false);
    }
  };

  // Reorder local widgets helper
  const moveWidget = (index: number, direction: 'up' | 'down') => {
    const nextList = [...localWidgets];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= nextList.length) return;

    // Swap sort_order
    const tempSort = nextList[index].sort_order;
    nextList[index].sort_order = nextList[targetIndex].sort_order;
    nextList[targetIndex].sort_order = tempSort;

    // Swap elements in list
    const tempElement = nextList[index];
    nextList[index] = nextList[targetIndex];
    nextList[targetIndex] = tempElement;

    setLocalWidgets(nextList);
  };

  const toggleVisibility = (id: string) => {
    setLocalWidgets(localWidgets.map(w => 
      w.id === id ? { ...w, visible: w.visible === 'true' ? 'false' : 'true' } : w
    ));
  };

  const updateColor = (id: string, newColor: string) => {
    setLocalWidgets(localWidgets.map(w => 
      w.id === id ? { ...w, color: newColor } : w
    ));
  };

  const updateRole = (id: string, targetRole: string) => {
    setLocalWidgets(localWidgets.map(w => 
      w.id === id ? { ...w, role: targetRole } : w
    ));
  };

  // Dynamic Widget Icon Renderer
  const getWidgetIcon = (iconName: string) => {
    switch (iconName?.toLowerCase()) {
      case 'users': return <Users size={22} />;
      case 'dollarsign': return <DollarSign size={22} />;
      case 'briefcase': return <Briefcase size={22} />;
      case 'messagesquare': return <MessageSquare size={22} />;
      default: return <Users size={22} />;
    }
  };

  const getCardBg = (colorName: string) => {
    switch (colorName?.toLowerCase()) {
      case 'indigo': return 'bg-indigo-50 text-indigo-600 border-indigo-100';
      case 'emerald': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'amber': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'rose': return 'bg-rose-50 text-rose-600 border-rose-100';
      default: return 'bg-indigo-50 text-indigo-600 border-indigo-100';
    }
  };

  // Active sorted widgets filtering based on Visibility, Role matches
  const visibleWidgets = widgets
    .filter(w => w.visible === 'true' && (w.role === 'Semua' || w.role === role))
    .sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0));

  return (
    <div className="space-y-6 text-left" id="dashboard-view-main">
      {/* Greetings Block */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between bg-gradient-to-r from-slate-900 to-indigo-950 p-6 rounded-2xl shadow-xl text-white">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Sparkles className="text-yellow-400 animate-pulse" size={20} />
            <h1 className="text-2xl font-black tracking-tight uppercase">EduTech Nusantara</h1>
          </div>
          <p className="text-slate-300 text-xs md:text-sm">
            Portal Enterprise CRM & Sistem Manajemen Projek Kolaboratif Nusantara Digital.
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center space-x-3 bg-white/10 px-4 py-2 rounded-xl backdrop-blur border border-white/10">
          <ShieldCheck className="text-emerald-400" size={18} />
          <div className="text-left text-xs">
            <p className="font-semibold">Sistem Aman</p>
            <p className="text-[10px] text-slate-300">Spreadsheet DB Active</p>
          </div>
        </div>
      </div>

      {/* Super Admin Layout Customizer Button */}
      {role === 'Super Admin' && (
        <div className="flex justify-end">
          <button
            id="customize-widgets-btn"
            onClick={handleOpenConfig}
            className="flex items-center space-x-1 px-4 py-2 bg-indigo-50 border border-indigo-200 text-indigo-700 font-extrabold text-xs rounded-xl shadow-sm hover:bg-indigo-100 transition cursor-pointer"
          >
            <Settings size={14} className="animate-spin" />
            <span>Atur Komponen Widget Dashboard</span>
          </button>
        </div>
      )}

      {/* Dynamic Rendered Bento Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" id="dashboard-metrics-grid">
        {visibleWidgets.map(w => {
          let valueDisplay = '0';
          let subtitleDisplay = 'Real-time database';

          if (w.id === 'WID01') {
            valueDisplay = String(activeClients);
            subtitleDisplay = 'Klien aktif terdaftar';
          } else if (w.id === 'WID02') {
            valueDisplay = formatIDR(totalRevenue || 45000000);
            subtitleDisplay = 'Pemasukan lunas';
          } else if (w.id === 'WID03') {
            valueDisplay = String(runningProjects);
            subtitleDisplay = `Dari ${totalProjects} total project`;
          } else if (w.id === 'WID04') {
            valueDisplay = String(unresolvedTickets);
            subtitleDisplay = 'Tiket butuh respon';
          }

          return (
            <div 
              key={w.id} 
              className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition flex items-center space-x-4"
            >
              <div className={`p-3 rounded-xl ${getCardBg(w.color)}`}>
                {getWidgetIcon(w.icon)}
              </div>
              <div className="text-left">
                <p className="text-xs text-slate-400 font-extrabold tracking-wider uppercase">{w.name}</p>
                <h3 className="text-xl font-black text-slate-800 mt-1 truncate max-w-[150px]">{valueDisplay}</h3>
                <span className="text-[10px] text-slate-400 font-semibold mt-0.5">{subtitleDisplay}</span>
              </div>
            </div>
          );
        })}

        {visibleWidgets.length === 0 && (
          <div className="col-span-full p-8 bg-white text-center border border-dashed border-slate-200 rounded-2xl">
            <EyeOff className="mx-auto text-slate-300 mb-2" size={24} />
            <p className="text-xs text-slate-400">Tidak ada komponen widget aktif diatur untuk role Anda.</p>
          </div>
        )}
      </div>

      {/* Charts & Bento Visualizers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Cashflow Area Chart */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <div className="text-left">
              <h2 className="text-sm font-bold text-slate-800">Evaluasi Arus Kas Bulanan</h2>
              <p className="text-xs text-slate-400">Ikhtisar pendapatan lunas dan pengeluaran operasional (SaaS View)</p>
            </div>
            <div className="flex space-x-3 text-xs font-semibold">
              <span className="flex items-center text-indigo-600">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 mr-1.5"></span> Pendapatan
              </span>
              <span className="flex items-center text-rose-500">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 mr-1.5"></span> Pengeluaran
              </span>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cashflowData}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="Pendapatan" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorIncome)" />
                <Area type="monotone" dataKey="Pengeluaran" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#colorExpense)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category distribution Pie Chart */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-800 text-left">Segmentasi Layanan EduTech</h2>
            <p className="text-xs text-slate-400 text-left mb-4">Proporsi pemesanan berdasarkan kategori</p>
            <div className="h-44 flex justify-center items-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          {/* Legend list */}
          <div className="grid grid-cols-2 gap-2 mt-4 border-t border-slate-50 pt-4">
            {pieData.map(item => (
              <div key={item.name} className="flex items-center space-x-1.5 text-[11px] text-slate-600 font-medium text-left">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }}></span>
                <span className="truncate">{item.name} ({item.value})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row with Project Progress Bar Chart & Support tickets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <h2 className="text-sm font-bold text-slate-800 text-left mb-1">Kemajuan Project Aktif</h2>
          <p className="text-xs text-slate-400 text-left mb-4">Persentase pengerjaan milestone utama di Google Sheet</p>
          <div className="h-64">
            {barData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                Tidak ada project aktif
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} domain={[0, 100]} />
                  <Tooltip formatter={(value) => [`${value}%`, 'Progress']} />
                  <Bar dataKey="Progress" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={24}>
                    {barData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.Progress > 80 ? '#10b981' : '#6366f1'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Support Tickets Overview */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <div className="text-left">
                <h2 className="text-sm font-bold text-slate-800">Tiket Layanan Pelanggan</h2>
                <p className="text-xs text-slate-400">Umpan keluhan dan kendala teknis client</p>
              </div>
              <span className="text-xs font-semibold text-rose-500 bg-rose-50 px-2.5 py-1 rounded-full">
                {unresolvedTickets} Aktif
              </span>
            </div>

            <div className="space-y-3">
              {tickets.slice(0, 3).map(ticket => (
                <div key={ticket.id} className="p-3 bg-slate-50 rounded-xl hover:bg-slate-100/60 transition text-left">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                      {ticket.id}
                    </span>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                      ticket.priority === 'Urgent' ? 'bg-red-100 text-red-700' :
                      ticket.priority === 'High' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {ticket.priority}
                    </span>
                  </div>
                  <h4 className="font-semibold text-xs text-slate-800 mt-1.5 truncate">{ticket.title}</h4>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">{ticket.description}</p>
                </div>
              ))}
              {tickets.length === 0 && (
                <div className="py-12 text-center text-xs text-slate-400">
                  Semua keluhan client beres. Luar biasa!
                </div>
              )}
            </div>
          </div>
          <div className="mt-4 border-t border-slate-100 pt-3 flex justify-end text-xs text-indigo-600 font-semibold cursor-pointer hover:underline">
            Buka Support Desk <ChevronRight size={14} className="ml-1" />
          </div>
        </div>
      </div>

      {/* Dynamic Widget Customize Dialog Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl max-w-lg w-full overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="text-left">
                <h3 className="font-black text-sm text-slate-800">Atur Komponen Widget Dashboard</h3>
                <p className="text-[10px] text-slate-400">Ubah hak akses role, warna, visibilitas, & urutan bento grid.</p>
              </div>
              <button onClick={() => setShowConfigModal(false)} className="text-slate-400 hover:text-slate-700 font-bold text-sm">✕</button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[60vh] space-y-4">
              {localWidgets.map((w, index) => (
                <div key={w.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between gap-4 text-xs text-left">
                  <div className="flex items-center space-x-3 shrink-0">
                    <LayoutGrid size={16} className="text-slate-300" />
                    <div>
                      <p className="font-bold text-slate-800">{w.name}</p>
                      <p className="text-[9px] text-slate-400 font-semibold">{w.id}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Role Filter Selector */}
                    <select
                      value={w.role}
                      onChange={(e) => updateRole(w.id, e.target.value)}
                      className="bg-white border border-slate-200 rounded px-1.5 py-1 text-[10px] font-bold text-slate-600 cursor-pointer"
                    >
                      <option value="Semua">Semua Akses</option>
                      <option value="Super Admin">Super Admin</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Customer Service">Customer Service</option>
                    </select>

                    {/* Color selector */}
                    <select
                      value={w.color}
                      onChange={(e) => updateColor(w.id, e.target.value)}
                      className="bg-white border border-slate-200 rounded px-1.5 py-1 text-[10px] font-bold text-slate-600 cursor-pointer"
                    >
                      <option value="indigo">Indigo</option>
                      <option value="emerald">Emerald</option>
                      <option value="amber">Amber</option>
                      <option value="rose">Rose</option>
                    </select>

                    {/* Visibility Toggle */}
                    <button
                      onClick={() => toggleVisibility(w.id)}
                      className={`p-1.5 rounded transition ${w.visible === 'true' ? 'text-indigo-600 bg-indigo-50' : 'text-slate-400 bg-white'}`}
                      title="Sembunyikan/Tampilkan"
                    >
                      {w.visible === 'true' ? <Eye size={13} /> : <EyeOff size={13} />}
                    </button>

                    {/* Sorting Order adjusters */}
                    <div className="flex items-center space-x-0.5">
                      <button
                        onClick={() => moveWidget(index, 'up')}
                        disabled={index === 0}
                        className="p-1 text-slate-400 hover:text-slate-800 disabled:opacity-20 cursor-pointer"
                      >
                        <ArrowUp size={12} />
                      </button>
                      <button
                        onClick={() => moveWidget(index, 'down')}
                        disabled={index === localWidgets.length - 1}
                        className="p-1 text-slate-400 hover:text-slate-800 disabled:opacity-20 cursor-pointer"
                      >
                        <ArrowDown size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-slate-100 flex justify-end space-x-2 bg-slate-50/50">
              <button
                type="button"
                onClick={() => setShowConfigModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition"
              >
                Batal
              </button>
              <button
                onClick={handleSaveConfig}
                disabled={isSavingLayout}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition flex items-center space-x-1 cursor-pointer"
              >
                {isSavingLayout && <Loader2 size={12} className="animate-spin" />}
                <span>Simpan Perubahan</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
