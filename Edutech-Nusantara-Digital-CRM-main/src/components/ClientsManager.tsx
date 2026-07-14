import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Plus,
  Edit2,
  Trash2,
  Download,
  Upload,
  UserPlus,
  RefreshCw,
  X,
  FileSpreadsheet
} from 'lucide-react';
import { Client } from '../types/crm';
import { CRM_API } from '../services/api';
import { getStatusColor, exportToCSV, parseCSV } from '../utils';
import Swal from 'sweetalert2';

export default function ClientsManager() {
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua');
  const [isLoading, setIsLoading] = useState(false);

  // Modal / Form state
  const [showFormModal, setShowFormModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Client>>({
    name: '',
    company: '',
    email: '',
    whatsapp: '',
    username: '',
    status: 'Aktif'
  });

  const loadClients = async () => {
    setIsLoading(true);
    const data = await CRM_API.getClients();
    setClients(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadClients();
  }, []);

  // Filter clients
  const filteredClients = clients.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || 
                          c.company.toLowerCase().includes(search.toLowerCase()) ||
                          c.email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'Semua' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Handle delete client
  const handleDelete = async (id: string, name: string) => {
    Swal.fire({
      title: 'Hapus Client?',
      text: `Apakah Anda yakin ingin menghapus client ${name}? Seluruh data login terkait akan terhapus.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#64748B',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal'
    }).then(async (result) => {
      if (result.isConfirmed) {
        await CRM_API.deleteClient(id);
        loadClients();
        Swal.fire('Terhapus!', 'Data client berhasil dihapus.', 'success');
      }
    });
  };

  // Open Add/Edit Modal
  const handleOpenForm = (client?: Client) => {
    if (client) {
      setIsEditing(true);
      setFormData(client);
    } else {
      setIsEditing(false);
      setFormData({
        name: '',
        company: '',
        email: '',
        whatsapp: '',
        username: '',
        status: 'Aktif'
      });
    }
    setShowFormModal(true);
  };

  // Save Client form
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.company || !formData.email || !formData.whatsapp) {
      Swal.fire('Error', 'Harap isi seluruh kolom wajib!', 'error');
      return;
    }

    await CRM_API.saveClient(formData as Client);
    setShowFormModal(false);
    loadClients();
    
    Swal.fire({
      icon: 'success',
      title: isEditing ? 'Client Diupdate' : 'Client Ditambahkan',
      text: isEditing ? 'Profil client berhasil diperbarui.' : 'Client baru berhasil diregistrasi ke database.',
      timer: 1500,
      showConfirmButton: false
    });
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['ID', 'Nama', 'Perusahaan', 'Email', 'WhatsApp', 'Username', 'Status', 'Jumlah Project', 'Tanggal Registrasi'];
    const rows = clients.map(c => [c.id, c.name, c.company, c.email, c.whatsapp, c.username, c.status, c.projectCount, c.createdAt]);
    exportToCSV('EduTech_Clients_Database', headers, rows);
    Swal.fire('Eksport Sukses', 'Data client berhasil dieksport ke format CSV.', 'success');
  };

  // Import mock CSV file
  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      const parsed = parseCSV(text);
      // skip headers, import rows
      if (parsed.length > 1) {
        for (let i = 1; i < parsed.length; i++) {
          const row = parsed[i];
          if (row.length >= 4 && row[1]) {
            await CRM_API.saveClient({
              id: '',
              name: row[1],
              company: row[2] || 'Instansi Umum',
              email: row[3] || 'info@klien.com',
              whatsapp: row[4] || '0812',
              username: row[5] || row[1].toLowerCase().replace(/\s/g, ''),
              status: 'Aktif',
              projectCount: 0,
              createdAt: new Date().toISOString().split('T')[0]
            });
          }
        }
        loadClients();
        Swal.fire('Import Berhasil', `${parsed.length - 1} Client berhasil diimport ke spreadsheet.`, 'success');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* Control Action Panel */}
      <div className="bg-white dark:bg-slate-800 p-4 md:p-6 rounded-2xl border border-slate-100 dark:border-slate-700/60 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-xl">
            <Users size={20} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">Direktori Database Klien</h3>
            <p className="text-xs text-slate-400">Total terdaftar: {clients.length} instansi terverifikasi</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Export / Import buttons */}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-700 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 transition"
          >
            <Download size={14} />
            <span>Ekspor CSV</span>
          </button>

          <label className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-700 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 cursor-pointer transition">
            <Upload size={14} />
            <span>Impor CSV</span>
            <input type="file" accept=".csv" onChange={handleImportCSV} className="hidden" />
          </label>

          <button
            onClick={() => handleOpenForm()}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition shadow-md shadow-blue-500/10"
          >
            <Plus size={14} />
            <span>Tambah Client</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/60 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search size={16} />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-3 py-2 text-xs border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 rounded-xl focus:outline-none text-slate-800 dark:text-white"
            placeholder="Cari nama, instansi, email..."
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 whitespace-nowrap font-medium">Status Keaktifan:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 rounded-xl focus:outline-none text-slate-800 dark:text-white"
          >
            <option value="Semua">Semua Status</option>
            <option value="Aktif">Aktif</option>
            <option value="Nonaktif">Nonaktif</option>
          </select>
        </div>

        <div className="flex items-center justify-end">
          <button
            onClick={loadClients}
            className="p-2 text-slate-400 hover:text-blue-600 rounded-xl bg-slate-50 dark:bg-slate-900/50 transition border border-transparent hover:border-slate-200/30"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* Clients Database Table Grid */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/60 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-20 text-center space-y-3">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs text-slate-400">Menghubungkan ke database...</p>
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="p-20 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center mx-auto text-slate-400">
              <Users size={24} />
            </div>
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">Data Client Kosong</h4>
            <p className="text-xs text-slate-400">Tidak ada data klien yang memenuhi filter saat ini.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="p-4">Nama Client</th>
                  <th className="p-4">Perusahaan / Lembaga</th>
                  <th className="p-4">Email & Kontak WA</th>
                  <th className="p-4">Proyek Aktif</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50 text-xs">
                {filteredClients.map((client) => {
                  const badge = getStatusColor(client.status);
                  return (
                    <tr key={client.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-700/10 transition">
                      <td className="p-4 font-semibold text-slate-800 dark:text-white">
                        {client.name}
                        <span className="block text-[10px] font-mono text-slate-400">@{client.username}</span>
                      </td>
                      <td className="p-4 text-slate-600 dark:text-slate-300 font-medium">{client.company}</td>
                      <td className="p-4 space-y-0.5">
                        <span className="block text-slate-600 dark:text-slate-300">{client.email}</span>
                        <span className="block text-[11px] font-semibold text-sky-600">{client.whatsapp}</span>
                      </td>
                      <td className="p-4 text-center">
                        <span className="inline-block px-2.5 py-1 bg-slate-100 dark:bg-slate-800 font-bold rounded-lg text-[11px] text-slate-700 dark:text-slate-300">
                          {client.projectCount} Project
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${badge.bg} ${badge.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`}></span>
                          {client.status}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-1 whitespace-nowrap">
                        <button
                          onClick={() => handleOpenForm(client)}
                          className="p-1.5 rounded-lg border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-400 hover:text-blue-600 hover:border-blue-100 transition inline-block"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => handleDelete(client.id, client.name)}
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

      {/* Form Dialog Modal for CRUD client */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200/50 dark:border-slate-700/50 space-y-5 animate-fade-in">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-700">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                {isEditing ? 'Perbarui Profil Klien' : 'Daftarkan Klien Baru'}
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
                    placeholder="Diana Putri"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Perusahaan / Lembaga *</label>
                  <input
                    type="text"
                    required
                    value={formData.company || ''}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 text-xs rounded-xl focus:outline-none"
                    placeholder="Yayasan Nusantara Learn"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 text-xs rounded-xl focus:outline-none"
                    placeholder="diana@nusantaralearn.com"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">WhatsApp (Aktif) *</label>
                  <input
                    type="text"
                    required
                    value={formData.whatsapp || ''}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 text-xs rounded-xl focus:outline-none"
                    placeholder="08567890..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Username Sistem (Akses Login)</label>
                  <input
                    type="text"
                    value={formData.username || ''}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 text-xs rounded-xl focus:outline-none"
                    placeholder="dianaputri"
                  />
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
                {isEditing ? 'Simpan Perubahan' : 'Registrasikan Sekarang'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
