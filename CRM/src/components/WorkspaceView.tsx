/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Mail,
  Calendar,
  Plus,
  Inbox,
  Send,
  Loader2,
  Trash2,
  ExternalLink,
  ChevronRight,
  Clock,
  Sparkles,
  Paperclip
} from 'lucide-react';

interface WorkspaceProps {
  gmails: any[];
  calendarEvents: any[];
  onSendEmail: (emailData: any) => Promise<any>;
  onAddCalendarEvent: (eventData: any) => Promise<any>;
  loadingGmail: boolean;
  loadingCalendar: boolean;
}

export default function WorkspaceView({
  gmails,
  calendarEvents,
  onSendEmail,
  onAddCalendarEvent,
  loadingGmail,
  loadingCalendar
}: WorkspaceProps) {
  const [activeSubTab, setActiveSubTab] = useState<'gmail' | 'calendar'>('gmail');
  const [selectedEmail, setSelectedEmail] = useState<any | null>(null);

  // Email Compose states
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [composeForm, setComposeForm] = useState({
    to: '',
    subject: '',
    body: ''
  });

  // Calendar Event states
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [isSubmittingEvent, setIsSubmittingEvent] = useState(false);
  const [eventForm, setEventForm] = useState({
    summary: '',
    description: '',
    start: '',
    end: ''
  });

  const handleComposeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    try {
      await onSendEmail(composeForm);
      setShowComposeModal(false);
      setComposeForm({ to: '', subject: '', body: '' });
      alert('Email berhasil dikirim via integrasi Gmail Applet!');
    } catch (err) {
      console.error(err);
      alert('Gagal mengirim email. Silakan verifikasi koneksi Google Anda.');
    } finally {
      setIsSending(false);
    }
  };

  const handleAddEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingEvent(true);
    try {
      await onAddCalendarEvent(eventForm);
      setShowAddEventModal(false);
      setEventForm({ summary: '', description: '', start: '', end: '' });
      alert('Kegiatan berhasil dijadwalkan langsung pada Google Calendar Anda!');
    } catch (err) {
      console.error(err);
      alert('Gagal menjadwalkan kegiatan. Verifikasi permission.');
    } finally {
      setIsSubmittingEvent(false);
    }
  };

  return (
    <div className="space-y-6" id="workspace-view-main">
      {/* Sub-tab selection */}
      <div className="flex space-x-1 bg-slate-100 p-1 rounded-xl w-64 border border-slate-200">
        <button
          onClick={() => setActiveSubTab('gmail')}
          className={`flex-1 flex items-center justify-center space-x-1.5 py-2 text-xs font-bold rounded-lg transition ${
            activeSubTab === 'gmail'
              ? 'bg-white text-slate-800 shadow-sm'
              : 'text-slate-400 hover:text-slate-700'
          }`}
        >
          <Mail size={14} />
          <span>Gmail Center</span>
        </button>
        <button
          onClick={() => setActiveSubTab('calendar')}
          className={`flex-1 flex items-center justify-center space-x-1.5 py-2 text-xs font-bold rounded-lg transition ${
            activeSubTab === 'calendar'
              ? 'bg-white text-slate-800 shadow-sm'
              : 'text-slate-400 hover:text-slate-700'
          }`}
        >
          <Calendar size={14} />
          <span>Calendar Events</span>
        </button>
      </div>

      {/* --- 1. GMAIL CENTER SUBTAB PANEL --- */}
      {activeSubTab === 'gmail' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Inbox Registry */}
          <div className="lg:col-span-1 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="text-left">
                  <h3 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider">Kotak Masuk Gmail</h3>
                  <p className="text-[10px] text-slate-400">Pesan bisnis dan pengajuan kontrak</p>
                </div>
                <button
                  id="gmail-compose-modal-btn"
                  onClick={() => setShowComposeModal(true)}
                  className="flex items-center space-x-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold rounded-lg transition"
                >
                  <Plus size={12} />
                  <span>Tulis</span>
                </button>
              </div>

              <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
                {loadingGmail ? (
                  <div className="py-24 text-center">
                    <Loader2 size={24} className="animate-spin text-indigo-600 mx-auto" />
                    <p className="text-xs text-slate-400 mt-2">Menghubungkan ke kotak masuk...</p>
                  </div>
                ) : gmails.map(email => (
                  <div
                    key={email.id}
                    onClick={() => setSelectedEmail(email)}
                    className={`p-3 rounded-xl border cursor-pointer transition text-left ${
                      selectedEmail?.id === email.id
                        ? 'border-indigo-600 bg-indigo-50/20'
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50'
                    }`}
                  >
                    <div className="flex justify-between text-[9px] text-slate-400">
                      <span className="font-bold text-slate-600 truncate max-w-[120px]">{email.from}</span>
                      <span>{email.date?.substring(0, 16) || ''}</span>
                    </div>
                    <h4 className="font-extrabold text-xs text-slate-800 mt-2 truncate">{email.subject}</h4>
                    <p className="text-[10px] text-slate-400 mt-1 line-clamp-2">{email.snippet}</p>
                  </div>
                ))}

                {!loadingGmail && gmails.length === 0 && (
                  <div className="py-24 text-center text-slate-400 text-xs">
                    <Inbox className="mx-auto mb-2 text-slate-200" size={36} />
                    Kotak masuk kosong.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Detailed Message View Panel */}
          <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm min-h-[450px]">
            {selectedEmail ? (
              <div className="text-left space-y-5 h-full flex flex-col justify-between">
                <div>
                  <div className="border-b border-slate-100 pb-4">
                    <p className="text-[10px] font-bold text-slate-400">Diterima dari:</p>
                    <p className="font-extrabold text-sm text-slate-800 mt-1">{selectedEmail.from}</p>
                    <p className="text-[11px] text-indigo-600 mt-0.5 font-semibold">Subjek: {selectedEmail.subject}</p>
                  </div>

                  <div className="py-4 text-xs text-slate-700 leading-relaxed space-y-4 max-h-96 overflow-y-auto">
                    <p className="bg-slate-50 p-4 rounded-xl font-medium">{selectedEmail.snippet}</p>
                    <div className="p-3 bg-indigo-50/30 rounded-xl border border-indigo-50 flex items-center space-x-2">
                      <Paperclip size={14} className="text-indigo-600" />
                      <span className="text-[10px] font-bold text-indigo-900">Email Lengkap disinkronisasi otomatis via Gmail API</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end">
                  <button
                    onClick={() => {
                      setComposeForm({
                        to: selectedEmail.from.match(/<([^>]+)>/)?.[1] || selectedEmail.from,
                        subject: `Re: ${selectedEmail.subject}`,
                        body: `\n\n--- Pada ${selectedEmail.date}, ${selectedEmail.from} menulis: ---\n> ${selectedEmail.snippet}`
                      });
                      setShowComposeModal(true);
                    }}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-950 text-white font-bold text-xs rounded-xl transition"
                  >
                    Balas Email
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-32 text-center text-slate-400 text-xs">
                <Mail className="mx-auto mb-4 text-slate-200 animate-pulse" size={48} />
                Pilih email di panel kiri untuk meninjau detail pengajuan atau membalas secara instant.
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- 2. GOOGLE CALENDAR SUBTAB PANEL --- */}
      {activeSubTab === 'calendar' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Event Scheduler details */}
          <div className="lg:col-span-1 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm text-left">
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider">Penjadwal Kegiatan</h3>
              <button
                id="add-calendar-event-modal-btn"
                onClick={() => setShowAddEventModal(true)}
                className="flex items-center space-x-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold rounded-lg transition"
              >
                <Plus size={12} />
                <span>Rapat Baru</span>
              </button>
            </div>

            <p className="text-xs text-slate-400 mb-4 leading-normal">
              Penjadwalan ini sinkron langsung dengan akun Google Calendar utama Anda, menjaga tenggat waktu project client.
            </p>

            <div className="p-4 bg-sky-50 border border-sky-100 rounded-xl space-y-2">
              <p className="font-bold text-sky-900 flex items-center"><Clock size={14} className="mr-1.5" /> Zona Waktu Aktif</p>
              <p className="text-[11px] font-semibold text-sky-800">Waktu Indonesia Barat (WIB)<br />Asia/Jakarta (GMT+7)</p>
            </div>
          </div>

          {/* List scheduled Events */}
          <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm text-left">
            <h3 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider mb-4">Agenda Mendatang</h3>
            {loadingCalendar ? (
              <div className="py-24 text-center">
                <Loader2 size={24} className="animate-spin text-indigo-600 mx-auto" />
                <p className="text-xs text-slate-400 mt-2">Menghubungkan ke Google Calendar...</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[450px] overflow-y-auto">
                {calendarEvents.map(event => (
                  <div key={event.id} className="p-3 bg-slate-50 hover:bg-slate-100/50 rounded-xl border border-slate-100 flex justify-between items-center transition">
                    <div>
                      <h4 className="font-extrabold text-xs text-slate-800">{event.summary}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">{event.description || 'Tidak ada deskripsi'}</p>
                    </div>
                    <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded">
                      {event.start?.dateTime?.substring(11, 16) || 'All Day'} • {event.start?.dateTime?.substring(0, 10) || ''}
                    </span>
                  </div>
                ))}

                {calendarEvents.length === 0 && (
                  <p className="text-center text-slate-400 text-xs py-12">Belum ada agenda terjadwal.</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- GMAIL COMPOSE MODAL --- */}
      {showComposeModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl max-w-md w-full overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-extrabold text-sm text-slate-800 text-left">Tulis Email Baru</h3>
              <button onClick={() => setShowComposeModal(false)} className="text-slate-400 hover:text-slate-700 font-bold">✕</button>
            </div>
            <form onSubmit={handleComposeSubmit} className="p-6 space-y-4 text-left">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Email Penerima *</label>
                <input
                  type="email"
                  required
                  value={composeForm.to}
                  onChange={(e) => setComposeForm({ ...composeForm, to: e.target.value })}
                  placeholder="client@unm.ac.id"
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Subjek Email *</label>
                <input
                  type="text"
                  required
                  value={composeForm.subject}
                  onChange={(e) => setComposeForm({ ...composeForm, subject: e.target.value })}
                  placeholder="Penawaran Kerja Sama EduTech Nusantara Digital"
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Isi Email *</label>
                <textarea
                  required
                  value={composeForm.body}
                  onChange={(e) => setComposeForm({ ...composeForm, body: e.target.value })}
                  placeholder="Tulis pesan email di sini..."
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-xs h-36"
                />
              </div>
              <div className="pt-4 flex justify-end space-x-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowComposeModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSending}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition flex items-center space-x-1"
                >
                  {isSending && <Loader2 size={12} className="animate-spin" />}
                  <span>Kirim Email</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- CALENDAR ADD EVENT MODAL --- */}
      {showAddEventModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl max-w-md w-full overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-extrabold text-sm text-slate-800 text-left">Jadwalkan Rapat / Kegiatan</h3>
              <button onClick={() => setShowAddEventModal(false)} className="text-slate-400 hover:text-slate-700 font-bold">✕</button>
            </div>
            <form onSubmit={handleAddEventSubmit} className="p-6 space-y-4 text-left">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Nama Kegiatan *</label>
                <input
                  type="text"
                  required
                  value={eventForm.summary}
                  onChange={(e) => setEventForm({ ...eventForm, summary: e.target.value })}
                  placeholder="Contoh: Rapat Koordinasi SIAKAD"
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Deskripsi Kegiatan</label>
                <textarea
                  value={eventForm.description}
                  onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                  placeholder="Deskripsikan agenda koordinasi..."
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-xs h-16"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Mulai Kegiatan *</label>
                  <input
                    type="datetime-local"
                    required
                    value={eventForm.start}
                    onChange={(e) => setEventForm({ ...eventForm, start: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Selesai Kegiatan *</label>
                  <input
                    type="datetime-local"
                    required
                    value={eventForm.end}
                    onChange={(e) => setEventForm({ ...eventForm, end: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg text-xs"
                  />
                </div>
              </div>
              <div className="pt-4 flex justify-end space-x-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddEventModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingEvent}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition flex items-center space-x-1"
                >
                  {isSubmittingEvent && <Loader2 size={12} className="animate-spin" />}
                  <span>Jadwalkan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
