// app/dashboard/layout.tsx

import React from "react";
import DashboardSidebar from "@/components/page/dashboard/DashboardSidebar";
import type { ReactNode } from "react";

export const metadata = { title: "Dashboard" };

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      {/* Sidebar (handles mobile button/offcanvas and large-screen sticky) */}
      <DashboardSidebar />

      {/* MAIN: add top padding for the fixed header and left margin on large screens */}
      <div className="pt-16 transition-all duration-200 md:ml-56 lg:ml-64">
        <main className="px-6 md:px-10 lg:px-12 py-8 pb-16">{children}</main>
      </div>
    </div>
  );
}
