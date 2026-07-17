/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Plus,
  TrendingUp,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  DollarSign,
  Briefcase,
  Loader2,
  ArrowRight,
  ArrowRightLeft
} from 'lucide-react';
import { Order, Client } from '../types';

interface LeadTrackingProps {
  orders: Order[];
  clients: Client[];
  onAddOrder: (orderData: any) => Promise<any>;
  onUpdateOrder: (id: string, updatedData: any) => Promise<any>;
}

export default function LeadTrackingView({
  orders,
  clients,
  onAddOrder,
  onUpdateOrder
}: LeadTrackingProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [funnelStage, setFunnelStage] = useState<string>('All');

  // Modal Create Lead states
  const [showAddLeadModal, setShowAddLeadModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [leadForm, setLeadForm] = useState({
    client_id: '',
    service_category: 'Website',
    service_package: 'Professional Web Dev',
    price: 15000000,
    status: 'Lead'
  });

  const funnelStages = ['Lead', 'Pitching', 'Negotiation', 'Closed Won', 'Closed Lost'];

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'Lead': return 'bg-sky-50 text-sky-700 border-sky-100';
      case 'Pitching': return 'bg-purple-50 text-purple-700 border-purple-100';
      case 'Negotiation': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'Closed Won': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'Closed Lost': return 'bg-rose-50 text-rose-700 border-rose-100';
      default: return 'bg-slate-50 text-slate-700 border-slate-100';
    }
  };

  const getClientName = (clientId: string) => {
    const c = clients.find(cl => cl.id === clientId);
    return c ? c.name : 'Unknown Client';
  };

  const handleMoveFunnel = async (order: Order, nextStage: string) => {
    await onUpdateOrder(order.id, { ...order, status: nextStage });
  };

  const filteredOrders = orders.filter(o => {
    const matchesStage = funnelStage === 'All' || o.status === funnelStage;
    const clientName = getClientName(o.client_id).toLowerCase();
    const matchesSearch =
      clientName.includes(searchQuery.toLowerCase()) ||
      o.service_package.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.service_category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStage && matchesSearch;
  });

  const formatIDR = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(num);
  };

  const handleAddLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const submitPayload = {
        client_id: leadForm.client_id,
        service_category: leadForm.service_category,
        service_package: leadForm.service_package,
        amount: leadForm.price,
        status: leadForm.status,
        notes: ''
      };
      await onAddOrder(submitPayload);
      setShowAddLeadModal(false);
      setLeadForm({
        client_id: '',
        service_category: 'Website',
        service_package: 'Professional Web Dev',
        price: 15000000,
        status: 'Lead'
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Compute total funnel pipeline values
  const totalPipelineVal = filteredOrders.reduce((sum, o) => sum + Number(o.amount || 0), 0);

  return (
    <div className="space-y-6" id="leads-view-main">
      {/* Funnel header quick dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm text-left">
        <div className="md:col-span-2 space-y-1">
          <h2 className="text-sm font-bold text-slate-800">Pipeline Penjualan & Pelacakan Prospek</h2>
          <p className="text-xs text-slate-400">
            Kelola data penawaran (leads), atur status pitching, negosiasi harga, hingga Closed Won.
          </p>
        </div>
        <div className="bg-slate-50 p-4 border border-slate-100 rounded-xl">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nilai Kumulatif Pipeline</p>
          <p className="text-lg font-black text-slate-800 mt-1">{formatIDR(totalPipelineVal)}</p>
        </div>
      </div>

      {/* Control filter panel and list view */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex space-x-1 shrink-0 bg-slate-50 p-1 rounded-lg border border-slate-100">
            <button
              onClick={() => setFunnelStage('All')}
              className={`px-3 py-1.5 text-[11px] font-semibold rounded-md transition ${
                funnelStage === 'All' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400'
              }`}
            >
              Semua Stage
            </button>
            {funnelStages.map(stage => (
              <button
                key={stage}
                onClick={() => setFunnelStage(stage)}
                className={`px-3 py-1.5 text-[11px] font-semibold rounded-md transition ${
                  funnelStage === stage ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400'
                }`}
              >
                {stage}
              </button>
            ))}
          </div>

          <button
            id="add-lead-modal-btn"
            onClick={() => setShowAddLeadModal(true)}
            className="flex items-center space-x-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition"
          >
            <Plus size={16} />
            <span>Pendaftaran Leads</span>
          </button>
        </div>

        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
          <input
            id="leads-search-input"
            type="text"
            placeholder="Cari nama client prospek atau layanan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 pl-9 pr-4 py-2 rounded-lg text-xs placeholder-slate-400 focus:outline-none"
          />
        </div>

        {/* Grid listing */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="leads-registry-grid">
          {filteredOrders.map(order => (
            <div key={order.id} className="p-4 bg-slate-50 border border-slate-100 rounded-xl text-left flex flex-col justify-between space-y-4">
              <div>
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-bold text-slate-400">{order.id}</span>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 border rounded-full ${getStageColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>
                <h4 className="font-extrabold text-xs text-slate-800 mt-3 truncate">{getClientName(order.client_id)}</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">{order.service_package}</p>
                <div className="mt-3 inline-flex items-center space-x-1 bg-indigo-50 px-2 py-0.5 rounded text-[10px] font-bold text-indigo-700">
                  <span>{order.service_category}</span>
                </div>
              </div>

              {/* Deal pricing and move panel */}
              <div className="pt-3 border-t border-slate-150/50 flex justify-between items-center">
                <div className="flex items-center space-x-1">
                  <DollarSign size={14} className="text-indigo-600" />
                  <span className="font-extrabold text-slate-800 text-xs">{formatIDR(order.amount || 0)}</span>
                </div>

                <div className="flex items-center space-x-1.5 text-[10px] font-bold">
                  <ArrowRightLeft size={12} className="text-slate-400" />
                  <select
                    id={`move-lead-stage-${order.id}`}
                    value={order.status}
                    onChange={(e) => handleMoveFunnel(order, e.target.value)}
                    className="bg-white border border-slate-200 rounded p-1 outline-none text-[10px] font-semibold cursor-pointer"
                  >
                    {funnelStages.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ))}

          {filteredOrders.length === 0 && (
            <div className="col-span-3 py-16 text-center text-slate-400 text-xs">
              Tidak ada prospek lead di funnel stage ini.
            </div>
          )}
        </div>
      </div>

      {/* --- ADD NEW LEAD MODAL --- */}
      {showAddLeadModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl max-w-md w-full overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-extrabold text-sm text-slate-800 text-left">Pendaftaran Leads Baru</h3>
              <button onClick={() => setShowAddLeadModal(false)} className="text-slate-400 hover:text-slate-700 font-bold">✕</button>
            </div>
            <form onSubmit={handleAddLeadSubmit} className="p-6 space-y-4 text-left">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Pilih Calon Client *</label>
                <select
                  required
                  value={leadForm.client_id}
                  onChange={(e) => setLeadForm({ ...leadForm, client_id: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-xs"
                >
                  <option value="">-- Pilih Calon Client --</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Kategori Layanan *</label>
                  <select
                    value={leadForm.service_category}
                    onChange={(e) => setLeadForm({ ...leadForm, service_category: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-xs"
                  >
                    <option value="Website">Website</option>
                    <option value="EduTech">EduTech</option>
                    <option value="Hosting">Cloud/Hosting</option>
                    <option value="Enterprise">Enterprise</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Estimasi Deal Deal size (IDR) *</label>
                  <input
                    type="number"
                    required
                    value={leadForm.price}
                    onChange={(e) => setLeadForm({ ...leadForm, price: Number(e.target.value) })}
                    placeholder="Contoh: 15000000"
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-xs"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Paket Layanan yang Ditawarkan *</label>
                <input
                  type="text"
                  required
                  value={leadForm.service_package}
                  onChange={(e) => setLeadForm({ ...leadForm, service_package: e.target.value })}
                  placeholder="Contoh: Custom Enterprise App"
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-xs"
                />
              </div>
              <div className="pt-4 flex justify-end space-x-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddLeadModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition flex items-center space-x-1"
                >
                  {isSubmitting && <Loader2 size={12} className="animate-spin" />}
                  <span>Daftarkan Lead</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
