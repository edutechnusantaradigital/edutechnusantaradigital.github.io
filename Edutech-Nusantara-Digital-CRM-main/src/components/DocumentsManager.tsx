import React, { useState, useEffect } from 'react';
import {
  FolderArchive,
  Search,
  Plus,
  Trash2,
  X,
  FileCheck,
  FileText,
  FileCode,
  Download,
  Info
} from 'lucide-react';
import { Document } from '../types/crm';
import { CRM_API } from '../services/api';
import Swal from 'sweetalert2';

export default function DocumentsManager() {
  const [docs, setDocs] = useState<Document[]>([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Semua');
  const [isLoading, setIsLoading] = useState(false);

  // Form Modal States
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<Partial<Document>>({
    name: '',
    category: 'Kontrak',
    size: '1.2 MB'
  });

  const categories = ['Kontrak', 'Kebutuhan Kerja', 'Website Jurnal', 'Sertifikat ISBN', 'Dokumen HKI', 'Lainnya'];

  const loadDocs = async () => {
    setIsLoading(true);
    const data = await CRM_API.getDocuments();
    setDocs(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadDocs();
  }, []);

  const filteredDocs = docs.filter(d => {
    const matchesSearch = d.name.toLowerCase().includes(search.toLowerCase()) ||
                          d.uploadedBy.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'Semua' || d.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleDelete = async (id: string, name: string) => {
    Swal.fire({
      title: 'Hapus Dokumen?',
      text: `Apakah Anda yakin ingin menghapus file ${name}? Tindakan ini permanen.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#64748B',
      confirmButtonText: 'Ya, Hapus File'
    }).then(async (result) => {
      if (result.isConfirmed) {
        await CRM_API.deleteDocument(id);
        loadDocs();
        Swal.fire('Terhapus', 'Arsip dokumen berhasil dihapus.', 'success');
      }
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      Swal.fire('Error', 'Nama berkas wajib diisi.', 'warning');
      return;
    }

    const newDoc: Document = {
      id: `doc-${Date.now()}`,
      name: formData.name,
      category: (formData.category as any) || 'Kontrak',
      size: `${(Math.random() * 5 + 0.5).toFixed(1)} MB`,
      uploadedAt: new Date().toISOString().split('T')[0],
      url: '#'
    };

    await CRM_API.saveDocument(newDoc);
    setShowModal(false);
    loadDocs();

    Swal.fire({
      icon: 'success',
      title: 'Berkas Berhasil Unggah',
      text: 'File digital berhasil diarsipkan ke database.',
      timer: 1500,
      showConfirmButton: false
    });
  };

  const getFileIcon = (category: string) => {
    switch (category) {
      case 'Kontrak':
        return <FileCheck className="text-emerald-500" size={20} />;
      case 'Kebutuhan Kerja':
        return <FileCode className="text-blue-500" size={20} />;
      default:
        return <FileText className="text-indigo-500" size={20} />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 p-4 md:p-6 rounded-2xl border border-slate-100 dark:border-slate-700/60 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-xl">
            <FolderArchive size={20} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">Arsip & Berkas Digital Terpadu</h3>
            <p className="text-xs text-slate-400">Total berkas tersimpan: {docs.length} file terlindung SSL</p>
          </div>
        </div>

        <button
          onClick={() => {
            setFormData({ name: '', category: 'Kontrak' });
            setShowModal(true);
          }}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition shadow-md shadow-blue-500/10"
        >
          <Plus size={14} />
          <span>Arsipkan Berkas</span>
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
            placeholder="Cari arsip berdasarkan nama file atau pengunggah..."
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 whitespace-nowrap font-medium">Kategori Arsip:</span>
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

      {/* Grid list files */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {isLoading ? (
          <div className="col-span-full p-20 text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-xs text-slate-400">Memindai arsip berkas...</p>
          </div>
        ) : filteredDocs.length === 0 ? (
          <div className="col-span-full p-16 text-center bg-white dark:bg-slate-800 border rounded-2xl">
            <p className="text-xs text-slate-400 italic">Belum ada berkas digital yang disimpan.</p>
          </div>
        ) : (
          filteredDocs.map((doc) => (
            <div
              key={doc.id}
              className="bg-white dark:bg-slate-800 p-4.5 rounded-2xl border border-slate-100 dark:border-slate-700/60 shadow-sm flex items-start justify-between group hover:shadow-md transition"
            >
              <div className="flex gap-3">
                <div className="p-2 bg-slate-50 dark:bg-slate-900 rounded-xl">
                  {getFileIcon(doc.category)}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-white leading-normal line-clamp-1">
                    {doc.name}
                  </h4>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-1 font-mono">
                    <span className="uppercase">{doc.category}</span>
                    <span>•</span>
                    <span>{doc.size}</span>
                  </div>
                  <span className="block text-[9px] text-slate-400 font-mono mt-0.5">Tanggal: {doc.uploadedAt}</span>
                </div>
              </div>

              <div className="flex gap-1">
                <a
                  href={doc.url}
                  onClick={(e) => {
                    e.preventDefault();
                    Swal.fire({
                      icon: 'info',
                      title: 'Download Berkas',
                      text: `Mengunduh file: ${doc.name} (${doc.size})`,
                      timer: 1200,
                      showConfirmButton: false
                    });
                  }}
                  className="p-1.5 rounded-lg border border-slate-100 dark:border-slate-700 hover:text-blue-600 transition"
                >
                  <Download size={13} />
                </a>
                <button
                  onClick={() => handleDelete(doc.id, doc.name)}
                  className="p-1.5 rounded-lg border border-slate-100 dark:border-slate-700 text-slate-400 hover:text-rose-500 transition"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Form modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-200/50 dark:border-slate-700/50 space-y-4 animate-fade-in text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-700">
              <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase">Arsip Berkas Baru</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase">Nama Berkas Dokumen *</label>
                <input
                  type="text"
                  required
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 rounded-xl focus:outline-none"
                  placeholder="Contoh: Lampiran-Kontrak-EduTech-DIGI.pdf"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase">Kategori Klasifikasi</label>
                <select
                  value={formData.category || 'Kontrak'}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                  className="mt-1 block w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 rounded-xl focus:outline-none"
                >
                  {categories.map((cat, i) => (
                    <option key={i} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-900 border dark:border-slate-800 rounded-xl flex items-center gap-2 text-slate-400 text-[10px] leading-relaxed">
                <Info size={14} className="text-blue-500" />
                <span>Simulasi upload: Ukuran berkas dan metadata dihitung otomatis oleh sistem sandbox CRM.</span>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition"
              >
                Arsipkan File Sekarang
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
