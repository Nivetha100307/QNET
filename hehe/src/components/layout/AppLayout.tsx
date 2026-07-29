import React, { useState } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { BreakerControlModal } from '../dialogs/BreakerControlModal';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [isControlModalOpen, setIsControlModalOpen] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 font-poppins">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header Bar */}
        <Header onOpenControlModal={() => setIsControlModalOpen(true)} />

        {/* Page Scrollable Area */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {children}
        </main>
      </div>

      {/* Zero-Trust SCADA Command Execution Modal */}
      {isControlModalOpen && (
        <BreakerControlModal onClose={() => setIsControlModalOpen(false)} />
      )}
    </div>
  );
};
