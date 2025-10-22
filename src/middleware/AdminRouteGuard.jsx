// Import Dependencies
import { Navigate } from "react-router";

// Local Imports
import { useAuthContext } from "app/contexts/auth/context";

// ----------------------------------------------------------------------

export default function AdminRouteGuard({ children }) {
  const { user } = useAuthContext();

  // Get user role from auth context
  const userRole = user?.role || "agent";

  // Check if user is admin
  if (userRole !== "admin") {
    // Redirect agents to agent dashboard
    return <Navigate to="/agent-dashboard" replace />;
  }

  return <>{children}</>;
}
