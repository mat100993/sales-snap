
import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface RequireAuthProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'manager' | 'sales';
}

const RequireAuth: React.FC<RequireAuthProps> = ({ children, requiredRole }) => {
  const { isAuthenticated, currentUser } = useAuth();
  const location = useLocation();

  // Check if user is authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If a specific role is required, check if user has that role
  if (requiredRole && currentUser?.role !== requiredRole) {
    // User is authenticated but doesn't have the required role
    // We could either redirect them to a specific page or let the component handle the unauthorized access
    return <Navigate to="/" replace />;
  }

  // User is authenticated and has the required role (if specified)
  return <>{children}</>;
};

export default RequireAuth;
