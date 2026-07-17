/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  Plus, Search, Edit2, Trash2, CheckCircle2, XCircle, 
  UserCheck, CreditCard, Gift, Percent, AlertCircle, RefreshCw,
  ChevronLeft, ChevronRight, Key, Mail, Phone, MapPin, Filter,
  Download, Upload, Activity, ShieldAlert, Laptop, ArrowRight,
  UserPlus, FileText, Check, MoreVertical, ShieldCheck, Eye
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip,
  BarChart, Bar, Cell, PieChart, Pie
} from 'recharts';

interface UserAccount {
  id: string;
  name: string;
  username: string;
  email: string;
  whatsapp: string;
  role: string;
  status: string;
  avatar?: string;
  join_date?: string;
  last_login?: string;
  referral_code?: string;
  commission_rate?: number;
  address?: string;
  bank?: string;
  account_number?: string;
  account_name?: string;
  ewallet?: string;
  ewallet_number?: string;
  failed_login?: string;
}

interface StaffViewProps {
  staffList: UserAccount[];
  onAddStaff: (data: any) => Promise<any>;
  onUpdateStaff: (id: string, data: any) => Promise<any>;
  role: string;
  onLoginAs?: (targetUser: any) => void;
  onDeleteStaff?: (id: string) => Promise<any>;
}

