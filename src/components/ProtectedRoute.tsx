import { Navigate, useLocation } from "react-router-dom";
import { getToken } from "@/lib/api";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Wraps a route so unauthenticated users are redirected to /login.
 * Saves the attempted URL so we can redirect back after login.
 */
const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const location = useLocation();
  const token = getToken();

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
