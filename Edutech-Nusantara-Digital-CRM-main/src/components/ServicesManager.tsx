import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Search,
  Plus,
  Edit2,
  Trash2,
  X,
  Sparkles,
  Info
} from 'lucide-react';
import { Service } from '../types/crm';
import { CRM_API } from '../services/api';
import { formatRupiah, getStatusColor } from '../utils';
import Swal from 'sweetalert2';

export default function ServicesManager() {
  const [services, setServices] = useState<Service[]>([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Semua');
  const [isLoading, setIsLoading] = useState(false);

  // Form states
  const [showFormModal, setShowFormModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Service>>({
    name: '',
    category: 'Website',
    price: 3500000,
    estimate: '7 Hari',
    status: 'Aktif',
    description: ''
  });

  const categories = [
    'Website', 'Landing Page', 'Company Profile', 'OJS', 'Jurnal', 'ISBN', 'HKI',
    'Hosting', 'Domain', 'Email Bisnis', 'SEO', 'Digital Marketing', 'AI Automation',
    'Maintenance', 'Google Workspace', 'Pelatihan'
  ];

  const loadServices = async () => {
    setIsLoading(true);
    const data = await CRM_API.getServices();
    setServices(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadServices();
  }, []);

  const filteredServices = services.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
                          s.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'Semua' || s.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleDelete = async (id: string, name: string) => {
    Swal.fire({
      title: 'Hapus Layanan?',
      text: `Apakah Anda yakin ingin menghapus layanan ${name} dari katalog?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#64748B',
      confirmButtonText: 'Hapus Layanan'
    }).then(async (result) => {
      if (result.isConfirmed) {
        await CRM_API.deleteService(id);
        loadServices();
        Swal.fire('Terhapus', 'Layanan berhasil dihapus dari katalog aktif.', 'success');
      }
    });
  };

  const handleOpenForm = (service?: Service) => {
    if (service) {
      setIsEditing(true);
      setFormData(service);
    } else {
      setIsEditing(false);
      setFormData({
        name: '',
        category: 'Website',
        price: 3500000,
        estimate: '7 Hari',
        status: 'Aktif',
        description: ''
      });
    }
    setShowFormModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.estimate || !formData.description) {
      Swal.fire('Error', 'Harap isi seluruh data wajib.', 'warning');
      return;
    }

    await CRM_API.saveService(formData as Service);
    setShowFormModal(false);
    loadServices();

    Swal.fire({
      icon: 'success',
      title: 'Layanan Diperbarui',
      text: isEditing ? 'Detail layanan berhasil diupdate.' : 'Layanan baru berhasil dimasukkan ke katalog.',
      timer: 1500,
      showConfirmButton: false
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 p-4 md:p-6 rounded-2xl border border-slate-100 dark:border-slate-700/60 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-xl">
            <Briefcase size={20} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">Katalog Produk & Jasa Digital</h3>
            <p className="text-xs text-slate-400">Total penawaran aktif: {services.length} paket komersial</p>
          </div>
        </div>

        <button
          onClick={() => handleOpenForm()}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition shadow-md shadow-blue-500/10"
        >
          <Plus size={14} />
          <span>Tambah Layanan</span>
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
            placeholder="Cari nama layanan atau deskripsi..."
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 whitespace-nowrap font-medium">Filter Kategori:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 rounded-xl focus:outline-none text-slate-800 dark:text-white"
          >
            <option value="Semua">Semua Kategori</option>
            {categories.map((cat, i) => (
              <option key={i} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Services Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {isLoading ? (
          <div className="col-span-full p-20 text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-xs text-slate-400">Menyinkronkan katalog...</p>
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="col-span-full p-20 text-center bg-white dark:bg-slate-800 rounded-2xl border">
            <p className="text-xs text-slate-400 italic">Katalog produk belum terisi.</p>
          </div>
        ) : (
          filteredServices.map((service) => {
            const badge = getStatusColor(service.status);
            return (
              <div
                key={service.id}
                className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/60 shadow-sm flex flex-col justify-between hover:shadow-md transition relative group"
              >
                <div className="space-y-3.5">
                  <div className="flex justify-between items-start">
                    <span className="inline-block px-2.5 py-1 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-[10px] font-bold rounded-lg border border-blue-200/20 uppercase tracking-wider">
                      {service.category}
                    </span>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold ${badge.bg} ${badge.text}`}>
                      {service.status}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-slate-800 dark:text-white leading-snug group-hover:text-blue-600 transition">
                      {service.name}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                      {service.description}
                    </p>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-700/80 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-mono">ESTIMASI: {service.estimate.toUpperCase()}</span>
                    <span className="text-base font-bold text-slate-800 dark:text-white">{formatRupiah(service.price)}</span>
                  </div>

                  <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition duration-200">
                    <button
                      onClick={() => handleOpenForm(service)}
                      className="p-1.5 rounded-lg border border-slate-100 dark:border-slate-700 text-slate-400 hover:text-blue-600 transition"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      onClick={() => handleDelete(service.id, service.name)}
                      className="p-1.5 rounded-lg border border-slate-100 dark:border-slate-700 text-slate-400 hover:text-rose-600 transition"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Form Dialog Modal for CRUD Service */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200/50 dark:border-slate-700/50 space-y-5 animate-fade-in">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-700">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                {isEditing ? 'Perbarui Katalog Jasa' : 'Masukkan Jasa Baru'}
              </h3>
              <button onClick={() => setShowFormModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase">Nama Jasa / Paket Produk *</label>
                <input
                  type="text"
                  required
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 text-xs rounded-xl focus:outline-none"
                  placeholder="Website OJS Jurnal Premium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Kategori Layanan</label>
                  <select
                    value={formData.category || 'Website'}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="mt-1 block w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 text-xs rounded-xl focus:outline-none"
                  >
                    {categories.map((cat, i) => (
                      <option key={i} value={cat}>{cat}</option>
                    ))}
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Nominal Harga (Rupiah) *</label>
                  <input
                    type="number"
                    required
                    value={formData.price || 0}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="mt-1 block w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 text-xs rounded-xl focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Estimasi Waktu Kerja *</label>
                  <input
                    type="text"
                    required
                    value={formData.estimate || ''}
                    onChange={(e) => setFormData({ ...formData, estimate: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 text-xs rounded-xl focus:outline-none"
                    placeholder="Contoh: 14 Hari"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase">Deskripsi & Ruang Lingkup Kerja *</label>
                <textarea
                  required
                  rows={3}
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 text-xs rounded-xl focus:outline-none"
                  placeholder="Tuliskan spesifikasi produk, kelebihan, dan ruang lingkup pekerjaan..."
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition"
              >
                Simpan Jasa
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