export default function StaffView({
  staffList = [],
  onAddStaff,
  onUpdateStaff,
  role,
  onLoginAs,
  onDeleteStaff
}: StaffViewProps) {
  // Query & Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('Semua');
  const [selectedStatus, setSelectedStatus] = useState('Semua');
  const [selectedLoginStatus, setSelectedLoginStatus] = useState('Semua');
  const [sortBy, setSortBy] = useState<'name' | 'join_date' | 'last_login'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // Selection / Bulk action states
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState('');
  
  // Modals & Panels
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);
  const [detailUser, setDetailUser] = useState<UserAccount | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importText, setImportText] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  
  // Notification Simulation States
  const [simulatedNotification, setSimulatedNotification] = useState<{
    target: string;
    channel: 'WhatsApp' | 'Email';
    title: string;
    message: string;
  } | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Active User Dropdowns
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  // Form states
  const [form, setForm] = useState({
    name: '',
    username: '',
    email: '',
    whatsapp: '',
    role: 'Client',
    status: 'Active',
    password: '',
    referral_code: '',
    commission_rate: 10,
    address: '',
    bank: 'Bank BCA',
    account_number: '',
    account_name: '',
    ewallet: 'OVO',
    ewallet_number: '',
    failed_login: '0'
  });

  const rolesList = ['Super Admin', 'IT Developer', 'Marketing', 'Customer Service', 'Client'];
  const statusOptions = ['Active', 'Pending', 'Nonaktif', 'Suspend', 'Blokir', 'Arsip'];

  // Clear selections
  const clearSelection = () => setSelectedUserIds([]);

  // Handle multi-select toggle
  const toggleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedUserIds(paginatedUsers.map(u => u.id));
    } else {
      clearSelection();
    }
  };

  const toggleSelectUser = (userId: string) => {
    setSelectedUserIds(prev => 
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  // Filters & sorting logic
  const filteredUsers = useMemo(() => {
    return staffList.filter(u => {
      const matchesSearch = 
        u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.whatsapp?.includes(searchQuery) ||
        u.id?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesRole = selectedRole === 'Semua' || u.role === selectedRole;
      
      const uStatus = u.status || 'Active';
      const matchesStatus = selectedStatus === 'Semua' || 
        uStatus.toLowerCase() === selectedStatus.toLowerCase() ||
        (selectedStatus === 'Nonaktif' && uStatus.toLowerCase() === 'inactive') ||
        (selectedStatus === 'Blokir' && uStatus.toLowerCase() === 'blocked') ||
        (selectedStatus === 'Suspend' && uStatus.toLowerCase() === 'suspended');

      const matchesLogin = selectedLoginStatus === 'Semua' ||
        (selectedLoginStatus === 'Online' && u.last_login && new Date(u.last_login).getTime() > Date.now() - 3600000) ||
        (selectedLoginStatus === 'Offline' && (!u.last_login || new Date(u.last_login).getTime() <= Date.now() - 3600000));

      return matchesSearch && matchesRole && matchesStatus && matchesLogin;
    }).sort((a, b) => {
      let fieldA = a[sortBy] || '';
      let fieldB = b[sortBy] || '';
      if (sortBy === 'join_date' || sortBy === 'last_login') {
        const timeA = fieldA ? new Date(fieldA).getTime() : 0;
        const timeB = fieldB ? new Date(fieldB).getTime() : 0;
        return sortOrder === 'asc' ? timeA - timeB : timeB - timeA;
      }
      return sortOrder === 'asc' 
        ? String(fieldA).localeCompare(String(fieldB)) 
        : String(fieldB).localeCompare(String(fieldA));
    });
  }, [staffList, searchQuery, selectedRole, selectedStatus, selectedLoginStatus, sortBy, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage) || 1;
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredUsers.slice(start, start + itemsPerPage);
  }, [filteredUsers, currentPage]);

  // Statistics & Metrics
  const metrics = useMemo(() => {
    const total = staffList.length;
    const staff = staffList.filter(u => u.role !== 'Client').length;
    const client = total - staff;
    const active = staffList.filter(u => (u.status || '').toLowerCase() === 'active' || (u.status || '').toLowerCase() === 'aktif').length;
    const suspend = staffList.filter(u => (u.status || '').toLowerCase() === 'suspend' || (u.status || '').toLowerCase() === 'suspended').length;
    const block = staffList.filter(u => (u.status || '').toLowerCase() === 'blokir' || (u.status || '').toLowerCase() === 'blocked' || (u.status || '').toLowerCase() === 'diblokir').length;
    
    // Online within past 1 hour simulation
    const online = staffList.filter(u => u.last_login && new Date(u.last_login).getTime() > Date.now() - 3600000).length;
    const registeredToday = staffList.filter(u => u.join_date === new Date().toISOString().split('T')[0]).length;

    return { total, staff, client, active, suspend, block, online, registeredToday };
  }, [staffList]);

  // Chart Data Preparation
  const roleChartData = useMemo(() => {
    const rolesMap = staffList.reduce((acc, curr) => {
      acc[curr.role] = (acc[curr.role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.keys(rolesMap).map(key => ({
      name: key,
      value: rolesMap[key]
    }));
  }, [staffList]);

  const registrationFlowData = useMemo(() => {
    // Generate static analytics grid for line graph
    return [
      { month: 'Jan', Admin: 2, Staff: 5, Client: 12 },
      { month: 'Feb', Admin: 3, Staff: 8, Client: 22 },
      { month: 'Mar', Admin: 4, Staff: 12, Client: 39 },
      { month: 'Apr', Admin: 4, Staff: 15, Client: 58 },
      { month: 'May', Admin: 5, Staff: 20, Client: 88 },
      { month: 'Jun', Admin: 5, Staff: 24, Client: 110 },
      { month: 'Jul', Admin: 6, Staff: 28, Client: 145 }
    ];
  }, []);

  // Form Modifiers
  const handleOpenAdd = () => {
    setEditingUser(null);
    setForm({
      name: '',
      username: '',
      email: '',
      whatsapp: '',
      role: 'Client',
      status: 'Active',
      password: '',
      referral_code: 'ND-' + Math.random().toString(36).substring(2, 7).toUpperCase(),
      commission_rate: 10,
      address: '',
      bank: 'Bank BCA',
      account_number: '',
      account_name: '',
      ewallet: 'OVO',
      ewallet_number: '',
      failed_login: '0'
    });
    setShowFormModal(true);
  };

  const handleOpenEdit = (u: UserAccount) => {
    setEditingUser(u);
    setForm({
      name: u.name || '',
      username: u.username || '',
      email: u.email || '',
      whatsapp: u.whatsapp || '',
      role: u.role || 'Client',
      status: u.status || 'Active',
      password: '', // blank by default for edit
      referral_code: u.referral_code || '',
      commission_rate: Number(u.commission_rate) || 10,
      address: u.address || '',
      bank: u.bank || 'Bank BCA',
      account_number: u.account_number || '',
      account_name: u.account_name || '',
      ewallet: u.ewallet || 'OVO',
      ewallet_number: u.ewallet_number || '',
      failed_login: u.failed_login || '0'
    });
    setShowFormModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingUser) {
        const payload: any = { ...form };
        if (!payload.password) delete payload.password;
        await onUpdateStaff(editingUser.id, payload);
      } else {
        await onAddStaff(form);
      }
      setShowFormModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  // Change user status & trigger broadcast simulation
  const handleUpdateUserStatus = async (userObj: UserAccount, nextStatus: string) => {
    try {
      await onUpdateStaff(userObj.id, { status: nextStatus, failed_login: nextStatus === 'Active' ? '0' : undefined });
      
      // Setup simulated WhatsApp & Email payload
      const title = `🚨 Pembaharuan Akun CRM EduTech Nusantara Digital`;
      const message = `Halo ${userObj.name},\n\nPemberitahuan resmi mengenai akun portal Anda. Status keanggotaan Anda saat ini telah disesuaikan menjadi: [${nextStatus}].\n\nJika ini adalah kekeliruan atau Anda membutuhkan bantuan lebih lanjut, silakan hubungi pusat admin kami.\n\nWhatsApp: 087850934303\nEduTech Nusantara Digital`;

      setSimulatedNotification({
        target: userObj.whatsapp || userObj.email,
        channel: userObj.whatsapp ? 'WhatsApp' : 'Email',
        title,
        message
      });
      
      setOpenDropdownId(null);
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Bulk Operations
  const handleBulkSubmit = async () => {
    if (selectedUserIds.length === 0 || !bulkAction) return;

    if (confirm(`Apakah Anda yakin ingin menerapkan tindakan massal "${bulkAction}" pada ${selectedUserIds.length} akun terpilih?`)) {
      try {
        for (const id of selectedUserIds) {
          if (bulkAction === 'Hapus') {
            if (onDeleteStaff) {
              await onDeleteStaff(id);
            } else {
              await onUpdateStaff(id, { status: 'Arsip' });
            }
          } else {
            let statusVal = 'Active';
            if (bulkAction === 'Nonaktifkan') statusVal = 'Nonaktif';
            else if (bulkAction === 'Suspend') statusVal = 'Suspend';
            else if (bulkAction === 'Blokir') statusVal = 'Blokir';
            
            await onUpdateStaff(id, { status: statusVal, failed_login: '0' });
          }
        }
        
        alert(`Tindakan massal "${bulkAction}" berhasil diterapkan pada ${selectedUserIds.length} pengguna!`);
        clearSelection();
        setBulkAction('');
      } catch (err) {
        console.error(err);
      }
    }
  };

  // CSV Exporter
  const exportToCSV = () => {
    const headers = ['ID', 'Nama Lengkap', 'Username', 'Email', 'WhatsApp', 'Role', 'Status', 'Tanggal Daftar', 'Login Terakhir', 'Referral Code', 'Komisi (%)', 'Bank', 'No Rekening'];
    const rows = staffList.map(u => [
      u.id, u.name, u.username, u.email, u.whatsapp, u.role, u.status || 'Active', u.join_date || '-', u.last_login || '-', u.referral_code || '-', `${u.commission_rate || 10}%`, u.bank || '-', u.account_number || '-'
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `CRM_Nusantara_Users_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // PDF / Printing trigger
  const triggerPDFPrint = () => {
    window.print();
  };

  // Batch CSV/JSON Import Handler
  const handleBatchImport = async () => {
    if (!importText.trim()) return;
    setImportError(null);

    try {
      // Allow CSV-like parsing or Raw JSON arrays
      let usersToCreate: any[] = [];
      
      if (importText.trim().startsWith('[')) {
        usersToCreate = JSON.parse(importText);
      } else {
        // Parse simple CSV (Name, Email, WhatsApp, Username, Password)
        const lines = importText.split('\n');
        for (const line of lines) {
          const cols = line.split(',').map(s => s.trim());
          if (cols.length >= 4) {
            usersToCreate.push({
              name: cols[0],
              email: cols[1],
              whatsapp: cols[2],
              username: cols[3],
              password: cols[4] || '17April1960*',
              role: 'Client',
              status: 'Active'
            });
          }
        }
      }

      if (usersToCreate.length === 0) {
        throw new Error('Tidak ada baris data valid yang ditemukan. Format CSV: Nama, Email, WhatsApp, Username, Password');
      }

      // Add each parsed user
      for (const u of usersToCreate) {
        await onAddStaff(u);
      }

      alert(`Penyuntingan Batch Berhasil! ${usersToCreate.length} pengguna client baru telah didaftarkan.`);
      setShowImportModal(false);
      setImportText('');
    } catch (err: any) {
      setImportError(err.message || 'Kesalahan parsing data. Periksa kembali struktur data masukan.');
    }
  };

  return (
    <div className="space-y-6 text-left pb-16" id="user-accounts-hub-root">
      
      {/* Dynamic Header Block */}
      <div className="bg-gradient-to-r from-teal-800 via-teal-900 to-slate-950 p-6 md:p-8 rounded-3xl shadow-xl text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
        <div className="absolute w-96 h-96 bg-teal-500/10 rounded-full blur-3xl -top-20 -left-20 pointer-events-none"></div>
        <div className="relative z-10 space-y-1.5">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 bg-teal-500/20 border border-teal-500/30 text-teal-300 rounded-full text-[9px] font-black uppercase tracking-widest">
              RBAC Administrator Panel
            </span>
            <div className="flex items-center gap-0.5 text-xs text-emerald-400">
              <Activity size={12} className="animate-pulse" />
              <span className="text-[10px] font-bold">ERP Core Online</span>
            </div>
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight">Manajemen Pengguna & Hak Akses</h1>
          <p className="text-slate-300 text-xs max-w-2xl leading-relaxed">
            Pusat administrasi penyesuaian peran karyawan, verifikasi client mandiri, riwayat login, status keamanan penangguhan, audit aktivitas, serta konfigurasi komisi bonus rujukan.
          </p>
        </div>

        {role === 'Super Admin' && (
          <div className="flex flex-wrap gap-2 shrink-0 relative z-10">
            <button
              onClick={() => setShowImportModal(true)}
              className="flex items-center space-x-1.5 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-teal-300 border border-teal-500/20 text-xs font-extrabold rounded-xl shadow-md transition cursor-pointer"
            >
              <Upload size={14} />
              <span>Import Pengguna</span>
            </button>
            <button
              onClick={handleOpenAdd}
              className="flex items-center space-x-1.5 px-4 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white text-xs font-black rounded-xl shadow-lg shadow-teal-700/20 transition cursor-pointer"
            >
              <Plus size={14} />
              <span>Daftar User Baru</span>
            </button>
          </div>
        )}
      </div>

      {/* METRICS WIDGETS ROW */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users widget */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Total Terdaftar</span>
            <span className="text-2xl font-black text-slate-800 block">{metrics.total}</span>
            <span className="text-[9px] text-slate-400 font-bold block">
              {metrics.staff} Staff | {metrics.client} Client
            </span>
          </div>
          <div className="p-3 bg-teal-50 rounded-xl text-teal-600">
            <UserPlus size={20} />
          </div>
        </div>

        {/* Active Accounts widget */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Akun Aktif</span>
            <span className="text-2xl font-black text-emerald-600 block">{metrics.active}</span>
            <span className="text-[9px] text-emerald-500 font-bold block">Ready to use</span>
          </div>
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
            <UserCheck size={20} />
          </div>
        </div>

        {/* Suspended/Blocked Accounts widget */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Ditangguhkan / Blokir</span>
            <span className="text-2xl font-black text-rose-600 block">{metrics.suspend + metrics.block}</span>
            <span className="text-[9px] text-rose-500 font-bold block">
              {metrics.suspend} Suspend | {metrics.block} Blokir
            </span>
          </div>
          <div className="p-3 bg-rose-50 rounded-xl text-rose-600">
            <ShieldAlert size={20} />
          </div>
        </div>

        {/* Online Activity widget */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Aktivitas Hari Ini</span>
            <span className="text-2xl font-black text-indigo-600 block">{metrics.online}</span>
            <span className="text-[9px] text-indigo-500 font-bold block">
              +{metrics.registeredToday} Daftar Baru
            </span>
          </div>
          <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
            <Activity size={20} />
          </div>
        </div>
      </div>

      {/* ANALYTICS CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Registration Line Chart */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-extrabold text-slate-800 text-sm">Tren Registrasi Pengguna</h3>
              <p className="text-[11px] text-slate-400">Pertumbuhan pendaftaran staf dan client berdasarkan bulan</p>
            </div>
            <span className="px-2 py-1 bg-teal-50 text-teal-600 rounded-lg text-[10px] font-black uppercase">
              Operational Graph
            </span>
          </div>
          <div className="h-56 w-full text-xs font-semibold">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={registrationFlowData}>
                <defs>
                  <linearGradient id="colorClient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip />
                <Area type="monotone" dataKey="Client" stroke="#14b8a6" fillOpacity={1} fill="url(#colorClient)" strokeWidth={2.5} />
                <Area type="monotone" dataKey="Staff" stroke="#6366f1" fill="none" strokeWidth={1.5} strokeDasharray="4 4" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Roles Distribution Bar Chart */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <div>
            <h3 className="font-extrabold text-slate-800 text-sm">Perbandingan Peran (Role)</h3>
            <p className="text-[11px] text-slate-400">Distribusi akun aktif berdasarkan hak akses</p>
          </div>
          <div className="h-56 w-full text-xs font-semibold">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={roleChartData} layout="vertical">
                <XAxis type="number" stroke="#94a3b8" hide />
                <YAxis dataKey="name" type="category" stroke="#64748b" width={85} />
                <Tooltip />
                <Bar dataKey="value" fill="#0f766e" radius={[0, 4, 4, 0]}>
                  {roleChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#0f766e' : '#14b8a6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* FILTER & ADVANCED TOOLBAR */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4 text-xs font-semibold">
        <div className="flex flex-col md:flex-row gap-3.5 items-center justify-between">
          
          {/* Live Search */}
          <div className="relative w-full md:w-80">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
              <Search size={15} />
            </span>
            <input
              type="text"
              placeholder="Cari ID, Nama, Email, WhatsApp, Kode..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="w-full bg-slate-50 border border-slate-200 pl-10 pr-4 py-2.5 rounded-xl text-xs outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Quick Toolbar Filters */}
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            {/* Filter Role */}
            <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl">
              <Filter size={12} className="text-slate-400" />
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-extrabold">Role:</span>
              <select
                value={selectedRole}
                onChange={(e) => { setSelectedRole(e.target.value); setCurrentPage(1); }}
                className="bg-transparent text-xs text-slate-700 outline-none cursor-pointer"
              >
                <option value="Semua">Semua Role</option>
                {rolesList.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            {/* Filter Status */}
            <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-extrabold">Status:</span>
              <select
                value={selectedStatus}
                onChange={(e) => { setSelectedStatus(e.target.value); setCurrentPage(1); }}
                className="bg-transparent text-xs text-slate-700 outline-none cursor-pointer"
              >
                <option value="Semua">Semua Status</option>
                {statusOptions.map(st => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>

            {/* Filter Login Status */}
            <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-extrabold">Koneksi:</span>
              <select
                value={selectedLoginStatus}
                onChange={(e) => { setSelectedLoginStatus(e.target.value); setCurrentPage(1); }}
                className="bg-transparent text-xs text-slate-700 outline-none cursor-pointer"
              >
                <option value="Semua">Semua Koneksi</option>
                <option value="Online">Online Baru Saja</option>
                <option value="Offline">Offline</option>
              </select>
            </div>
          </div>

        </div>

        {/* BULK ACTIONS & EXPORTERS SUB-ROW */}
        <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row gap-3.5 items-center justify-between">
          <div className="flex items-center space-x-2.5 w-full sm:w-auto">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-extrabold shrink-0">
              {selectedUserIds.length} Terpilih:
            </span>
            <select
              value={bulkAction}
              onChange={(e) => setBulkAction(e.target.value)}
              disabled={selectedUserIds.length === 0}
              className="bg-slate-50 border border-slate-200 p-2 rounded-lg text-xs outline-none cursor-pointer disabled:opacity-50"
            >
              <option value="">-- Tindakan Massal --</option>
              <option value="Aktifkan">Aktifkan Akun</option>
              <option value="Nonaktifkan">Nonaktifkan</option>
              <option value="Suspend">Suspend Akun</option>
              <option value="Blokir">Blokir Keamanan</option>
              <option value="Hapus">Hapus Selamanya</option>
            </select>
            <button
              onClick={handleBulkSubmit}
              disabled={!bulkAction || selectedUserIds.length === 0}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-[11px] font-extrabold rounded-lg transition"
            >
              Terapkan
            </button>
            {selectedUserIds.length > 0 && (
              <button onClick={clearSelection} className="text-teal-500 text-[11px] hover:underline">Batal</button>
            )}
          </div>

          {/* Download and Reports */}
          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
            <button
              onClick={exportToCSV}
              className="flex items-center space-x-1 px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-[11px] font-extrabold text-slate-600 cursor-pointer"
              title="Download format CSV"
            >
              <Download size={13} />
              <span>Export CSV</span>
            </button>
            <button
              onClick={triggerPDFPrint}
              className="flex items-center space-x-1 px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-[11px] font-extrabold text-slate-600 cursor-pointer"
              title="Cetak Laporan Lengkap"
            >
              <FileText size={13} />
              <span>Cetak PDF</span>
            </button>
          </div>
        </div>

      </div>

      {/* CORE DATA TABLE FRAME */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden" id="users-datatable-container">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                <th className="py-4 px-4 text-center w-12">
                  <input
                    type="checkbox"
                    checked={selectedUserIds.length === paginatedUsers.length && paginatedUsers.length > 0}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded text-teal-600 border-slate-300 focus:ring-teal-500 cursor-pointer"
                  />
                </th>
                <th className="py-4 px-4">Pengguna & Peran</th>
                <th className="py-4 px-4">Email / WhatsApp</th>
                <th className="py-4 px-4">Afiliasi & Referral</th>
                <th className="py-4 px-4">Status Akun</th>
                <th className="py-4 px-4">Aktivitas Koneksi</th>
                <th className="py-4 px-4 text-center w-20">Opsi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {paginatedUsers.map(u => {
                const uStatus = (u.status || 'Active').toLowerCase();
                const isOnline = u.last_login && new Date(u.last_login).getTime() > Date.now() - 3600000;
                const isSelected = selectedUserIds.includes(u.id);

                return (
                  <tr key={u.id} className={`hover:bg-slate-50/60 transition ${isSelected ? 'bg-teal-50/20' : ''}`}>
                    {/* Checkbox Select Row */}
                    <td className="py-3.5 px-4 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectUser(u.id)}
                        className="w-4 h-4 rounded text-teal-600 border-slate-300 focus:ring-teal-500 cursor-pointer"
                      />
                    </td>

                    {/* Photo, Name & Role */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={u.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
                          alt={u.name}
                          className="w-10 h-10 rounded-xl object-cover border border-slate-100 shadow-inner"
                        />
                        <div>
                          <div className="font-extrabold text-slate-800 flex items-center gap-1">
                            <span>{u.name}</span>
                            {u.role === 'Super Admin' && <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />}
                          </div>
                          <div className="flex items-center space-x-1.5 mt-0.5">
                            <span className="text-[10px] text-slate-400 font-mono">@{u.username}</span>
                            <span className="text-[9px] px-1.5 py-0.2 bg-teal-50 text-teal-700 font-black rounded uppercase">
                              {u.role}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Email & Whatsapp */}
                    <td className="py-3.5 px-4 text-slate-600">
                      <p className="flex items-center gap-1 font-semibold">
                        <Mail size={12} className="text-slate-400" />
                        {u.email || '-'}
                      </p>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Phone size={12} className="text-slate-400" />
                        {u.whatsapp || '-'}
                      </p>
                    </td>

                    {/* Referral & Commissions */}
                    <td className="py-3.5 px-4">
                      <p className="font-extrabold text-slate-700 flex items-center gap-1">
                        <Gift size={12} className="text-indigo-400" />
                        Code: <span className="text-indigo-600">{u.referral_code || '-'}</span>
                      </p>
                      <p className="text-[11px] text-slate-400 font-semibold">
                        Rate: <span className="text-slate-600 font-bold">{u.commission_rate || 10}%</span>
                      </p>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1.5 rounded-full text-[9px] font-black uppercase inline-block border ${
                        uStatus === 'active' || uStatus === 'aktif' 
                          ? 'bg-emerald-50 border-emerald-100 text-emerald-700' 
                          : uStatus === 'pending' || uStatus === 'belum verifikasi'
                          ? 'bg-amber-50 border-amber-100 text-amber-700'
                          : uStatus === 'suspend' || uStatus === 'suspended' || uStatus === 'ditangguhkan'
                          ? 'bg-orange-50 border-orange-100 text-orange-700'
                          : uStatus === 'blokir' || uStatus === 'diblokir' || uStatus === 'blocked'
                          ? 'bg-rose-50 border-rose-100 text-rose-700'
                          : 'bg-slate-50 border-slate-100 text-slate-700'
                      }`}>
                        {u.status || 'Active'}
                      </span>
                    </td>

                    {/* Connection Activity */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-1.5">
                        <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></span>
                        <span className="text-[11px] font-bold text-slate-700">
                          {isOnline ? 'Online Baru Saja' : 'Offline'}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Daftar: {u.join_date || '-'}
                      </p>
                    </td>

                    {/* Options per row dropdown */}
                    <td className="py-3.5 px-4 text-center relative">
                      <button
                        onClick={() => setOpenDropdownId(openDropdownId === u.id ? null : u.id)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                      >
                        <MoreVertical size={16} />
                      </button>

                      {/* Dropdown Options List */}
                      {openDropdownId === u.id && (
                        <div className="absolute right-6 top-10 bg-white border border-slate-150 rounded-xl shadow-xl py-1.5 w-44 z-30 text-left text-[11px] font-semibold text-slate-700">
                          
                          {/* Profile details drawer */}
                          <button
                            onClick={() => { setDetailUser(u); setOpenDropdownId(null); }}
                            className="w-full px-3 py-1.5 hover:bg-slate-50 flex items-center space-x-1.5"
                          >
                            <Eye size={12} className="text-teal-500" />
                            <span>Lihat Detail Profile</span>
                          </button>

                          {/* Login Sebagai */}
                          {onLoginAs && role === 'Super Admin' && u.id !== 'USR00001' && (
                            <button
                              onClick={() => { onLoginAs(u); setOpenDropdownId(null); }}
                              className="w-full px-3 py-1.5 hover:bg-teal-50 hover:text-teal-700 flex items-center space-x-1.5 border-b border-slate-100"
                            >
                              <Laptop size={12} className="text-teal-600" />
                              <span className="font-bold">Login Sebagai</span>
                            </button>
                          )}

                          {role === 'Super Admin' && (
                            <>
                              <button
                                onClick={() => { handleOpenEdit(u); setOpenDropdownId(null); }}
                                className="w-full px-3 py-1.5 hover:bg-slate-50 flex items-center space-x-1.5"
                              >
                                <Edit2 size={12} className="text-indigo-500" />
                                <span>Ubah Data Profil</span>
                              </button>

                              {/* Status Modifiers */}
                              <button
                                onClick={() => handleUpdateUserStatus(u, 'Active')}
                                className="w-full px-3 py-1.5 hover:bg-slate-50 flex items-center space-x-1.5"
                              >
                                <CheckCircle2 size={12} className="text-emerald-500" />
                                <span>Aktifkan Akun</span>
                              </button>

                              <button
                                onClick={() => handleUpdateUserStatus(u, 'Nonaktif')}
                                className="w-full px-3 py-1.5 hover:bg-slate-50 flex items-center space-x-1.5"
                              >
                                <XCircle size={12} className="text-slate-400" />
                                <span>Nonaktifkan</span>
                              </button>

                              <button
                                onClick={() => handleUpdateUserStatus(u, 'Suspend')}
                                className="w-full px-3 py-1.5 hover:bg-slate-50 flex items-center space-x-1.5"
                              >
                                <AlertCircle size={12} className="text-orange-500" />
                                <span>Suspend Akun</span>
                              </button>

                              <button
                                onClick={() => handleUpdateUserStatus(u, 'Blokir')}
                                className="w-full px-3 py-1.5 hover:bg-slate-50 flex items-center space-x-1.5"
                              >
                                <ShieldAlert size={12} className="text-rose-500" />
                                <span>Blokir Keamanan</span>
                              </button>

                              {onDeleteStaff && (
                                <button
                                  onClick={() => {
                                    if (confirm(`Apakah Anda yakin ingin menghapus user ${u.name}?`)) {
                                      onDeleteStaff(u.id);
                                    }
                                    setOpenDropdownId(null);
                                  }}
                                  className="w-full px-3 py-1.5 hover:bg-rose-50 text-rose-600 flex items-center space-x-1.5 border-t border-slate-100"
                                >
                                  <Trash2 size={12} />
                                  <span>Hapus Pengguna</span>
                                </button>
                              )}
                            </>
                          )}

                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}

              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <AlertCircle className="mx-auto text-slate-300 mb-2" size={32} />
                    <h4 className="font-bold text-slate-700">Tidak Ada Data Pengguna</h4>
                    <p className="text-xs text-slate-400 mt-1">Sesuaikan kata kunci pencarian atau filter pilihan Anda.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION PANEL */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 bg-slate-50 border-t border-slate-100 text-xs font-bold text-slate-500">
            <p>
              Menampilkan <span className="font-bold text-slate-800">{(currentPage - 1) * itemsPerPage + 1}</span> - <span className="font-bold text-slate-800">{Math.min(currentPage * itemsPerPage, filteredUsers.length)}</span> dari <span className="font-bold text-slate-800">{filteredUsers.length}</span> Pengguna terdaftar.
            </p>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40 bg-white transition"
              >
                <ChevronLeft size={14} />
              </button>
              <span className="px-3 text-slate-600">Halaman {currentPage} dari {totalPages}</span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40 bg-white transition"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* DETAILED PROFILE DRAWER / PANEL */}
      {detailUser && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-end z-50">
          <div className="bg-white max-w-lg w-full h-full shadow-2xl p-6 overflow-y-auto space-y-6 flex flex-col justify-between">
            <div className="space-y-4 text-left">
              <div className="flex justify-between items-center border-b pb-4">
                <h3 className="font-black text-sm uppercase tracking-wider text-teal-600 flex items-center gap-1">
                  <UserCheck size={16} /> Detailed User Profile
                </h3>
                <button onClick={() => setDetailUser(null)} className="text-slate-400 hover:text-slate-700 font-bold text-sm">✕ Close</button>
              </div>

              {/* Identity Header */}
              <div className="flex items-center space-x-4">
                <img
                  src={detailUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
                  alt={detailUser.name}
                  className="w-16 h-16 rounded-2xl object-cover shadow-md"
                />
                <div>
                  <h4 className="text-base font-black text-slate-800">{detailUser.name}</h4>
                  <p className="text-xs text-slate-400">ID Pengguna: {detailUser.id}</p>
                  <p className="text-[11px] mt-1 inline-block px-2.5 py-0.5 bg-teal-50 text-teal-700 font-black rounded uppercase">
                    Role: {detailUser.role}
                  </p>
                </div>
              </div>

              <hr />

              {/* Dynamic Profiles */}
              <div className="space-y-3.5 text-xs text-slate-600">
                <h5 className="font-extrabold uppercase text-[10px] text-slate-400 tracking-wider">Informasi Kontak & Akun</h5>
                <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl">
                  <div>
                    <span className="text-[9px] font-black uppercase text-slate-400 block">Username</span>
                    <span className="font-extrabold text-slate-700">@{detailUser.username}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-black uppercase text-slate-400 block">Status Akun</span>
                    <span className="font-extrabold text-slate-700">{detailUser.status || 'Active'}</span>
                  </div>
                  <div className="col-span-2 border-t pt-2 mt-2">
                    <span className="text-[9px] font-black uppercase text-slate-400 block">Alamat Email</span>
                    <span className="font-bold text-slate-700">{detailUser.email || '-'}</span>
                  </div>
                  <div className="col-span-2 border-t pt-2">
                    <span className="text-[9px] font-black uppercase text-slate-400 block">WhatsApp</span>
                    <span className="font-bold text-slate-700">{detailUser.whatsapp || '-'}</span>
                  </div>
                </div>

                <h5 className="font-extrabold uppercase text-[10px] text-slate-400 tracking-wider">Afiliasi Referral Komisi</h5>
                <div className="grid grid-cols-2 gap-3 p-3 bg-indigo-50/50 rounded-xl border border-indigo-100">
                  <div>
                    <span className="text-[9px] font-black uppercase text-slate-400 block">Kode Referral</span>
                    <span className="font-black text-indigo-700">{detailUser.referral_code || '-'}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-black uppercase text-slate-400 block">Komisi Penjualan</span>
                    <span className="font-bold text-slate-700">{detailUser.commission_rate || 10}%</span>
                  </div>
                </div>

                <h5 className="font-extrabold uppercase text-[10px] text-slate-400 tracking-wider">Rekening Pencairan Finansial</h5>
                <div className="p-3 bg-slate-50 rounded-xl space-y-2">
                  <div className="grid grid-cols-2 gap-3 border-b pb-2">
                    <div>
                      <span className="text-[9px] font-black uppercase text-slate-400 block">Nama Bank</span>
                      <span className="font-bold text-slate-700">{detailUser.bank || '-'}</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-black uppercase text-slate-400 block">Nomor Rekening</span>
                      <span className="font-bold text-slate-700">{detailUser.account_number || '-'}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-[9px] font-black uppercase text-slate-400 block">Atas Nama Rekening</span>
                    <span className="font-bold text-slate-700">{detailUser.account_name || '-'}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 border-t pt-2">
                    <div>
                      <span className="text-[9px] font-black uppercase text-slate-400 block">E-Wallet</span>
                      <span className="font-bold text-slate-700">{detailUser.ewallet || '-'}</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-black uppercase text-slate-400 block">No E-Wallet</span>
                      <span className="font-bold text-slate-700">{detailUser.ewallet_number || '-'}</span>
                    </div>
                  </div>
                </div>

                <h5 className="font-extrabold uppercase text-[10px] text-slate-400 tracking-wider">Riwayat Log Keamanan</h5>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <div className="flex justify-between">
                    <div>
                      <span className="text-[9px] font-black uppercase text-slate-400 block">Tanggal Registrasi</span>
                      <span className="font-bold text-slate-700">{detailUser.join_date || '-'}</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-black uppercase text-slate-400 block">Login Terakhir</span>
                      <span className="font-bold text-slate-700">{detailUser.last_login ? new Date(detailUser.last_login).toLocaleString() : '-'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => setDetailUser(null)}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-black uppercase tracking-wider rounded-xl transition"
            >
              Close Profile Details
            </button>
          </div>
        </div>
      )}

      {/* IMPORT MULTIPLE USERS MODAL */}
      {showImportModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl max-w-lg w-full overflow-hidden flex flex-col text-left">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="font-black text-sm text-slate-800">Batch Import Akun Pengguna</h3>
                <p className="text-[10px] text-slate-400">Daftarkan banyak client sekaligus secara otomatis</p>
              </div>
              <button onClick={() => setShowImportModal(false)} className="text-slate-400 hover:text-slate-700 font-bold text-sm">✕</button>
            </div>

            <div className="p-6 space-y-4">
              {importError && (
                <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 text-xs rounded-xl flex items-start gap-2">
                  <AlertCircle size={15} className="shrink-0 mt-0.5" />
                  <span>{importError}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-[10px] font-black text-slate-500 uppercase">Input Paste Data (Format CSV atau Array JSON)</label>
                <textarea
                  rows={8}
                  placeholder="Format CSV:&#10;Nama, Email, WhatsApp, Username, Password&#10;&#10;Contoh:&#10;Agus Riyadi, agus@sekolah.sch.id, 081299991111, agusriyadi, agus123*"
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs font-mono outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <div className="text-[10px] text-slate-400 space-y-1 leading-normal">
                <p>💡 <strong>Aturan Import:</strong></p>
                <p>1. Pisahkan baris dengan enter.</p>
                <p>2. Setiap baris wajib memiliki minimal 4 kolom dipisahkan koma.</p>
                <p>3. Password bersifat opsional, jika kosong akan menggunakan default "17April1960*".</p>
              </div>

              <div className="pt-4 flex justify-end space-x-2 border-t border-slate-100">
                <button
                  onClick={() => setShowImportModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition"
                >
                  Batal
                </button>
                <button
                  onClick={handleBatchImport}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-black rounded-lg transition"
                >
                  Proses Import Massal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SIMULATED NOTIFICATION PAYLOAD DISPLAY MODAL */}
      {simulatedNotification && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 text-white rounded-3xl border border-slate-800 shadow-2xl max-w-md w-full overflow-hidden flex flex-col text-left">
            <div className="p-4 bg-teal-950/80 border-b border-teal-500/20 flex justify-between items-center">
              <div className="flex items-center space-x-2 text-teal-400">
                <Activity size={16} className="animate-pulse" />
                <span className="text-[11px] font-black uppercase tracking-widest">
                  Notifikasi Sistem Terkirim ({simulatedNotification.channel})
                </span>
              </div>
              <button 
                onClick={() => setSimulatedNotification(null)} 
                className="text-slate-400 hover:text-white font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="space-y-1">
                <span className="text-[9px] font-black uppercase text-teal-400 block">Penerima Kontak</span>
                <span className="text-xs font-mono font-bold block">{simulatedNotification.target}</span>
              </div>

              {simulatedNotification.channel === 'Email' && (
                <div className="space-y-1 border-t border-slate-800 pt-2">
                  <span className="text-[9px] font-black uppercase text-teal-400 block">Subjek Email</span>
                  <span className="text-xs font-bold block">{simulatedNotification.title}</span>
                </div>
              )}

              <div className="space-y-1 border-t border-slate-800 pt-2">
                <span className="text-[9px] font-black uppercase text-teal-400 block">Pesan Broadcast</span>
                <div className="p-3 bg-slate-950/60 rounded-xl text-xs font-mono whitespace-pre-wrap leading-relaxed text-slate-300">
                  {simulatedNotification.message}
                </div>
              </div>

              <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] rounded-xl flex items-start gap-2">
                <CheckCircle2 size={14} className="shrink-0 mt-0.5" />
                <span>Simulasi pengiriman API selesai. Pelanggan telah berhasil diberi tahu melalui webhook backend.</span>
              </div>

              <button
                onClick={() => setSimulatedNotification(null)}
                className="w-full py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-black uppercase tracking-wider rounded-xl transition"
              >
                Selesai & Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT USER FORM MODAL */}
      {showFormModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl max-w-lg w-full overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-black text-sm text-slate-800 text-left">
                {editingUser ? 'Edit Informasi Akun Pengguna' : 'Tambah Akun Pengguna Baru'}
              </h3>
              <button onClick={() => setShowFormModal(false)} className="text-slate-400 hover:text-slate-700 font-bold text-sm">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-left overflow-y-auto max-h-[75vh]">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Nama Lengkap *</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Contoh: Agus Riyadi"
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Username Unik *</label>
                  <input
                    type="text"
                    required
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                    placeholder="agusriyadi"
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Email Resmi *</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="agus@sekolah.sch.id"
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Nomor WhatsApp *</label>
                  <input
                    type="text"
                    required
                    value={form.whatsapp}
                    onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                    placeholder="0812..."
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Kata Sandi (Password) *</label>
                  <input
                    type="password"
                    required={!editingUser}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder={editingUser ? 'Kosongkan jika tidak diubah' : 'Ketik password...'}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Peran (Role Akses) *</label>
                  <select
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-xs cursor-pointer"
                  >
                    {rolesList.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Referral and commissions config */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div>
                  <label className="block text-[10px] font-bold text-teal-600 uppercase mb-1">Kode Referral Rujukan</label>
                  <input
                    type="text"
                    value={form.referral_code}
                    onChange={(e) => setForm({ ...form, referral_code: e.target.value })}
                    className="w-full bg-white border border-slate-200 p-2.5 rounded-lg text-xs font-bold text-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-teal-600 uppercase mb-1">Persentase Komisi (%)</label>
                  <input
                    type="number"
                    value={form.commission_rate}
                    onChange={(e) => setForm({ ...form, commission_rate: Number(e.target.value) })}
                    className="w-full bg-white border border-slate-200 p-2.5 rounded-lg text-xs font-bold text-slate-700"
                  />
                </div>
              </div>

              {/* Bank Details section */}
              <div className="space-y-3 p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Rincian Bank & Pencairan Komisi</span>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Nama Bank</label>
                    <input
                      type="text"
                      value={form.bank}
                      onChange={(e) => setForm({ ...form, bank: e.target.value })}
                      placeholder="Bank BCA"
                      className="w-full bg-white border border-slate-200 p-2 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">No Rekening</label>
                    <input
                      type="text"
                      value={form.account_number}
                      onChange={(e) => setForm({ ...form, account_number: e.target.value })}
                      placeholder="801223..."
                      className="w-full bg-white border border-slate-200 p-2 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Atas Nama</label>
                    <input
                      type="text"
                      value={form.account_name}
                      onChange={(e) => setForm({ ...form, account_name: e.target.value })}
                      placeholder="Agus R."
                      className="w-full bg-white border border-slate-200 p-2 rounded-lg text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Dompet Digital</label>
                    <input
                      type="text"
                      value={form.ewallet}
                      onChange={(e) => setForm({ ...form, ewallet: e.target.value })}
                      placeholder="GOPAY / OVO / DANA"
                      className="w-full bg-white border border-slate-200 p-2 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">No E-Wallet</label>
                    <input
                      type="text"
                      value={form.ewallet_number}
                      onChange={(e) => setForm({ ...form, ewallet_number: e.target.value })}
                      placeholder="0812..."
                      className="w-full bg-white border border-slate-200 p-2 rounded-lg text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end space-x-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-lg transition"
                >
                  {editingUser ? 'Simpan Akun' : 'Daftarkan Akun'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
