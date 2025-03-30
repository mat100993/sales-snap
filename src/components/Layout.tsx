
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  FileText, 
  LogOut,
  Menu,
  X,
  Flask,
  Truck,
  FileIcon,
  UserCog
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/context/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { logout, isAuthenticated, isAdmin, currentUser } = useAuth();
  const [sidebarOpen, setSidebarOpen] = React.useState(!isMobile);

  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  React.useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    } else {
      setSidebarOpen(true);
    }
  }, [isMobile]);

  const navigationItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Clients', path: '/clients', icon: Users },
    { name: 'Products', path: '/products', icon: Package },
    { name: 'Quotations', path: '/quotations', icon: FileText },
    { name: 'Sample Requests', path: '/samples', icon: Flask },
    { name: 'Delivery Notes', path: '/delivery-notes', icon: Truck },
    { name: 'Documents', path: '/documents', icon: FileIcon },
  ];

  // Admin-only items
  const adminItems = [
    { name: 'User Management', path: '/admin/users', icon: UserCog },
  ];

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile sidebar toggle */}
      {isMobile && (
        <button 
          className="fixed top-4 left-4 z-50 p-2 bg-white rounded-md shadow-md"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      )}
      
      {/* Sidebar */}
      <aside 
        className={`
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
          ${isMobile ? 'fixed inset-y-0 left-0 z-40' : 'relative'} 
          w-64 bg-white shadow-md transition-transform duration-200 ease-in-out
        `}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b">
            <h1 className="text-2xl font-bold text-sales-600">SalesSnap</h1>
            <p className="text-sm text-gray-500">Quotation Management</p>
            {currentUser && (
              <div className="mt-2 text-sm font-medium">
                <span className="text-gray-600">Logged in as:</span> {currentUser.fullName}
              </div>
            )}
          </div>

          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            {navigationItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`sidebar-item ${isActive(item.path) ? 'active' : ''}`}
              >
                <item.icon size={20} />
                <span>{item.name}</span>
              </Link>
            ))}

            {/* Admin-only navigation items */}
            {isAdmin && adminItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`sidebar-item ${isActive(item.path) ? 'active' : ''}`}
              >
                <item.icon size={20} />
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>

          <div className="p-4 border-t">
            <div 
              className="sidebar-item hover:bg-gray-100 cursor-pointer"
              onClick={handleLogout}
            >
              <LogOut size={20} />
              <span>Logout</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className={`flex-1 overflow-auto`}>
        <div className="container mx-auto px-4 py-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
