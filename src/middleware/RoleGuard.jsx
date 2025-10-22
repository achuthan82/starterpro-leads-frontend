// Import Dependencies
import { Navigate, useLocation } from "react-router";

// Local Imports
import { useAuthContext } from "app/contexts/auth/context";

// ----------------------------------------------------------------------

export default function RoleGuard({ allowedRoles = [], children }) {
  const { user } = useAuthContext();
  const location = useLocation();

  // Get user role from auth context
  const userRole = user?.role || "agent";

  // Handle both string and array formats for allowedRoles
  const allowedRolesArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  
  // Check if user role is in allowed roles
  const hasAccess = allowedRolesArray.includes(userRole);

  // If user doesn't have access, redirect to appropriate page
  if (!hasAccess) {
    // Redirect to agent dashboard for agents trying to access admin routes
    if (userRole === "agent" && location.pathname.startsWith("/admin")) {
      return <Navigate to="/agent-dashboard" replace />;
    }
    
    // Redirect to admin users page for admins trying to access agent-only routes
    if (userRole === "admin" && location.pathname.startsWith("/agent-dashboard")) {
      return <Navigate to="/admin/users" replace />;
    }

    // Default redirect to agent dashboard
    return <Navigate to="/agent-dashboard" replace />;
  }

  return <>{children}</>;
}