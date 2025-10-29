import {
  // UserIcon,
  ChartBarIcon,
  UsersIcon,
  // MapPinIcon,
  // CurrencyDollarIcon,
  // BellIcon,
  CreditCardIcon,
  ShieldCheckIcon,
  ArrowRightStartOnRectangleIcon,
  ClockIcon,
  ChartPieIcon,
  UserPlusIcon,
  MapIcon,
  ShoppingBagIcon,
  CloudArrowUpIcon,
  TagIcon,
  // QuestionMarkCircleIcon,
  // ChartBarSquareIcon,
  SpeakerWaveIcon,
} from "@heroicons/react/24/outline";
import Logo from "assets/app-logo/logo-text.svg?.react";
import { useNavigate } from "react-router";
import { useAuthContext } from "app/contexts/auth/context";
import { ShoppingCartIcon } from "@heroicons/react/24/outline";
import { CheckBadgeIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";

const SharedSidebar = ({ currentPath = "" }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuthContext();

  // Get user data from auth context
  const userRole = user?.role || localStorage.getItem("userRole") || "agent";

  // Force re-render when user data changes
  const [forceUpdate, setForceUpdate] = useState(0);

  useEffect(() => {
    setForceUpdate((prev) => prev + 1);
  }, [user?.role, user?.id, localStorage.getItem("userRole")]);
  // const userEmail = user?.email || 'user@aegissuite.com';
  const userName = user?.name || "Unknown";

  // Get user initials from email
  const getUserInitials = (email) => {
    const name = email.split("@")[0];
    const parts = name.split(".");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      // Fallback: clear localStorage and redirect
      localStorage.removeItem("userRole");
      localStorage.removeItem("userEmail");
      localStorage.removeItem("isAuthenticated");
      localStorage.removeItem("authToken");
      navigate("/login");
    }
  };

  const sidebarItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: ChartPieIcon,
      href: "/agent-dashboard",
    },
    {
      id: "leads",
      label: "Lead Management",
      icon: UserPlusIcon,
      href: "/lead-management",
    },
    {
      id: "territories",
      label: "Mailing Territories",
      icon: MapIcon,
      href: "/territories",
    },
    {
      id: "marketplace",
      label: "Lead Bank",
      icon: ShoppingCartIcon,
      href: "/marketplace",
    },
    {
      id: "orders-subscriptions",
      label: "Orders & Subscriptions",
      icon: ShoppingBagIcon,
      href: "/orders-subscriptions",
    },
    // { id: 'campaigns', label: 'My Campaigns', icon: BellIcon, href: '/shieldnest/campaigns' },
    // { id: 'settings', label: 'Settings', icon: UserIcon, href: '/shieldnest/settings' },
    {
      id: "subscriptions",
      label: "Subscriptions",
      description: "Manage your subscriptions",
      href: "/subscriptions",
      icon: CreditCardIcon,
      iconColor: "text-red-600",
    },
    // {
    //   id: "support",
    //   label: "Support",
    //   icon: QuestionMarkCircleIcon,
    //   href: "/support",
    // },
  ];

  // Admin-only menu items
  const adminItems = [
    {
      id: "admin-agents",
      label: "Agent Management",
      icon: UsersIcon,
      href: "/admin/agents",
    },
    {
      id: "admin-users",
      label: "User Management",
      icon: ShieldCheckIcon,
      href: "/admin/users",
    },
    {
      id: "admin-uploads",
      label: "File Uploads",
      icon: CloudArrowUpIcon,
      href: "/admin/file-upload",
    },
    {
      id: "admin-subscriptions",
      label: "Subscription Plans",
      icon: CreditCardIcon,
      href: "/admin/subscriptions",
    },
    {
      id: "admin-purchase-history",
      label: "Purchase History",
      icon: ClockIcon,
      href: "/admin/purchase-history",
    },
    {
      id: "admin-promo-codes",
      label: "Manage Promo Code",
      icon: TagIcon,
      href: "/admin/promo-codes",
    },
    {
      id: "reports",
      label: "Reports & Analytics",
      icon: ChartBarIcon,
      href: "/reports",
    },
    // {
    //   id: "revenue-reports",
    //   label: "Revenue Reports",
    //   icon: ChartBarSquareIcon,
    //   href: "/shieldnest/revenue-report",
    // },
    {
      id: "prospect",
      label: "Prospect",
      icon: CheckBadgeIcon,
      href: "/prospect",
    },
    {
      id: "campaign",
      label: "Campaign",
      icon: SpeakerWaveIcon,
      href: "/campaign",
    },
  ];

  return (
    <div
      className="flex w-64 flex-col border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg"
      style={{ overflow: "auto" }}
    >
      <div className="border-b border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center space-x-3">
          <div>
            <img
              src={Logo}
              alt="Logo"
              style={{ maxWidth: "100%", height: "auto", objectFit: "contain" }}
              className="dark:brightness-200"
            />
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-4 text-center">
              {userRole === "admin" ? "Admin Portal" : "Agent Portal"}
            </p>
          </div>
          {/* <div className="w-12 h-12 bg-gradient-to-br from-white to-yellow-50 border-2 border-yellow-200/50 rounded-2xl flex items-center justify-center shadow-xl">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-aegis-navy h-6 w-6"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"></path>
            </svg>
          </div> */}
          {/* <div>
            <h2 className="text-xl font-bold text-[#0a2463]">
              <span className="text-[#0a2463]">Aegis</span>
              <span className="bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-200 bg-clip-text text-transparent">Suite</span>
            </h2>
            <p className="text-sm text-gray-600">
              {userRole === "admin" ? "Admin Portal" : "Agent Portal"}
            </p>
          </div> */}
        </div>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {sidebarItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => navigate(item.href)}
                className={`flex w-full items-center space-x-3 rounded-lg p-3 text-left transition-all duration-200 ${
                  currentPath === item.href ||
                  window.location.pathname === item.href
                    ? "bg-[#0a2463] dark:bg-blue-600 text-white"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            </li>
          ))}

          {/* Admin Section */}
          {userRole === "admin" && (
            <div key={`admin-section-${forceUpdate}`}>
              <li className="pt-4">
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <p className="mb-3 text-xs font-semibold tracking-wider text-gray-400 dark:text-gray-500 uppercase">
                    Administration
                  </p>
                </div>
              </li>
              {adminItems.map((item) => (
                <li key={item.id} className="mt-2">
                  <button
                    onClick={() => navigate(item.href)}
                    className={`flex w-full items-center space-x-3 rounded-lg p-3 text-left transition-all duration-200 ${
                      currentPath === item.href ||
                      window.location.pathname === item.href
                        ? "bg-[#0a2463] dark:bg-blue-600 text-white"
                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                </li>
              ))}
            </div>
          )}
        </ul>
      </nav>

      <div className="border-t border-gray-200 dark:border-gray-700 p-4">
        <div className="mb-4 flex items-center space-x-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0a2463] dark:bg-blue-600">
            <span className="text-sm font-medium text-white">
              {getUserInitials(userName)}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{userName}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{userRole}</p>
          </div>
        </div>
        <div className="space-y-2">
          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center rounded-lg p-2 text-sm text-gray-600 dark:text-gray-300 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400"
          >
            <ArrowRightStartOnRectangleIcon className="mr-2 h-4 w-4" />
            Sign Out
          </button>
          {/* <button
            onClick={() => navigate('/')}
            className="w-full flex items-center text-sm text-gray-600 hover:text-[#0a2463] transition-colors p-2 rounded-lg hover:bg-gray-50"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to ShieldNest
          </button> */}
        </div>
      </div>
    </div>
  );
};

export default SharedSidebar;
