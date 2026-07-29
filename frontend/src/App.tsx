import React from 'react';
import { QuantumSessionManager } from './components/QuantumSessionManager';

export const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-quantum-dark text-slate-100 font-sans">
      <main className="py-8">
        <QuantumSessionManager />
      </main>
    </div>
  );
};

export default App;
