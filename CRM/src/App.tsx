/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  googleSignIn,
  logoutUser,
  initAuth,
  getAccessToken
} from './firebase-auth';
import {
  User,
  Client,
  Order,
  Project,
  ProjectTask,
  Invoice,
  Payment,
  Ticket,
  TicketChat,
  FinanceLog,
  Referral,
  Commission
} from './types';

// Component imports
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardView from './components/DashboardView';
import ClientsView from './components/ClientsView';
import LeadTrackingView from './components/LeadTrackingView';
import ProjectsView from './components/ProjectsView';
import InvoicesView from './components/InvoicesView';
import TicketsView from './components/TicketsView';
import WorkspaceView from './components/WorkspaceView';
import ServicesView from './components/ServicesView';
import FinancesView from './components/FinancesView';
import StaffView from './components/StaffView';
import AffiliateView from './components/AffiliateView';
import LoginView from './components/LoginView';
import DocumentsView from './components/DocumentsView';
import AppsScriptView from './components/AppsScriptView';

import {
  Sparkles,
  ShieldAlert,
  Loader2,
  Lock,
  GitBranch,
  Settings,
  DollarSign,
  UserCheck,
  Smartphone
} from 'lucide-react';

const uniqueById = <T extends { id?: string | number }>(arr: T[]): T[] => {
  if (!Array.isArray(arr)) return [];
  const seen = new Set();
  return arr.filter(item => {
    if (!item || !item.id) return true;
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
};

export default function App() {
  const [user, setUser] = useState<any | null>(null);
  const [originalUser, setOriginalUser] = useState<any | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [spreadsheetId, setSpreadsheetId] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [loadingData, setLoadingData] = useState(false);

  // Active View and Showcase RBAC Role
  const [selectedTab, setSelectedTab] = useState('dashboard');
  const [collapsed, setCollapsed] = useState(false);
  const [activeRole, setActiveRole] = useState<'Super Admin' | 'IT Developer' | 'Marketing' | 'Customer Service' | 'Client'>('Super Admin');
  const [notificationsCount, setNotificationsCount] = useState(2);

  // Database Data state
  const [clients, setClients] = useState<Client[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<ProjectTask[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [chats, setChats] = useState<TicketChat[]>([]);
  const [finances, setFinances] = useState<FinanceLog[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [servicesList, setServicesList] = useState<any[]>([]);
  const [staffList, setStaffList] = useState<any[]>([]);
  const [widgetsList, setWidgetsList] = useState<any[]>([]);
  const [cashoutsList, setCashoutsList] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);

  // Workspace integration states
  const [gmails, setGmails] = useState<any[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
  const [loadingGmail, setLoadingGmail] = useState(false);
  const [loadingCalendar, setLoadingCalendar] = useState(false);

  // Settings state
  const [companySettings, setCompanySettings] = useState({
    company_name: 'EduTech Nusantara Digital',
    company_email: 'info@edutechnusantaradigital.com',
    whatsapp: '087850934303',
    manager_name: 'Direktur Utama'
  });

  // Global search query
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Initialize Auth on Mount
  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser, currentToken) => {
        setUser(currentUser);
        setToken(currentToken);
        initializeSpreadsheet(currentToken);
      },
      () => {
        setUser(null);
        setToken(null);
        setInitializing(false);
      }
    );
    return () => unsubscribe();
  }, []);

  // 2. Setup Spreadsheet DB connection
  const initializeSpreadsheet = async (oauthToken: string) => {
    try {
      const response = await fetch('/api/init', {
        headers: {
          Authorization: `Bearer ${oauthToken}`
        }
      });
      if (!response.ok) throw new Error('Database initialization rejected');
      const data = await response.json();
      setSpreadsheetId(data.spreadsheetId);
      if (data.settings) {
        setCompanySettings(data.settings);
      }
      // Save sheet ID to state & fetch full operational boards
      await fetchAllBoards(oauthToken, data.spreadsheetId);
    } catch (err) {
      console.error('Error auto-initializing sheet DB:', err);
    } finally {
      setInitializing(false);
    }
  };

  // 3. Fetch board tables from Sheets
  const fetchAllBoards = async (oauthToken: string, sheetId: string) => {
    setLoadingData(true);
    const headers = {
      Authorization: `Bearer ${oauthToken}`,
      'spreadsheet-id': sheetId
    };

    try {
      // Parallel fetches for speed & clean load
      const [
        clientsRes,
        ordersRes,
        projectsRes,
        invoicesRes,
        paymentsRes,
        ticketsRes,
        financesRes,
        referralsRes,
        servicesRes,
        staffRes,
        widgetsRes,
        cashoutsRes,
        documentsRes
      ] = await Promise.all([
        fetch('/api/clients', { headers }),
        fetch('/api/orders', { headers }),
        fetch('/api/projects', { headers }),
        fetch('/api/invoices', { headers }),
        fetch('/api/payments', { headers }),
        fetch('/api/tickets', { headers }),
        fetch('/api/finance', { headers }),
        fetch('/api/referrals', { headers }),
        fetch('/api/services', { headers }),
        fetch('/api/staff', { headers }),
        fetch('/api/dashboard/widgets', { headers }),
        fetch('/api/commissions/cashouts', { headers }),
        fetch('/api/documents', { headers })
      ]);

      if (clientsRes.ok) setClients(uniqueById(await clientsRes.json()));
      if (ordersRes.ok) setOrders(uniqueById(await ordersRes.json()));
      
      if (projectsRes.ok) {
        const projData = await projectsRes.json();
        setProjects(uniqueById(projData.projects || []));
        setTasks(uniqueById(projData.tasks || []));
      }

      if (invoicesRes.ok) setInvoices(uniqueById(await invoicesRes.json()));
      if (paymentsRes.ok) setPayments(uniqueById(await paymentsRes.json()));
      
      if (ticketsRes.ok) {
        const ticketList = await ticketsRes.json();
        setTickets(uniqueById(ticketList));
        // Load chats for active tickets
        if (ticketList.length > 0) {
          const firstTicketId = ticketList[0].id;
          const chatRes = await fetch(`/api/tickets/${firstTicketId}/chats`, { headers });
          if (chatRes.ok) setChats(uniqueById(await chatRes.json()));
        }
      }

      if (financesRes.ok) setFinances(uniqueById(await financesRes.json()));
      
      if (referralsRes.ok) {
        const refData = await referralsRes.json();
        setReferrals(uniqueById(refData.referrals || []));
        setCommissions(uniqueById(refData.commissions || []));
      }

      if (servicesRes.ok) setServicesList(uniqueById(await servicesRes.json()));
      if (staffRes.ok) setStaffList(uniqueById(await staffRes.json()));
      if (widgetsRes.ok) setWidgetsList(uniqueById(await widgetsRes.json()));
      if (cashoutsRes.ok) setCashoutsList(uniqueById(await cashoutsRes.json()));
      if (documentsRes.ok) setDocuments(uniqueById(await documentsRes.json()));

      // Pre-load Gmail & Calendar
      fetchGmailInbox(oauthToken);
      fetchCalendarAgenda(oauthToken);

    } catch (err) {
      console.error('Error fetching CRM board tables:', err);
    } finally {
      setLoadingData(false);
    }
  };

  // Google Workspace APIs fetch proxies
  const fetchGmailInbox = async (oauthToken: string) => {
    setLoadingGmail(true);
    try {
      const res = await fetch('/api/gmail/inbox', {
        headers: { Authorization: `Bearer ${oauthToken}` }
      });
      if (res.ok) setGmails(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingGmail(false);
    }
  };

  const fetchCalendarAgenda = async (oauthToken: string) => {
    setLoadingCalendar(true);
    try {
      const res = await fetch('/api/calendar/events', {
        headers: { Authorization: `Bearer ${oauthToken}` }
      });
      if (res.ok) setCalendarEvents(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingCalendar(false);
    }
  };

  // 4. CRUD operations triggered from client UI callbacks
  const handleAddClient = async (clientData: any) => {
    if (!token || !spreadsheetId) return;
    const res = await fetch('/api/clients', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'spreadsheet-id': spreadsheetId,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(clientData)
    });
    if (res.ok) {
      const saved = await res.json();
      setClients([...clients, saved]);
      return saved;
    }
  };

  const handleUpdateClient = async (id: string, updatedData: any) => {
    if (!token || !spreadsheetId) return;
    const res = await fetch(`/api/clients/${id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'spreadsheet-id': spreadsheetId,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updatedData)
    });
    if (res.ok) {
      setClients(clients.map(c => c.id === id ? { ...c, ...updatedData } : c));
    }
  };

  const handleAddOrder = async (orderData: any) => {
    if (!token || !spreadsheetId) return;
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'spreadsheet-id': spreadsheetId,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(orderData)
    });
    if (res.ok) {
      const saved = await res.json();
      setOrders([...orders, saved]);
      return saved;
    }
  };

  const handleUpdateOrder = async (id: string, updatedData: any) => {
    if (!token || !spreadsheetId) return;
    const res = await fetch(`/api/orders/${id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'spreadsheet-id': spreadsheetId,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updatedData)
    });
    if (res.ok) {
      setOrders(orders.map(o => o.id === id ? { ...o, ...updatedData } : o));
    }
  };

  const handleAddProject = async (projectData: any) => {
    if (!token || !spreadsheetId) return;
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'spreadsheet-id': spreadsheetId,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(projectData)
    });
    if (res.ok) {
      const saved = await res.json();
      setProjects([...projects, saved]);
      return saved;
    }
  };

  const handleUpdateProject = async (id: string, updatedData: any) => {
    if (!token || !spreadsheetId) return;
    const res = await fetch(`/api/projects/${id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'spreadsheet-id': spreadsheetId,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updatedData)
    });
    if (res.ok) {
      setProjects(projects.map(p => p.id === id ? { ...p, ...updatedData } : p));
    }
  };

  const handleAddTask = async (projectId: string, taskData: any) => {
    if (!token || !spreadsheetId) return;
    const res = await fetch(`/api/projects/${projectId}/tasks`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'spreadsheet-id': spreadsheetId,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(taskData)
    });
    if (res.ok) {
      const saved = await res.json();
      setTasks([...tasks, saved]);
      return saved;
    }
  };

  const handleUpdateTask = async (taskId: string, updatedData: any) => {
    if (!token || !spreadsheetId) return;
    const res = await fetch(`/api/projects/tasks/${taskId}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'spreadsheet-id': spreadsheetId,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updatedData)
    });
    if (res.ok) {
      setTasks(tasks.map(t => t.id === taskId ? { ...t, ...updatedData } : t));
    }
  };

  const handleAddInvoice = async (invData: any) => {
    if (!token || !spreadsheetId) return;
    const res = await fetch('/api/invoices', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'spreadsheet-id': spreadsheetId,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(invData)
    });
    if (res.ok) {
      const saved = await res.json();
      setInvoices([...invoices, saved]);
      return saved;
    }
  };

  const handleUpdateInvoice = async (id: string, updatedData: any) => {
    if (!token || !spreadsheetId) return;
    const res = await fetch(`/api/invoices/${id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'spreadsheet-id': spreadsheetId,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updatedData)
    });
    if (res.ok) {
      setInvoices(invoices.map(i => i.id === id ? { ...i, ...updatedData } : i));
    }
  };

  const handleAddPayment = async (payData: any) => {
    if (!token || !spreadsheetId) return;
    const res = await fetch('/api/payments', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'spreadsheet-id': spreadsheetId,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payData)
    });
    if (res.ok) {
      const saved = await res.json();
      setPayments([...payments, saved]);
      return saved;
    }
  };

  const handleUpdatePayment = async (id: string, updatedData: any) => {
    if (!token || !spreadsheetId) return;
    const res = await fetch(`/api/payments/${id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'spreadsheet-id': spreadsheetId,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updatedData)
    });
    if (res.ok) {
      setPayments(payments.map(p => p.id === id ? { ...p, ...updatedData } : p));
    }
  };

  const handleAddTicket = async (tktData: any) => {
    if (!token || !spreadsheetId) return;
    const res = await fetch('/api/tickets', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'spreadsheet-id': spreadsheetId,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(tktData)
    });
    if (res.ok) {
      const saved = await res.json();
      setTickets([...tickets, saved]);
      return saved;
    }
  };

  const handleUpdateTicket = async (id: string, updatedData: any) => {
    if (!token || !spreadsheetId) return;
    const res = await fetch(`/api/tickets/${id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'spreadsheet-id': spreadsheetId,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updatedData)
    });
    if (res.ok) {
      setTickets(tickets.map(t => t.id === id ? { ...t, ...updatedData } : t));
    }
  };

  const handleAddChat = async (ticketId: string, chatMsg: any) => {
    if (!token || !spreadsheetId) return;
    const res = await fetch(`/api/tickets/${ticketId}/chats`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'spreadsheet-id': spreadsheetId,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(chatMsg)
    });
    if (res.ok) {
      const saved = await res.json();
      setChats([...chats, saved]);
      return saved;
    }
  };

  const handleAddFinance = async (finData: any) => {
    if (!token || !spreadsheetId) return;
    const res = await fetch('/api/finance', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'spreadsheet-id': spreadsheetId,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(finData)
    });
    if (res.ok) {
      const saved = await res.json();
      setFinances(uniqueById([...finances, saved]));
      return saved;
    }
  };

  const handleAddService = async (svcData: any) => {
    if (!token || !spreadsheetId) return;
    const res = await fetch('/api/services', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'spreadsheet-id': spreadsheetId,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(svcData)
    });
    if (res.ok) {
      const saved = await res.json();
      setServicesList(uniqueById([...servicesList, saved]));
      return saved;
    }
  };

  const handleUpdateService = async (id: string, updatedData: any) => {
    if (!token || !spreadsheetId) return;
    const res = await fetch(`/api/services/${id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'spreadsheet-id': spreadsheetId,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updatedData)
    });
    if (res.ok) {
      setServicesList(servicesList.map(s => s.id === id ? { ...s, ...updatedData } : s));
    }
  };

  const handleDeleteService = async (id: string) => {
    if (!token || !spreadsheetId) return;
    const res = await fetch(`/api/services/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
        'spreadsheet-id': spreadsheetId
      }
    });
    if (res.ok) {
      setServicesList(servicesList.map(s => s.id === id ? { ...s, status: 'Inactive' } : s));
    }
  };

  const handleAddStaff = async (staffData: any) => {
    if (!token || !spreadsheetId) return;
    const res = await fetch('/api/staff', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'spreadsheet-id': spreadsheetId,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(staffData)
    });
    if (res.ok) {
      const saved = await res.json();
      setStaffList(uniqueById([...staffList, saved]));
      return saved;
    }
  };

  const handleUpdateStaff = async (id: string, updatedData: any) => {
    if (!token || !spreadsheetId) return;
    const res = await fetch(`/api/staff/${id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'spreadsheet-id': spreadsheetId,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updatedData)
    });
    if (res.ok) {
      setStaffList(staffList.map(s => s.id === id ? { ...s, ...updatedData } : s));
    }
  };

  const handleDeleteStaff = async (id: string) => {
    if (!token || !spreadsheetId) return;
    const res = await fetch(`/api/staff/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
        'spreadsheet-id': spreadsheetId
      }
    });
    if (res.ok) {
      setStaffList(staffList.filter(s => s.id !== id));
    } else {
      // Fallback: archive status if hard delete route is locked or not permitted
      await handleUpdateStaff(id, { status: 'Arsip' });
    }
  };

  const handleLoginAs = (targetUser: any) => {
    if (!originalUser) {
      setOriginalUser(user);
    }
    setUser({
      ...targetUser,
      displayName: targetUser.name,
      photoURL: targetUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'
    });
    setActiveRole(targetUser.role || 'Client');
    setNotificationsCount(prev => prev + 1);
    setSelectedTab('dashboard');
  };

  const handleExitImpersonation = () => {
    if (originalUser) {
      setUser(originalUser);
      setActiveRole(originalUser.role || 'Super Admin');
      setOriginalUser(null);
      setSelectedTab('staff');
    }
  };

  const handleUpdateWidgetsLayout = async (updatedWidgets: any[]) => {
    if (!token || !spreadsheetId) return;
    const res = await fetch('/api/dashboard/widgets/layout', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'spreadsheet-id': spreadsheetId,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ widgets: updatedWidgets })
    });
    if (res.ok) {
      setWidgetsList(updatedWidgets);
    }
  };

  const handleAddCashout = async (cashData: any) => {
    if (!token || !spreadsheetId) return;
    const res = await fetch('/api/commissions/cashouts', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'spreadsheet-id': spreadsheetId,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(cashData)
    });
    if (res.ok) {
      const saved = await res.json();
      setCashoutsList(uniqueById([...cashoutsList, saved]));
      return saved;
    }
  };

  const handleUpdateCashout = async (id: string, updatedData: any) => {
    if (!token || !spreadsheetId) return;
    const res = await fetch(`/api/commissions/cashouts/${id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'spreadsheet-id': spreadsheetId,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updatedData)
    });
    if (res.ok) {
      setCashoutsList(cashoutsList.map(c => c.id === id ? { ...c, ...updatedData } : c));
    }
  };

  const handleUploadDocument = async (docData: any) => {
    if (!token || !spreadsheetId) return;
    const res = await fetch('/api/documents', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'spreadsheet-id': spreadsheetId,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(docData)
    });
    if (res.ok) {
      const saved = await res.json();
      setDocuments(uniqueById([...documents, saved]));
      return saved;
    }
  };

  const handleGeneratePDF = async (pdfData: any) => {
    if (!token || !spreadsheetId) return;
    const res = await fetch('/api/documents/generate-pdf', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'spreadsheet-id': spreadsheetId,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(pdfData)
    });
    if (res.ok) {
      const saved = await res.json();
      setDocuments(uniqueById([...documents, saved]));
      return saved;
    }
  };

  const handleUpdateDocument = async (id: string, updatedData: any) => {
    if (!token || !spreadsheetId) return;
    const res = await fetch(`/api/documents/${id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'spreadsheet-id': spreadsheetId,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updatedData)
    });
    if (res.ok) {
      setDocuments(documents.map(d => d.id === id ? { ...d, ...updatedData } : d));
    }
  };

  const handleDeleteDocument = async (id: string) => {
    if (!token || !spreadsheetId) return;
    const res = await fetch(`/api/documents/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
        'spreadsheet-id': spreadsheetId
      }
    });
    if (res.ok) {
      setDocuments(documents.filter(d => d.id !== id));
    }
  };

  // Google API send Email callback
  const handleSendEmail = async (emailForm: any) => {
    if (!token) return;
    const res = await fetch('/api/gmail/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(emailForm)
    });
    if (res.ok) {
      // Re-fetch inbox
      fetchGmailInbox(token);
      return await res.json();
    }
  };

  // Google Calendar scheduling callback
  const handleAddCalendarEvent = async (eventForm: any) => {
    if (!token) return;
    const res = await fetch('/api/calendar/events', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(eventForm)
    });
    if (res.ok) {
      fetchCalendarAgenda(token);
      return await res.json();
    }
  };

  // Gemini project report summary
  const handleGenerateProjectReport = async (project: Project, projTasks: ProjectTask[]) => {
    if (!token) return '';
    const res = await fetch('/api/gemini/summarize-project', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ project, tasks: projTasks })
    });
    if (res.ok) {
      const data = await res.json();
      return data.summary;
    }
    return 'Gagal menyusun laporan otomatis.';
  };

  // Gemini customer support ticket helper suggestion
  const handleGenerateTicketSuggestion = async (ticket: Ticket) => {
    if (!token) return '';
    const res = await fetch('/api/gemini/reply-suggestion', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ ticket })
    });
    if (res.ok) {
      const data = await res.json();
      return data.reply;
    }
    return '';
  };

  // Handle user authentication pop-ups
  const handleLogin = async () => {
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setToken(result.accessToken);
        initializeSpreadsheet(result.accessToken);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCredentialSignIn = async (credential: string, password: string, rememberMe: boolean) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential, password })
    });
    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || 'Login gagal.');
    }
    const data = await res.json();
    setUser(data.user);
    setToken(data.token);
    setActiveRole(data.user.role);
    initializeSpreadsheet(data.token);
    return data;
  };

  const handleResetPassword = async (email: string) => {
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    if (!res.ok) {
      const errData = await res.json();
      return { success: false, message: errData.error || 'Gagal mereset sandi.' };
    }
    const data = await res.json();
    return { success: true, message: data.message };
  };

  const handleLogout = async () => {
    await logoutUser();
    setUser(null);
    setToken(null);
    setSpreadsheetId(null);
  };

  // Save Settings to Google Sheets SETTING row
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !spreadsheetId) return;
    const res = await fetch('/api/settings', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'spreadsheet-id': spreadsheetId,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(companySettings)
    });
    if (res.ok) {
      alert('Konfigurasi instansi berhasil disimpan dan diperbarui langsung di Google Sheets!');
    }
  };

  // 5. Auth Cover Welcome Layout
  if (!user) {
    return (
      <LoginView
        onGoogleSignIn={handleLogin}
        onCredentialSignIn={handleCredentialSignIn}
        onResetPassword={handleResetPassword}
        loading={initializing}
      />
    );
  }

  // 6. Loading Operational data state
  if (initializing) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center text-slate-300" id="initializing-spinner">
        <Loader2 className="animate-spin text-indigo-500 mb-4" size={32} />
        <p className="text-sm font-semibold tracking-wide">Menginisialisasi Database Cloud Sheets...</p>
      </div>
    );
  }

  return (
    <div className="flex bg-slate-50 min-h-screen text-slate-700 font-sans" id="applet-viewport">
      {/* Dynamic Navigation Sidebar */}
      <Sidebar
        selectedTab={selectedTab}
        setSelectedTab={setSelectedTab}
        role={activeRole}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {originalUser && (
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 px-5 py-2.5 text-xs font-black flex items-center justify-between shadow-lg relative z-50 shrink-0">
            <span className="flex items-center gap-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-900 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-slate-950"></span>
              </span>
              <span>⚠️ Anda saat ini masuk sebagai <strong>{user?.name || user?.displayName}</strong> ({activeRole}). Menggunakan simulasi sistem <strong>"Login Sebagai"</strong>.</span>
            </span>
            <button
              onClick={handleExitImpersonation}
              className="bg-slate-950 text-white hover:bg-slate-900 px-3.5 py-1.5 rounded-xl font-extrabold transition text-[11px] uppercase tracking-wider"
            >
              Keluar Simulasi
            </button>
          </div>
        )}
        {/* Global Toolbar Header */}
        <Header
          user={user}
          spreadsheetId={spreadsheetId}
          activeRole={activeRole}
          setActiveRole={setActiveRole}
          onLogout={handleLogout}
          onSearch={setSearchQuery}
          notificationsCount={notificationsCount}
          onClearNotifications={() => setNotificationsCount(0)}
        />

        {/* Scrollable View Panel */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-50/50">
          {loadingData ? (
            <div className="h-full flex flex-col justify-center items-center text-slate-400">
              <Loader2 className="animate-spin text-indigo-600 mb-3" size={32} />
              <p className="text-xs font-semibold">Mensinkronisasi tabel Google Spreadsheet...</p>
            </div>
          ) : (
            <>
              {/* Tab Mount router */}
              {selectedTab === 'dashboard' && (
                <DashboardView
                  clients={clients}
                  orders={orders}
                  projects={projects}
                  invoices={invoices}
                  tickets={tickets}
                  finances={finances}
                  role={activeRole}
                  widgets={widgetsList}
                  onUpdateWidgetsLayout={handleUpdateWidgetsLayout}
                />
              )}

              {selectedTab === 'services' && (
                <ServicesView
                  services={servicesList}
                  onAddService={handleAddService}
                  onUpdateService={handleUpdateService}
                  onDeleteService={handleDeleteService}
                  role={activeRole}
                />
              )}

              {selectedTab === 'finances' && (
                <FinancesView
                  finances={finances}
                  onAddFinance={handleAddFinance}
                />
              )}

              {selectedTab === 'staff' && (
                <StaffView
                  staffList={staffList}
                  onAddStaff={handleAddStaff}
                  onUpdateStaff={handleUpdateStaff}
                  role={activeRole}
                  onLoginAs={handleLoginAs}
                  onDeleteStaff={handleDeleteStaff}
                />
              )}

              {selectedTab === 'clients' && (
                <ClientsView
                  clients={clients}
                  orders={orders}
                  projects={projects}
                  tickets={tickets}
                  onAddClient={handleAddClient}
                  onUpdateClient={handleUpdateClient}
                />
              )}

              {selectedTab === 'leads' && (
                <LeadTrackingView
                  orders={orders}
                  clients={clients}
                  onAddOrder={handleAddOrder}
                  onUpdateOrder={handleUpdateOrder}
                />
              )}

              {selectedTab === 'orders' && (
                <LeadTrackingView
                  orders={orders}
                  clients={clients}
                  onAddOrder={handleAddOrder}
                  onUpdateOrder={handleUpdateOrder}
                />
              )}

              {selectedTab === 'projects' && (
                <ProjectsView
                  projects={projects}
                  tasks={tasks}
                  onAddProject={handleAddProject}
                  onUpdateProject={handleUpdateProject}
                  onAddTask={handleAddTask}
                  onUpdateTask={handleUpdateTask}
                  onGenerateReport={handleGenerateProjectReport}
                />
              )}

              {selectedTab === 'invoices' && (
                <InvoicesView
                  invoices={invoices}
                  clients={clients}
                  orders={orders}
                  payments={payments}
                  role={activeRole}
                  onAddInvoice={handleAddInvoice}
                  onUpdateInvoice={handleUpdateInvoice}
                  onAddPayment={handleAddPayment}
                  onUpdatePayment={handleUpdatePayment}
                />
              )}

              {selectedTab === 'gmail' && (
                <WorkspaceView
                  gmails={gmails}
                  calendarEvents={calendarEvents}
                  onSendEmail={handleSendEmail}
                  onAddCalendarEvent={handleAddCalendarEvent}
                  loadingGmail={loadingGmail}
                  loadingCalendar={loadingCalendar}
                />
              )}

              {selectedTab === 'calendar' && (
                <WorkspaceView
                  gmails={gmails}
                  calendarEvents={calendarEvents}
                  onSendEmail={handleSendEmail}
                  onAddCalendarEvent={handleAddCalendarEvent}
                  loadingGmail={loadingGmail}
                  loadingCalendar={loadingCalendar}
                />
              )}

              {selectedTab === 'tickets' && (
                <TicketsView
                  tickets={tickets}
                  clients={clients}
                  chats={chats}
                  role={activeRole}
                  userName={user?.displayName || user?.name || 'Admin'}
                  onAddTicket={handleAddTicket}
                  onUpdateTicket={handleUpdateTicket}
                  onAddChat={handleAddChat}
                  onGenerateSuggestion={handleGenerateTicketSuggestion}
                />
              )}

              {selectedTab === 'referrals' && (
                <AffiliateView
                  referrals={referrals}
                  commissions={commissions}
                  cashouts={cashoutsList}
                  currentUser={user}
                  onAddCashout={handleAddCashout}
                  onUpdateCashout={handleUpdateCashout}
                  role={activeRole}
                />
              )}

              {selectedTab === 'documents' && (
                <DocumentsView
                  documents={documents}
                  clients={clients}
                  onUploadDocument={handleUploadDocument}
                  onGeneratePDF={handleGeneratePDF}
                  onUpdateDocument={handleUpdateDocument}
                  onDeleteDocument={handleDeleteDocument}
                  role={activeRole}
                />
              )}

              {selectedTab === 'apps-script' && (
                <AppsScriptView
                  spreadsheetId={spreadsheetId}
                  token={token}
                />
              )}

              {selectedTab === 'settings' && (
                <div className="space-y-6 text-left max-w-2xl">
                  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex items-center space-x-2 border-b border-slate-100 pb-4 mb-6">
                      <Settings className="text-indigo-600" size={20} />
                      <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">Konfigurasi Instansi (SETTING)</h2>
                    </div>

                    <form onSubmit={handleSaveSettings} className="space-y-4">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Nama Instansi SaaS *</label>
                        <input
                          type="text"
                          required
                          value={companySettings.company_name}
                          onChange={(e) => setCompanySettings({ ...companySettings, company_name: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Email Korespondensi Resmi *</label>
                        <input
                          type="email"
                          required
                          value={companySettings.company_email}
                          onChange={(e) => setCompanySettings({ ...companySettings, company_email: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">WhatsApp Admin Utama *</label>
                        <input
                          type="text"
                          required
                          value={companySettings.whatsapp}
                          onChange={(e) => setCompanySettings({ ...companySettings, whatsapp: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Nama Penanggung Jawab *</label>
                        <input
                          type="text"
                          required
                          value={companySettings.manager_name}
                          onChange={(e) => setCompanySettings({ ...companySettings, manager_name: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-xs"
                        />
                      </div>

                      <div className="pt-4 border-t border-slate-100 flex justify-end">
                        <button
                          type="submit"
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition"
                        >
                          Simpan Konfigurasi
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
