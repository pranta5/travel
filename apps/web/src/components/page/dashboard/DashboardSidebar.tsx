// src/components/DashboardSidebar.tsx
"use client";
import { useEffect, useState, useCallback } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Menu,
  X,
  User,
  LogOut,
  LayoutDashboard,
  PenLine,
  Package,
  Hotel,
  Inbox,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function DashboardSidebar() {
  const pathname = usePathname() ?? "/dashboard";
  const { user, loading, logout } = useAuth();

  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) =>
      e.key === "Escape" && setIsOpen(false);
    if (isOpen) window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen]);

  const navItems = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard size={18} />,
    },
    // {
    //   href: "/dashboard/addblog",
    //   label: "Add Blogs",
    //   icon: <PenLine size={18} />,
    // },
    {
      href: "/dashboard/addpackage",
      label: "Add Packages",
      icon: <Package size={18} />,
    },
    // { href: "/dashboard/addhotel", label: "Hotels", icon: <Hotel size={18} /> },
    {
      href: "/dashboard/enquiry",
      label: "Manage Enquiry",
      icon: <Inbox size={18} />,
    },
    {
      href: "/dashboard/bookings",
      label: "Manage Bookings",
      icon: <Inbox size={18} />,
    },
    {
      href: "/dashboard/profile",
      label: "profile",
      icon: <Inbox size={18} />,
    },
  ];

  const isActive = useCallback(
    (href: string) => pathname === href || pathname.startsWith(href + "/"),
    [pathname]
  );

  return (
    <>
      {/* Mobile menu button (hidden from md up) */}
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden fixed left-4 top-4 z-50 p-2 bg-white/90 text-teal-800 rounded-md shadow"
        aria-label="Open sidebar"
      >
        <Menu size={24} />
      </button>

      {/* Backdrop (only below md) */}
      {isOpen && (
        <div
          className="fixed inset-0 top-16 bg-black/50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        aria-hidden={!isOpen}
        className={`bg-teal-800 text-white w-56 md:w-56 lg:w-64 z-40 transform transition-transform duration-300 flex flex-col
          ${
            isOpen
              ? "fixed top-16 left-0 bottom-0 translate-x-0"
              : "fixed top-16 left-0 -translate-x-full"
          }
          md:fixed md:top-16 md:left-0 md:translate-x-0 md:bottom-[var(--footer-h,0)] md:h-[calc(100vh-4rem)]
          lg:bottom-[var(--footer-h,0)] lg:h-[calc(100vh-4rem)]`}
      >
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-teal-700 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
              <User size={22} className="text-teal-200" />
            </div>
            <div>
              <p className="text-sm font-medium">{user?.name}</p>
              <p className="text-xs text-teal-200/70">{user?.role}</p>
            </div>
          </div>

          <button
            className="md:hidden"
            onClick={() => setIsOpen(false)}
            aria-label="Close sidebar"
          >
            <X size={22} />
          </button>
        </div>

        {/* Nav (scrollable) */}
        <nav className="p-4 space-y-2 overflow-y-auto flex-1 min-h-0">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-colors
                  ${active ? "bg-teal-700" : "hover:bg-teal-700/60"}`}
              >
                <span className="w-8 h-8 flex items-center justify-center bg-white/10 rounded-md">
                  {item.icon}
                </span>
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer (logout) */}
        <div className="p-4 border-t border-teal-700 flex-shrink-0">
          <Link
            href="/dashboard/logout"
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-teal-700 hover:bg-teal-600"
          >
            <LogOut size={16} />
            Logout
          </Link>
        </div>
      </aside>
    </>
  );
}
