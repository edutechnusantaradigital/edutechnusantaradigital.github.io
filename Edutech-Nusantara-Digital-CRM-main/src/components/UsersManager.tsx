import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  Search,
  Plus,
  Edit2,
  Trash2,
  X,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { User, UserRole } from '../types/crm';
import { CRM_API } from '../services/api';
import { getStatusColor } from '../utils';
import Swal from 'sweetalert2';

export default function UsersManager() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('Semua');
  const [isLoading, setIsLoading] = useState(false);

  // Form states
  const [showFormModal, setShowFormModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<User>>({
    name: '',
    username: '',
    email: '',
    whatsapp: '',
    role: 'CLIENT',
    status: 'Aktif'
  });

  const loadUsers = async () => {
    setIsLoading(true);
    const data = await CRM_API.getUsers();
    setUsers(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
                          u.username.toLowerCase().includes(search.toLowerCase()) ||
                          u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'Semua' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleDelete = async (id: string, name: string) => {
    if (id === 'u-1') {
      Swal.fire('Terproteksi', 'Pengguna Admin Utama tidak dapat dihapus.', 'error');
      return;
    }

    Swal.fire({
      title: 'Hapus Staff?',
      text: `Yakin ingin menghapus staff ${name}? Hak akses ke CRM akan segera ditarik.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#64748B',
      confirmButtonText: 'Hapus Akses'
    }).then(async (res) => {
      if (res.isConfirmed) {
        await CRM_API.deleteUser(id);
        loadUsers();
        Swal.fire('Terhapus', 'Akun staff berhasil dihapus dari sistem.', 'success');
      }
    });
  };

  const handleOpenForm = (user?: User) => {
    if (user) {
      setIsEditing(true);
      setFormData(user);
    } else {
      setIsEditing(false);
      setFormData({
        name: '',
        username: '',
        email: '',
        whatsapp: '',
        role: 'CLIENT',
        status: 'Aktif'
      });
    }
    setShowFormModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.username || !formData.email || !formData.whatsapp) {
      Swal.fire('Data Kurang', 'Harap lengkapi semua field bertanda bintang.', 'warning');
      return;
    }

    await CRM_API.saveUser(formData as User);
    setShowFormModal(false);
    loadUsers();

    Swal.fire({
      icon: 'success',
      title: 'Data Tersimpan',
      text: isEditing ? 'Profil staff berhasil dirubah.' : 'Staff baru berhasil terdaftar di database.',
      timer: 1500,
      showConfirmButton: false
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 p-4 md:p-6 rounded-2xl border border-slate-100 dark:border-slate-700/60 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-xl">
            <UserCheck size={20} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">Daftar Pengguna / Staff Organisasi</h3>
            <p className="text-xs text-slate-400">Total staff internal dan akun client: {users.length} akun terdaftar</p>
          </div>
        </div>

        <button
          onClick={() => handleOpenForm()}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition shadow-md shadow-blue-500/10"
        >
          <Plus size={14} />
          <span>Tambah Akun / Staff</span>
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/60 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="relative col-span-2">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search size={16} />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-3 py-2 text-xs border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 rounded-xl focus:outline-none text-slate-800 dark:text-white"
            placeholder="Cari staff berdasarkan nama, username, email..."
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 whitespace-nowrap font-medium">Filter Jabatan:</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 rounded-xl focus:outline-none text-slate-800 dark:text-white"
          >
            <option value="Semua">Semua Hak Akses</option>
            <option value="SUPER_ADMIN">Super Admin</option>
            <option value="IT">IT Support</option>
            <option value="MARKETING">Marketing</option>
            <option value="CLIENT">Client</option>
          </select>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/60 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-20 text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-xs text-slate-400">Memuat data staff...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-20 text-center">
            <p className="text-xs text-slate-400 italic">Tidak ada data pengguna yang terdaftar.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="p-4">Nama & Akun</th>
                  <th className="p-4">Kontak Hubung</th>
                  <th className="p-4">Jabatan (Role)</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50 text-xs">
                {filteredUsers.map((user) => {
                  const badge = getStatusColor(user.status);
                  return (
                    <tr key={user.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-700/10 transition">
                      <td className="p-4 flex items-center gap-3">
                        <img
                          src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&h=100&q=80'}
                          alt={user.name}
                          className="w-9 h-9 rounded-full border object-cover border-blue-500/20"
                        />
                        <div className="leading-tight">
                          <span className="font-bold text-slate-800 dark:text-white block">{user.name}</span>
                          <span className="text-[10px] font-mono text-slate-400">@{user.username}</span>
                        </div>
                      </td>
                      <td className="p-4 space-y-0.5 font-medium text-slate-600 dark:text-slate-300">
                        <span className="block">{user.email}</span>
                        <span className="block text-sky-600 font-semibold">{user.whatsapp}</span>
                      </td>
                      <td className="p-4">
                        <span className="inline-block px-2.5 py-1 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-bold text-[10px] rounded-lg border border-blue-200/20 uppercase tracking-wider">
                          {user.role}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${badge.bg} ${badge.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`}></span>
                          {user.status}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-1 whitespace-nowrap">
                        <button
                          onClick={() => handleOpenForm(user)}
                          className="p-1.5 rounded-lg border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-400 hover:text-blue-600 hover:border-blue-100 transition inline-block"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => handleDelete(user.id, user.name)}
                          className="p-1.5 rounded-lg border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-400 hover:text-rose-600 hover:border-rose-100 transition inline-block"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Form Modal User */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200/50 dark:border-slate-700/50 space-y-5 animate-fade-in">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-700">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                {isEditing ? 'Perbarui Profil Akun / Staff' : 'Buat Akun Staff Baru'}
              </h3>
              <button onClick={() => setShowFormModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Nama Lengkap *</label>
                  <input
                    type="text"
                    required
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 text-xs rounded-xl focus:outline-none"
                    placeholder="Budi Santoso"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Username Login *</label>
                  <input
                    type="text"
                    required
                    value={formData.username || ''}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 text-xs rounded-xl focus:outline-none"
                    placeholder="budidev"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Email Kantor *</label>
                  <input
                    type="email"
                    required
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 text-xs rounded-xl focus:outline-none"
                    placeholder="budi@edutech.com"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Nomor WhatsApp *</label>
                  <input
                    type="text"
                    required
                    value={formData.whatsapp || ''}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 text-xs rounded-xl focus:outline-none"
                    placeholder="0812345..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Jabatan / Hak Akses</label>
                  <select
                    value={formData.role || 'CLIENT'}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                    className="mt-1 block w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 text-xs rounded-xl focus:outline-none"
                  >
                    <option value="SUPER_ADMIN">Super Admin</option>
                    <option value="IT">IT Support</option>
                    <option value="MARKETING">Marketing</option>
                    <option value="CLIENT">Client</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Status Keaktifan</label>
                  <select
                    value={formData.status || 'Aktif'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'Aktif' | 'Nonaktif' })}
                    className="mt-1 block w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 text-xs rounded-xl focus:outline-none"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Nonaktif">Nonaktif</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition"
              >
                Simpan Akun
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
