import React, { useState, useEffect } from 'react';
import {
  Layers,
  Search,
  Plus,
  Edit2,
  Trash2,
  X,
  Clock,
  Briefcase,
  User,
  ShieldCheck,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Order, Client, Service, User as UserType } from '../types/crm';
import { CRM_API } from '../services/api';
import { getStatusColor, formatDate } from '../utils';
import Swal from 'sweetalert2';

export default function OrdersManager() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [staff, setStaff] = useState<UserType[]>([]);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua');
  const [isLoading, setIsLoading] = useState(false);

  // Form states
  const [showFormModal, setShowFormModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Order>>({
    clientId: '',
    serviceId: '',
    picId: '',
    deadline: '',
    priority: 'Sedang',
    status: 'Menunggu',
    notes: ''
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const ordersData = await CRM_API.getOrders();
      setOrders(ordersData);

      const clientsData = await CRM_API.getClients();
      setClients(clientsData.filter(c => c.status === 'Aktif'));

      const servicesData = await CRM_API.getServices();
      setServices(servicesData.filter(s => s.status === 'Aktif'));

      const usersData = await CRM_API.getUsers();
      setStaff(usersData.filter(u => u.role !== 'CLIENT' && u.status === 'Aktif'));
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
                          o.clientName.toLowerCase().includes(search.toLowerCase()) ||
                          o.serviceName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'Semua' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDelete = async (id: string, orderNo: string) => {
    Swal.fire({
      title: 'Hapus Order?',
      text: `Apakah Anda yakin ingin menghapus tiket order ${orderNo}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#64748B',
      confirmButtonText: 'Hapus Tiket'
    }).then(async (result) => {
      if (result.isConfirmed) {
        await CRM_API.deleteOrder(id);
        loadData();
        Swal.fire('Terhapus', 'Tiket order berhasil dihapus dari database.', 'success');
      }
    });
  };

  const handleOpenForm = (order?: Order) => {
    if (order) {
      setIsEditing(true);
      setFormData(order);
    } else {
      setIsEditing(false);
      setFormData({
        clientId: clients[0]?.id || '',
        serviceId: services[0]?.id || '',
        picId: staff[0]?.id || '',
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        priority: 'Sedang',
        status: 'Menunggu',
        notes: ''
      });
    }
    setShowFormModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clientId || !formData.serviceId || !formData.picId || !formData.deadline) {
      Swal.fire('Formulir Belum Selesai', 'Harap isi seluruh field dropdown dan tanggal deadline.', 'warning');
      return;
    }

    await CRM_API.saveOrder(formData as Order);
    setShowFormModal(false);
    loadData();

    Swal.fire({
      icon: 'success',
      title: 'Tiket Order Tersimpan',
      text: isEditing
        ? 'Data tiket project berhasil diupdate.'
        : 'Order baru tercatat! Invoice digital & Papan progress otomatis terbit.',
      confirmButtonColor: '#2563EB'
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 p-4 md:p-6 rounded-2xl border border-slate-100 dark:border-slate-700/60 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-xl">
            <Layers size={20} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">Daftar Order & Kontrak Pekerjaan</h3>
            <p className="text-xs text-slate-400">Total order tercatat: {orders.length} transaksi</p>
          </div>
        </div>

        <button
          onClick={() => handleOpenForm()}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition shadow-md shadow-blue-500/10"
        >
          <Plus size={14} />
          <span>Buat Tiket Order Baru</span>
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
            placeholder="Cari berdasarkan No. Order, nama client, atau layanan..."
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 whitespace-nowrap font-medium">Status Pekerjaan:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 rounded-xl focus:outline-none text-slate-800 dark:text-white"
          >
            <option value="Semua">Semua Pekerjaan</option>
            <option value="Menunggu">Menunggu</option>
            <option value="Diproses">Diproses</option>
            <option value="Revisi">Revisi</option>
            <option value="Selesai">Selesai</option>
            <option value="Dibatalkan">Dibatalkan</option>
          </select>
        </div>
      </div>

      {/* Database list layout */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/60 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-20 text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-xs text-slate-400">Sinkronisasi transaksi...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-20 text-center">
            <p className="text-xs text-slate-400 italic">Belum ada transaksi pengerjaan terdaftar.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="p-4">No. Order / Tgl</th>
                  <th className="p-4">Klien & Instansi</th>
                  <th className="p-4">Paket Layanan</th>
                  <th className="p-4">PIC / Deadline</th>
                  <th className="p-4 text-center">Prioritas / Status</th>
                  <th className="p-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50 text-xs">
                {filteredOrders.map((order) => {
                  const badge = getStatusColor(order.status);
                  const prioBadge = getStatusColor(order.priority);
                  return (
                    <tr key={order.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-700/10 transition">
                      <td className="p-4 whitespace-nowrap">
                        <span className="font-bold text-slate-800 dark:text-white block font-mono">{order.orderNumber}</span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">{formatDate(order.date)}</span>
                      </td>
                      <td className="p-4 font-semibold text-slate-700 dark:text-slate-300">
                        {order.clientName}
                      </td>
                      <td className="p-4 text-slate-600 dark:text-slate-300 font-medium">
                        {order.serviceName}
                      </td>
                      <td className="p-4 space-y-0.5 whitespace-nowrap">
                        <span className="block font-medium text-slate-700 dark:text-slate-300">👨‍💻 {order.picName}</span>
                        <span className="block text-[10px] font-bold text-rose-500">📅 DL: {formatDate(order.deadline)}</span>
                      </td>
                      <td className="p-4 text-center space-y-1.5 whitespace-nowrap">
                        <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold uppercase block w-16 mx-auto ${prioBadge.bg} ${prioBadge.text}`}>
                          {order.priority}
                        </span>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold w-20 mx-auto ${badge.bg} ${badge.text}`}>
                          <span className={`w-1 h-1 rounded-full ${badge.dot}`}></span>
                          {order.status}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-1 whitespace-nowrap">
                        <button
                          onClick={() => handleOpenForm(order)}
                          className="p-1.5 rounded-lg border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-400 hover:text-blue-600 hover:border-blue-100 transition inline-block"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => handleDelete(order.id, order.orderNumber)}
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

      {/* Form Modal Order */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200/50 dark:border-slate-700/50 space-y-5 animate-fade-in">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-700">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                {isEditing ? 'Perbarui Tiket Pekerjaan' : 'Buat Tiket Transaksi Baru'}
              </h3>
              <button onClick={() => setShowFormModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Pilih Client Registrasi *</label>
                  <select
                    value={formData.clientId || ''}
                    onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 rounded-xl focus:outline-none"
                  >
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.company})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Pilih Paket Jasa *</label>
                  <select
                    value={formData.serviceId || ''}
                    onChange={(e) => setFormData({ ...formData, serviceId: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 rounded-xl focus:outline-none"
                  >
                    {services.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Pilih Staff PIC Pekerjaan *</label>
                  <select
                    value={formData.picId || ''}
                    onChange={(e) => setFormData({ ...formData, picId: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 rounded-xl focus:outline-none"
                  >
                    {staff.map(u => (
                      <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Batas Akhir (Deadline) *</label>
                  <input
                    type="date"
                    required
                    value={formData.deadline || ''}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 rounded-xl focus:outline-none text-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Skala Prioritas</label>
                  <select
                    value={formData.priority || 'Sedang'}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                    className="mt-1 block w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 rounded-xl focus:outline-none"
                  >
                    <option value="Rendah">Rendah</option>
                    <option value="Sedang">Sedang</option>
                    <option value="Tinggi">Tinggi</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Status Progress</label>
                  <select
                    value={formData.status || 'Menunggu'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="mt-1 block w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 rounded-xl focus:outline-none"
                  >
                    <option value="Menunggu">Menunggu</option>
                    <option value="Diproses">Diproses</option>
                    <option value="Revisi">Revisi</option>
                    <option value="Selesai">Selesai</option>
                    <option value="Dibatalkan">Dibatalkan</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase">Catatan Klien / Kebutuhan Kustom</label>
                <textarea
                  rows={2}
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 rounded-xl focus:outline-none"
                  placeholder="Isikan catatan fungsional yang diminta oleh klien..."
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition"
              >
                Simpan Transaksi Order
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
