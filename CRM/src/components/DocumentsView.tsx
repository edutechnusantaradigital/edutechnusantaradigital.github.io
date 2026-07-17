/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  Plus, Folder, FolderPlus, File, FileText, Download, Trash2, Eye, 
  Share2, Upload, Check, Copy, Search, ExternalLink, RefreshCw, 
  AlertCircle, HardDrive, Info, Shield, HelpCircle, ArrowUpRight, Edit2
} from 'lucide-react';

interface DocumentRecord {
  id: string;
  client_id?: string;
  name: string;
  type: string;
  drive_url: string;
  created_at: string;
  uploaded_by?: string;
  size?: string;
  folder?: string;
  access?: 'Public' | 'Admin Only' | 'Shared';
}

interface DocumentsViewProps {
  documents: DocumentRecord[];
  clients: any[];
  onUploadDocument: (data: any) => Promise<any>;
  onGeneratePDF: (data: any) => Promise<any>;
  onUpdateDocument?: (id: string, data: any) => Promise<any>;
  onDeleteDocument?: (id: string) => Promise<any>;
  role: string;
}

export default function DocumentsView({
  documents = [],
  clients = [],
  onUploadDocument,
  onGeneratePDF,
  onUpdateDocument,
  onDeleteDocument,
  role
}: DocumentsViewProps) {
  // Query, filters and sorting
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFolder, setActiveFolder] = useState('Semua');
  const [selectedClientFilter, setSelectedClientFilter] = useState('Semua');
  const [sortBy, setSortBy] = useState<'name' | 'created_at'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Virtual Folders
  const [folders, setFolders] = useState<string[]>([
    'Invoices', 'Client Files', 'Project Assets', 'Templates'
  ]);
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  // Drag-and-drop state
  const [dragActive, setDragActive] = useState(false);

  // Modals & previews
  const [previewDoc, setPreviewDoc] = useState<DocumentRecord | null>(null);
  const [renameDoc, setRenameDoc] = useState<DocumentRecord | null>(null);
  const [newName, setNewName] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // PDF Generator States
  const [pdfTemplate, setPdfTemplate] = useState('Project Contract');
  const [pdfTargetClient, setPdfTargetClient] = useState('');
  const [pdfFileName, setPdfFileName] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Manual Upload Form States
  const [uploadForm, setUploadForm] = useState({
    name: '',
    type: 'PDF',
    client_id: '',
    folder: 'Client Files',
    drive_url: '',
    access: 'Public' as 'Public' | 'Admin Only' | 'Shared'
  });

  // Handle Drag Events
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Handle Drop and create mock upload
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const fileSizeStr = (file.size / (1024 * 1024)).toFixed(2) + ' MB';
      
      const fileType = file.name.split('.').pop()?.toUpperCase() || 'PDF';
      
      const payload = {
        name: file.name,
        type: fileType,
        drive_url: `https://docs.google.com/viewer?srcid=mock_drive_${Math.random().toString(36).substring(2, 10)}&pid=explorer`,
        client_id: clients[0]?.id || 'CLI00001',
        folder: activeFolder === 'Semua' ? 'Client Files' : activeFolder,
        access: 'Public',
        size: fileSizeStr,
        uploaded_by: role
      };

      try {
        await onUploadDocument(payload);
        alert(`Sukses mengunggah "${file.name}" langsung ke Google Drive & Cloud database!`);
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Form based manual upload submit
  const handleManualUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadForm.name.trim()) return;

    const payload = {
      ...uploadForm,
      drive_url: uploadForm.drive_url || `https://docs.google.com/viewer?srcid=mock_drive_${Math.random().toString(36).substring(2, 10)}&pid=explorer`,
      size: (Math.random() * 4 + 0.1).toFixed(2) + ' MB',
      uploaded_by: role
    };

    try {
      await onUploadDocument(payload);
      setShowUploadModal(false);
      setUploadForm({
        name: '',
        type: 'PDF',
        client_id: '',
        folder: 'Client Files',
        drive_url: '',
        access: 'Public'
      });
    } catch (err) {
      console.error(err);
    }
  };

  // Handle PDF auto-compiling trigger
  const handleAutoGeneratePDF = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);

    const clientObj = clients.find(c => c.id === pdfTargetClient) || clients[0];
    const clientName = clientObj ? clientObj.name : 'Client Umum';

    const payload = {
      clientId: pdfTargetClient || clients[0]?.id || 'CLI00001',
      templateType: pdfTemplate,
      name: pdfFileName.trim() || `KONTRAK_${pdfTemplate.toUpperCase().replace(/ /g, '_')}_${clientName.replace(/ /g, '_')}.pdf`,
      uploadedBy: role
    };

    try {
      await onGeneratePDF(payload);
      alert(`Generator Sukses! PDF ${pdfTemplate} telah berhasil dicompile secara dinamis dan diunggah otomatis ke Google Drive.`);
      setPdfFileName('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Share URL copy tool
  const handleCopyShareUrl = (doc: DocumentRecord) => {
    navigator.clipboard.writeText(doc.drive_url);
    setCopiedId(doc.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Handle renaming metadata
  const handleSaveRename = async () => {
    if (!renameDoc || !newName.trim() || !onUpdateDocument) return;
    try {
      await onUpdateDocument(renameDoc.id, { name: newName.trim() });
      setRenameDoc(null);
      setNewName('');
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Create virtual folder
  const handleCreateFolder = () => {
    if (newFolderName.trim() && !folders.includes(newFolderName.trim())) {
      setFolders([...folders, newFolderName.trim()]);
      setActiveFolder(newFolderName.trim());
      setNewFolderName('');
      setShowNewFolderModal(false);
    }
  };

  // Filtered Documents
  const filteredDocs = useMemo(() => {
    return documents.filter(doc => {
      const matchesSearch = doc.name?.toLowerCase().includes(searchQuery.toLowerCase()) || doc.id?.toLowerCase().includes(searchQuery.toLowerCase());
      const docFolder = doc.folder || 'Client Files';
      const matchesFolder = activeFolder === 'Semua' || docFolder === activeFolder;
      const matchesClient = selectedClientFilter === 'Semua' || doc.client_id === selectedClientFilter;
      
      // RBAC security constraints
      if (role === 'Client' && doc.access === 'Admin Only') {
        return false;
      }
      return matchesSearch && matchesFolder && matchesClient;
    }).sort((a, b) => {
      if (sortBy === 'created_at') {
        const timeA = new Date(a.created_at).getTime() || 0;
        const timeB = new Date(b.created_at).getTime() || 0;
        return sortOrder === 'asc' ? timeA - timeB : timeB - timeA;
      }
      return sortOrder === 'asc' 
        ? a.name.localeCompare(b.name) 
        : b.name.localeCompare(a.name);
    });
  }, [documents, searchQuery, activeFolder, selectedClientFilter, sortBy, sortOrder, role]);

  return (
    <div className="space-y-6 text-left pb-16" id="dms-system-root">
      
      {/* DRIVE GOOGLE CLOUD INTEGRATION STATUS */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="absolute w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl -top-10 -left-10 pointer-events-none"></div>
        
        {/* Connection info */}
        <div className="space-y-2 relative z-10">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 rounded-full text-[9px] font-black uppercase tracking-wider">
              Google Workspace Active
            </span>
            <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping"></span>
              <span>OAuth Connected</span>
            </div>
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight flex items-center gap-2">
            <HardDrive className="text-indigo-400" /> DMS & Google Drive Center
          </h1>
          <p className="text-slate-300 text-xs max-w-xl leading-relaxed">
            Penyimpanan awan terpusat. Seluruh dokumen proyek, tagihan invoice, laporan akademis, serta kontrak client EduTech otomatis tertata rapi dalam folder Google Drive.
          </p>
        </div>

        {/* Quota Gauge widget */}
        <div className="bg-slate-950/40 border border-slate-800/80 rounded-2xl p-4 w-full lg:w-72 relative z-10 shrink-0 text-xs">
          <div className="flex justify-between items-center mb-1.5 text-[10px] text-slate-400 font-bold uppercase">
            <span>Penyimpanan Google Drive</span>
            <span className="text-indigo-300">8% Terpakai</span>
          </div>
          <p className="text-sm font-black text-white">1.21 GB <span className="text-xs text-slate-500 font-semibold">dari 15 GB</span></p>
          <div className="w-full bg-slate-800 h-2 rounded-full mt-2 overflow-hidden">
            <div className="bg-indigo-500 h-full rounded-full" style={{ width: '8.1%' }}></div>
          </div>
          <div className="flex items-center space-x-1 text-[9px] text-slate-500 mt-2">
            <Info size={11} />
            <span>Folder: /CRM_EduTech_Nusantara_Files</span>
          </div>
        </div>
      </div>

      {/* CORE DMS WORKSPACE */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">

        {/* SIDEBAR FILE SYSTEM CONTROL */}
        <div className="space-y-6 xl:col-span-1">
          
          {/* Virtual Folder navigation list */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider">Direktori Folder</h3>
              <button 
                onClick={() => setShowNewFolderModal(true)}
                className="p-1.5 hover:bg-slate-50 text-indigo-600 rounded-lg transition"
                title="Buat Folder Baru"
              >
                <FolderPlus size={15} />
              </button>
            </div>

            <div className="space-y-1">
              <button
                onClick={() => setActiveFolder('Semua')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-left transition ${
                  activeFolder === 'Semua' 
                    ? 'bg-indigo-50 text-indigo-700 font-extrabold' 
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Folder size={14} className={activeFolder === 'Semua' ? 'text-indigo-600' : 'text-slate-400'} />
                  Semua Berkas
                </span>
                <span className="text-[10px] font-bold text-slate-400 bg-slate-100/50 px-2 py-0.5 rounded-full">
                  {documents.length}
                </span>
              </button>

              {folders.map(folder => {
                const count = documents.filter(d => (d.folder || 'Client Files') === folder).length;
                return (
                  <button
                    key={folder}
                    onClick={() => setActiveFolder(folder)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-left transition ${
                      activeFolder === folder 
                        ? 'bg-indigo-50 text-indigo-700 font-extrabold' 
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="flex items-center gap-2 truncate">
                      <Folder size={14} className={activeFolder === folder ? 'text-indigo-600' : 'text-slate-400'} />
                      {folder}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-100/50 px-2 py-0.5 rounded-full">
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* DYNAMIC AUTOMATED PDF GENERATOR BOX */}
          {role !== 'Client' && (
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
              <div className="border-b pb-2.5">
                <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="text-indigo-600" size={15} /> Dynamic PDF Generator
                </h3>
                <p className="text-[10px] text-slate-400 mt-0.5 leading-normal">
                  Kompilasi berkas PDF instan dengan template profesional otomatis terunggah ke Drive.
                </p>
              </div>

              <form onSubmit={handleAutoGeneratePDF} className="space-y-3.5 text-xs font-semibold">
                {/* Template Selection */}
                <div className="space-y-1">
                  <label className="block text-[10px] text-slate-500 font-bold uppercase">Pilih Template Dokumen</label>
                  <select
                    value={pdfTemplate}
                    onChange={(e) => setPdfTemplate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg"
                  >
                    <option value="Project Contract">Kontrak Kerjasama</option>
                    <option value="Official Invoice">Tagihan Invoice Pembayaran</option>
                    <option value="Certificate of Completion">Sertifikat Kelulusan Program</option>
                    <option value="Meeting Summary">Ringkasan Notulensi Rapat</option>
                  </select>
                </div>

                {/* Target Client */}
                <div className="space-y-1">
                  <label className="block text-[10px] text-slate-500 font-bold uppercase">Client Terkait</label>
                  <select
                    value={pdfTargetClient}
                    onChange={(e) => setPdfTargetClient(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg"
                  >
                    <option value="">-- Pilih Client Nusantara --</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.id})</option>
                    ))}
                  </select>
                </div>

                {/* Custom File Name */}
                <div className="space-y-1">
                  <label className="block text-[10px] text-slate-500 font-bold uppercase">Nama File PDF (Opsional)</label>
                  <input
                    type="text"
                    value={pdfFileName}
                    onChange={(e) => setPdfFileName(e.target.value)}
                    placeholder="kontrak_belajar_agus.pdf"
                    className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isGenerating}
                  className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-800 hover:from-indigo-500 hover:to-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-indigo-600/15"
                >
                  <RefreshCw size={13} className={isGenerating ? 'animate-spin' : ''} />
                  <span>{isGenerating ? 'Mengompilasi PDF...' : 'Compile & Upload PDF'}</span>
                </button>
              </form>
            </div>
          )}

        </div>

        {/* CORE DOCUMENTS DATAGRID AREA */}
        <div className="xl:col-span-3 space-y-6">

          {/* ADVANCED FILTER & SEARCH TOOLBAR */}
          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-3.5 justify-between items-center text-xs font-semibold">
            
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Search size={15} />
              </span>
              <input
                type="text"
                placeholder="Cari nama berkas, nomor id dokumen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 pl-9 pr-4 py-2 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Selector list */}
            <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
              
              {/* Filter Client */}
              <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl">
                <span className="text-[10px] text-slate-500 uppercase font-bold">Client:</span>
                <select
                  value={selectedClientFilter}
                  onChange={(e) => setSelectedClientFilter(e.target.value)}
                  className="bg-transparent text-xs text-slate-700 outline-none cursor-pointer"
                >
                  <option value="Semua">Semua Client</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Sort By Toggle */}
              <div className="flex items-center space-x-1 bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl">
                <span className="text-[10px] text-slate-500 uppercase font-bold">Urutkan:</span>
                <button
                  onClick={() => {
                    if (sortBy === 'name') {
                      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
                    } else {
                      setSortBy('name');
                      setSortOrder('asc');
                    }
                  }}
                  className={`px-1.5 py-0.2 rounded font-bold text-[11px] ${sortBy === 'name' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-600'}`}
                >
                  Nama
                </button>
                <button
                  onClick={() => {
                    if (sortBy === 'created_at') {
                      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
                    } else {
                      setSortBy('created_at');
                      setSortOrder('desc');
                    }
                  }}
                  className={`px-1.5 py-0.2 rounded font-bold text-[11px] ${sortBy === 'created_at' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-600'}`}
                >
                  Tanggal
                </button>
              </div>

              {/* Upload Button */}
              {role !== 'Client' && (
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black rounded-xl shadow transition cursor-pointer"
                >
                  <Upload size={13} />
                  <span>Unggah Berkas</span>
                </button>
              )}

            </div>
          </div>

          {/* DRAG AND DROP INTEGRATION AREA */}
          {role !== 'Client' && (
            <div 
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-6 text-center transition flex flex-col items-center justify-center space-y-2 relative overflow-hidden ${
                dragActive 
                  ? 'border-indigo-500 bg-indigo-50/40 text-indigo-700' 
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
                <Upload size={20} className={dragActive ? 'animate-bounce' : ''} />
              </div>
              <div className="space-y-0.5 text-xs text-slate-600 font-semibold">
                <p className="text-slate-800 font-black">Seret & Jatuhkan berkas di sini untuk mengunggah</p>
                <p className="text-slate-400 text-[11px]">Format: PDF, Word, PNG, XLSX, ZIP (Hingga 15MB)</p>
              </div>
            </div>
          )}

          {/* FILES GRID FRAME */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredDocs.map(doc => {
              const fileExt = doc.name.split('.').pop()?.toUpperCase() || 'PDF';
              const docTypeStr = doc.type || fileExt;
              const docSize = doc.size || '1.8 MB';
              const docFolder = doc.folder || 'Client Files';
              const docAccess = doc.access || 'Public';

              return (
                <div 
                  key={doc.id} 
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      {/* Document Type Badge Icon */}
                      <div className={`p-3 rounded-xl ${
                        docTypeStr === 'PDF' 
                          ? 'bg-rose-50 text-rose-600' 
                          : docTypeStr === 'XLS' || docTypeStr === 'XLSX'
                          ? 'bg-emerald-50 text-emerald-600'
                          : docTypeStr === 'DOC' || docTypeStr === 'DOCX'
                          ? 'bg-blue-50 text-blue-600'
                          : 'bg-indigo-50 text-indigo-600'
                      }`}>
                        <FileText size={20} />
                      </div>

                      {/* Access tag and options */}
                      <div className="flex items-center space-x-1 text-[10px] font-black uppercase">
                        <span className={`px-2 py-0.5 rounded ${
                          docAccess === 'Public' 
                            ? 'bg-teal-50 text-teal-700' 
                            : docAccess === 'Admin Only'
                            ? 'bg-rose-50 text-rose-700'
                            : 'bg-indigo-50 text-indigo-700'
                        }`}>
                          {docAccess}
                        </span>
                      </div>
                    </div>

                    {/* Meta file descriptions */}
                    <div className="space-y-1 text-left">
                      <h4 
                        className="font-extrabold text-slate-800 text-sm truncate cursor-pointer hover:text-indigo-600"
                        title={doc.name}
                        onClick={() => setPreviewDoc(doc)}
                      >
                        {doc.name}
                      </h4>
                      <div className="flex items-center space-x-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        <span>{docTypeStr}</span>
                        <span>•</span>
                        <span>{docSize}</span>
                        <span>•</span>
                        <span className="text-indigo-600 font-black">{docFolder}</span>
                      </div>
                    </div>
                  </div>

                  {/* Uploader, Created, and Options list */}
                  <div className="pt-3.5 border-t border-slate-50 flex justify-between items-center text-xs">
                    <div className="text-left">
                      <p className="text-[10px] text-slate-400">Pengunggah / Tanggal</p>
                      <p className="font-semibold text-slate-700 leading-normal truncate max-w-[120px]">
                        {doc.uploaded_by || 'Sistem'}
                      </p>
                      <p className="text-[9px] text-slate-400">
                        {new Date(doc.created_at).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex items-center space-x-1">
                      {/* Copy Shareable link */}
                      <button
                        onClick={() => handleCopyShareUrl(doc)}
                        className={`p-1.5 rounded-lg transition ${copiedId === doc.id ? 'bg-emerald-50 text-emerald-600' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50'}`}
                        title="Salin Link Google Drive"
                      >
                        {copiedId === doc.id ? <Check size={13} /> : <Copy size={13} />}
                      </button>

                      {/* Rename controls */}
                      {role !== 'Client' && (
                        <button
                          onClick={() => { setRenameDoc(doc); setNewName(doc.name); }}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition"
                          title="Ubah Nama File"
                        >
                          <Edit2 size={13} />
                        </button>
                      )}

                      {/* Previewer trigger */}
                      <button
                        onClick={() => setPreviewDoc(doc)}
                        className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition animate-pulse"
                        title="Pratinjau Dokumen"
                      >
                        <Eye size={13} />
                      </button>

                      {/* Delete file */}
                      {role === 'Super Admin' && onDeleteDocument && (
                        <button
                          onClick={() => {
                            if (confirm(`Apakah Anda yakin ingin menghapus berkas ${doc.name} selamanya?`)) {
                              onDeleteDocument(doc.id);
                            }
                          }}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                          title="Hapus Berkas"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredDocs.length === 0 && (
              <div className="col-span-full bg-white p-12 text-center border border-dashed border-slate-200 rounded-3xl">
                <AlertCircle className="mx-auto text-slate-300 mb-2" size={32} />
                <h4 className="font-bold text-slate-700">Tidak Ada Dokumen Ditemukan</h4>
                <p className="text-xs text-slate-400 mt-1">Gunakan filter, pilih direktori folder lain, atau unggah berkas baru.</p>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* BUILT-IN GOOGLE DRIVE PDF PREVIEWER MODAL */}
      {previewDoc && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl max-w-4xl w-full h-[85vh] overflow-hidden flex flex-col text-left">
            
            {/* Viewer Header */}
            <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center shrink-0">
              <div className="space-y-0.5">
                <h3 className="font-black text-sm text-slate-800 flex items-center gap-2">
                  <FileText className="text-indigo-600 animate-pulse" size={16} /> Drive Document Viewer
                </h3>
                <p className="text-[10px] text-slate-400 font-mono">ID File: {previewDoc.id} | Nama: {previewDoc.name}</p>
              </div>
              
              <div className="flex items-center space-x-2">
                <a
                  href={previewDoc.drive_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 px-3 py-1.5 bg-slate-200 hover:bg-slate-300 rounded-xl text-slate-700 text-[11px] font-bold"
                >
                  <span>Buka di Tab Baru</span>
                  <ExternalLink size={12} />
                </a>
                <button 
                  onClick={() => setPreviewDoc(null)} 
                  className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold"
                >
                  ✕ Tutup
                </button>
              </div>
            </div>

            {/* Simulated Frame Viewer or real doc render */}
            <div className="flex-1 bg-slate-900 relative">
              {previewDoc.drive_url ? (
                <iframe
                  src={previewDoc.drive_url}
                  className="w-full h-full border-0"
                  title="Document Preview"
                  referrerPolicy="no-referrer"
                ></iframe>
              ) : (
                <div className="absolute inset-0 flex flex-col justify-center items-center text-slate-400 text-xs">
                  <AlertCircle size={32} className="mb-2 text-indigo-400" />
                  <p>Dokumen tidak mendukung pratinjau inline.</p>
                  <p className="text-[10px] mt-1 text-slate-500">Silakan klik tombol "Buka di Tab Baru" di atas.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* RENAME METADATA MODAL */}
      {renameDoc && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl max-w-sm w-full p-5 text-left space-y-4">
            <div>
              <h3 className="font-black text-sm text-slate-800">Ubah Nama Berkas</h3>
              <p className="text-[10px] text-slate-400">Ganti penamaan metadata file Google Drive</p>
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] text-slate-500 font-bold uppercase">Nama Berkas Baru *</label>
              <input
                type="text"
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-xs"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t">
              <button
                onClick={() => setRenameDoc(null)}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition"
              >
                Batal
              </button>
              <button
                onClick={handleSaveRename}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE NEW FOLDER MODAL */}
      {showNewFolderModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl max-w-sm w-full p-5 text-left space-y-4">
            <div>
              <h3 className="font-black text-sm text-slate-800 flex items-center gap-1.5">
                <FolderPlus size={16} className="text-indigo-600" /> Buat Direktori Folder Baru
              </h3>
              <p className="text-[10px] text-slate-400">Folder akan ditambahkan langsung ke Google Drive database Anda</p>
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] text-slate-500 font-bold uppercase">Nama Folder *</label>
              <input
                type="text"
                required
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Contoh: Laporan_Akademik"
                className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-xs font-semibold"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t">
              <button
                onClick={() => setShowNewFolderModal(false)}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition"
              >
                Batal
              </button>
              <button
                onClick={handleCreateFolder}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition"
              >
                Buat Folder
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MANUAL UPLOAD FORM MODAL */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl max-w-md w-full overflow-hidden flex flex-col text-left">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-black text-sm text-slate-800">Unggah Berkas Baru ke Drive</h3>
              <button onClick={() => setShowUploadModal(false)} className="text-slate-400 hover:text-slate-700 font-bold text-sm">✕</button>
            </div>

            <form onSubmit={handleManualUpload} className="p-6 space-y-4">
              {/* File Name */}
              <div className="space-y-1">
                <label className="block text-[10px] text-slate-500 font-bold uppercase">Nama Berkas *</label>
                <input
                  type="text"
                  required
                  value={uploadForm.name}
                  onChange={(e) => setUploadForm({ ...uploadForm, name: e.target.value })}
                  placeholder="Contoh: Laporan_Bulanan_CS.xlsx"
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-xs"
                />
              </div>

              {/* Type & Folder */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] text-slate-500 font-bold uppercase">Jenis File *</label>
                  <select
                    value={uploadForm.type}
                    onChange={(e) => setUploadForm({ ...uploadForm, type: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-xs cursor-pointer"
                  >
                    <option value="PDF">PDF Document</option>
                    <option value="XLSX">Excel Spreadsheet</option>
                    <option value="DOCX">Word Document</option>
                    <option value="ZIP">ZIP Archive</option>
                    <option value="PNG">Image Asset (PNG)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] text-slate-500 font-bold uppercase">Direktori Folder *</label>
                  <select
                    value={uploadForm.folder}
                    onChange={(e) => setUploadForm({ ...uploadForm, folder: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-xs cursor-pointer"
                  >
                    {folders.map(f => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Associated Client & Access rights */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] text-slate-500 font-bold uppercase">Hubungkan Client</label>
                  <select
                    value={uploadForm.client_id}
                    onChange={(e) => setUploadForm({ ...uploadForm, client_id: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-xs cursor-pointer"
                  >
                    <option value="">-- Berkas Umum --</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] text-slate-500 font-bold uppercase">Hak Akses *</label>
                  <select
                    value={uploadForm.access}
                    onChange={(e) => setUploadForm({ ...uploadForm, access: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-xs cursor-pointer"
                  >
                    <option value="Public">Public (Semua Tim & Client)</option>
                    <option value="Admin Only">Admin Only (Super Admin & Dev)</option>
                    <option value="Shared">Shared (Admin & Client Terkait)</option>
                  </select>
                </div>
              </div>

              {/* Real URL/Simulated Drive Link input */}
              <div className="space-y-1">
                <label className="block text-[10px] text-slate-500 font-bold uppercase">Tautan Google Drive (Opsional)</label>
                <input
                  type="url"
                  value={uploadForm.drive_url}
                  onChange={(e) => setUploadForm({ ...uploadForm, drive_url: e.target.value })}
                  placeholder="https://docs.google.com/spreadsheets/d/..."
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-xs"
                />
              </div>

              <div className="pt-4 flex justify-end space-x-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition"
                >
                  Simpan & Unggah ke Drive
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
