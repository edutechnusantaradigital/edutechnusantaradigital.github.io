import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  CheckSquare,
  MessageSquare,
  Paperclip,
  Clock,
  Plus,
  Trash2,
  X,
  FileCheck2,
  RefreshCw,
  Activity
} from 'lucide-react';
import { ProjectProgress, ChecklistItem, Comment, Attachment } from '../types/crm';
import { CRM_API } from '../services/api';
import Swal from 'sweetalert2';

export default function ProgressManager() {
  const [projects, setProjects] = useState<ProjectProgress[]>([]);
  const [selectedProject, setSelectedProject] = useState<ProjectProgress | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Interaction inputs
  const [commentText, setCommentText] = useState('');
  const [newChecklistText, setNewChecklistText] = useState('');

  const loadProgressList = async () => {
    setIsLoading(true);
    const data = await CRM_API.getProgress();
    setProjects(data);
    if (data.length > 0) {
      // Keep selection or default to first
      setSelectedProject(prev => data.find(p => p.id === prev?.id) || data[0]);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadProgressList();
  }, []);

  // Recalculate percentage based on checked milestones
  const recalculatePercentage = (checklists: ChecklistItem[]) => {
    if (checklists.length === 0) return 0;
    const completed = checklists.filter(c => c.isCompleted).length;
    return Math.round((completed / checklists.length) * 100);
  };

  // Toggle checklist check
  const handleToggleChecklist = async (checkId: string) => {
    if (!selectedProject) return;

    const updatedChecklists = selectedProject.checklists.map(c => 
      c.id === checkId ? { ...c, isCompleted: !c.isCompleted } : c
    );

    const newPercentage = recalculatePercentage(updatedChecklists);

    const updatedProject = {
      ...selectedProject,
      checklists: updatedChecklists,
      percentage: newPercentage,
      activities: [
        {
          id: `ac-${Date.now()}`,
          user: 'Admin Staff',
          action: `Mengubah status milestone checklist`,
          timestamp: new Date().toLocaleString()
        },
        ...selectedProject.activities
      ]
    };

    await CRM_API.saveProgress(updatedProject);
    loadProgressList();
  };

  // Add a new checklist milestone
  const handleAddChecklist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChecklistText.trim() || !selectedProject) return;

    const newCheck: ChecklistItem = {
      id: `ch-${Date.now()}`,
      title: newChecklistText,
      isCompleted: false
    };

    const updatedChecklists = [...selectedProject.checklists, newCheck];
    const newPercentage = recalculatePercentage(updatedChecklists);

    const updatedProject = {
      ...selectedProject,
      checklists: updatedChecklists,
      percentage: newPercentage,
      activities: [
        {
          id: `ac-${Date.now()}`,
          user: 'Admin Staff',
          action: `Menambahkan milestone baru: ${newChecklistText}`,
          timestamp: new Date().toLocaleString()
        },
        ...selectedProject.activities
      ]
    };

    await CRM_API.saveProgress(updatedProject);
    setNewChecklistText('');
    loadProgressList();

    Swal.fire({
      icon: 'success',
      title: 'Milestone Ditambahkan',
      text: 'Checklist berhasil dibuat dan ditautkan ke project.',
      timer: 1200,
      showConfirmButton: false,
      toast: true,
      position: 'top-end'
    });
  };

  // Delete a checklist milestone
  const handleDeleteChecklist = async (checkId: string) => {
    if (!selectedProject) return;

    const updatedChecklists = selectedProject.checklists.filter(c => c.id !== checkId);
    const newPercentage = recalculatePercentage(updatedChecklists);

    const updatedProject = {
      ...selectedProject,
      checklists: updatedChecklists,
      percentage: newPercentage
    };

    await CRM_API.saveProgress(updatedProject);
    loadProgressList();
  };

  // Add Comment from Admin Board
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !selectedProject) return;

    const newComment: Comment = {
      id: `co-${Date.now()}`,
      authorName: 'Andi Pratama',
      authorRole: 'Admin',
      content: commentText,
      timestamp: new Date().toLocaleString('id-ID', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })
    };

    const updatedProject = {
      ...selectedProject,
      comments: [...selectedProject.comments, newComment],
      activities: [
        {
          id: `ac-${Date.now()}`,
          user: 'Andi Pratama',
          action: 'Mengirim komentar koordinasi proyek',
          timestamp: new Date().toLocaleString()
        },
        ...selectedProject.activities
      ]
    };

    await CRM_API.saveProgress(updatedProject);
    setCommentText('');
    loadProgressList();
  };

  return (
    <div className="space-y-6">
      {/* Selection row for admin */}
      <div className="bg-white dark:bg-slate-800 p-4 md:p-6 rounded-2xl border border-slate-100 dark:border-slate-700/60 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-xl">
            <FileSpreadsheet size={20} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">Papan Progress & Milestone Pekerjaan</h3>
            <p className="text-xs text-slate-400">Pilih proyek aktif untuk meninjau kustomisasi checklist dan diskusi</p>
          </div>
        </div>

        <div>
          <select
            value={selectedProject?.id || ''}
            onChange={(e) => {
              const proj = projects.find(p => p.id === e.target.value);
              if (proj) setSelectedProject(proj);
            }}
            className="px-3.5 py-2 text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 rounded-xl focus:outline-none text-slate-800 dark:text-white"
          >
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.orderNumber} - {p.projectName} ({p.clientName})</option>
            ))}
          </select>
        </div>
      </div>

      {isLoading || !selectedProject ? (
        <div className="bg-white dark:bg-slate-800 p-20 text-center rounded-2xl border">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs text-slate-400">Mengambil data lembar kerja...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left panel: Percentage indicator and checklist CRUD */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700/60 shadow-sm space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-white">Milestone & Checklist Pekerjaan</h4>
                <p className="text-xs text-slate-400">Centang item untuk merubah persentase kemajuan project di sistem client</p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-blue-600 block">{selectedProject.percentage}%</span>
                <span className="text-[10px] text-slate-400 font-mono">SELESAI</span>
              </div>
            </div>

            {/* Custom Progress bar container */}
            <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
              <div
                style={{ width: `${selectedProject.percentage}%` }}
                className="bg-gradient-to-r from-blue-600 to-sky-400 h-full rounded-full transition-all duration-500"
              ></div>
            </div>

            {/* Checklist elements with direct togglers */}
            <div className="space-y-3">
              {selectedProject.checklists.map((chk) => (
                <div
                  key={chk.id}
                  className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-700/50 bg-slate-50/30 dark:bg-slate-800/20 flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleToggleChecklist(chk.id)}
                      className={`w-5 h-5 rounded-md flex items-center justify-center border transition ${
                        chk.isCompleted
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'border-slate-300 dark:border-slate-600 hover:border-blue-400'
                      }`}
                    >
                      {chk.isCompleted && <FileCheck2 size={13} strokeWidth={3} />}
                    </button>
                    <span className={`text-xs font-semibold leading-normal ${
                      chk.isCompleted ? 'text-slate-400 line-through' : 'text-slate-700 dark:text-slate-300'
                    }`}>
                      {chk.title}
                    </span>
                  </div>

                  <button
                    onClick={() => handleDeleteChecklist(chk.id)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-rose-500 transition"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>

            {/* Form to add custom milestone checklist */}
            <form onSubmit={handleAddChecklist} className="flex gap-2 pt-2">
              <input
                type="text"
                required
                value={newChecklistText}
                onChange={(e) => setNewChecklistText(e.target.value)}
                className="flex-1 px-3.5 py-2 text-xs border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 rounded-xl focus:outline-none"
                placeholder="Tambahkan tugas/milestone kustom baru..."
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1"
              >
                <Plus size={14} />
                <span>Tambah</span>
              </button>
            </form>
          </div>

          {/* Right panel: Activity feeds & coordination comments */}
          <div className="space-y-6">
            {/* Discussion Feed */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700/60 shadow-sm flex flex-col h-[22rem] justify-between space-y-4">
              <div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-white">Kolaborasi & Komentar Tim</h4>
                <p className="text-xs text-slate-400">Pusat komunikasi internal bersama client</p>
              </div>

              {/* Comments Feed */}
              <div className="flex-1 overflow-y-auto space-y-3.5 pr-1">
                {selectedProject.comments.length === 0 ? (
                  <p className="text-xs text-slate-400 italic text-center py-10">Belum ada tanggapan.</p>
                ) : (
                  selectedProject.comments.map((comm) => (
                    <div key={comm.id} className="p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/40 rounded-xl space-y-1">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="font-bold text-slate-800 dark:text-white">{comm.authorName}</span>
                        <span className="text-slate-400 font-mono">{comm.timestamp}</span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-normal">{comm.content}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Comment submission form */}
              <form onSubmit={handleAddComment} className="flex gap-1.5">
                <input
                  type="text"
                  required
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="flex-1 px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 rounded-xl text-xs focus:outline-none text-slate-800 dark:text-white"
                  placeholder="Ketik koordinasi tim/klien..."
                />
                <button type="submit" className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold">
                  Kirim
                </button>
              </form>
            </div>

            {/* Audit Log Activity Feed */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700/60 shadow-sm space-y-4">
              <h4 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                <Activity size={16} className="text-blue-500" />
                <span>Audit Log Project</span>
              </h4>

              <div className="space-y-4 max-h-[12rem] overflow-y-auto pr-1">
                {selectedProject.activities.map((act) => (
                  <div key={act.id} className="flex gap-2.5 text-[11px] leading-normal">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0"></div>
                    <div>
                      <p className="text-slate-700 dark:text-slate-300">
                        <strong className="font-semibold text-slate-800 dark:text-white">{act.user}</strong> {act.action}
                      </p>
                      <span className="text-[9px] text-slate-400 block font-mono mt-0.5">{act.timestamp}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
