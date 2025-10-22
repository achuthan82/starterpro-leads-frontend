import {
  UserGroupIcon,
  ShoppingBagIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  CreditCardIcon
} from "@heroicons/react/24/outline";

export const aegissuite = {
  id: "aegissuite",
  title: "AegisSuite",
  description: "Insurance Lead Management System",
  icon: ShieldCheckIcon,
  iconColor: "text-blue-600",
  href: "/",
  children: [
    {
      id: "overview",
      title: "Overview",
      description: "AegisSuite platform overview",
      href: "/overview",
      icon: ShieldCheckIcon,
      iconColor: "text-blue-600",
    },
    {
      id: "agent-dashboard",
      title: "Agent Dashboard",
      description: "Comprehensive dashboard for insurance agents",
      href: "/agent-dashboard",
      icon: ChartBarIcon,
      iconColor: "text-green-600",
    },
    {
      id: "marketplace",
      title: "Lead Marketplace",
      description: "Buy and sell insurance leads",
      href: "/marketplace",
      icon: ShoppingBagIcon,
      iconColor: "text-purple-600",
    },
    {
      id: "lead-management",
      title: "Lead Management",
      description: "Manage your insurance leads",
      href: "/lead-management",
      icon: UserGroupIcon,
      iconColor: "text-blue-600",
    },
    /*{
      id: "subscriptions",
      title: "Subscriptions",
      description: "Manage your subscriptions",
      href: "/subscriptions",
      icon: CreditCardIcon,
      iconColor: "text-red-600",
    }*/
  ],
};
