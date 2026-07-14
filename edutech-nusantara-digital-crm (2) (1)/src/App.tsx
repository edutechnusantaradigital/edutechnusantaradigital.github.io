import React, { useState, useEffect } from 'react';
import { CRM_API } from './services/api';
import { User } from './types/crm';
import AuthPage from './components/AuthPage';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import AdminDashboard from './components/AdminDashboard';
import ClientDashboard from './components/ClientDashboard';
import ClientsManager from './components/ClientsManager';
import UsersManager from './components/UsersManager';
import ServicesManager from './components/ServicesManager';
import OrdersManager from './components/OrdersManager';
import ProgressManager from './components/ProgressManager';
import InvoicesManager from './components/InvoicesManager';
import PaymentsManager from './components/PaymentsManager';
import DocumentsManager from './components/DocumentsManager';
import ReportsManager from './components/ReportsManager';
import SettingsManager from './components/SettingsManager';
import ProfileManager from './components/ProfileManager';
import GoogleSheetsManager from './components/GoogleSheetsManager';

const defaultStats = {
  totalClients: 0,
  activeProjects: 0,
  completedProjects: 0,
  pendingInvoicesCount: 0,
  totalRevenue: 0,
  pendingRevenue: 0,
  revenueByMonth: [],
  ordersByCategory: []
};

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [darkMode, setDarkMode] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [stats, setStats] = useState<any>(null);

  // Initialize and check current user
  useEffect(() => {
    const user = CRM_API.getCurrentUser();
    if (user) {
      setCurrentUser(user);
      // set default starting tab based on role
      setActiveTab(user.role === 'CLIENT' ? 'dashboard-client' : 'dashboard');
    }

    // Read stored dark mode preference
    const savedDark = localStorage.getItem('theme_dark') === 'true';
    setDarkMode(savedDark);
  }, []);

  // Fetch stats when activeTab changes
  useEffect(() => {
    if (currentUser && currentUser.role !== 'Client') {
      CRM_API.getReports().then((data) => {
        setStats(data);
      });
    }
  }, [currentUser, activeTab]);

  // Sync dark mode class on document element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme_dark', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme_dark', 'false');
    }
  }, [darkMode]);

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setActiveTab(user.role === 'CLIENT' ? 'dashboard-client' : 'dashboard');
  };

  const handleLogout = () => {
    CRM_API.logout();
    setCurrentUser(null);
  };

  // Switch tabs programmatically
  const handleQuickAction = (action: 'client' | 'order' | 'invoice') => {
    if (action === 'client') setActiveTab('clients');
    if (action === 'order') setActiveTab('orders');
    if (action === 'invoice') setActiveTab('invoices');
  };

  // Render main tab layout based on selection and user roles
  const renderTabContent = () => {
    if (!currentUser) return null;

    const role = currentUser.role;
    
    // Strict RBAC Tab Protections
    const allowedTabs = {
      SUPER_ADMIN: ['dashboard', 'clients', 'users', 'services', 'orders', 'progress', 'invoices', 'payments', 'documents', 'reports', 'sheets', 'settings', 'profile'],
      IT: ['dashboard', 'services', 'progress', 'documents', 'sheets', 'profile'],
      MARKETING: ['dashboard', 'clients', 'services', 'orders', 'progress', 'invoices', 'payments', 'reports', 'profile'],
      CLIENT: ['dashboard-client', 'orders', 'progress', 'invoices', 'payments', 'documents', 'chats', 'profile']
    }[role] || [];

    if (!allowedTabs.includes(activeTab)) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
          <div className="p-4 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 rounded-full">
            <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">Akses Ditolak</h3>
          <p className="text-sm text-slate-500 max-w-sm">
            Anda tidak memiliki wewenang/hak akses untuk membuka menu ini.
          </p>
          <button
            onClick={() => setActiveTab(role === 'CLIENT' ? 'dashboard-client' : 'dashboard')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-sm transition"
          >
            Kembali ke Dashboard
          </button>
        </div>
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return (
          <AdminDashboard
            stats={stats || defaultStats}
            onNavigateToTab={setActiveTab}
            onQuickAction={handleQuickAction}
            role={role}
          />
        );
      case 'dashboard-client':
        return <ClientDashboard clientUser={currentUser} onNavigateToTab={setActiveTab} />;
      case 'clients':
        return <ClientsManager />;
      case 'users':
        return <UsersManager />;
      case 'services':
        return <ServicesManager />;
      case 'orders':
        return <OrdersManager />;
      case 'progress':
        return <ProgressManager />;
      case 'invoices':
        return <InvoicesManager />;
      case 'payments':
        return <PaymentsManager />;
      case 'documents':
        return <DocumentsManager />;
      case 'reports':
        return <ReportsManager />;
      case 'sheets':
        return <GoogleSheetsManager />;
      case 'settings':
        return <SettingsManager />;
      case 'profile':
        return <ProfileManager />;
      case 'chats':
        // Chat is beautifully embedded inside the client dashboard
        return <ClientDashboard clientUser={currentUser} onNavigateToTab={setActiveTab} />;
      default:
        return role === 'CLIENT' ? (
          <ClientDashboard clientUser={currentUser} onNavigateToTab={setActiveTab} />
        ) : (
          <AdminDashboard
            stats={stats || defaultStats}
            onNavigateToTab={setActiveTab}
            onQuickAction={handleQuickAction}
            role={role}
          />
        );
    }
  };

  // Render Auth page if no session exists
  if (!currentUser) {
    return <AuthPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-200">
      {/* Sidebar Navigation */}
      <Sidebar
        role={currentUser.role}
        userName={currentUser.name}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onLogout={handleLogout}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />

      {/* Main Panel Outer wrapper */}
      <div className={`transition-all duration-300 min-h-screen ${isCollapsed ? 'pl-20' : 'pl-64'}`}>
        
        {/* Top Header Navbar */}
        <Navbar
          user={currentUser}
          activeTab={activeTab}
          isCollapsed={isCollapsed}
          onLogout={handleLogout}
          onQuickAction={handleQuickAction}
        />

        {/* Content canvas container */}
        <main className="pt-24 pb-12 px-6 max-w-7xl mx-auto animate-fade-in">
          {renderTabContent()}
        </main>
      </div>
    </div>
  );
}
