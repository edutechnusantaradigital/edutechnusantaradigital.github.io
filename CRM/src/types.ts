/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Super Admin' | 'IT Developer' | 'Marketing' | 'Customer Service' | 'Client';
  status: 'Active' | 'Inactive';
  avatar?: string;
  created_at: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  whatsapp: string;
  address: string;
  npwp?: string;
  nik?: string;
  pic: string;
  website?: string;
  status: 'Active' | 'Inactive' | 'Blacklist';
  avatar?: string;
  created_at: string;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  whatsapp: string;
  source: string;
  status: 'Lead' | 'Negotiation' | 'Deal' | 'Lost';
  notes: string;
  assigned_to?: string;
  created_at: string;
}

export interface Order {
  id: string;
  client_id: string;
  client_name?: string;
  service_category: string;
  service_package: string;
  amount: number;
  notes: string;
  status: 'Lead' | 'Negotiation' | 'Deal' | 'DP' | 'Progress' | 'Selesai' | 'Cancel';
  created_at: string;
  completed_at?: string;
}

export interface Project {
  id: string;
  order_id: string;
  name: string;
  description: string;
  status: 'To Do' | 'On Progress' | 'Testing' | 'Revision' | 'Completed';
  progress: number; // 0 to 100
  start_date: string;
  end_date: string;
  assigned_to: string; // User ID or Name
  created_at: string;
}

export interface ProjectTask {
  id: string;
  project_id: string;
  name: string;
  status: 'Pending' | 'Completed';
  priority: 'Low' | 'Medium' | 'High';
  due_date: string;
  assigned_to: string;
}

export interface ProjectTimeline {
  id: string;
  project_id: string;
  title: string;
  description: string;
  date: string;
}

export interface Invoice {
  id: string;
  order_id: string;
  client_id: string;
  client_name?: string;
  subtotal: number;
  tax: number;
  discount: number;
  grand_total: number;
  status: 'Draft' | 'Unpaid' | 'Partial' | 'Paid' | 'Expired';
  due_date: string;
  created_at: string;
}

export interface Payment {
  id: string;
  invoice_id: string;
  amount: number;
  bank_id: string;
  proof_url?: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  created_at: string;
  verified_by?: string;
  notes?: string;
}

export interface Bank {
  id: string;
  bank_name: string;
  account_number: string;
  account_name: string;
}

export interface Ticket {
  id: string;
  client_id: string;
  client_name?: string;
  title: string;
  category: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  status: 'Open' | 'Progress' | 'Solved' | 'Closed';
  description: string;
  created_at: string;
  updated_at: string;
}

export interface TicketChat {
  id: string;
  ticket_id: string;
  sender_id: string;
  sender_name: string;
  sender_avatar?: string;
  sender_role: string;
  message: string;
  timestamp: string;
}

export interface Document {
  id: string;
  client_id: string;
  client_name?: string;
  name: string;
  type: string; // Contract, Invoice, Project, Backup, etc.
  drive_url: string;
  created_at: string;
}

export interface FinanceLog {
  id: string;
  type: 'INCOME' | 'EXPENSE';
  amount: number;
  category: string;
  description: string;
  date: string;
  created_at: string;
}

export interface Referral {
  id: string;
  client_id: string;
  client_name?: string;
  code: string;
  clicks: number;
  leads_converted: number;
  created_at: string;
}

export interface Commission {
  id: string;
  referral_id: string;
  client_name?: string;
  amount: number;
  status: 'Pending' | 'Approved' | 'Paid';
  created_at: string;
}

export interface HostingInfo {
  id: string;
  client_id: string;
  client_name?: string;
  provider: string;
  package: string;
  price: number;
  expiry_date: string;
  status: 'Active' | 'Expired' | 'Suspended';
}

export interface DomainInfo {
  id: string;
  client_id: string;
  client_name?: string;
  domain_name: string;
  registrar: string;
  expiry_date: string;
  status: 'Active' | 'Expired';
}

export interface ServerInfo {
  id: string;
  client_id: string;
  client_name?: string;
  ip_address: string;
  provider: string;
  expiry_date: string;
  status: 'Active' | 'Expired';
}

export interface ActivityLog {
  id: string;
  user_name: string;
  action: string;
  details: string;
  timestamp: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  is_read: boolean;
  timestamp: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export interface Setting {
  company_name: string;
  logo: string;
  website: string;
  whatsapp: string;
  address: string;
  email: string;
  bank_name: string;
  bank_account: string;
  bank_recipient: string;
  qris_url?: string;
  timezone: string;
  language: string;
}
