// Import Dependencies
import { Navigate } from "react-router";

// Local Imports
import AuthGuard from "middleware/AuthGuard";

// ----------------------------------------------------------------------

const protectedRoutes = {
  id: "protected",
  Component: AuthGuard,
  children: [
    // AegisSuite standalone layout - removes all framework components
    {
      lazy: async () => ({
        Component: (await import("app/layouts/AegisSuiteLayout")).default,
      }),
      children: [
        {
          index: true,
          element: <Navigate to="/agent-dashboard" />,
        },
        {
          path: "overview",
          lazy: async () => ({
            Component: (await import("app/pages/AegisSuite/Overview")).default,
          }),
        },
        {
          path: "agent-dashboard",
          lazy: async () => ({
            Component: (await import("app/pages/AegisSuite/AgentDashboard"))
              .default,
          }),
        },
        {
          path: "profile-page",
          lazy: async () => ({
            Component: (
              await import("app/pages/AegisSuite/profile/ProfilePage")
            ).default,
          }),
        },
        {
          path: "appointments",
          lazy: async () => ({
            Component: (
              await import("app/pages/AegisSuite/appointments/Appointments")
            ).default,
          }),
        },
        {
          path: "side-leads",
          lazy: async () => ({
            Component: (
              await import("app/pages/AegisSuite/side-lead-bank/SideLeadBank")
            ).default,
          }),
        },
        {
          path: "workflow",
          lazy: async () => ({
            Component: (await import("app/pages/AegisSuite/workflow/Index"))
              .default,
          }),
        },
        {
          path: "suppression",
          lazy: async () => ({
            Component: (await import("app/pages/AegisSuite/suppression/Suppression"))
              .default,
          }),
        },
        {
          path: "subscriptions",
          lazy: async () => ({
            Component: (await import("app/pages/AegisSuite/Subscriptions"))
              .default,
          }),
        },
         {
          path: "platform-subscriptions",
          lazy: async () => ({
            Component: (await import("app/pages/AegisSuite/platformSubscription/indexPlatform"))
              .default,
          }),
        },
        {
          path: "subscriptions/success",
          lazy: async () => ({
            Component: (
              await import(
                "app/pages/AegisSuite/Subscriptions/PurchaseLeads/CheckoutSuccess"
              )
            ).default,
          }),
        },
        {
          path: "subscriptions/cancel",
          lazy: async () => ({
            Component: (
              await import(
                "app/pages/AegisSuite/Subscriptions/PurchaseLeads/CheckoutCancel"
              )
            ).default,
          }),
        },
        {
          path: "subscriptions/invoice/:id",
          lazy: async () => ({
            Component: (
              await import("app/pages/AegisSuite/Subscriptions/InvoiceTemplate")
            ).default,
          }),
        },
        {
          path: "platform-subscriptions/invoice/:id",
          lazy: async () => ({
            Component: (
              await import("app/pages/AegisSuite/platformSubscription/PlatformInvoiceTemplate")
            ).default,
          }),
        },
        {
          path: "subscriptions/purchase/:id",
          lazy: async () => ({
            Component: (
              await import(
                "app/pages/AegisSuite/Subscriptions/PurchaseLeads/index"
              )
            ).default,
          }),
        },
        {
          path: "lead-management",
          lazy: async () => ({
            Component: (await import("app/pages/AegisSuite/LeadManagement"))
              .default,
          }),
        },
        {
          path: "revenue-report",
          lazy: async () => ({
            Component: (
              await import("app/pages/AegisSuite/revenue-reports/Report")
            ).default,
          }),
        },
        {
          path: "regions",
          lazy: async () => ({
            Component: (await import("app/pages/AegisSuite/Territories"))
              .default,
          }),
        },
        {
          path: "marketplace",
          lazy: async () => ({
            Component: (
              await import("app/pages/AegisSuite/Marketplace/Marketplace")
            ).default,
          }),
        },
        {
          path: "prospect",
          lazy: async () => ({
            Component: (
              await import("app/pages/AegisSuite/prospect/ProspectList")
            ).default,
          }),
        },
        {
          path: "campaign",
          lazy: async () => ({
            Component: (
              await import("app/pages/AegisSuite/campaign/CampaignManagement")
            ).default,
          }),
        },
        {
          path: "marketplace/checkout-success",
          lazy: async () => ({
            Component: (
              await import("app/pages/AegisSuite/Marketplace/CheckoutSuccess")
            ).default,
          }),
        },
        {
          path: "marketplace/checkout-cancel",
          lazy: async () => ({
            Component: (
              await import("app/pages/AegisSuite/Marketplace/CheckoutCancel")
            ).default,
          }),
        },
        {
          path: "campaigns",
          lazy: async () => ({
            Component: (await import("app/pages/AegisSuite/Campaigns")).default,
          }),
        },
        {
          path: "reports",
          lazy: async () => ({
            Component: (await import("app/pages/AegisSuite/Reports")).default,
          }),
        },
        {
          path: "orders-subscriptions",
          lazy: async () => ({
            Component: (
              await import(
                "app/pages/AegisSuite/OrdersAndSubscriptions/OrdersAndSubscriptions"
              )
            ).default,
          }),
        },
        {
          path: "/power-dialer",
          lazy: async () => ({
            Component: (await import("app/pages/powerDialer/PowerDialer"))
              .default,
          }),
        },
        {
          path: "sms-conversation",
          lazy: async () => ({
            Component: (
              await import("app/pages/AegisSuite/sms/SmsConversation")
            ).default,
          }),
        },
        {
          path: "sms-conversation/:mortgage_id/:lead_member_id",
          lazy: async () => ({
            Component: (
              await import("app/pages/AegisSuite/sms/SmsConversation")
            ).default,
          }),
        },
        {
          path: "power-dialer/recharge-success",
          lazy: async () => ({
            Component: (await import("app/pages/powerDialer/RechargeSuccess"))
              .default,
          }),
        },
        {
          path: "power-dialer/recharge-cancel",
          lazy: async () => ({
            Component: (await import("app/pages/powerDialer/RechargeCancel"))
              .default,
          }),
        },
        {
          path: "settings",
          lazy: async () => ({
            Component: (await import("app/pages/AegisSuite/Settings")).default,
          }),
        },
         {
          path: "/twilio/expense-reports",
          lazy: async () => ({
            Component: (
              await import("app/pages/AegisSuite/admin/TwilioExpenseAndReports")
            ).default,
          }),
        },

        // Admin routes
        {
          path: "admin/agents",
          lazy: async () => ({
            Component: (
              await import("app/pages/AegisSuite/admin/AdminAgentManagement")
            ).default,
          }),
        },
        {
          path: "admin/users",
          lazy: async () => ({
            Component: (
              await import("app/pages/AegisSuite/admin/AdminUserManagement")
            ).default,
          }),
        },
        {
          path: "admin/file-upload",
          lazy: async () => ({
            Component: (
              await import("app/pages/AegisSuite/admin/file-upload/FileUpload")
            ).default,
          }),
        },
        {
          path: "admin/subscriptions",
          lazy: async () => ({
            Component: (
              await import("app/pages/AegisSuite/admin/AdminSubscriptionPlans")
            ).default,
          }),
        },
        {
          path: "admin/purchase-history",
          lazy: async () => ({
            Component: (
              await import("app/pages/AegisSuite/admin/AdminPurchaseHistory")
            ).default,
          }),
        },
        {
          path: "admin/expense-reports",
          lazy: async () => ({
            Component: (
              await import("app/pages/AegisSuite/admin/AdminExpenseAndReports")
            ).default,
          }),
        },
        {
          path: "admin/invite-user",
          lazy: async () => ({
            Component: (await import("app/pages/AegisSuite/InviteUser"))
              .default,
          }),
        },
        {
          path: "admin/agents/:agentId/leads",
          lazy: async () => ({
            Component: (await import("app/pages/AegisSuite/admin/AgentLeads"))
              .default,
          }),
        },
        {
          path: "admin/agents/:agentId/orders",
          lazy: async () => ({
            Component: (await import("app/pages/AegisSuite/admin/AgentOrders"))
              .default,
          }),
        },
        {
          path: "admin/promo-codes",
          lazy: async () => ({
            Component: (
              await import(
                "app/pages/AegisSuite/admin/AdminPromoCodeManagement"
              )
            ).default,
          }),
        },
        {
          path: "support",
          lazy: async () => ({
            Component: (await import("app/pages/AegisSuite/Support")).default,
          }),
        },
      ],
    },
  ],
};

export { protectedRoutes };
