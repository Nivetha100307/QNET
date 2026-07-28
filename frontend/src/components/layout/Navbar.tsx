import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Activity, Cpu, Menu, ShieldCheck, Wifi, X } from "lucide-react";
import { ThemeToggle } from "../common/ThemeToggle";
import { useSessionContext } from "../../contexts/SessionContext";
import { useWebSocketContext } from "../../contexts/WebSocketContext";

export const Navbar: React.FC = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { backendInfo, activeStatus } = useSessionContext();
  const { isConnected } = useWebSocketContext();

  const navLinks = [
    { path: "/", label: "Home" },
    { path: "/dashboard", label: "Dashboard" },
    { path: "/sessions", label: "Sessions" },
    { path: "/network", label: "Network" },
    { path: "/settings", label: "Settings" },
    { path: "/about", label: "About" },
  ];

  return (
    <header className="glass-panel sticky top-0 z-50 px-6 py-4 rounded-2xl mb-6 flex items-center justify-between">
      {/* Brand & Quantum Logo */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#00f0ff]/10 border border-[#00f0ff] flex items-center justify-center text-[#00f0ff] shadow-cyan">
          <ShieldCheck size={22} />
        </div>
        <div>
          <h1 className="font-title font-bold text-xl tracking-tight">
            EntangleNet <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00f0ff] to-[#9d4edd]">QKD Studio</span>
          </h1>
          <p className="text-xs text-[#8c9ba5]">E91 Protocol • Quantum Entanglement Security</p>
        </div>
      </div>

      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center gap-1 bg-white/5 border border-white/10 p-1 rounded-xl">
        {navLinks.map((link) => {
          const isActive = location.pathname === link.path;
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? "bg-gradient-to-r from-[#00f0ff]/20 to-[#9d4edd]/20 text-[#00f0ff] border border-[#00f0ff]/40 shadow-cyan"
                  : "text-[#8c9ba5] hover:text-[#f0f4fc] hover:bg-white/5"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>

      {/* Status Badges & Controls */}
      <div className="hidden lg:flex items-center gap-3">
        {/* Backend Status Placeholder */}
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full text-xs text-[#8c9ba5]">
          <Cpu size={14} className="text-[#00ff9d]" />
          <span>{backendInfo.name}</span>
        </div>

        {/* WebSocket Status Placeholder */}
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full text-xs text-[#8c9ba5]">
          <Wifi size={14} className={isConnected ? "text-[#00ff9d]" : "text-[#ffb700]"} />
          <span>{isConnected ? "Live Stream" : "WS Standby"}</span>
        </div>

        {/* Active Session Status Pill */}
        <div className="px-3.5 py-1.5 rounded-full font-title font-bold text-xs uppercase tracking-wider bg-white/10 border border-white/20 text-[#8c9ba5]">
          {activeStatus}
        </div>

        <ThemeToggle />
      </div>

      {/* Mobile Drawer Button */}
      <div className="flex md:hidden items-center gap-2">
        <ThemeToggle />
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg bg-white/5 border border-white/10 text-[#f0f4fc]"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="absolute top-20 left-0 right-0 glass-panel p-4 rounded-2xl flex flex-col gap-2 md:hidden z-50">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                location.pathname === link.path
                  ? "bg-[#00f0ff]/20 text-[#00f0ff] border border-[#00f0ff]/40"
                  : "text-[#8c9ba5] hover:bg-white/5"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
};
