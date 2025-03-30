
import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Client, 
  Product, 
  Quotation, 
  SalesRep,
  DashboardStats
} from '@/types';
import { toast } from "sonner";

// Sample data
const initialClients: Client[] = [
  {
    id: '1',
    name: 'John',
    surname: 'Doe',
    company: 'ABC Corp',
    phone: '+1234567890',
    email: 'john.doe@example.com',
    createdAt: new Date('2023-01-15')
  },
  {
    id: '2',
    name: 'Jane',
    surname: 'Smith',
    company: 'XYZ Ltd',
    phone: '+0987654321',
    email: 'jane.smith@example.com',
    createdAt: new Date('2023-02-20')
  },
  {
    id: '3',
    name: 'Robert',
    surname: 'Johnson',
    company: 'Johnson & Co',
    phone: '+1122334455',
    email: 'robert@johnson.com',
    createdAt: new Date('2023-03-10')
  },
];

const initialProducts: Product[] = [
  {
    id: '1',
    name: 'Industrial Washing Machine',
    description: 'Heavy duty washing machine for commercial use',
    price: 2499.99,
    category: 'Laundry',
    tags: ['washing machine', 'laundry', 'cleaning', 'industrial'],
    stock: 12,
    status: 'in-stock',
    createdAt: new Date('2023-01-05')
  },
  {
    id: '2',
    name: 'Commercial Vacuum Cleaner',
    description: 'Powerful vacuum for large spaces',
    price: 599.99,
    category: 'Cleaning',
    tags: ['vacuum', 'cleaning', 'floor care'],
    stock: 0,
    status: 'out-of-stock',
    createdAt: new Date('2023-02-10')
  },
  {
    id: '3',
    name: 'Detergent (Bulk)',
    description: '20L professional cleaning detergent',
    price: 89.99,
    category: 'Cleaning Supplies',
    tags: ['detergent', 'cleaning', 'supplies', 'liquid'],
    stock: 45,
    status: 'in-stock',
    createdAt: new Date('2023-03-15')
  },
  {
    id: '4',
    name: 'Dishwasher Pro',
    description: 'Commercial grade dishwasher',
    price: 1299.99,
    category: 'Kitchen',
    tags: ['dishwasher', 'kitchen', 'cleaning'],
    stock: 0,
    status: 'on-command',
    createdAt: new Date('2023-01-25')
  },
];

const initialQuotations: Quotation[] = [
  {
    id: '1',
    clientId: '1',
    items: [
      { productId: '1', quantity: 2, price: 2499.99 },
      { productId: '3', quantity: 5, price: 89.99 }
    ],
    total: 5449.93,
    status: 'sent',
    createdBy: '1',
    createdAt: new Date('2023-04-10'),
    updatedAt: new Date('2023-04-10')
  },
  {
    id: '2',
    clientId: '2',
    items: [
      { productId: '2', quantity: 1, price: 599.99 },
      { productId: '3', quantity: 2, price: 89.99 }
    ],
    total: 779.97,
    status: 'accepted',
    createdBy: '2',
    createdAt: new Date('2023-04-15'),
    updatedAt: new Date('2023-04-17')
  },
];

const initialSalesReps: SalesRep[] = [
  { id: '1', name: 'Michael Scott', group: 'North', company: 'SalesSnap Inc.' },
  { id: '2', name: 'Dwight Schrute', group: 'East', company: 'SalesSnap Inc.' },
];

interface DataContextType {
  clients: Client[];
  products: Product[];
  quotations: Quotation[];
  salesReps: SalesRep[];
  addClient: (client: Omit<Client, 'id' | 'createdAt'>) => void;
  updateClient: (id: string, clientData: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => void;
  updateProduct: (id: string, productData: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  addQuotation: (quotation: Omit<Quotation, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateQuotation: (id: string, quotationData: Partial<Quotation>) => void;
  deleteQuotation: (id: string) => void;
  searchProducts: (query: string) => Product[];
  getDashboardStats: () => DashboardStats;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [quotations, setQuotations] = useState<Quotation[]>(initialQuotations);
  const [salesReps] = useState<SalesRep[]>(initialSalesReps);

  const addClient = (client: Omit<Client, 'id' | 'createdAt'>) => {
    const newClient: Client = {
      ...client,
      id: Date.now().toString(),
      createdAt: new Date()
    };
    setClients([...clients, newClient]);
    toast.success("Client added successfully");
  };

  const updateClient = (id: string, clientData: Partial<Client>) => {
    setClients(clients.map(client => 
      client.id === id ? { ...client, ...clientData } : client
    ));
    toast.success("Client updated successfully");
  };

  const deleteClient = (id: string) => {
    setClients(clients.filter(client => client.id !== id));
    toast.success("Client deleted successfully");
  };

  const addProduct = (product: Omit<Product, 'id' | 'createdAt'>) => {
    const newProduct: Product = {
      ...product,
      id: Date.now().toString(),
      createdAt: new Date()
    };
    setProducts([...products, newProduct]);
    toast.success("Product added successfully");
  };

  const updateProduct = (id: string, productData: Partial<Product>) => {
    setProducts(products.map(product => 
      product.id === id ? { ...product, ...productData } : product
    ));
    toast.success("Product updated successfully");
  };

  const deleteProduct = (id: string) => {
    setProducts(products.filter(product => product.id !== id));
    toast.success("Product deleted successfully");
  };

  const addQuotation = (quotation: Omit<Quotation, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date();
    const newQuotation: Quotation = {
      ...quotation,
      id: Date.now().toString(),
      createdAt: now,
      updatedAt: now
    };
    setQuotations([...quotations, newQuotation]);
    toast.success("Quotation created successfully");
  };

  const updateQuotation = (id: string, quotationData: Partial<Quotation>) => {
    setQuotations(quotations.map(quotation => 
      quotation.id === id 
        ? { ...quotation, ...quotationData, updatedAt: new Date() } 
        : quotation
    ));
    toast.success("Quotation updated successfully");
  };

  const deleteQuotation = (id: string) => {
    setQuotations(quotations.filter(quotation => quotation.id !== id));
    toast.success("Quotation deleted successfully");
  };

  const searchProducts = (query: string): Product[] => {
    if (!query) return products;
    
    const searchTerms = query.toLowerCase().split(' ');
    
    return products.filter(product => {
      // Search in name, description, category, and tags
      const searchableText = [
        product.name,
        product.description,
        product.category,
        ...(product.tags || [])
      ].join(' ').toLowerCase();
      
      // Match product if any of the search terms is found
      return searchTerms.some(term => searchableText.includes(term));
    });
  };

  const getDashboardStats = (): DashboardStats => {
    const acceptedQuotations = quotations.filter(q => q.status === 'accepted').length;
    const totalSentQuotations = quotations.filter(q => 
      q.status === 'accepted' || q.status === 'declined' || q.status === 'sent'
    ).length;
    
    return {
      totalQuotations: quotations.length,
      totalClients: clients.length,
      totalProducts: products.length,
      conversionRate: totalSentQuotations > 0 
        ? Math.round((acceptedQuotations / totalSentQuotations) * 100) 
        : 0
    };
  };

  return (
    <DataContext.Provider value={{
      clients,
      products,
      quotations,
      salesReps,
      addClient,
      updateClient,
      deleteClient,
      addProduct,
      updateProduct,
      deleteProduct,
      addQuotation,
      updateQuotation,
      deleteQuotation,
      searchProducts,
      getDashboardStats
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
