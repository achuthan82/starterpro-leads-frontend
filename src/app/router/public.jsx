const publicRoutes = {
  id: "public",
  children: [
    // Token verification route (top-level)
    {
      path: "v/:token",
      lazy: async () => ({
        Component: (await import("app/pages/AegisSuite/VerifyToken")).default,
      }),
    },
    // AegisSuite public routes
    {
      path: "login",
      lazy: async () => ({
        Component: (await import("app/pages/prototypes/sign-in-1")).default,
      }),
    },
      {
      path: "single-mortgage-public/:mortgage_id/:uuid",
      lazy: async () => ({
        Component: (await import("app/pages/AegisSuite/public/SingleMortgage")).default,
      }),
    },
     {
      path: "appointments/:token",
      lazy: async () => ({
        Component: (await import("app/pages/AegisSuite/public/PublicAppointment")).default,
      }),
    },
    {
      path: "register/:token",
      lazy: async () => ({
        Component: (await import("app/pages/AegisSuite/Register")).default,
      }),
    },
    {
      path: "forgot-password",
      lazy: async () => ({
        Component: (await import("app/pages/AegisSuite/ForgotPassword")).default,
      }),
    },
    {
      path: "reset-password/:token",
      lazy: async () => ({
        Component: (await import("app/pages/AegisSuite/ResetPassword")).default,
      }),
    },
     {
      path: "subscription",
      lazy: async () => ({
        Component: (await import("app/pages/AegisSuite/Subscriptions/Subscription")).default,
      }),
    },
  ],
};

export { publicRoutes };