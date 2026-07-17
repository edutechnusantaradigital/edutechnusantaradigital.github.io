/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Plus,
  Users,
  Search,
  CheckCircle2,
  AlertOctagon,
  XCircle,
  FileText,
  Briefcase,
  MessageSquare,
  Smartphone,
  Mail,
  MapPin,
  Globe,
  Loader2,
  Trash2,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { Client, Order, Project, Ticket } from '../types';

interface ClientsProps {
  clients: Client[];
  orders: Order[];
  projects: Project[];
  tickets: Ticket[];
  onAddClient: (clientData: any) => Promise<any>;
  onUpdateClient: (id: string, updatedData: any) => Promise<any>;
}

export default function ClientsView({
  clients,
  orders,
  projects,
  tickets,
  onAddClient,
  onUpdateClient
}: ClientsProps) {
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [profileTab, setProfileTab] = useState<'orders' | 'projects' | 'tickets' | 'documents'>('orders');

  // Modal create states
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    whatsapp: '',
    address: '',
    pic: '',
    website: '',
    npwp: '',
    nik: '',
    status: 'Active'
  });

  const filteredClients = clients.filter(c => {
    const matchesStatus = filterStatus === 'All' || c.status === filterStatus;
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.pic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.whatsapp.includes(searchQuery);
    return matchesStatus && matchesSearch;
  });

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onAddClient(formData);
      setShowAddModal(false);
      setFormData({
        name: '',
        email: '',
        whatsapp: '',
        address: '',
        pic: '',
        website: '',
        npwp: '',
        nik: '',
        status: 'Active'
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (client: Client) => {
    const statuses: ('Active' | 'Inactive' | 'Blacklist')[] = ['Active', 'Inactive', 'Blacklist'];
    const nextIdx = (statuses.indexOf(client.status) + 1) % statuses.length;
    const nextStatus = statuses[nextIdx];
    
    await onUpdateClient(client.id, { ...client, status: nextStatus });
    if (selectedClient && selectedClient.id === client.id) {
      setSelectedClient({ ...selectedClient, status: nextStatus });
    }
  };

  // Get relational child records for selected client
  const clientOrders = orders.filter(o => o.client_id === selectedClient?.id);
  const clientProjects = projects.filter(p => {
    const orderIdsForClient = clientOrders.map(o => o.id);
    return orderIdsForClient.includes(p.order_id);
  });
  const clientTickets = tickets.filter(t => t.client_id === selectedClient?.id);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="clients-view-container">
      {/* 1. Left List / Grid Filter Panel (Col span 2) */}
      <div className="lg:col-span-2 space-y-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-left">
            <h2 className="text-sm font-bold text-slate-800">Direktori Database Client</h2>
            <p className="text-xs text-slate-400">Total terdaftar: {clients.length} akun EduTech</p>
          </div>
          <button
            id="add-client-modal-btn"
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition shadow-sm self-start"
          >
            <Plus size={16} />
            <span>Tambah Client</span>
          </button>
        </div>

        {/* Filter and Search */}
        <div className="flex flex-col sm:flex-row gap-2">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
            <input
              id="clients-search"
              type="text"
              placeholder="Cari nama, pic, email, WA..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 pl-9 pr-4 py-2 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          {/* Status buttons */}
          <div className="flex space-x-1 shrink-0 bg-slate-50 p-1 rounded-lg border border-slate-100">
            {['All', 'Active', 'Inactive', 'Blacklist'].map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1 text-[11px] font-semibold rounded-md transition ${
                  filterStatus === status
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Clients Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs" id="clients-table">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-semibold bg-slate-50">
                <th className="p-3">Client</th>
                <th className="p-3">PIC / WhatsApp</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredClients.map(client => (
                <tr
                  key={client.id}
                  onClick={() => setSelectedClient(client)}
                  className={`hover:bg-slate-50/50 cursor-pointer transition ${
                    selectedClient?.id === client.id ? 'bg-indigo-50/30' : ''
                  }`}
                >
                  <td className="p-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold shrink-0">
                        {client.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-slate-800 truncate max-w-[150px]">{client.name}</p>
                        <p className="text-[10px] text-slate-400 truncate max-w-[150px]">{client.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 text-left">
                    <p className="font-semibold text-slate-700">{client.pic}</p>
                    <p className="text-[10px] text-slate-400">{client.whatsapp}</p>
                  </td>
                  <td className="p-3 text-left">
                    <button
                      id={`toggle-status-${client.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleStatus(client);
                      }}
                      className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        client.status === 'Active' ? 'bg-emerald-50 text-emerald-700' :
                        client.status === 'Inactive' ? 'bg-slate-100 text-slate-500' :
                        'bg-red-50 text-red-700'
                      }`}
                      title="Klik untuk mengubah status"
                    >
                      {client.status === 'Active' && <CheckCircle2 size={10} />}
                      {client.status === 'Inactive' && <AlertOctagon size={10} />}
                      {client.status === 'Blacklist' && <XCircle size={10} />}
                      <span>{client.status}</span>
                    </button>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      id={`view-detail-${client.id}`}
                      className="p-1 text-slate-400 hover:text-indigo-600 rounded transition"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </td>
                </tr>
              ))}

              {filteredClients.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-400">
                    Tidak ada client ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. Right Profile Folder Detail Tabbed Panel */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
        {selectedClient ? (
          <div className="space-y-5">
            {/* Folder top Header */}
            <div className="text-center pb-4 border-b border-slate-100">
              <div className="w-16 h-16 rounded-full bg-slate-100 text-indigo-700 font-black text-xl flex items-center justify-center mx-auto border-2 border-indigo-100 shadow-sm">
                {selectedClient.name.substring(0, 2).toUpperCase()}
              </div>
              <h3 className="font-extrabold text-sm text-slate-800 mt-3">{selectedClient.name}</h3>
              <p className="text-[10px] text-slate-400 font-semibold">{selectedClient.id}</p>

              <div className="flex justify-center space-x-3 mt-4 text-xs text-slate-500">
                <a href={`mailto:${selectedClient.email}`} className="p-2 bg-slate-50 hover:bg-slate-100 hover:text-slate-800 rounded-full transition" title="Kirim Email">
                  <Mail size={14} />
                </a>
                <a href={`https://wa.me/${selectedClient.whatsapp}`} target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-50 hover:bg-slate-100 hover:text-slate-800 rounded-full transition" title="WhatsApp PIC">
                  <Smartphone size={14} />
                </a>
                {selectedClient.website && (
                  <a href={selectedClient.website} target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-50 hover:bg-slate-100 hover:text-slate-800 rounded-full transition" title="Website Portal">
                    <Globe size={14} />
                  </a>
                )}
              </div>
            </div>

            {/* Parameter specifications */}
            <div className="space-y-2 text-xs text-left pb-4 border-b border-slate-100">
              <p className="text-slate-600 flex items-center"><MapPin size={12} className="mr-2 text-slate-400 shrink-0" /> {selectedClient.address || '-'}</p>
              <p className="text-slate-600 flex items-center"><Smartphone size={12} className="mr-2 text-slate-400 shrink-0" /> PIC: {selectedClient.pic}</p>
              <p className="text-slate-400 font-semibold mt-2 uppercase text-[9px] tracking-wider">Legalitas</p>
              <p className="text-slate-600">NPWP: {selectedClient.npwp || '-'}</p>
              <p className="text-slate-600">NIK: {selectedClient.nik || '-'}</p>
            </div>

            {/* Folder tabs selectors */}
            <div className="flex border-b border-slate-100 pb-1">
              {[
                { id: 'orders', label: 'Order', icon: FileText },
                { id: 'projects', label: 'Project', icon: Briefcase },
                { id: 'tickets', label: 'Tiket', icon: MessageSquare }
              ].map(tab => {
                const Icon = tab.icon;
                const isTabActive = profileTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setProfileTab(tab.id as any)}
                    className={`flex-1 flex items-center justify-center space-x-1 pb-2 text-[11px] font-bold border-b-2 transition ${
                      isTabActive
                        ? 'border-indigo-600 text-indigo-600'
                        : 'border-transparent text-slate-400 hover:text-slate-700'
                    }`}
                  >
                    <Icon size={12} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Tab view outcomes */}
            <div className="min-h-48 text-left text-xs max-h-60 overflow-y-auto">
              {profileTab === 'orders' && (
                <div className="space-y-2">
                  {clientOrders.map(order => (
                    <div key={order.id} className="p-2.5 bg-slate-50 rounded-xl flex justify-between items-center">
                      <div>
                        <p className="font-bold text-slate-800">{order.service_package}</p>
                        <p className="text-[10px] text-slate-400">{order.id} • {order.service_category}</p>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                        {order.status}
                      </span>
                    </div>
                  ))}
                  {clientOrders.length === 0 && (
                    <p className="text-center text-slate-400 py-12">Belum ada pemesanan.</p>
                  )}
                </div>
              )}

              {profileTab === 'projects' && (
                <div className="space-y-2">
                  {clientProjects.map(project => (
                    <div key={project.id} className="p-2.5 bg-slate-50 rounded-xl space-y-1">
                      <div className="flex justify-between items-center">
                        <p className="font-bold text-slate-800 truncate max-w-[130px]">{project.name}</p>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">
                          {project.status}
                        </span>
                      </div>
                      {/* Progress bar */}
                      <div className="flex items-center space-x-2 pt-1">
                        <div className="flex-1 bg-slate-200 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-indigo-600 h-full" style={{ width: `${project.progress}%` }}></div>
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 shrink-0">{project.progress}%</span>
                      </div>
                    </div>
                  ))}
                  {clientProjects.length === 0 && (
                    <p className="text-center text-slate-400 py-12">Belum ada project aktif.</p>
                  )}
                </div>
              )}

              {profileTab === 'tickets' && (
                <div className="space-y-2">
                  {clientTickets.map(ticket => (
                    <div key={ticket.id} className="p-2.5 bg-slate-50 rounded-xl flex justify-between items-center">
                      <div className="truncate max-w-[160px]">
                        <p className="font-bold text-slate-800 truncate">{ticket.title}</p>
                        <p className="text-[10px] text-slate-400">{ticket.id} • {ticket.category}</p>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        ticket.status === 'Open' ? 'bg-rose-50 text-rose-700' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {ticket.status}
                      </span>
                    </div>
                  ))}
                  {clientTickets.length === 0 && (
                    <p className="text-center text-slate-400 py-12">Tidak ada tiket support aktif.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="py-24 text-center text-slate-400 text-xs">
            <Users className="mx-auto text-slate-200 mb-4" size={48} />
            Pilih client dari direktori sebelah kiri untuk melihat rekap detail, history order, status project, dan dokumen legalitas.
          </div>
        )}
      </div>

      {/* --- ADD NEW CLIENT MODAL --- */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl max-w-lg w-full overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-extrabold text-sm text-slate-800 text-left">Tambah Client Baru</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700 font-bold"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleAddSubmit} className="p-6 space-y-4 text-left overflow-y-auto max-h-[75vh]">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Nama Instansi / Perusahaan *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Contoh: Universitas Nusantara Malang"
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Nama PIC *</label>
                  <input
                    type="text"
                    required
                    value={formData.pic}
                    onChange={(e) => setFormData({ ...formData, pic: e.target.value })}
                    placeholder="Contoh: Budi Susanto, S.Kom."
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Nomor WhatsApp PIC *</label>
                  <input
                    type="tel"
                    required
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    placeholder="Contoh: 08123456789"
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Alamat Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="pic@unm.ac.id"
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Website (Opsional)</label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="https://unm.ac.id"
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-xs"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Alamat Kantor Lengkap</label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Masukkan alamat lengkap instansi..."
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-xs h-16"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">NPWP Instansi (Opsional)</label>
                  <input
                    type="text"
                    value={formData.npwp}
                    onChange={(e) => setFormData({ ...formData, npwp: e.target.value })}
                    placeholder="00.000.000.0-000.000"
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">NIK PIC (Opsional)</label>
                  <input
                    type="text"
                    value={formData.nik}
                    onChange={(e) => setFormData({ ...formData, nik: e.target.value })}
                    placeholder="3500000000000000"
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-xs"
                  />
                </div>
              </div>
              <div className="pt-4 flex justify-end space-x-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-xs font-semibold rounded-lg transition flex items-center space-x-1"
                >
                  {isSubmitting && <Loader2 size={12} className="animate-spin" />}
                  <span>Simpan Client</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
