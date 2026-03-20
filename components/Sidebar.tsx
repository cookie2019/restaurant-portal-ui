"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  TableProperties,
  Settings,
  LogOut,
  Utensils,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/reservations", label: "Reservations", icon: CalendarDays },
  { href: "/tables", label: "Tables", icon: TableProperties },
  { href: "/customers", label: "Guests", icon: Users },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  function handleLogout() {
    localStorage.removeItem("portal_token");
    localStorage.removeItem("portal_restaurant_id");
    window.location.href = "/login";
  }

  return (
    <aside className="w-[220px] flex-shrink-0 flex flex-col border-r border-[#1e1e24] bg-[#0a0a0b] h-screen sticky top-0">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-[#1e1e24]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#6c63ff]/20 flex items-center justify-center">
            <Utensils className="w-3.5 h-3.5 text-[#6c63ff]" />
          </div>
          <div>
            <p className="text-[13px] font-semibold text-[#f0f0f5]">HeyAspen</p>
            <p className="text-[11px] text-[#55556a]">Restaurant Portal</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all",
                active
                  ? "bg-[#6c63ff]/15 text-[#6c63ff]"
                  : "text-[#8888a0] hover:text-[#f0f0f5] hover:bg-white/5"
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-[#1e1e24]">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium text-[#8888a0] hover:text-red-400 hover:bg-red-400/5 transition-all"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
