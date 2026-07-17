/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  FileText,
  MessageSquare,
  Mail,
  Calendar,
  Settings,
  GitBranch,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  Cpu
} from 'lucide-react';

interface SidebarProps {
  selectedTab: string;
  setSelectedTab: (tab: string) => void;
  role: 'Super Admin' | 'IT Developer' | 'Marketing' | 'Customer Service' | 'Client';
  collapsed: boolean;
  setCollapsed: (c: boolean) => void;
}

export default function Sidebar({
  selectedTab,
  setSelectedTab,
  role,
  collapsed,
  setCollapsed
}: SidebarProps) {
  // Determine menu items based on role (RBAC)
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['Super Admin', 'IT Developer', 'Marketing', 'Customer Service', 'Client'] },
    { id: 'services', label: 'Layanan EduTech', icon: Briefcase, roles: ['Super Admin', 'IT Developer', 'Marketing'] },
    { id: 'clients', label: 'Clients CRM', icon: Users, roles: ['Super Admin', 'Marketing', 'Customer Service'] },
    { id: 'leads', label: 'Leads Tracker', icon: UserCheck, roles: ['Super Admin', 'Marketing'] },
    { id: 'orders', label: 'Order Manager', icon: TrendingUp, roles: ['Super Admin', 'Marketing'] },
    { id: 'projects', label: 'Project Board', icon: Briefcase, roles: ['Super Admin', 'IT Developer', 'Marketing', 'Client'] },
    { id: 'invoices', label: 'Invoices & Pay', icon: FileText, roles: ['Super Admin', 'Marketing', 'Customer Service', 'Client'] },
    { id: 'documents', label: 'DMS Drive Center', icon: FileText, roles: ['Super Admin', 'IT Developer', 'Marketing', 'Customer Service', 'Client'] },
    { id: 'finances', label: 'Keuangan Suite', icon: TrendingUp, roles: ['Super Admin', 'Marketing'] },
    { id: 'staff', label: 'Manajemen Staff', icon: Users, roles: ['Super Admin'] },
    { id: 'gmail', label: 'Gmail Center', icon: Mail, roles: ['Super Admin', 'IT Developer', 'Customer Service'] },
    { id: 'calendar', label: 'Calendar Events', icon: Calendar, roles: ['Super Admin', 'IT Developer', 'Customer Service', 'Client'] },
    { id: 'tickets', label: 'Support Tickets', icon: MessageSquare, roles: ['Super Admin', 'IT Developer', 'Customer Service', 'Client'] },
    { id: 'referrals', label: 'Referral & Comm', icon: GitBranch, roles: ['Super Admin', 'IT Developer', 'Marketing', 'Client'] },
    { id: 'apps-script', label: 'Apps Script Engine', icon: Cpu, roles: ['Super Admin', 'IT Developer'] },
    { id: 'settings', label: 'Settings', icon: Settings, roles: ['Super Admin', 'IT Developer'] }
  ];

  const allowedItems = menuItems.filter(item => item.roles.includes(role));

  return (
    <motion.div
      id="sidebar-container"
      animate={{ width: collapsed ? '4.5rem' : '16rem' }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      className="bg-slate-900 text-slate-200 h-screen flex flex-col border-r border-slate-800 shadow-xl relative z-10"
    >
      {/* Brand Header */}
      <div className="p-4 flex items-center justify-between border-b border-slate-800 h-16 overflow-hidden">
        <div className="flex items-center space-x-3 shrink-0">
          <img
            id="company-logo"
            src="https://edutechnusantaradigital.github.io/assets/images/logo.png"
            alt="EduTech Logo"
            className="w-8 h-8 rounded"
          />
          {!collapsed && (
            <span className="font-bold text-sm tracking-tight text-white uppercase">
              EduTech CRM
            </span>
          )}
        </div>
        <button
          id="toggle-sidebar-btn"
          onClick={() => setCollapsed(!collapsed)}
          className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Role Badge */}
      {!collapsed && (
        <div className="px-4 py-3 bg-slate-950/40 border-b border-slate-800/60 flex items-center space-x-2 shrink-0">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-xs text-slate-400 font-medium tracking-wide truncate">
            Akses: {role}
          </span>
        </div>
      )}

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-1 scrollbar-thin scrollbar-thumb-slate-800">
        {allowedItems.map(item => {
          const Icon = item.icon;
          const isActive = selectedTab === item.id;
          return (
            <button
              id={`sidebar-link-${item.id}`}
              key={item.id}
              onClick={() => setSelectedTab(item.id)}
              className={`w-full flex items-center p-3 rounded-lg text-sm font-medium transition duration-200 group relative ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
              }`}
            >
              <Icon size={18} className={`shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`} />
              {!collapsed && (
                <span className="ml-3 transition-opacity duration-300">
                  {item.label}
                </span>
              )}
              {collapsed && (
                <div className="absolute left-16 bg-slate-950 text-white text-xs rounded px-2 py-1 opacity-0 pointer-events-none group-hover:opacity-100 transition duration-150 shadow-md whitespace-nowrap z-50">
                  {item.label}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800 text-center text-xs text-slate-500 shrink-0">
        {!collapsed ? (
          <div>
            <p className="font-semibold text-slate-400">EduTech CRM v1.0</p>
            <p className="mt-0.5 text-[10px]">Cloud Spreadsheet DB</p>
          </div>
        ) : (
          <span className="font-bold text-[10px] text-slate-400">v1</span>
        )}
      </div>
    </motion.div>
  );
}
