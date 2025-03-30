
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { DataProvider } from './context/DataContext';
import { AuthProvider } from './context/AuthContext';
import RequireAuth from './components/RequireAuth';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import Products from './pages/Products';
import Quotations from './pages/Quotations';
import Login from './pages/Login';
import AdminUsers from './pages/AdminUsers';
import Samples from './pages/Samples';
import DeliveryNotes from './pages/DeliveryNotes';
import DocumentLibrary from './pages/DocumentLibrary';
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <DataProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              
              <Route path="/" element={
                <RequireAuth>
                  <Dashboard />
                </RequireAuth>
              } />
              
              <Route path="/clients" element={
                <RequireAuth>
                  <Clients />
                </RequireAuth>
              } />
              
              <Route path="/products" element={
                <RequireAuth>
                  <Products />
                </RequireAuth>
              } />
              
              <Route path="/quotations" element={
                <RequireAuth>
                  <Quotations />
                </RequireAuth>
              } />
              
              <Route path="/admin/users" element={
                <RequireAuth requiredRole="admin">
                  <AdminUsers />
                </RequireAuth>
              } />
              
              <Route path="/samples" element={
                <RequireAuth>
                  <Samples />
                </RequireAuth>
              } />
              
              <Route path="/delivery-notes" element={
                <RequireAuth>
                  <DeliveryNotes />
                </RequireAuth>
              } />
              
              <Route path="/documents" element={
                <RequireAuth>
                  <DocumentLibrary />
                </RequireAuth>
              } />
              
              <Route path="/index" element={<Navigate to="/" replace />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </DataProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
