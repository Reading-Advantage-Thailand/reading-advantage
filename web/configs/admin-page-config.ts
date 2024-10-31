import { AdminPageConfig } from "@/types";

export const adminPageConfig: AdminPageConfig = {
  mainNav: [
    {
      title: "home",
      href: "/",
    },
    {
      title: "about",
      href: "/about",
    },
    {
      title: "contact",
      href: "/contact",
    },
    {
      title: "authors",
      href: "/authors",
    },
  ],
  sidebarNav: [
    {
      title: "Admin Dashboard",
      href: "/admin/dashboard",
      icon: "dashboard",
    },
    {
      title: "Admin Management",
      href: "/admin/management",
      icon: "MonitorCog",
    },
  ],
};
