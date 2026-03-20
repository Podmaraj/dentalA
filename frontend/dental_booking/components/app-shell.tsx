"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Stethoscope,
  CalendarPlus,
  MessageCircle,
  Home,
  Menu,
  X,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRealtimeSlots } from "@/hooks/use-realtime-slots";

const NAV_ITEMS = [
  { href: "/", label: "Landing", icon: Home },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/doctors", label: "Doctors", icon: Stethoscope },
  { href: "/booking", label: "Book Appointment", icon: CalendarPlus },
  { href: "/chat", label: "AI Chat", icon: MessageCircle },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { connected } = useRealtimeSlots();

  // Close sidebar on route change
  useEffect(() => setSidebarOpen(false), [pathname]);

  // Don't show shell on landing page
  if (pathname === "/") return <>{children}</>;

  return (
    <div className="flex h-screen bg-[var(--bg-soft)]">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-[var(--border)] flex flex-col transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand */}
        <div className="flex items-center gap-3 px-6 h-16 border-b border-[var(--border)]">
          <div className="w-8 h-8 rounded-full bg-[var(--teal-500)] flex items-center justify-center text-white text-sm">
            ✦
          </div>
          <span className="font-semibold text-[var(--teal-600)] tracking-wide" style={{ fontFamily: "var(--font-head)" }}>
            DENTALA
          </span>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                  active
                    ? "bg-[var(--teal-50)] text-[var(--teal-700)] border border-[var(--teal-200)]"
                    : "text-[var(--fg-muted)] hover:bg-[var(--bg-muted)] hover:text-[var(--fg)]"
                )}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Status */}
        <div className="px-4 py-3 border-t border-[var(--border)]">
          <div className="flex items-center gap-2 text-xs text-[var(--fg-dim)]">
            <Activity className="w-3 h-3" />
            <span>Real-time:</span>
            <span
              className={cn(
                "inline-block w-2 h-2 rounded-full",
                connected ? "bg-emerald-500" : "bg-red-400"
              )}
            />
            <span>{connected ? "Connected" : "Disconnected"}</span>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 h-14 bg-white/95 backdrop-blur border-b border-[var(--border)] flex items-center px-4 gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-[var(--bg-muted)] text-[var(--fg-muted)]"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <h1
            className="text-base font-semibold text-[var(--fg)]"
            style={{ fontFamily: "var(--font-head)" }}
          >
            {NAV_ITEMS.find((n) => n.href === pathname)?.label || "DentalA"}
          </h1>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
