// Import Dependencies
import { createBrowserRouter, Navigate } from "react-router";

// Local Imports
import Root from "app/layouts/Root";
import RootErrorBoundary from "app/pages/errors/RootErrorBoundary";
import { SplashScreen } from "components/template/SplashScreen";
import { protectedRoutes } from "./protected";
import { publicRoutes } from "./public";

// ----------------------------------------------------------------------

const router = createBrowserRouter([
  {
    id: "root",
    Component: Root,
    hydrateFallbackElement: <SplashScreen />,
    ErrorBoundary: RootErrorBoundary,
    children: [
      {
        index: true,
        element: <Navigate to="/login" replace />,
      },
      protectedRoutes, 
      publicRoutes
    ],
  },
]);

export default router;