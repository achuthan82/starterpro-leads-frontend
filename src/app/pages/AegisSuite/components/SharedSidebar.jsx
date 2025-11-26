import {
  ChartBarIcon,
  UsersIcon,
  CreditCardIcon,
  ShieldCheckIcon,
  ArrowRightStartOnRectangleIcon,
  ClockIcon,
  ChartPieIcon,
  UserPlusIcon,
  MapIcon,
  ShoppingBagIcon,
  CloudArrowUpIcon,
  PhoneIcon,
  CalendarIcon,
  EyeIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EnvelopeIcon,
} from "@heroicons/react/24/outline";
import Logo from "assets/app-logo/logo-text.svg?.react";
import logoIcon from "assets/app-logo/logo-new.png?.react";
import { useNavigate } from "react-router";
import { useAuthContext } from "app/contexts/auth/context";
import { ShoppingCartIcon } from "@heroicons/react/24/outline";
import { CheckBadgeIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { Button } from "components/ui";

const SharedSidebar = ({ currentPath = "" }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuthContext();

  // Get user data from auth context
  const userRole = user?.role || localStorage.getItem("userRole") || "agent";

  // Force re-render when user data changes
  const [forceUpdate, setForceUpdate] = useState(0);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };
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
      id: "regions",
      label: "Mailing Regions",
      icon: MapIcon,
      href: "/regions",
    },
    {
      id: "marketplace",
      label: "Lead Bank",
      icon: ShoppingCartIcon,
      href: "/marketplace",
    },
    {
      id: "power-dialer",
      label: "Power Dialer",
      icon: PhoneIcon,
      href: "/power-dialer",
    },
    {
      id: "orders-subscriptions",
      label: "Orders & Subscriptions",
      icon: ShoppingBagIcon,
      href: "/orders-subscriptions",
    },
    {
      id: "appointments",
      label: "Appointments",
      icon: CalendarIcon,
      href: "/appointments",
    },
    {
      id: "subscriptions",
      label: "Subscriptions",
      description: "Manage your subscriptions",
      href: "/subscriptions",
      icon: CreditCardIcon,
      iconColor: "text-red-600",
    },
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
      id: "workflow",
      label: "Workflow",
      icon: EnvelopeIcon,
      href: "/workflow",
    },
    // {
    //   id: "admin-promo-codes",
    //   label: "Manage Promo Code",
    //   icon: TagIcon,
    //   href: "/admin/promo-codes",
    // },
    {
      id: "side-lead-bank",
      label: "Side Lead Bank",
      icon: ShoppingCartIcon,
      href: "/side-leads",
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
    // {
    //   id: "campaign",
    //   label: "Campaign",
    //   icon: SpeakerWaveIcon,
    //   href: "/campaign",
    // },
  ];
  const handleViewProfile = () => {
    navigate("/profile-page");
  };
  return (
    <div
      className={`sidebar-scroll-container flex ${isCollapsed ? "w-20" : "w-64"} flex-col border-r border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800 overflow-y-auto overflow-x-hidden`}
    >
      <div className="border-b border-gray-200 p-6 dark:border-gray-700 overflow-x-hidden">
        {isCollapsed ? (
          <>
            <div className="flex flex-col items-center space-y-3">
              <img
                src={logoIcon}
                alt="logo"
                className="h-10 w-auto max-w-full object-contain"
              />
              <button
                onClick={toggleSidebar}
                className="dark:hover:bg-dark-700 dark:text-dark-200 rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100"
                aria-label="Expand sidebar"
                title="Expand sidebar"
              >
                <ChevronRightIcon className="h-5 w-5" />
              </button>
            </div>
          </>
        ) : (
          <>
          <div className="flex items-center justify-between min-w-0">
            <img
              src={Logo}
              alt="StarterPro"
              className="h-25 w-auto max-w-full object-contain flex-shrink"
            />
            
            <button
              onClick={toggleSidebar}
              className="dark:hover:bg-dark-700 dark:text-dark-200 flex-shrink-0 rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100"
              aria-label="Collapse sidebar"
              title="Collapse sidebar"
            >
              <ChevronLeftIcon className="h-10 w-10" />
            </button>
          </div>
          {user.agency?.name !== 'StarterPro' && (
            <h3 className="text-sm ml-[32px] mt-2 font-bold text-gray-900 dark:text-gray-100">[{user.agency?.name}]</h3>
          )}
          </>
        )}
      </div>

      <nav className="flex-1 p-4 overflow-x-hidden">
        <ul className="space-y-2 w-full">
          {sidebarItems.map((item) => (
            <li key={item.id} className="w-full min-w-0">
              <button
                onClick={() => navigate(item.href)}
                className={`flex w-full items-center ${isCollapsed ? "justify-center" : "space-x-3"} rounded-lg p-3 text-left transition-all duration-200 min-w-0 ${
                  currentPath === item.href ||
                  window.location.pathname === item.href
                    ? "bg-[#0a2463] text-white dark:bg-blue-600"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                }`}
                title={isCollapsed ? item.label : ""}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {!isCollapsed && (
                  <span className="font-medium truncate">{item.label}</span>
                )}
              </button>
            </li>
          ))}

          {/* Admin Section */}
          {userRole === "admin" && (
            <div key={`admin-section-${forceUpdate}`}>
              <li className="pt-4">
                <div className="dark:border-dark-600 border-t border-gray-200 pt-4">
                  {!isCollapsed && (
                    <p className="dark:text-dark-400 mb-3 text-xs font-semibold tracking-wider text-gray-400 uppercase">
                      Administration
                    </p>
                  )}
                </div>
              </li>
              {adminItems.map((item) => (
                <li key={item.id} className={`${user.agency?.name !== 'StarterPro' && item.href === "/admin/subscriptions" ? "hidden" : "mb-2 w-full min-w-0"}`}>
                  <button
                    onClick={() => navigate(item.href)}
                    className={`flex w-full items-center ${isCollapsed ? "justify-center" : "space-x-3"} rounded-lg p-3 text-left transition-all duration-200 min-w-0 ${
                      currentPath === item.href ||
                      window.location.pathname === item.href
                        ? "bg-[#0a2463] text-white dark:bg-blue-600"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                    }`}
                    title={isCollapsed ? item.label : ""}
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    {!isCollapsed && (
                      <span className="font-medium truncate">{item.label}</span>
                    )}
                  </button>
                </li>
              ))}
            </div>
          )}
        </ul>
      </nav>

      <div className="border-t border-gray-200 p-4 dark:border-gray-700 overflow-x-hidden">
        {!isCollapsed ? (
          <>
            {" "}
            {/* Profile Section */}
            <div className="mb-4 flex items-center justify-between">
              {/* Left side: Avatar + Info */}
              <div className="flex items-center space-x-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0a2463] dark:bg-blue-600">
                  <span className="text-sm font-medium text-white">
                    {getUserInitials(userName)}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {userName}
                  </p>
                  <p className="text-xs text-gray-500 capitalize dark:text-gray-400">
                    {userRole}
                  </p>
                </div>
              </div>

              {/* Right side: Profile icon button */}
              <Button
                // color='primary'
                // variant='outlined'
                isIcon
                onClick={handleViewProfile}
                data-tooltip
                data-tooltip-variant="info"
                data-tooltip-content="View Profile"
                className="p-1 text-gray-500 transition-colors hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                title="View Profile"
              >
                <EyeIcon className="h-4 w-4" />
              </Button>
            </div>
            {/* Action Buttons */}
            <div className="space-y-2">
              <button
                onClick={handleLogout}
                className="flex w-full items-center justify-center rounded-lg p-2 text-sm text-gray-600 transition-colors hover:bg-red-50 hover:text-red-600 dark:text-gray-300 dark:hover:bg-red-900/20 dark:hover:text-red-400"
              >
                <ArrowRightStartOnRectangleIcon className="mr-2 h-4 w-4" />
                Sign Out
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="flex flex-col items-center space-y-4">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0a2463] dark:bg-blue-600"
                title={userName}
              >
                <span className="text-sm font-medium text-white">
                  {getUserInitials(userName)}
                </span>
              </div>
              <button
                onClick={handleViewProfile}
                className="dark:text-dark-200 flex items-center justify-center rounded-lg p-2 text-gray-600 transition-colors hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20 dark:hover:text-blue-400"
                title="View Profile"
              >
                <EyeIcon className="h-5 w-5" />
              </button>
              <button
                onClick={handleLogout}
                className="dark:text-dark-200 flex items-center justify-center rounded-lg p-2 text-gray-600 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                title="Sign Out"
              >
                <ArrowRightStartOnRectangleIcon className="h-5 w-5" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SharedSidebar;
