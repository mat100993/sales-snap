
export interface Client {
  id: string;
  name: string;
  surname: string;
  company: string;
  phone: string;
  email: string;
  createdAt: Date;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  tags: string[];
  stock: number;
  status: 'in-stock' | 'out-of-stock' | 'on-command';
  imageUrl?: string;
  createdAt: Date;
}

export interface QuotationItem {
  productId: string;
  quantity: number;
  price: number;
  discount?: number;
}

export interface Quotation {
  id: string;
  clientId: string;
  items: QuotationItem[];
  total: number;
  status: 'draft' | 'sent' | 'accepted' | 'declined';
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SalesRep {
  id: string;
  name: string;
  group?: string;
  company?: string;
}

export interface DashboardStats {
  totalQuotations: number;
  totalClients: number;
  totalProducts: number;
  conversionRate: number;
}

export interface FilterOptions {
  salesRep?: string;
  group?: string;
  company?: string;
  dateRange?: [Date, Date];
  status?: Quotation['status'];
}
