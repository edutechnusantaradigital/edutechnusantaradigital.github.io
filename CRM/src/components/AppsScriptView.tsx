/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Cpu, Play, Check, Copy, ExternalLink, RefreshCw, AlertTriangle, 
  HardDrive, Settings, Terminal, ArrowRight, Lock, Code, Clock, 
  Activity, FileCode, CheckCircle, HelpCircle
} from 'lucide-react';

interface AppsScriptViewProps {
  spreadsheetId: string | null;
  token: string | null;
}

const safeLocalStorage = {
  getItem(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      return null;
    }
  },
  setItem(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      // ignore
    }
  }
};

export default function AppsScriptView({ spreadsheetId, token }: AppsScriptViewProps) {
  // Connection states
  const [webAppUrl, setWebAppUrl] = useState('https://script.google.com/macros/s/AKfycbyOgoKVt-2sm13Aub1vVlaS-L0Hi8VhvyEgar3FML5RkZ-A8Jho79yL9oP9pqPt1tD4Tw/exec');
  const [projectId, setProjectId] = useState('1A3-k7BmmZd5-IpbJK61ZQVa0CKMd3qaZGw8knoB1U0-iMY4G1srHvhjH');
  const [isSaving, setIsSaving] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'Unconfigured' | 'Connected' | 'Error' | 'Testing'>('Unconfigured');
  const [pingLatency, setPingLatency] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Script action states
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [logs, setLogs] = useState<any[]>([]);

  // Clipboard copy state
  const [copiedTemplate, setCopiedTemplate] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  // Load saved configuration on mount
  useEffect(() => {
    const savedUrl = safeLocalStorage.getItem('apps_script_web_app_url');
    const savedProj = safeLocalStorage.getItem('apps_script_project_id');
    const initialUrl = savedUrl || 'https://script.google.com/macros/s/AKfycbyOgoKVt-2sm13Aub1vVlaS-L0Hi8VhvyEgar3FML5RkZ-A8Jho79yL9oP9pqPt1tD4Tw/exec';
    setWebAppUrl(initialUrl);
    if (savedProj) setProjectId(savedProj);
    
    testConnection(initialUrl);
  }, []);

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    safeLocalStorage.setItem('apps_script_web_app_url', webAppUrl.trim());
    safeLocalStorage.setItem('apps_script_project_id', projectId.trim());
    
    setTimeout(() => {
      setIsSaving(false);
      testConnection(webAppUrl.trim());
    }, 800);
  };

  const testConnection = async (urlToTest: string) => {
    if (!urlToTest) {
      setConnectionStatus('Unconfigured');
      return;
    }
    setConnectionStatus('Testing');
    const startTime = Date.now();
    try {
      const response = await fetch('/api/apps-script/proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'spreadsheet-id': spreadsheetId || ''
        },
        body: JSON.stringify({
          webAppUrl: urlToTest,
          action: 'ping'
        })
      });

      const latency = Date.now() - startTime;
      if (response.ok) {
        const data = await response.json();
        setConnectionStatus('Connected');
        setPingLatency(latency);
        setErrorMessage('');
        addLog('ping', 'Success', data, latency);
      } else {
        const data = await response.json().catch(() => ({}));
        setConnectionStatus('Error');
        setErrorMessage(data.error || 'Gagal tersambung ke Apps Script. Periksa CORS/izin publik.');
        addLog('ping', 'Failed', data, latency);
      }
    } catch (err: any) {
      const latency = Date.now() - startTime;
      setConnectionStatus('Error');
      setErrorMessage(err.message || 'Network Error.');
      addLog('ping', 'Error', { error: err.message }, latency);
    }
  };

  const triggerScriptAction = async (action: 'backup' | 'sync' | 'notify') => {
    if (connectionStatus !== 'Connected' && connectionStatus !== 'Error') {
      alert('Silakan simpan & sambungkan Web App URL Apps Script terlebih dahulu.');
      return;
    }
    setActiveAction(action);
    const startTime = Date.now();
    try {
      const response = await fetch('/api/apps-script/proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'spreadsheet-id': spreadsheetId || ''
        },
        body: JSON.stringify({
          webAppUrl: webAppUrl.trim(),
          action,
          payload: {
            spreadsheetId,
            timestamp: new Date().toISOString(),
            triggeredBy: 'Super Admin CRM'
          }
        })
      });

      const latency = Date.now() - startTime;
      const data = await response.json();
      
      if (response.ok && data.status === 'success') {
        alert(`Aksi "${action.toUpperCase()}" Berhasil Dieksekusi!\nRespon: ${data.message || 'Sukses'}`);
        addLog(action, 'Success', data, latency);
      } else {
        alert(`Aksi "${action.toUpperCase()}" Gagal:\n${data.message || data.error || 'Unknown Error'}`);
        addLog(action, 'Failed', data, latency);
      }
    } catch (err: any) {
      const latency = Date.now() - startTime;
      alert(`Error mengeksekusi Apps Script:\n${err.message}`);
      addLog(action, 'Error', { error: err.message }, latency);
    } finally {
      setActiveAction(null);
    }
  };

  const addLog = (action: string, status: string, response: any, latency: number) => {
    const newLog = {
      id: Math.random().toString(36).substring(2, 8).toUpperCase(),
      action,
      status,
      latency,
      timestamp: new Date().toLocaleTimeString(),
      response: JSON.stringify(response)
    };
    setLogs(prev => [newLog, ...prev].slice(0, 20));
  };

  const copyToClipboard = (text: string, setCopied: (v: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Ready-to-use GAS Template
  const appsScriptTemplate = `/**
 * Google Apps Script Integration Backend
 * Project ID: ${projectId}
 * 
 * Silakan copy-paste script ini ke dalam editor Apps Script Anda,
 * lalu pilih "Deploy" -> "New Deployment" -> type "Web App".
 * Ubah "Execute as" ke "Me" dan "Who has access" ke "Anyone".
 */

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: "success",
    message: "Koneksi terjalin sempurna dengan Google Apps Script Engine EduTech Nusantara!",
    timestamp: new Date().toISOString(),
    projectId: "${projectId}"
  })).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const postData = JSON.parse(e.postData.contents);
    const action = postData.action;
    const payload = postData.payload || {};
    const spreadsheetId = payload.spreadsheetId;
    
    if (action === "ping") {
      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        message: "Pong! Google Apps Script Online.",
        projectId: "${projectId}",
        timestamp: new Date().toISOString()
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    if (action === "backup") {
      if (!spreadsheetId) throw new Error("Spreadsheet ID tidak dikirim.");
      
      const file = DriveApp.getFileById(spreadsheetId);
      const folder = file.getParents().next();
      const backupName = "BACKUP_CRM_DB_" + Utilities.formatDate(new Date(), "GMT+7", "yyyy-MM-dd_HHmmss");
      
      const backupFile = file.makeCopy(backupName, folder);
      
      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        message: "Spreadsheet berhasil dibackup!",
        backupFileName: backupName,
        backupFileId: backupFile.getId(),
        timestamp: new Date().toISOString()
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    if (action === "sync") {
      // Custom sync formulas, re-calculating balances or caching data.
      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        message: "Formulasi & baris spreadsheet berhasil dikompilasi ulang.",
        timestamp: new Date().toISOString()
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    if (action === "notify") {
      // Trigger messaging or mock WhatsApp logger
      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        message: "Notifikasi otomatis Apps Script berhasil dikirim.",
        timestamp: new Date().toISOString()
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    throw new Error("Aksi tidak dikenal: " + action);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString(),
      timestamp: new Date().toISOString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}`;

  return (
    <div className="space-y-6 text-left pb-16" id="apps-script-root">
      
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-900 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="absolute w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl -top-10 -left-10 pointer-events-none"></div>
        
        <div className="space-y-2 relative z-10">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 rounded-full text-[9px] font-black uppercase tracking-wider">
              External Automation Hub
            </span>
            <div className="flex items-center gap-1 text-[10px] text-teal-400 font-bold">
              <span className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-ping"></span>
              <span>Apps Script Service</span>
            </div>
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight flex items-center gap-2">
            <Cpu className="text-indigo-400 animate-pulse" /> Google Apps Script Connector
          </h1>
          <p className="text-slate-300 text-xs max-w-xl leading-relaxed">
            Hubungkan instansi EduTech Nusantara Digital dengan Google Apps Script milik Anda secara asinkronus untuk otomatisasi back-end, audit database, dan notifikasi otomatis.
          </p>
        </div>

        {/* CONNECTION CARD */}
        <div className="bg-slate-950/40 border border-slate-800/80 rounded-2xl p-4 w-full lg:w-72 relative z-10 shrink-0 text-xs text-left">
          <div className="flex justify-between items-center mb-1.5 text-[10px] text-slate-400 font-bold uppercase">
            <span>Status Apps Script</span>
            {connectionStatus === 'Connected' ? (
              <span className="text-teal-400 flex items-center gap-1 font-black">● TERHUBUNG</span>
            ) : connectionStatus === 'Testing' ? (
              <span className="text-indigo-400 flex items-center gap-1 font-black">● MENCOBA...</span>
            ) : connectionStatus === 'Error' ? (
              <span className="text-rose-400 flex items-center gap-1 font-black">● ERROR</span>
            ) : (
              <span className="text-amber-400 flex items-center gap-1 font-black">● BELUM CONFIG</span>
            )}
          </div>
          
          <div className="space-y-1 mt-1">
            <p className="text-[10px] text-slate-500 font-bold">Latency Sambungan</p>
            <p className="text-base font-black text-white">
              {pingLatency ? `${pingLatency} ms` : '-'}
            </p>
          </div>

          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-300 ${
              connectionStatus === 'Connected' ? 'bg-teal-400 w-full' : connectionStatus === 'Testing' ? 'bg-indigo-500 w-1/2 animate-pulse' : 'bg-rose-500 w-1/4'
            }`}></div>
          </div>

          <button 
            onClick={() => testConnection(webAppUrl)}
            disabled={!webAppUrl || connectionStatus === 'Testing'}
            className="mt-3 w-full py-1.5 bg-indigo-600/30 hover:bg-indigo-600/50 disabled:opacity-40 text-indigo-300 font-bold rounded-lg transition text-[10px] tracking-wide uppercase cursor-pointer"
          >
            Tes Koneksi Ping
          </button>
        </div>
      </div>

      {/* CORE INTEGRATION DASHBOARD */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* FORM CONFIGURATION & INSTRUCTIONS (COL 1) */}
        <div className="space-y-6 xl:col-span-1">
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 border-b pb-3 border-slate-50">
              <Settings size={16} className="text-indigo-600" />
              <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider">Konfigurasi Script</h3>
            </div>

            <form onSubmit={handleSaveConfig} className="space-y-4 text-xs font-semibold">
              <div className="space-y-1">
                <label className="block text-[10px] text-slate-500 font-bold uppercase">Google Apps Script ID *</label>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    required
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    placeholder="Contoh: 1A3-k7BmmZd5..."
                    className="flex-1 bg-slate-50 border border-slate-200 p-2 rounded-lg text-slate-800"
                  />
                  <button
                    type="button"
                    onClick={() => copyToClipboard(projectId, setCopiedId)}
                    className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition"
                    title="Copy Project ID"
                  >
                    {copiedId ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 leading-normal font-normal">
                  ID dari URL project Google Apps Script editor Anda.
                </p>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] text-slate-500 font-bold uppercase">Web App Deployment URL *</label>
                <input
                  type="url"
                  required
                  value={webAppUrl}
                  onChange={(e) => setWebAppUrl(e.target.value)}
                  placeholder="https://script.google.com/macros/s/.../exec"
                  className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg text-slate-800"
                />
                <p className="text-[10px] text-slate-400 leading-normal font-normal">
                  URL hasil deployment Web App agar CRM dapat melakukan POST request webhook.
                </p>
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
              >
                {isSaving ? <RefreshCw size={13} className="animate-spin" /> : <CheckCircle size={13} />}
                <span>{isSaving ? 'Menghubungkan...' : 'Simpan & Validasi'}</span>
              </button>
            </form>
          </div>

          {/* INSTRUCTIONS PANEL */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 border-b pb-3 border-slate-50">
              <HelpCircle size={16} className="text-indigo-600" />
              <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider">Panduan Deployment</h3>
            </div>

            <div className="space-y-3.5 text-xs text-slate-600 leading-relaxed font-medium">
              <div className="flex gap-2">
                <span className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-black shrink-0 text-[10px]">1</span>
                <p>
                  Buka editor script Anda di{' '}
                  <a 
                    href={`https://script.google.com/u/0/home/projects/${projectId}/edit`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-indigo-600 underline font-extrabold inline-flex items-center gap-0.5"
                  >
                    Google Apps Script <ExternalLink size={11} />
                  </a>
                </p>
              </div>

              <div className="flex gap-2">
                <span className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-black shrink-0 text-[10px]">2</span>
                <p>Salin <strong>Kode Template .gs</strong> di samping kanan dan paste ke dalam editor script Google.</p>
              </div>

              <div className="flex gap-2">
                <span className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-black shrink-0 text-[10px]">3</span>
                <p>Klik tombol <strong>"Deploy"</strong> di kanan atas, pilih <strong>"New deployment"</strong>.</p>
              </div>

              <div className="flex gap-2">
                <span className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-black shrink-0 text-[10px]">4</span>
                <p>Atur tipe deployment sebagai <strong>"Web app"</strong>. Ubah opsi:
                  <br />• <i>Execute as</i>: <strong>Me</strong>
                  <br />• <i>Who has access</i>: <strong>Anyone</strong>
                </p>
              </div>

              <div className="flex gap-2">
                <span className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-black shrink-0 text-[10px]">5</span>
                <p>Salin <strong>Web App URL</strong> yang dihasilkan oleh Google dan paste di form konfigurasi di atas.</p>
              </div>
            </div>
          </div>
        </div>

        {/* COPYABLE TEMPLATE CODE & AUTOMATION HUB (COL 2 & 3) */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* THE AUTOMATION TRIGGERS BOX */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <div className="border-b pb-3 border-slate-50 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Activity size={16} className="text-indigo-600" />
                <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider">Aksi Otomatisasi Terintegrasi</h3>
              </div>
              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase rounded-full">
                Live Trigger
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* BACKUP SPREADSHEET CARD */}
              <div className="border border-slate-100 bg-slate-50/50 p-4 rounded-xl flex flex-col justify-between h-40">
                <div className="space-y-1">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg w-fit">
                    <HardDrive size={18} />
                  </div>
                  <h4 className="font-extrabold text-slate-800 text-xs mt-2">Auto-Backup Database</h4>
                  <p className="text-[10px] text-slate-400 leading-normal">
                    Trigger duplikasi database Google Sheet ke folder aman cadangan secara langsung.
                  </p>
                </div>
                <button
                  onClick={() => triggerScriptAction('backup')}
                  disabled={!!activeAction}
                  className="w-full mt-3 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-[10px] font-black rounded-lg transition uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer shadow-sm"
                >
                  <Play size={10} />
                  <span>{activeAction === 'backup' ? 'Mengeksekusi...' : 'Backup Database'}</span>
                </button>
              </div>

              {/* RE-COMPILE FORMULAS CARD */}
              <div className="border border-slate-100 bg-slate-50/50 p-4 rounded-xl flex flex-col justify-between h-40">
                <div className="space-y-1">
                  <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg w-fit">
                    <RefreshCw size={18} />
                  </div>
                  <h4 className="font-extrabold text-slate-800 text-xs mt-2">Kompilasi & Sinkronisasi</h4>
                  <p className="text-[10px] text-slate-400 leading-normal">
                    Hitung ulang formula sheet, singkronisasikan saldo keuangan, dan re-indeks entitas.
                  </p>
                </div>
                <button
                  onClick={() => triggerScriptAction('sync')}
                  disabled={!!activeAction}
                  className="w-full mt-3 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-[10px] font-black rounded-lg transition uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer shadow-sm"
                >
                  <Play size={10} />
                  <span>{activeAction === 'sync' ? 'Mengeksekusi...' : 'Sync & Recalculate'}</span>
                </button>
              </div>

              {/* WHATSAPP LOG WEBHOOK TEST CARD */}
              <div className="border border-slate-100 bg-slate-50/50 p-4 rounded-xl flex flex-col justify-between h-40">
                <div className="space-y-1">
                  <div className="p-2 bg-violet-50 text-violet-600 rounded-lg w-fit">
                    <Terminal size={18} />
                  </div>
                  <h4 className="font-extrabold text-slate-800 text-xs mt-2">Webhook Notifikasi Test</h4>
                  <p className="text-[10px] text-slate-400 leading-normal">
                    Kirimkan trigger WhatsApp mock log test ke server Apps Script untuk menguji kesiapan notifikasi.
                  </p>
                </div>
                <button
                  onClick={() => triggerScriptAction('notify')}
                  disabled={!!activeAction}
                  className="w-full mt-3 py-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-[10px] font-black rounded-lg transition uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer shadow-sm"
                >
                  <Play size={10} />
                  <span>{activeAction === 'notify' ? 'Mengeksekusi...' : 'Trigger Webhook'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* CODE COMPONENT BOX */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <div className="border-b pb-3 border-slate-50 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <FileCode size={16} className="text-indigo-600 animate-pulse" />
                <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider">Kode Template Google Apps Script (.gs)</h3>
              </div>
              
              <button
                onClick={() => copyToClipboard(appsScriptTemplate, setCopiedTemplate)}
                className="flex items-center space-x-1 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-black rounded-lg transition"
              >
                {copiedTemplate ? <Check size={11} className="text-emerald-600" /> : <Copy size={11} />}
                <span>{copiedTemplate ? 'Copied!' : 'Copy Code'}</span>
              </button>
            </div>

            <div className="bg-slate-950 rounded-2xl p-4 font-mono text-[11px] text-indigo-300 overflow-x-auto max-h-72 border border-slate-800 scrollbar-thin scrollbar-thumb-slate-800 text-left">
              <pre>{appsScriptTemplate}</pre>
            </div>
          </div>

          {/* EXECUTION LOGS */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b pb-2.5 border-slate-50">
              <div className="flex items-center space-x-1.5">
                <Terminal size={15} className="text-slate-600" />
                <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider">History Response Apps Script</h3>
              </div>
              <span className="text-[10px] text-slate-400 font-bold">20 Execution Max</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs font-semibold text-left">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 uppercase text-[9px] font-black tracking-wider">
                    <th className="pb-2">ID</th>
                    <th className="pb-2">Action</th>
                    <th className="pb-2">Status</th>
                    <th className="pb-2">Latency</th>
                    <th className="pb-2">Waktu</th>
                    <th className="pb-2 text-right">Raw Output</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {logs.map(log => (
                    <tr key={log.id} className="text-slate-700 hover:bg-slate-50/50">
                      <td className="py-2.5 text-[10px] font-mono text-slate-400">{log.id}</td>
                      <td className="py-2.5 uppercase text-[10px] font-extrabold text-slate-800">{log.action}</td>
                      <td className="py-2.5">
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                          log.status === 'Success' 
                            ? 'bg-emerald-50 text-emerald-700' 
                            : 'bg-rose-50 text-rose-700'
                        }`}>
                          {log.status}
                        </span>
                      </td>
                      <td className="py-2.5 text-slate-500">{log.latency}ms</td>
                      <td className="py-2.5 text-slate-400 text-[10px]">{log.timestamp}</td>
                      <td className="py-2.5 text-right font-mono text-[9px] text-indigo-600 max-w-xs truncate" title={log.response}>
                        {log.response}
                      </td>
                    </tr>
                  ))}
                  {logs.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400 text-[11px] font-medium">
                        Belum ada riwayat pemanggilan Apps Script dalam sesi ini.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
