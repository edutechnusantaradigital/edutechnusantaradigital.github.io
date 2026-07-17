/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Plus, Search, Edit2, Trash2, CheckCircle2, XCircle, 
  Download, Upload, Tag, Briefcase, ChevronLeft, ChevronRight,
  Filter, AlertCircle, RefreshCw
} from 'lucide-react';

interface Service {
  id: string;
  category: string;
  subcategory: string;
  package_name: string;
  price: number;
  discount: number;
  status: string;
  icon: string;
  color: string;
  description: string;
  features: string;
  estimation: string;
}

interface ServicesViewProps {
  services: Service[];
  onAddService: (data: any) => Promise<any>;
  onUpdateService: (id: string, data: any) => Promise<any>;
  onDeleteService: (id: string) => Promise<any>;
  role: string;
}

export default function ServicesView({
  services,
  onAddService,
  onUpdateService,
  onDeleteService,
  role
}: ServicesViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [selectedStatus, setSelectedStatus] = useState('Semua');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  
  // Form states
  const [form, setForm] = useState({
    category: 'Website',
    subcategory: 'Landing Page',
    package_name: '',
    price: 0,
    discount: 0,
    status: 'Active',
    icon: 'Globe',
    color: 'bg-indigo-500',
    description: '',
    features: '',
    estimation: '3 Hari'
  });

  const categories = ['Website', 'Education', 'Enterprise', 'Cloud', 'Digital Marketing', 'Lainnya'];
  const itemsPerPage = 8;

  // Filter and Search logic
  const filteredServices = services.filter(svc => {
    const matchesSearch = 
      svc.package_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      svc.subcategory?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      svc.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'Semua' || svc.category === selectedCategory;
    const matchesStatus = selectedStatus === 'Semua' || svc.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredServices.length / itemsPerPage) || 1;
  const paginatedServices = filteredServices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const formatIDR = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(num);
  };

  const handleOpenAdd = () => {
    setEditingService(null);
    setForm({
      category: 'Website',
      subcategory: 'Landing Page',
      package_name: '',
      price: 0,
      discount: 0,
      status: 'Active',
      icon: 'Globe',
      color: 'bg-indigo-500',
      description: '',
      features: 'Full Responsive, Hosting 1 Tahun, Domain .com, Revisi 3x',
      estimation: '3 Hari'
    });
    setShowFormModal(true);
  };

  const handleOpenEdit = (svc: Service) => {
    setEditingService(svc);
    setForm({
      category: svc.category || 'Website',
      subcategory: svc.subcategory || '',
      package_name: svc.package_name || '',
      price: svc.price || 0,
      discount: svc.discount || 0,
      status: svc.status || 'Active',
      icon: svc.icon || 'Globe',
      color: svc.color || 'bg-indigo-500',
      description: svc.description || '',
      features: svc.features || '',
      estimation: svc.estimation || '5 Hari'
    });
    setShowFormModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingService) {
        await onUpdateService(editingService.id, form);
      } else {
        await onAddService(form);
      }
      setShowFormModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Apakah Anda yakin ingin menonaktifkan paket layanan ini?')) {
      await onDeleteService(id);
    }
  };

  // CSV Import / Export Handler
  const handleExportCSV = () => {
    const headers = ['ID', 'Kategori', 'Sub Kategori', 'Nama Paket', 'Harga', 'Diskon', 'Status', 'Deskripsi', 'Estimasi'];
    const rows = filteredServices.map(s => [
      s.id, s.category, s.subcategory, s.package_name, s.price, s.discount, s.status, s.description, s.estimation
    ]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(r => r.map(val => `"${val}"`).join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "EduTech_Layanan_SaaS.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const text = evt.target?.result as string;
      const lines = text.split('\n').slice(1); // skip headers
      for (const line of lines) {
        if (!line.trim()) continue;
        const parts = line.split(',').map(p => p.replace(/^"|"$/g, '').trim());
        if (parts.length >= 5) {
          const servicePayload = {
            category: parts[1] || 'Website',
            subcategory: parts[2] || '',
            package_name: parts[3] || '',
            price: Number(parts[4]) || 0,
            discount: Number(parts[5]) || 0,
            status: parts[6] || 'Active',
            icon: 'Globe',
            color: 'bg-indigo-500',
            description: parts[7] || '',
            features: 'Imported via CSV',
            estimation: parts[8] || '7 Hari'
          };
          await onAddService(servicePayload);
        }
      }
      alert('Impor file layanan CSV berhasil disinkronkan!');
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 text-left" id="services-view-root">
      {/* Dynamic Header */}
      <div className="bg-gradient-to-r from-indigo-900 to-indigo-950 p-6 rounded-2xl shadow-xl text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xs font-extrabold uppercase tracking-widest text-indigo-300">EduTech Nusantara Layanan</h2>
          <h1 className="text-2xl font-black mt-1">SaaS & Layanan Pendidikan Suite</h1>
          <p className="text-slate-300 text-xs mt-1 max-w-xl">
            Kelola rincian paket website, kustomisasi dashboard layanan, sistem diskon, harga, serta fitur masing-masing modul digital.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {role === 'Super Admin' && (
            <>
              <label className="flex items-center space-x-1.5 px-3 py-2 bg-indigo-850/60 hover:bg-indigo-800 text-xs font-bold rounded-lg border border-indigo-700 cursor-pointer transition">
                <Upload size={14} />
                <span>Impor CSV</span>
                <input type="file" accept=".csv" onChange={handleImportCSV} className="hidden" />
              </label>
              <button
                id="export-services-btn"
                onClick={handleExportCSV}
                className="flex items-center space-x-1 px-3 py-2 bg-indigo-850/60 hover:bg-indigo-800 text-xs font-bold rounded-lg border border-indigo-700 transition"
              >
                <Download size={14} />
                <span>Ekspor CSV</span>
              </button>
              <button
                id="add-service-btn"
                onClick={handleOpenAdd}
                className="flex items-center space-x-1 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-extrabold rounded-lg shadow-lg shadow-indigo-500/20 transition"
              >
                <Plus size={16} />
                <span>Tambah Layanan</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Advanced Filter Suite */}
      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <Search size={16} />
          </span>
          <input
            type="text"
            placeholder="Cari paket layanan atau deskripsi..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="w-full bg-slate-50 border border-slate-200 pl-10 pr-4 py-2 rounded-lg text-xs outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Dynamic Select Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg">
            <Filter size={13} className="text-slate-400" />
            <span className="text-[10px] font-bold text-slate-500 uppercase">Kategori:</span>
            <select
              value={selectedCategory}
              onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
              className="bg-transparent text-xs font-bold text-slate-700 outline-none cursor-pointer"
            >
              <option value="Semua">Semua Kategori</option>
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg">
            <Tag size={13} className="text-slate-400" />
            <span className="text-[10px] font-bold text-slate-500 uppercase">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => { setSelectedStatus(e.target.value); setCurrentPage(1); }}
              className="bg-transparent text-xs font-bold text-slate-700 outline-none cursor-pointer"
            >
              <option value="Semua">Semua Status</option>
              <option value="Active">Aktif</option>
              <option value="Inactive">Nonaktif</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {paginatedServices.map(svc => {
          const discountAmount = (svc.price * (svc.discount || 0)) / 100;
          const finalPrice = svc.price - discountAmount;

          return (
            <div 
              key={svc.id} 
              className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition duration-200 flex flex-col justify-between"
            >
              {/* Card Banner */}
              <div className={`h-2.5 ${svc.color || 'bg-indigo-500'}`}></div>

              <div className="p-5 space-y-4 text-left flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-bold uppercase">
                      {svc.category}
                    </span>
                    <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-extrabold ${
                      svc.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                    }`}>
                      {svc.status === 'Active' ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-slate-800 text-sm leading-tight">{svc.package_name}</h3>
                    <p className="text-[11px] text-slate-400 font-medium">{svc.subcategory}</p>
                  </div>

                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed min-h-[2.5rem]">
                    {svc.description || 'Tidak ada deskripsi rinci.'}
                  </p>
                </div>

                {/* Price Display */}
                <div className="p-3 bg-slate-50/80 rounded-xl space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-slate-400 font-bold">Harga Ritel:</span>
                    {svc.discount > 0 && (
                      <span className="px-1.5 py-0.5 bg-rose-50 text-rose-600 rounded font-black text-[9px]">
                        Diskon {svc.discount}%
                      </span>
                    )}
                  </div>
                  <div className="flex items-baseline space-x-1.5">
                    <span className="text-base font-black text-slate-800">{formatIDR(finalPrice)}</span>
                    {svc.discount > 0 && (
                      <span className="text-xs text-slate-400 line-through">{formatIDR(svc.price)}</span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-100 flex justify-between">
                    <span>Pengerjaan:</span>
                    <span className="font-bold text-slate-600">{svc.estimation}</span>
                  </div>
                </div>

                {/* Actions */}
                {role === 'Super Admin' && (
                  <div className="pt-3 border-t border-slate-100 flex justify-end space-x-1">
                    <button
                      onClick={() => handleOpenEdit(svc)}
                      className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                      title="Edit Layanan"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      onClick={() => handleDelete(svc.id)}
                      className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      title="Nonaktifkan Layanan"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {paginatedServices.length === 0 && (
          <div className="col-span-full bg-white p-12 text-center border border-dashed border-slate-200 rounded-2xl">
            <AlertCircle className="mx-auto text-slate-300 mb-2" size={32} />
            <h4 className="font-bold text-slate-700">Tidak Ada Paket Layanan</h4>
            <p className="text-xs text-slate-400 mt-1">Gunakan filter atau tombol tambah di atas.</p>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <p className="text-xs text-slate-400">
            Menampilkan <span className="font-bold text-slate-700">{(currentPage - 1) * itemsPerPage + 1}</span> - <span className="font-bold text-slate-700">{Math.min(currentPage * itemsPerPage, filteredServices.length)}</span> dari <span className="font-bold text-slate-700">{filteredServices.length}</span> layanan.
          </p>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 transition"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="text-xs font-bold text-slate-600 px-3">
              Halaman {currentPage} dari {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 transition"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Form Dialog Modal */}
      {showFormModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl max-w-lg w-full overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-black text-sm text-slate-800 text-left">
                {editingService ? 'Edit Paket Layanan' : 'Tambah Paket Layanan Baru'}
              </h3>
              <button onClick={() => setShowFormModal(false)} className="text-slate-400 hover:text-slate-700 font-bold text-sm">✕</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-left overflow-y-auto max-h-[75vh]">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Kategori Utama *</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-xs"
                  >
                    {categories.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Sub Kategori *</label>
                  <input
                    type="text"
                    required
                    value={form.subcategory}
                    onChange={(e) => setForm({ ...form, subcategory: e.target.value })}
                    placeholder="Contoh: Landing Page Kampus"
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Nama Paket Layanan *</label>
                <input
                  type="text"
                  required
                  value={form.package_name}
                  onChange={(e) => setForm({ ...form, package_name: e.target.value })}
                  placeholder="Contoh: Website Akreditasi Premium"
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Harga (IDR) *</label>
                  <input
                    type="number"
                    required
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Diskon (%)</label>
                  <input
                    type="number"
                    value={form.discount}
                    onChange={(e) => setForm({ ...form, discount: Number(e.target.value) })}
                    placeholder="0"
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Estimasi Kerja</label>
                  <input
                    type="text"
                    value={form.estimation}
                    onChange={(e) => setForm({ ...form, estimation: e.target.value })}
                    placeholder="3 Hari"
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Deskripsi Singkat *</label>
                <textarea
                  required
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Deskripsikan kelebihan, sasaran instansi pendidikan, dan rincian modul..."
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-xs"
                ></textarea>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Fitur Utama (Pemisah Koma) *</label>
                <input
                  type="text"
                  required
                  value={form.features}
                  onChange={(e) => setForm({ ...form, features: e.target.value })}
                  placeholder="Contoh: Hosting Premium, Domain .ac.id, SSL, Integrasi SIAKAD"
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Status Publikasi</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-xs"
                  >
                    <option value="Active">Aktif</option>
                    <option value="Inactive">Nonaktif</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Warna Aksen Banner</label>
                  <select
                    value={form.color}
                    onChange={(e) => setForm({ ...form, color: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-xs"
                  >
                    <option value="bg-indigo-500">Indigo Modern</option>
                    <option value="bg-emerald-500">Emerald Edu</option>
                    <option value="bg-sky-500">Sky Clean</option>
                    <option value="bg-rose-500">Rose Warm</option>
                    <option value="bg-amber-500">Gold Premium</option>
                  </select>
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
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition"
                >
                  {editingService ? 'Simpan Perubahan' : 'Buat Paket Layanan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
