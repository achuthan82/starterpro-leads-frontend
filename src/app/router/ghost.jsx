import GhostGuard from "middleware/GhostGuard";

const ghostRoutes = {
  id: "ghost",
  Component: GhostGuard,
  children: [
    // No routes needed here since login is handled by public routes
  ],
};

export { ghostRoutes };