import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Activity,
  BookOpen,
  Database,
  Home,
  LayoutDashboard,
  Network,
  Settings,
} from "lucide-react";

export const Sidebar: React.FC = () => {
  const location = useLocation();

  const menuItems = [
    { path: "/", label: "Overview", icon: Home },
    { path: "/dashboard", label: "Studio Dashboard", icon: LayoutDashboard },
    { path: "/sessions", label: "Session Audit", icon: Database },
    { path: "/network", label: "Network Graph", icon: Network },
    { path: "/settings", label: "Settings", icon: Settings },
    { path: "/about", label: "Protocol Specs", icon: BookOpen },
  ];

  return (
    <aside className="hidden lg:flex flex-col gap-2 w-64 glass-panel p-4 rounded-2xl h-[calc(100vh-140px)] sticky top-28">
      <div className="px-3 py-2 text-xs font-semibold text-[#8c9ba5] uppercase tracking-wider">
        Navigation
      </div>
      <nav className="flex flex-col gap-1.5">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? "bg-gradient-to-r from-[#00f0ff]/20 to-[#9d4edd]/20 text-[#00f0ff] border border-[#00f0ff]/40 shadow-cyan"
                  : "text-[#8c9ba5] hover:text-[#f0f4fc] hover:bg-white/5"
              }`}
            >
              <Icon size={18} className={isActive ? "text-[#00f0ff]" : "text-[#8c9ba5]"} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto p-4 rounded-xl bg-white/5 border border-white/10 text-xs text-[#8c9ba5]">
        <div className="flex items-center gap-2 text-[#00ff9d] font-semibold mb-1">
          <Activity size={14} /> QKD Node Active
        </div>
        Quantum channel simulation ready.
      </div>
    </aside>
  );
};
