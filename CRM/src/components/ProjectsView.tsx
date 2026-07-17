/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Plus,
  Briefcase,
  CheckSquare,
  Square,
  Clock,
  Sparkles,
  Calendar,
  AlertCircle,
  Loader2,
  ChevronRight,
  User,
  ArrowRightLeft
} from 'lucide-react';
import { Project, ProjectTask } from '../types';

interface ProjectsProps {
  projects: Project[];
  tasks: ProjectTask[];
  onAddProject: (projectData: any) => Promise<any>;
  onUpdateProject: (id: string, updatedData: any) => Promise<any>;
  onAddTask: (projectId: string, taskData: any) => Promise<any>;
  onUpdateTask: (taskId: string, updatedData: any) => Promise<any>;
  onGenerateReport: (project: Project, projectTasks: ProjectTask[]) => Promise<string>;
}

export default function ProjectsView({
  projects,
  tasks,
  onAddProject,
  onUpdateProject,
  onAddTask,
  onUpdateTask,
  onGenerateReport
}: ProjectsProps) {
  const [selectedProject, setSelectedProject] = useState<Project | null>(projects[0] || null);
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');

  // AI report states
  const [aiReportHtml, setAiReportHtml] = useState<string | null>(null);
  const [generatingReport, setGeneratingReport] = useState(false);

  // Modal Create Project
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newProjectForm, setNewProjectForm] = useState({
    name: '',
    description: '',
    start_date: '',
    end_date: '',
    assigned_to: 'IT Developer',
    status: 'To Do',
    progress: 0
  });

  const lanes = ['To Do', 'On Progress', 'Testing', 'Revision', 'Completed'];

  const getProjectsByLane = (lane: string) => {
    return projects.filter(p => p.status === lane);
  };

  const handleMoveLane = async (project: Project, nextLane: string) => {
    await onUpdateProject(project.id, { ...project, status: nextLane });
    if (selectedProject && selectedProject.id === project.id) {
      setSelectedProject({ ...selectedProject, status: nextLane as any });
    }
  };

  const projectTasks = tasks.filter(t => t.project_id === selectedProject?.id);

  const handleAddTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject || !newTaskName.trim()) return;

    try {
      await onAddTask(selectedProject.id, {
        name: newTaskName,
        status: 'Pending',
        priority: newTaskPriority,
        due_date: selectedProject.end_date,
        assigned_to: selectedProject.assigned_to
      });
      setNewTaskName('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleTaskStatus = async (task: ProjectTask) => {
    const nextStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
    await onUpdateTask(task.id, { ...task, status: nextStatus });

    // Recalculate project progress %
    if (selectedProject) {
      const allTasks = tasks.filter(t => t.project_id === selectedProject.id);
      const updatedTasks = allTasks.map(t => t.id === task.id ? { ...t, status: nextStatus } : t);
      const completedCount = updatedTasks.filter(t => t.status === 'Completed').length;
      const progressPercent = updatedTasks.length > 0
        ? Math.round((completedCount / updatedTasks.length) * 100)
        : 0;
      await onUpdateProject(selectedProject.id, { ...selectedProject, progress: progressPercent });
      setSelectedProject({ ...selectedProject, progress: progressPercent });
    }
  };

  const handleAddProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const saved = await onAddProject(newProjectForm);
      setShowAddProjectModal(false);
      setNewProjectForm({
        name: '',
        description: '',
        start_date: '',
        end_date: '',
        assigned_to: 'IT Developer',
        status: 'To Do',
        progress: 0
      });
      if (saved) setSelectedProject(saved);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const triggerAIReport = async () => {
    if (!selectedProject) return;
    setGeneratingReport(true);
    setAiReportHtml(null);
    try {
      const html = await onGenerateReport(selectedProject, projectTasks);
      setAiReportHtml(html);
    } catch (err) {
      console.error(err);
    } finally {
      setGeneratingReport(false);
    }
  };

  return (
    <div className="space-y-6" id="projects-view-main">
      {/* 1. Header with Title & Report trigger */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
        <div className="text-left">
          <h2 className="text-sm font-bold text-slate-800">Manajemen Project & Kanban Board</h2>
          <p className="text-xs text-slate-400">Papan alur kerja taktis terhubung ke Google Sheets Database</p>
        </div>
        <div className="flex items-center space-x-2">
          {selectedProject && (
            <button
              id="ai-project-report-btn"
              onClick={triggerAIReport}
              disabled={generatingReport}
              className="flex items-center space-x-1 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-lg border border-indigo-200 transition"
            >
              {generatingReport ? (
                <>
                  <Loader2 size={14} className="animate-spin mr-1" />
                  <span>Menganalisis...</span>
                </>
              ) : (
                <>
                  <Sparkles size={14} className="text-indigo-600 animate-pulse" />
                  <span>Generate AI Status Report</span>
                </>
              )}
            </button>
          )}
          <button
            id="add-project-modal-btn"
            onClick={() => setShowAddProjectModal(true)}
            className="flex items-center space-x-1 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition"
          >
            <Plus size={14} />
            <span>Project Baru</span>
          </button>
        </div>
      </div>

      {/* 2. Kanban Board Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto pb-4" id="kanban-board-grid">
        {lanes.map(lane => (
          <div key={lane} className="bg-slate-50 p-3 rounded-xl min-w-[200px] flex flex-col justify-between space-y-3 shrink-0">
            {/* Lane Header */}
            <div className="flex justify-between items-center bg-white p-2 rounded-lg border border-slate-100 shadow-sm shrink-0">
              <span className="text-xs font-bold text-slate-700 text-left">{lane}</span>
              <span className="text-[10px] font-black text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                {getProjectsByLane(lane).length}
              </span>
            </div>

            {/* Lane Cards */}
            <div className="flex-1 space-y-2.5 overflow-y-auto max-h-[350px]">
              {getProjectsByLane(lane).map(project => (
                <div
                  key={project.id}
                  onClick={() => setSelectedProject(project)}
                  className={`bg-white p-3 rounded-xl border transition cursor-pointer text-left relative group ${
                    selectedProject?.id === project.id
                      ? 'border-indigo-500 shadow-md ring-1 ring-indigo-500/10'
                      : 'border-slate-200 hover:border-slate-300 shadow-sm'
                  }`}
                >
                  <p className="text-[10px] font-bold text-slate-400">{project.id}</p>
                  <h4 className="font-extrabold text-xs text-slate-800 mt-1 truncate">{project.name}</h4>
                  <p className="text-[10px] text-slate-500 mt-1 line-clamp-2">{project.description}</p>

                  {/* Progress Indicator */}
                  <div className="mt-3 flex items-center space-x-2">
                    <div className="flex-1 bg-slate-100 h-1 rounded-full overflow-hidden">
                      <div className="bg-indigo-600 h-full" style={{ width: `${project.progress}%` }}></div>
                    </div>
                    <span className="text-[9px] font-bold text-slate-400">{project.progress}%</span>
                  </div>

                  {/* Lane Switching Overlay Controls for easy showcase */}
                  <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition flex space-x-1">
                    <select
                      id={`move-lane-select-${project.id}`}
                      value={project.status}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => handleMoveLane(project, e.target.value)}
                      className="bg-slate-100 border border-slate-200 text-[9px] font-bold rounded p-0.5 outline-none cursor-pointer"
                    >
                      {lanes.map(l => (
                        <option key={l} value={l}>{l}</option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}

              {getProjectsByLane(lane).length === 0 && (
                <div className="border border-dashed border-slate-200 py-12 text-center text-slate-400 text-[10px]">
                  Kosong
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 3. Task Checklist Details */}
      {selectedProject ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          {/* Project Details Panel */}
          <div className="lg:col-span-1 border-r border-slate-100 pr-0 lg:pr-6 text-left space-y-4">
            <div>
              <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded">
                {selectedProject.id}
              </span>
              <h3 className="font-extrabold text-sm text-slate-800 mt-2">{selectedProject.name}</h3>
              <p className="text-xs text-slate-400 mt-1">{selectedProject.description}</p>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400 font-semibold">Tanggung Jawab:</span>
                <span className="text-slate-800 font-bold">{selectedProject.assigned_to}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-semibold">Mulai Project:</span>
                <span className="text-slate-800 font-bold">{selectedProject.start_date || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-semibold">Deadline Target:</span>
                <span className="text-slate-800 font-bold">{selectedProject.end_date || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-semibold">Status Papan:</span>
                <span className="text-slate-800 font-bold">{selectedProject.status}</span>
              </div>
            </div>

            {/* General progress circle or bar */}
            <div className="pt-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Presentasi Kemajuan</p>
              <div className="flex items-center space-x-3 mt-1.5">
                <div className="flex-1 bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-indigo-600 h-full rounded-full transition-all" style={{ width: `${selectedProject.progress}%` }}></div>
                </div>
                <span className="text-xs font-extrabold text-slate-600">{selectedProject.progress}%</span>
              </div>
            </div>
          </div>

          {/* Checklist Panel */}
          <div className="lg:col-span-2 space-y-4 text-left pl-0 lg:pl-6">
            <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider">Daftar Tugas & Checklist Kerja</h4>

            {/* Add Task bar */}
            <form onSubmit={handleAddTaskSubmit} className="flex gap-2" id="add-task-form">
              <input
                id="task-name-input"
                type="text"
                placeholder="Masukkan tugas / sub-milestone baru..."
                value={newTaskName}
                onChange={(e) => setNewTaskName(e.target.value)}
                className="flex-1 bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg text-xs"
              />
              <select
                id="task-priority-select"
                value={newTaskPriority}
                onChange={(e: any) => setNewTaskPriority(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-xs rounded-lg px-2"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
              <button
                type="submit"
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg transition"
              >
                Tambah
              </button>
            </form>

            {/* Checklist List */}
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {projectTasks.map(task => {
                const isCompleted = task.status === 'Completed';
                return (
                  <div
                    key={task.id}
                    onClick={() => handleToggleTaskStatus(task)}
                    className="flex justify-between items-center p-2.5 bg-slate-50 hover:bg-slate-100/50 rounded-xl cursor-pointer transition"
                  >
                    <div className="flex items-center space-x-2.5">
                      {isCompleted ? (
                        <CheckSquare className="text-emerald-500 shrink-0" size={16} />
                      ) : (
                        <Square className="text-slate-400 shrink-0" size={16} />
                      )}
                      <span className={`text-xs ${isCompleted ? 'line-through text-slate-400' : 'text-slate-700 font-medium'}`}>
                        {task.name}
                      </span>
                    </div>
                    <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded ${
                      task.priority === 'High' ? 'bg-red-50 text-red-600' :
                      task.priority === 'Medium' ? 'bg-amber-50 text-amber-600' : 'bg-slate-200 text-slate-500'
                    }`}>
                      {task.priority}
                    </span>
                  </div>
                );
              })}

              {projectTasks.length === 0 && (
                <div className="py-12 text-center text-slate-400 text-xs">
                  Belum ada daftar tugas. Tambahkan tugas baru di atas untuk melacak kemajuan project!
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white p-12 rounded-2xl border border-slate-100 shadow-sm text-center text-slate-400 text-xs">
          Silakan buat project baru atau pilih project untuk mengelola daftar tugas.
        </div>
      )}

      {/* --- ADD PROJECT MODAL --- */}
      {showAddProjectModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl max-w-md w-full overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-extrabold text-sm text-slate-800 text-left">Buat Project Baru</h3>
              <button onClick={() => setShowAddProjectModal(false)} className="text-slate-400 hover:text-slate-700 font-bold">✕</button>
            </div>
            <form onSubmit={handleAddProjectSubmit} className="p-6 space-y-4 text-left">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Nama Project *</label>
                <input
                  type="text"
                  required
                  value={newProjectForm.name}
                  onChange={(e) => setNewProjectForm({ ...newProjectForm, name: e.target.value })}
                  placeholder="Contoh: Website Profil Pondok Pesantren"
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Deskripsi Project *</label>
                <textarea
                  required
                  value={newProjectForm.description}
                  onChange={(e) => setNewProjectForm({ ...newProjectForm, description: e.target.value })}
                  placeholder="Deskripsikan cakupan milestone project..."
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-xs h-16"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Tanggal Mulai *</label>
                  <input
                    type="date"
                    required
                    value={newProjectForm.start_date}
                    onChange={(e) => setNewProjectForm({ ...newProjectForm, start_date: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Target Selesai *</label>
                  <input
                    type="date"
                    required
                    value={newProjectForm.end_date}
                    onChange={(e) => setNewProjectForm({ ...newProjectForm, end_date: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg text-xs"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Assign Ke Staff *</label>
                <select
                  value={newProjectForm.assigned_to}
                  onChange={(e) => setNewProjectForm({ ...newProjectForm, assigned_to: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-xs"
                >
                  <option value="IT Developer">IT Developer</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Customer Service">Customer Service</option>
                  <option value="Super Admin">Super Admin</option>
                </select>
              </div>
              <div className="pt-4 flex justify-end space-x-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddProjectModal(false)}
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
                  <span>Simpan Project</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- AI REPORT RESULTS MODAL --- */}
      {aiReportHtml && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-indigo-50 text-indigo-900">
              <div className="flex items-center space-x-2">
                <Sparkles className="text-indigo-600 animate-pulse" size={18} />
                <h3 className="font-extrabold text-sm">Draft Laporan Status AI - EduTech</h3>
              </div>
              <button onClick={() => setAiReportHtml(null)} className="text-indigo-900 hover:text-red-600 font-bold text-sm">✕</button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh] text-left text-slate-800 prose prose-slate text-xs space-y-4">
              <div dangerouslySetInnerHTML={{ __html: aiReportHtml }} />
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center text-xs">
              <p className="text-slate-400">Generated powered by Gemini 2.5 Flash</p>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(aiReportHtml.replace(/<[^>]*>/g, ''));
                  alert('Laporan berhasil disalin ke clipboard!');
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition"
              >
                Salin Teks Laporan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
