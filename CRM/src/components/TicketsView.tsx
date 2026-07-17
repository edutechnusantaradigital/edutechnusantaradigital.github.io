/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Plus,
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  Sparkles,
  Loader2,
  Send,
  User,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { Ticket, TicketChat, Client } from '../types';

interface TicketsProps {
  tickets: Ticket[];
  clients: Client[];
  chats: TicketChat[];
  role: string;
  userName: string;
  onAddTicket: (ticketData: any) => Promise<any>;
  onUpdateTicket: (id: string, updatedData: any) => Promise<any>;
  onAddChat: (ticketId: string, chatData: any) => Promise<any>;
  onGenerateSuggestion: (ticket: Ticket) => Promise<string>;
}

export default function TicketsView({
  tickets,
  clients,
  chats,
  role,
  userName,
  onAddTicket,
  onUpdateTicket,
  onAddChat,
  onGenerateSuggestion
}: TicketsProps) {
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(tickets[0] || null);
  const [replyText, setReplyText] = useState('');
  const [loadingSuggestion, setLoadingSuggestion] = useState(false);
  const [ticketChats, setTicketChats] = useState<TicketChat[]>([]);

  // Modal Create states
  const [showAddTicketModal, setShowAddTicketModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newTicketForm, setNewTicketForm] = useState({
    client_id: '',
    title: '',
    category: 'Website',
    priority: 'Medium',
    status: 'Open',
    description: ''
  });

  // Load chat messages when ticket selection changes
  useEffect(() => {
    if (selectedTicket) {
      const filteredChats = chats.filter(c => c.ticket_id === selectedTicket.id);
      setTicketChats(filteredChats);
    } else {
      setTicketChats([]);
    }
  }, [selectedTicket, chats]);

  const getClientName = (clientId: string) => {
    const c = clients.find(cl => cl.id === clientId);
    return c ? c.name : 'Unknown Client';
  };

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !replyText.trim()) return;

    const chatMsg = {
      sender_id: role,
      sender_name: userName,
      sender_role: role,
      message: replyText
    };

    try {
      const saved = await onAddChat(selectedTicket.id, chatMsg);
      if (saved) {
        setTicketChats([...ticketChats, saved]);
        setReplyText('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleResolveTicket = async () => {
    if (!selectedTicket) return;
    const confirmed = window.confirm('Apakah Anda yakin ingin menandai tiket bantuan ini sebagai Selesai (Solved)?');
    if (!confirmed) return;

    await onUpdateTicket(selectedTicket.id, { ...selectedTicket, status: 'Solved' });
    setSelectedTicket({ ...selectedTicket, status: 'Solved' });
  };

  const handleAISuggestion = async () => {
    if (!selectedTicket) return;
    setLoadingSuggestion(true);
    try {
      const suggestion = await onGenerateSuggestion(selectedTicket);
      setReplyText(suggestion);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSuggestion(false);
    }
  };

  const handleAddTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const saved = await onAddTicket(newTicketForm);
      setShowAddTicketModal(false);
      setNewTicketForm({
        client_id: '',
        title: '',
        category: 'Website',
        priority: 'Medium',
        status: 'Open',
        description: ''
      });
      if (saved) setSelectedTicket(saved);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="tickets-view-container">
      {/* 1. Left Support Queue Panel */}
      <div className="lg:col-span-1 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="text-left">
              <h3 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider">Antrean Tiket Support</h3>
              <p className="text-[10px] text-slate-400">Total kendala aktif: {tickets.length}</p>
            </div>
            <button
              id="add-ticket-modal-btn"
              onClick={() => setShowAddTicketModal(true)}
              className="p-1.5 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition"
              title="Buat Tiket Baru"
            >
              <Plus size={16} />
            </button>
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {tickets.map(ticket => (
              <div
                key={ticket.id}
                onClick={() => setSelectedTicket(ticket)}
                className={`p-3 rounded-xl border cursor-pointer transition text-left ${
                  selectedTicket?.id === ticket.id
                    ? 'border-indigo-600 bg-indigo-50/20'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50'
                }`}
              >
                <div className="flex justify-between items-start text-[10px]">
                  <span className="font-bold text-indigo-600">{ticket.id}</span>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                    ticket.priority === 'Urgent' ? 'bg-red-100 text-red-700' :
                    ticket.priority === 'High' ? 'bg-amber-100 text-amber-700' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {ticket.priority}
                  </span>
                </div>
                <h4 className="font-extrabold text-xs text-slate-800 mt-2 truncate">{ticket.title}</h4>
                <p className="text-[10px] text-slate-400 mt-0.5 truncate">{getClientName(ticket.client_id)}</p>
                <div className="mt-3 flex justify-between items-center text-[9px] text-slate-400">
                  <span className="font-semibold">{ticket.category}</span>
                  <span>{ticket.status}</span>
                </div>
              </div>
            ))}

            {tickets.length === 0 && (
              <p className="text-center text-slate-400 py-12 text-xs">Semua tiket teresolusi!</p>
            )}
          </div>
        </div>
      </div>

      {/* 2. Right Live Chat Conversation Thread */}
      <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col h-[580px]" id="tickets-chat-panel">
        {selectedTicket ? (
          <div className="flex flex-col h-full justify-between">
            {/* Conversation top header */}
            <div className="pb-3 border-b border-slate-100 flex justify-between items-center shrink-0">
              <div className="text-left space-y-0.5">
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded">
                    {selectedTicket.id}
                  </span>
                  <span className="text-xs font-black text-slate-800">{selectedTicket.title}</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Pelanggan: <span className="font-bold text-slate-600">{getClientName(selectedTicket.client_id)}</span> • {selectedTicket.category}
                </p>
              </div>

              {selectedTicket.status !== 'Solved' && (
                <button
                  id="ticket-resolve-btn"
                  onClick={handleResolveTicket}
                  className="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-100 text-xs font-semibold rounded-lg transition"
                >
                  Selesaikan Tiket
                </button>
              )}
            </div>

            {/* Conversation Chat Bubbles Log */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1 text-xs text-slate-700 scrollbar-thin">
              {/* Initial ticket description as system card */}
              <div className="p-3 bg-indigo-50/40 border border-indigo-50 rounded-xl text-left">
                <p className="font-bold text-indigo-900 flex items-center mb-1">
                  <HelpCircle size={14} className="mr-1.5" /> Deskripsi Keluhan Awal:
                </p>
                <p className="text-indigo-950 font-medium leading-relaxed">{selectedTicket.description}</p>
              </div>

              {/* Chat thread list */}
              {ticketChats.map(chat => {
                const isMe = chat.sender_role === role;
                return (
                  <div key={chat.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] p-3 rounded-2xl text-left shadow-sm ${
                      isMe
                        ? 'bg-slate-900 text-white rounded-tr-none'
                        : 'bg-slate-100 text-slate-800 rounded-tl-none'
                    }`}>
                      <p className="text-[9px] opacity-75 font-bold mb-1">{chat.sender_name} ({chat.sender_role})</p>
                      <p className="font-medium leading-relaxed">{chat.message}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Conversation Send controls with AI assistant */}
            <div className="pt-3 border-t border-slate-100 shrink-0 space-y-2">
              {/* AI helper button */}
              <div className="flex justify-start">
                <button
                  id="ticket-ai-suggestion-btn"
                  onClick={handleAISuggestion}
                  disabled={loadingSuggestion}
                  className="flex items-center space-x-1 px-3 py-1 bg-indigo-50 hover:bg-indigo-100 disabled:bg-indigo-100 text-indigo-700 text-[10px] font-bold rounded-lg border border-indigo-100 transition"
                >
                  {loadingSuggestion ? (
                    <>
                      <Loader2 size={12} className="animate-spin mr-1" />
                      <span>Menyusun saran balasan...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={12} className="text-indigo-600 animate-pulse" />
                      <span>Dapatkan Saran Balasan AI</span>
                    </>
                  )}
                </button>
              </div>

              <form onSubmit={handleSendChat} className="flex gap-2">
                <input
                  id="ticket-reply-input"
                  type="text"
                  placeholder="Ketik tanggapan / solusi kendala..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="flex-1 bg-slate-50 border border-slate-200 px-3 py-2.5 rounded-lg text-xs"
                />
                <button
                  type="submit"
                  className="px-4 bg-slate-900 hover:bg-slate-950 text-white rounded-lg flex items-center justify-center transition"
                >
                  <Send size={14} />
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="py-24 text-center text-slate-400 text-xs">
            Pilih tiket bantuan untuk memulai percakapan solusi realtime.
          </div>
        )}
      </div>

      {/* --- ADD TICKET MODAL --- */}
      {showAddTicketModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl max-w-md w-full overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-extrabold text-sm text-slate-800 text-left">Buat Tiket Bantuan</h3>
              <button onClick={() => setShowAddTicketModal(false)} className="text-slate-400 hover:text-slate-700 font-bold">✕</button>
            </div>
            <form onSubmit={handleAddTicketSubmit} className="p-6 space-y-4 text-left">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Pilih Client *</label>
                <select
                  required
                  value={newTicketForm.client_id}
                  onChange={(e) => setNewTicketForm({ ...newTicketForm, client_id: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-xs"
                >
                  <option value="">-- Pilih Client --</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.id})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Judul Kendala *</label>
                <input
                  type="text"
                  required
                  value={newTicketForm.title}
                  onChange={(e) => setNewTicketForm({ ...newTicketForm, title: e.target.value })}
                  placeholder="Contoh: Migrasi Domain cPanel atau Bug SIAKAD"
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Kategori Kendala *</label>
                  <select
                    value={newTicketForm.category}
                    onChange={(e) => setNewTicketForm({ ...newTicketForm, category: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-xs"
                  >
                    <option value="Website">Website</option>
                    <option value="OJS">OJS Portal</option>
                    <option value="Hosting">Hosting</option>
                    <option value="Domain">Domain</option>
                    <option value="Server">Server</option>
                    <option value="Bug">Bug Report</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Prioritas *</label>
                  <select
                    value={newTicketForm.priority}
                    onChange={(e: any) => setNewTicketForm({ ...newTicketForm, priority: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-xs"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Penjelasan Detail Kendala *</label>
                <textarea
                  required
                  value={newTicketForm.description}
                  onChange={(e) => setNewTicketForm({ ...newTicketForm, description: e.target.value })}
                  placeholder="Jelaskan secara rinci kendala teknis yang dihadapi client..."
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-xs h-24"
                />
              </div>
              <div className="pt-4 flex justify-end space-x-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddTicketModal(false)}
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
                  <span>Daftarkan Tiket</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
