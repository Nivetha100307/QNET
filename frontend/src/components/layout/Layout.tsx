import React from "react";
import { Outlet } from "react-router-dom";
import { Footer } from "./Footer";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";

export const Layout: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0b0d17] bg-quantum-gradient text-[#f0f4fc] p-4 md:p-6 flex flex-col justify-between">
      <div>
        <Navbar />
        <div className="flex gap-6 max-w-[1440px] mx-auto">
          <Sidebar />
          <main className="flex-1 min-w-0">
            <Outlet />
          </main>
        </div>
      </div>
      <Footer />
    </div>
  );
};
